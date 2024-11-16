/**
 *
 *  Tune Tracker
 *  Copyright © 2024 Jonathan Hilliard

 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.

 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * @format
 */


import React, {createContext, isValidElement, useEffect, useReducer, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';


import TuneListDisplay from './components/TuneListDisplay.tsx';
import Editor from './components/Editor.tsx';
import Importer from './components/Importer.tsx';
import {
  SafeAreaView,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import {standard, tune_draft, editorAttrs, Status, miniEditorAttrs, standardDefaults} from './types.ts';
import OnlineDB from './OnlineDB.tsx';
import ExtrasMenu from './components/ExtrasMenu.tsx';
import {RealmProvider, useQuery, useRealm} from '@realm/react';
import Tune from './model/Tune.ts';
import Composer from './model/Composer.ts';
import Playlist from './model/Playlist.ts';
import {BSON} from 'realm';
import PlaylistViewer from './components/PlaylistViewer.tsx';
import PlaylistImporter from './components/PlaylistImporter.tsx';


const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {

  const [state, dispatch] = useReducer(OnlineDB.reducer, {composers: [], standards: [], status: Status.Failed})
  useEffect(() => {
    //OnlineDB.updateDispatch(dispatch);
  }, []);

  return(
    <OnlineDB.DbDispatchContext.Provider value={dispatch}>
      <OnlineDB.DbStateContext.Provider value={state}>
        <View style={{flex: 1, backgroundColor: "black"}}>
          <RealmProvider schema={[Tune, Composer, Playlist]} deleteRealmIfMigrationNeeded={true} >
            <NavigationContainer>
              <MainMenu/>
            </NavigationContainer>
          </RealmProvider>
        </View>
      </OnlineDB.DbStateContext.Provider>
    </OnlineDB.DbDispatchContext.Provider>
  );
}

function MainMenu({}: {}): React.JSX.Element {
  //TODO: Instantiate selectedTune with any tune, remove "as Tune" in editors.
  const [selectedTune, setSelectedTune]: [Tune | unknown, Function] = useState();
  const [selectedTunes, setSelectedTunes]: [Tune[], Function] = useState([]);
  const [newTune, setNewTune] = useState(false);
  const isDarkMode = true;
  const realm = useRealm();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  let entriesArr = Array.from(miniEditorAttrs.entries());
  let arr = entriesArr;
  const allLocalComposers = useQuery(Composer);
  return(
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName='TuneListDisplay'
    >
      <Stack.Screen name="MiniEditor">
        {(props) => <Editor
          prettyAttrs={arr}
          selectedTune={selectedTune as Tune}
          newTune={newTune}
          setNewTune={setNewTune}
          navigation={props.navigation}
        />}
      </Stack.Screen>
      <Stack.Screen name="Editor">
        {(props) => <Editor
          prettyAttrs={editorAttrs as Array<[string, string]>}
          selectedTune={selectedTune as Tune}
          newTune={newTune}
          setNewTune={setNewTune}
          navigation={props.navigation}
        />}
      </Stack.Screen>
      <Stack.Screen name="Importer">
        {(props) =>
        <SafeAreaView style={{flex: 1, backgroundColor: "black"}}>
          <Importer
            importingComposers={false}
            navigation={props.navigation}
            importingId={false}
            importFn={function(stand: standard, mini=false){
              const tn: tune_draft = {};
              for(let attrPair of standardDefaults){
                const standardAttr = stand[attrPair[0]];
                if(attrPair[0] !== "id" && typeof standardAttr !== "undefined"){
                  //TODO: Translate attr fn from DraftReducers
                  tn[attrPair[0] as keyof tune_draft] = standardAttr;
                }
              }
              tn.dbId = stand['id'];
              if(stand["Composers"]){
                const compDbIds = stand["Composers"].map(comp => comp.id)
                const localComps = allLocalComposers.filter(comp => comp.dbId && compDbIds.includes(comp.dbId));
                tn.composers = localComps;
                if(tn.composers.length !== stand["Composers"].length){
                  console.log(tn.composers);
                  console.log("Past inequality");
                  //TODO: Optimize
                  // Composer(s) are missing from localDB.
                  // Finds all dbIds where there are no corresponding local entries
                  const missingComposersIds = compDbIds.filter(id => 
                    !localComps.some(dbComposer => dbComposer.dbId === id)
                  );
                  console.log("Missing composer ids:");
                  console.log(missingComposersIds);
                  // Maps missing IDs to onineDB composers
                  const missingComposers = missingComposersIds.map(missingCompId => 
                    stand["Composers"].find(onlineComp => onlineComp.id === missingCompId)
                  );
                  console.log("Missing composers:");
                  console.log(missingComposers);
                  realm.write(() => {
                    for(const missingComp of missingComposers){
                      if(!missingComp){
                        //TODO: Handle error from composer not being found in OnlineDB
                      }else{
                        const createdComp = realm.create(Composer, {
                          id: new BSON.ObjectId(),
                          name: missingComp.name ? missingComp.name : "New Song",
                          birth: missingComp?.birth,
                          death: missingComp?.death,
                          dbId: missingComp.id,
                        })
                        tn.composers?.push(createdComp)
                        setSelectedTune(tn);
                        setNewTune(true);
                        props.navigation.goBack();
                        mini ? props.navigation.navigate("MiniEditor")
                          :props.navigation.navigate("Editor")
                      }
                    }
                  });
                }else{
                  setSelectedTune(tn);
                  setNewTune(true);
                  props.navigation.goBack();
                  mini ? props.navigation.navigate("MiniEditor")
                    :props.navigation.navigate("Editor")
                }
              }
            }}/>
          </SafeAreaView>
        }
      </Stack.Screen>
      <Stack.Screen name="TuneListDisplay">
        {(props) =>
        <SafeAreaView style={{backgroundColor: "#000", flex: 1}}>
          <View>
            <TuneListDisplay
              navigation={props.navigation}
              setSelectedTune={setSelectedTune}
              setNewTune={setNewTune}
              allowNewTune={true}
              selectMode={false}
              selectedTunes={selectedTunes}
              setSelectedTunes={setSelectedTunes}
            />
          </View>
        </SafeAreaView>
      }
    </Stack.Screen>
    <Stack.Screen name="ExtrasMenu">
        {(props) =>
        <SafeAreaView style={{flex: 1, backgroundColor: "black"}}>
          <View style={{flex:1}}>
            <ExtrasMenu
              navigation={props.navigation}
            />
          </View>
        </SafeAreaView>
        }
    </Stack.Screen>
    <Stack.Screen name="PlaylistViewer">
        {(props) =>
        <SafeAreaView style={{flex: 1, backgroundColor: "black"}}>
          <View style={{flex:1}}>
            <PlaylistViewer
              navigation={props.navigation}
            />
          </View>
        </SafeAreaView>
        }
    </Stack.Screen>
    <Stack.Screen name="PlaylistImporter">
        {(props) =>
        <SafeAreaView style={{flex: 1, backgroundColor: "black"}}>
          <View style={{flex:1}}>
            <PlaylistImporter
              navigation={props.navigation}
            />
          </View>
        </SafeAreaView>
        }
    </Stack.Screen>
  </Stack.Navigator>
);
}
export default App;

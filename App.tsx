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


import React, {useEffect, useLayoutEffect, useReducer, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';


import TuneListDisplay from './components/TuneListDisplay.tsx';
import Editor from './components/Editor.tsx';
import Importer from './components/Importer.tsx';
import {
  SafeAreaView,
  View,
} from 'react-native';


import {standard, tune_draft, Status, standardDefaults} from './types.ts';
import OnlineDB from './OnlineDB.tsx';
import ExtrasMenu from './components/ExtrasMenu.tsx';
import {RealmProvider, useQuery, useRealm} from '@realm/react';
import Tune from './model/Tune.ts';
import Composer from './model/Composer.ts';
import Playlist from './model/Playlist.ts';
import {BSON} from 'realm';
import PlaylistViewer from './components/PlaylistViewer.tsx';
import PlaylistImporter from './components/PlaylistImporter.tsx';
import {translateAttrFromStandardTune} from './DraftReducers/utils/translate.ts';
import Register from './components/Register.tsx';
import ProfileMenu from './components/ProfileMenu.tsx';
import SplashScreen from 'react-native-splash-screen';
import {ThemeProvider} from 'styled-components';
import {light, dark} from './Themes.tsx';
import {BgView, SafeBgView} from './Style.tsx';
import AsyncStorage from '@react-native-community/async-storage';
import AccountDeletion from './components/AccountDeletion.tsx';
import NewTuneSelector from './components/NewTuneSelector.tsx';


const Stack = createNativeStackNavigator();

function migration(oldRealm, newRealm){
  const keyMap = new Map([
    ["c", 0],
    ["c#", 1],
    ["db", 1],
    ["d", 2],
    ["d#", 3],
    ["eb", 3],
    ["e", 4],
    ["f", 5],
    ["f#", 6],
    ["gb", 6],
    ["g", 7],
    ["g#", 8],
    ["ab", 8],
    ["a", 9],
    ["a#", 10],
    ["bb", 10],
    ["b", 11],
  ])
  if(oldRealm.schemaVersion <= 6){
    //Migrate keyCenters to per-key confidence
    const oldObjects = oldRealm.objects(Tune);
    const newObjects = newRealm.objects(Tune);
    for (let i = 0; i < oldObjects.length; i++) {
      const oldObj = oldObjects[i];
      const newObj = newObjects[i];
      if(typeof oldObj.keyCenters !== "undefined"){
        //Old key centers were an array of strings.
        const oldKeys = oldObj.keyCenters as unknown as string[];
        //Just ignore a key if it doesn't exist in the map
        const newKeyMap = oldKeys.filter(key => keyMap.has(key.toLowerCase()))
          .map(key => keyMap.get(key.toLowerCase()) as number);
        const newKeys = [0,0,0,0,0,0,0,0,0,0,0,0];
        //Set the confidence of each key as proficient (3)
        newKeyMap.forEach(keyIndex => {newKeys[keyIndex] = 3})

        newObj.keyCenters = newKeys
      }
    }
  }
}
function App(): React.JSX.Element {
  const [dbState, dbDispatch] = useReducer(OnlineDB.reducer, {composers: [], standards: [], status: Status.Failed})
  const [theme, setTheme] = useState(dark);
  useEffect(() => {
    SplashScreen.hide();
  }, [])
  useEffect(() => {
    console.log("App open")
    try{
      AsyncStorage.getItem("theme").then(thm => {
        if(thm !== null){
          setTheme(JSON.parse(thm));
        }else{
          setTheme(dark);
        }
      })
    }catch(e){
      console.error("Error reading ");
      setTheme(dark);
    }
    OnlineDB.updateDispatch(dbDispatch);
  }, []);

  return(
    <ThemeProvider theme={theme}>
      <OnlineDB.DbDispatchContext.Provider value={dbDispatch}>
        <OnlineDB.DbStateContext.Provider value={dbState}>
          <BgView style={{flex: 1}}>
          <RealmProvider schema={[Tune, Composer, Playlist]} schemaVersion={7} onMigration={migration}>
              <NavigationContainer>
                <MainMenu 
                  toggleTheme={() => {
                    if(theme === dark){
                      try {
                        AsyncStorage.setItem('theme', JSON.stringify(light));
                      } catch (e) {
                        console.error("Error saving theme");
                      }
                      setTheme(light);
                    }else{
                      try {
                        AsyncStorage.setItem('theme', JSON.stringify(dark));
                      } catch (e) {
                        console.error("Error saving theme");
                      }
                      setTheme(dark);
                    }
                  }}
                />
              </NavigationContainer>
            </RealmProvider>
          </BgView>
        </OnlineDB.DbStateContext.Provider>
      </OnlineDB.DbDispatchContext.Provider>
    </ThemeProvider>
  );
}

function MainMenu({toggleTheme}: {toggleTheme: Function}): React.JSX.Element {
  const [selectedTune, setSelectedTune]: [Tune | unknown, Function] = useState();
  const [selectedTunes, setSelectedTunes]: [Tune[], Function] = useState([]);
  const [newTune, setNewTune] = useState(false);
  const realm = useRealm();
  const composerQuery = useQuery(Composer);

  const allLocalComposers = useQuery(Composer);
  return(
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName='TuneListDisplay'
    >
      <Stack.Group screenOptions={{presentation: "modal"}}>
        <Stack.Screen name="Register" component={Register}/>
        <Stack.Screen name="NewTuneSelector" component={NewTuneSelector}/>
      </Stack.Group>
      <Stack.Screen name="Editor">
        {(props) => <Editor
          selectedTune={selectedTune as Tune}
          newTune={newTune}
          setNewTune={setNewTune}
        />}
      </Stack.Screen>
      <Stack.Screen name="Importer">
        {(props) =>
        <SafeBgView>
          <Importer
            importingComposers={false}
            importingId={false}
            importFn={function(stand: standard, skipEditor = false){
              const tn: tune_draft = {};
              for(let attrPair of standardDefaults){
                const standardAttr = stand[attrPair[0]];
                const tuneAttrPair = translateAttrFromStandardTune(attrPair[0], standardAttr, composerQuery, realm)
                if(attrPair[0] !== "id" && typeof standardAttr !== "undefined"){
                  tn[tuneAttrPair[0][0]] = tuneAttrPair[0][1];
                }
              }
              tn.dbId = stand['id'];
              if(stand["Composers"]){
                const compDbIds = stand["Composers"].map(comp => comp.id)
                const localComps = allLocalComposers.filter(comp => comp.dbId && compDbIds.includes(comp.dbId));
                tn.composers = localComps;
                if(tn.composers.length !== stand["Composers"].length){
                  //TODO: Optimize
                  // Composer(s) are missing from localDB.
                  // Finds all dbIds where there are no corresponding local entries
                  const missingComposersIds = compDbIds.filter(id => 
                    !localComps.some(dbComposer => dbComposer.dbId === id)
                  );
                  // Maps missing IDs to onineDB composers
                  const missingComposers = missingComposersIds.map(missingCompId => 
                    stand["Composers"]?.find(onlineComp => onlineComp.id === missingCompId)
                  );
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
                      }
                    }
                  });
                }
              }
              if(skipEditor){
                console.log("Skipping editor");
                realm.write(() => {
                  //ensure this works
                  const modifiedTune = tn;
                  modifiedTune.id = new BSON.ObjectId();
                  modifiedTune.dbId = stand.id;
                  realm.create(Tune, modifiedTune as Tune);
                });
              }else{
                console.log("Not skipping editor");
                setSelectedTune(tn);
                setNewTune(true);
                props.navigation.goBack();
                props.navigation.navigate("Editor")
              }
            }}/>
          </SafeBgView>
        }
      </Stack.Screen>
      <Stack.Screen name="TuneListDisplay">
        {(props) =>
        <SafeBgView>
          <View>
            <TuneListDisplay
              setSelectedTune={setSelectedTune}
              setNewTune={setNewTune}
              allowNewTune={true}
              selectMode={false}
              selectedTunes={selectedTunes}
              setSelectedTunes={setSelectedTunes}
            />
          </View>
        </SafeBgView>
      }
    </Stack.Screen>
    <Stack.Screen name="ExtrasMenu">
      {(props) => 
      <ExtrasMenu
        toggleTheme={toggleTheme}
      />
      }
    </Stack.Screen>
    <Stack.Screen name="AccountDeletion">
      {(props) => 
      <AccountDeletion/>
      }
    </Stack.Screen>
    <Stack.Screen name="ProfileMenu" component={ProfileMenu}/>
    <Stack.Screen name="PlaylistViewer">
        {(props) =>
        <SafeBgView>
          <View style={{flex:1}}>
            <PlaylistViewer/>
          </View>
        </SafeBgView>
        }
    </Stack.Screen>
    <Stack.Screen name="PlaylistImporter">
        {(props) =>
        <SafeBgView>
          <View style={{flex:1}}>
            <PlaylistImporter
            />
          </View>
        </SafeBgView>
        }
    </Stack.Screen>
  </Stack.Navigator>
);
}
export default App;

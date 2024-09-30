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


import React, {createContext, isValidElement, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';


import TuneListDisplay from './components/TuneListDisplay.tsx';
import Editor from './components/Editor.tsx';
import Importer from './components/Importer.tsx';
import {
  BackHandler,
  SafeAreaView,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import {standard, tune_draft, editorAttrs, Status} from './types.tsx';
import SongsList from './SongsList.tsx';
import Playlists from './Playlists.tsx';
import OnlineDB from './OnlineDB.tsx';
import Tune from './model/Tune.js';
import {database} from './index.js';
import { Q } from "@nozbe/watermelondb"
import Composer from './model/Composer.js';


//PrettyAttrs function as both as "prettifiers" and lists of attrs to display in corresponding editors
const miniEditorPrettyAttrs = new Map<string, string>([
  ["title", "Title"],
  ["hasLyrics", "Has lyrics?"],
  ["formConfidence", "Form Confidence"],
  ["melodyConfidence", "Melody Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
  //  ["just_played", "'I Just Played This'"],
])

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [songs, setSongs] = useState([]);
  const [composers, setComposers] = useState([]);
  const songsList = new SongsList(songs, setSongs, composers, setComposers);
  const [rawPlaylists, setRawPlaylists] = useState([])
  const playlists = new Playlists(rawPlaylists, setRawPlaylists);

  useEffect(() => {
    songsList.rereadDb();
    //TODO: Implement playlists in WatermelonDB
    playlists.readFromPlaylistsJson();
    OnlineDB.update();
  }, []);

  return(
    <View style={{flex: 1, backgroundColor: "black"}}>
      <NavigationContainer>
          <MainMenu
            songs={songs}
            songsList={songsList}
            playlists={playlists}
          />
      </NavigationContainer>
    </View>
  );
}

function MainMenu({
  songs, songsList, playlists
}: {
  songs: Array<Tune>,
  songsList: SongsList,
  playlists: Playlists
}): React.JSX.Element {
  const [selectedTune, setSelectedTune] = useState(songs[0]);
  const [newTune, setNewTune] = useState(false);
  const isDarkMode = true;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  let entriesArr = Array.from(miniEditorPrettyAttrs.entries());
  let arr = ((entriesArr as Array<Array<unknown>>) as Array<[string, string]>);
  return(
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName='TuneListDisplay'
    >
      <Stack.Screen name="MiniEditor">
        {(props) => <Editor
          prettyAttrs={arr}
          selectedTune={selectedTune}
          songsList={songsList}
          playlists={playlists}
          newTune={newTune}
          setNewTune={setNewTune}
          navigation={props.navigation}
        />}
      </Stack.Screen>
      <Stack.Screen name="Editor">
        {(props) => <Editor
          prettyAttrs={editorAttrs as Array<[string, string]>}
          selectedTune={selectedTune}
          songsList={songsList}
          playlists={playlists}
          newTune={newTune}
          setNewTune={setNewTune}
          navigation={props.navigation}
        />}
      </Stack.Screen>
      <Stack.Screen name="Importer">
        {(props) =>
        <SafeAreaView style={{flex: 1, backgroundColor: "black"}}>
          <Importer
            navigation={props.navigation}
            importingId={false}
            importFn={function(stand: standard, mini=false){
              //TODO: Consider possibility of updating the Editor props from App.tsx instead of waiting to switch
              const tn: tune_draft = {};
              for(let attrPair of editorAttrs){
                if(attrPair[0] !== "id"){
                  tn[attrPair[0] as keyof tune_draft] = stand[attrPair[0] as keyof stand];
                }
              }
              tn.dbId = stand['id'];
              if(stand["Composers"]){
                const compDbIds = stand["Composers"].map(comp => comp.id)
                database.get('composers').query(
                  Q.where("db_id", Q.oneOf(compDbIds))
                ).fetch().then(comps => {
                  tn.composers = comps as Composer[];
                  console.log(tn.composers);
                  if(tn.composers.length != stand["Composers"].length){
                    console.log("Past inequality");
                    //TODO: Optimize
                    // Composer(s) are missing from localDB.
                    // Finds all dbIds where there are no corresponding local entries
                    const missingComposersIds = compDbIds.filter(id => 
                      !comps.some(dbComposer => (dbComposer as Composer).dbId === id)
                    );
                    console.log("Missing composer ids:");
                    console.log(missingComposersIds);
                    // Maps missing IDs to onineDB composers
                    const missingComposers = missingComposersIds.map(missingCompId => 
                      stand["Composers"].find(onlineComp => onlineComp.id === missingCompId)
                    );
                    console.log("Missing composers:");
                    console.log(missingComposers);
                    for(const missingComp of missingComposers){
                      //TODO: Batch edit?
                      database.write(async () => {database.get('composers').create(comp => {
                        (comp as Composer).replace(missingComp)
                      }).then(resultingModel => {
                        //TODO: Is this necessary?
                        songsList.rereadDb();
                        tn.composers?.push(resultingModel as Composer)
                      })}).then(() => {
                        setSelectedTune(tn);
                        setNewTune(true);
                        props.navigation.goBack();
                        mini ? props.navigation.navigate("MiniEditor")
                          :props.navigation.navigate("Editor")
                      });
                    }
                  }else{
                    setSelectedTune(tn);
                    setNewTune(true);
                    props.navigation.goBack();
                    mini ? props.navigation.navigate("MiniEditor")
                      :props.navigation.navigate("Editor")
                  }
                })
              }
            }}/>
          </SafeAreaView>
        }
      </Stack.Screen>
      <Stack.Screen name="TuneListDisplay">
        {(props) =>
        <SafeAreaView style={backgroundStyle}>
          <View>
            <TuneListDisplay songs={songs}
              navigation={props.navigation}
              setSelectedTune={setSelectedTune}
              playlists={playlists}
              setNewTune={setNewTune}
            />
          </View>
        </SafeAreaView>
      }
    </Stack.Screen>
  </Stack.Navigator>
);
}
export default App;

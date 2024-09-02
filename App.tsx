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

import {standard, tune_draft} from './types.tsx';
import SongsList from './SongsList.tsx';
import Playlists from './Playlists.tsx';
import OnlineDB from './OnlineDB.tsx';
import Tune from './model/Tune.js';
import {database} from './index.js';


//PrettyAttrs function as both as "prettifiers" and lists of attrs to display in corresponding editors
const miniEditorPrettyAttrs = new Map<string, string>([
  ["title", "Title"],
  ["has_lyrics", "Has lyrics?"],
  ["form_confidence", "Form Confidence"],
  ["melody_confidence", "Melody Confidence"],
  ["solo_confidence", "Solo Confidence"],
  ["lyrics_confidence", "Lyrics Confidence"],
  //  ["just_played", "'I Just Played This'"],
])
const prettyAttrs = new Map<string, string>([
  ["db_id", "Database Connection"],
  ["title", "Title"],
  ["alternative_title", "Alternative Title"],
  //  ["composers", "Composers"],
  ["composer_placeholder", "Composers"],
  ["form", "Form"],
  //  ["notable_recordings", "Notable Recordings"],
  ["keys", "Keys"],
  //  ["styles", "Styles"],
  ["tempi", "Tempi"],
  //  ["contrafacts", "Contrafacts"],
  ["playlists", "Playlists"],
  ["playthroughs", "Playthroughs"],
  ["has_lyrics", "Has lyrics?"],
  ["form_confidence", "Form Confidence"],
  ["melody_confidence", "Melody Confidence"],
  ["solo_confidence", "Solo Confidence"],
  ["lyrics_confidence", "Lyrics Confidence"],
])

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [songs, setSongs] = useState([]);
  const songsList = new SongsList(songs, setSongs);
  const [rawPlaylists, setRawPlaylists] = useState([])
  const playlists = new Playlists(rawPlaylists, setRawPlaylists);

  useEffect(() => {
    //The below functions may also create "template" json files if either is not present.
    songsList.rereadDb();
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
  //const isDarkMode = useColorScheme() === 'dark';
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
          prettyAttrs={Array.from(prettyAttrs.entries())}
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
              //TODO: IMPLEMENT WITH TUNEMODEL

            // Create tune, fill with details, then move to editor
            const tn: tune_draft = {};
            for(let attrPair of prettyAttrs){
              if(attrPair[0] !== "id"){
                tn[attrPair[0] as keyof tune_draft] = stand[attrPair[0] as keyof stand];
              }
            }
          //tn.title = stand.title;
          //  //tn.composers = stand['Composers'].map(comp => comp.name);
            tn.dbId = stand['id'];
            setSelectedTune(tn);
            setNewTune(true);
            props.navigation.goBack();
            mini ? props.navigation.navigate("MiniEditor")
            :props.navigation.navigate("Editor")
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

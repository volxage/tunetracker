/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {isValidElement, useEffect, useState} from 'react';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {
  Text,
  SubText,
  TextInput,
  styles
} from './Style.tsx'

import LList from './components/Llist.tsx'
import Editor from './components/Editor.tsx'
import {
  SafeAreaView,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import defaultSongsJson from './songs.json';
import RNFS from 'react-native-fs'
const songsFilePath = RNFS.DocumentDirectoryPath + "/songs.json"
type tune = {
  "title"?: string
  "alternative_title"?: string
  "composers"?: string[]
  "form"?: string
  "notable_recordings"?: string[]
  "keys"?: string[]
  "styles"?: string[]
  "tempi"?: string[]
  "contrafacts"?: string[] // In the future, these could link to other tunes
  "playthroughs"?: number
  "form_confidence"?: number
  "melody_confidence"?: number
  "solo_confidence"?: number
  "lyrics_confidence"?: number
  "played_at"?: string[]
}
const miniEditorPrettyAttrs = new Map<string, string>([
  ["title", "Title"],
  ["form_confidence", "Form Confidence"],
  ["melody_confidence", "Melody Confidence"],
  ["solo_confidence", "Solo Confidence"],
  ["lyrics_confidence", "Lyrics Confidence"],
])
const prettyAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternative_title", "Alternative Title"],
  ["composers", "Composers"],
  ["form", "Form"],
  ["notable_recordings", "Notable Recordings"],
  ["keys", "Keys"],
  ["styles", "Styles"],
  ["tempi", "Tempi"],
  ["contrafacts", "Contrafacts"],
  ["playthroughs", "Playthroughs"],
  ["form_confidence", "Form Confidence"],
  ["melody_confidence", "Melody Confidence"],
  ["solo_confidence", "Solo Confidence"],
  ["lyrics_confidence", "Lyrics Confidence"],
])

function writeToSongsJson(tuneList=defaultSongsJson as tune[], setSongs: Function){
  // TODO: Try await for better readability
  const stringified = JSON.stringify(tuneList);
  console.log(songsFilePath)
  RNFS.writeFile(songsFilePath, stringified)
    .then(() => setSongs(tuneList))
    .then(() => console.log(tuneList))
}

function App(): React.JSX.Element {
  //TODO: Fix infinite render loop
  // TRY PUTTING SONGS STATE IN THE MAIN MENU, KEEP EFFECT IN APP FN
  //
  // Why is RNFS not saving the file properly? Or why is the android emulator not persisting the data?
  const [songs, setSongs] = useState(defaultSongsJson)
  useEffect(() => {
    RNFS.readFile(songsFilePath)
      .then((results) => {
        setSongs(JSON.parse(results))
        console.log(JSON.parse(results))
      })
      .catch((reason) => {
        console.log("ERROR CAUGHT BELOW:")
        console.log(reason)
        console.log("Assuming file doesn't exist, creating one:")
        RNFS.writeFile(songsFilePath, JSON.stringify(defaultSongsJson))
      })
  }, []);
  console.log("Rerendered main")


  return(
    <MainMenu songs={songs} setSongs={setSongs}/>
  );
}

function MainMenu({songs, setSongs}:
  {songs: Array<tune>, setSongs: Function}): React.JSX.Element {

  //const isDarkMode = useColorScheme() === 'dark';
  const [selectedTune, setSelectedTune] = useState(songs[0])
  const [editing, setEditorVisible] = useState(0);
  const isDarkMode = true;
  function replaceSelectedTune(oldTune:tune, newTune:tune){
    function ifSelectedTuneReplace(value: tune, index: number, array: tune[]){
      if(value === oldTune){
        return newTune;
      }
      else{
        return value;
      }
    }
    writeToSongsJson(songs.map(ifSelectedTuneReplace), setSongs)
  }

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  let editPair = {editing:editing, setEditorVisible:setEditorVisible}
  if(editing === 1){
    console.log("Edit1" + selectedTune)
    let entriesArr = Array.from(miniEditorPrettyAttrs.entries());
    let arr = ((entriesArr as Array<Array<unknown>>) as Array<[string, string]>)
    return(
      <Editor editPair={editPair} prettyAttrs={arr} selectedTune={selectedTune} replaceSelectedTune={replaceSelectedTune}/>
    );
  }else if(editing === 2){
    console.log("Edit2" + selectedTune)
    return(
      <Editor editPair={editPair} prettyAttrs={Array.from(prettyAttrs.entries())} selectedTune={selectedTune} replaceSelectedTune={replaceSelectedTune}/>
    );
  }else{
    return (
      <SafeAreaView style={backgroundStyle}>
        <View>
          <LList songs={songs} editPair={editPair} setSelectedTune={setSelectedTune}/>
        </View>
        </SafeAreaView>
      );
  }
}
export default App;

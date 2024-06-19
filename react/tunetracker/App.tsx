/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {isValidElement, useState} from 'react';
import songsJson from './songs.json';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {
  Text,
  SubText,
  TextInput,
  styles
} from './Style.tsx'

import LList from './components/Llist.tsx'
import Editor from './components/Editors.tsx'
import MiniEditor from './components/MiniEditor.tsx'
import {
  SafeAreaView,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
const songs: Array<tune> = songsJson

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

function App(): React.JSX.Element {
  const [editing, setEditorVisible] = useState(0);
  return(
    <MainMenu editing={editing} setEditorVisible={setEditorVisible}></MainMenu>
  );
}

function MainMenu({editing, setEditorVisible}: {editing: number, setEditorVisible: Function}): React.JSX.Element {
  //const isDarkMode = useColorScheme() === 'dark';
  const isDarkMode = true;
  const [selectedTune, setSelectedTune] = useState(songs[0])

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  let editPair = {editing:editing, setEditorVisible:setEditorVisible}
  
  if(editing == 1){
    let entriesArr = Array.from(miniEditorPrettyAttrs.entries());
    let arr = ((entriesArr as Array<Array<unknown>>) as Array<[string, string]>)
    return(
      <Editor editPair={editPair} prettyAttrs={arr} selectedTune={selectedTune}/>
    );
  }else if(editing == 2){
    return(
      <Editor editPair={editPair} prettyAttrs={Array.from(prettyAttrs.entries())} selectedTune={selectedTune}/>
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

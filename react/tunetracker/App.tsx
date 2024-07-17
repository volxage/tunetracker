/**
 * Tune Tracker
 * https://github.com/volxage/tunetracker
 *
 * @format
 */

import React, {isValidElement, useEffect, useState} from 'react';

import TuneViewer from './components/TuneViewer.tsx';
import Editor from './components/Editor.tsx';
import Importer from './components/Importer.tsx';
import {
  SafeAreaView,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import defaultSongsJson from './songs.json';
import jazzStandards from './jazzstandards.json';

import RNFS from 'react-native-fs';

import { tune } from './types.tsx';
import SongsList from './SongsList.tsx';
import Playlists from './Playlists.tsx';

//PrettyAttrs function as both as "prettifiers" and lists of attrs to display in corresponding editors
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
  ["playlists", "Playlits"],
  ["playthroughs", "Playthroughs"],
  ["form_confidence", "Form Confidence"],
  ["melody_confidence", "Melody Confidence"],
  ["solo_confidence", "Solo Confidence"],
  ["lyrics_confidence", "Lyrics Confidence"]
])


function App(): React.JSX.Element {
  const [songs, setSongs] = useState(defaultSongsJson);
  const songsList = new SongsList(songs, setSongs);
  const [rawPlaylists, setRawPlaylists] = useState([])

  const playlists = new Playlists(rawPlaylists, setRawPlaylists);
  useEffect(() => {
    //The below functions may also create "template" json files if either is not present.
    songsList.readFromSongsJson();
    playlists.readFromPlaylistsJson();
  }, []);

  return(
    <MainMenu songs={songs} setSongs={setSongs} songsList={songsList} playlists={playlists}/>
  );
}

function MainMenu({songs, setSongs, songsList, playlists}:
  {songs: Array<tune>, setSongs: Function, songsList: SongsList, playlists: Playlists}): React.JSX.Element {

  //const isDarkMode = useColorScheme() === 'dark';
  const [selectedTune, setSelectedTune] = useState(songs[0]);
  const [viewing, setViewing] = useState(0);
  const isDarkMode = true;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  let viewingPair = {viewing:viewing, setViewing:setViewing};
  if(viewing === 1){ //MiniEditor (Just Editor with less attrs)
    let entriesArr = Array.from(miniEditorPrettyAttrs.entries());
    let arr = ((entriesArr as Array<Array<unknown>>) as Array<[string, string]>);
    return(
      <Editor
        viewingPair={viewingPair}
        prettyAttrs={arr}
        selectedTune={selectedTune}
        songsList={songsList}
        playlists={playlists}
      />
    );
  }else if(viewing === 2){ //Editor
    return(
      <Editor
      viewingPair={viewingPair}
      prettyAttrs={Array.from(prettyAttrs.entries())}
      selectedTune={selectedTune}
      songsList={songsList}
      playlists={playlists}
      />
    );
  }else if (viewing == 3){ //TuneImporter
    return(
      <SafeAreaView style={backgroundStyle}>
        <Importer standards={jazzStandards} viewingPair={viewingPair} setSelectedTune={setSelectedTune} addNewTune={songsList.addNewTune}/>
      </SafeAreaView>
    )
  }
  else{ //TuneViewer
    return (
      <SafeAreaView style={backgroundStyle}>
        <View>
          <TuneViewer songs={songs}
            viewingPair={viewingPair}
            setSelectedTune={setSelectedTune}
            addNewTune={songsList.addNewTune}
            playlists={playlists}
            />
        </View>
        </SafeAreaView>
      );
  }
}
export default App;

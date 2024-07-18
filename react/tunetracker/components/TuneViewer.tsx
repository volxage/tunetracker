/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {isValidElement, useState} from 'react';
import {
  FlatList,
  Switch,
  View,
  TouchableHighlight,
} from 'react-native';

import {
  Text,
  SubText,
  TextInput,
  styles,
  Button,
  ButtonText
} from '../Style.tsx'
import tuneSort from '../tuneSort.tsx'
import Playlists from '../Playlists.tsx'
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Fuse from 'fuse.js';


const fuseOptions = { // For finetuning the search algorithm
	// isCaseSensitive: false,
	// includeScore: false,
	// shouldSort: true,
	// includeMatches: false,
	// findAllMatches: false,
	// minMatchCharLength: 1,
	// location: 0,
	// threshold: 0.6,
	// distance: 100,
	// useExtendedSearch: false,
	// ignoreLocation: false,
	// ignoreFieldNorm: false,
	// fieldNormWeight: 1,
	keys: [
		"title",
		"composers"
	]
};
import { tune, playlist } from '../types.tsx';
import SongsList from '../SongsList.tsx';
const prettyAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternative_title", "Alternative Title"],
  ["composers", "Composer(s)"],
  ["form", "Form"],
  ["notable_recordings", "Notable recordings"],
  ["keys", "Key(s)"],
  ["styles", "Styles"],
  ["tempi", "Tempi"],
  ["contrafacts", "Contrafacts"],
  ["playthroughs", "Playthrough Count"],
  ["form_confidence", "Form Confidence"],
  ["melody_confidence", "Melody Confidence"],
  ["solo_confidence", "Solo Confidence"],
  ["lyrics_confidence", "Lyrics Confidence"],
  ["played_at", "Played At"],
]);

function prettyPrint(object: unknown): string{
  if (typeof object == "string") return object as string;
  if (typeof object == "number") return JSON.stringify(object);
  if (Array.isArray(object)) return object.join(", ");
  return "(Empty)";
}

function LListHeader({listReversed, setListReversed, setViewing, setSearch, songsList, setSelectedAttr, setSelectedTune, setSelectedPlaylist, playlists}:
{listReversed: boolean | undefined,
      setListReversed: Function,
      setViewing: Function,
      setSearch: Function,
      songsList: SongsList,
      setSelectedAttr: Function,
      setSelectedTune: Function,
      setSelectedPlaylist: Function,
      playlists: Playlists}){

  const selectedAttrItems = Array.from(prettyAttrs.entries()).map(
    (entry) => {return {label: entry[1], value: entry[0]}}
  );

  const selectedPlaylistItems = Array.from(playlists.getPlaylists().map(
    (playlist) => {return {label: playlist.title, value: playlist.id}}
  ));
  selectedPlaylistItems.unshift(
    {
      label: "All Songs",
      value: " "
    }
  )

  return(
  <View>
    <View style={{flexDirection: 'row'}}>
      <View style={{flex:1}}>
        <TextInput
          placeholder={"Search"}
          placeholderTextColor={"white"}
          onChangeText={(text) => {setSearch(text)}}
        />
      </View>
      <View style={{flex:1}}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedPlaylist(value)}
          items={selectedPlaylistItems}
          useNativeAndroidPickerStyle={false}
          placeholder={{label: "Select a playlist", value: ""}}
          style={{inputAndroid: {backgroundColor: 'transparent', color: 'white', fontSize: 18, fontWeight: "300"}}}
        />
      </View>
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <View style={{flex: 2}}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedAttr(value)}
          items={selectedAttrItems as Array<{label:string, value:string}>}
          useNativeAndroidPickerStyle={false}
          placeholder={{label: "Sort by...", value: "title"}}
          style={{inputAndroid: {backgroundColor: 'transparent', color: 'white', fontSize: 18, fontWeight: "300"}}}
        />
      </View>
      <View style={{alignItems: "flex-end"}}>
        <SubText>{"Reverse sort:"}</SubText>
      </View>
      <View style={{flex: 1, alignItems: "center"}}>
        <Switch value={listReversed} onValueChange={() => setListReversed(!listReversed)}/>
      </View>
      <Button onPress={() => setViewing(3)} onLongPress={() => {
            const tn: tune = {};
            songsList.addNewTune(tn);
            setSelectedTune(tn);
            setViewing(2);
      }}>
        <ButtonText><Icon name="plus" size={30}/></ButtonText>
      </Button>
    </View>
  </View>
);
}
type viewingPair = {
  viewing: number;
  setViewing: Function;
}
export default function TuneViewer({songs, viewingPair, setSelectedTune, songsList, playlists}:
{songs: Array<tune>, viewingPair: viewingPair, setSelectedTune: Function, songsList: SongsList, playlists: Playlists}){
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, updateSelectedAttr] = useState("title");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [search, setSearch] = useState("");

  let displaySongs = songs;
  if(selectedPlaylist !== " "){
    const playlist = playlists.getPlaylist(selectedPlaylist)
    if(typeof playlist !== "undefined"){
      displaySongs = songs.filter(
        (tune) => {return typeof tune.id !== "undefined" && playlist.tunes.includes(tune.id)}
      )
    }
  }
  const fuse = new Fuse(displaySongs, fuseOptions);
  if(search === ""){
    tuneSort(displaySongs, selectedAttr, listReversed);
  }else{
    displaySongs = fuse.search(search)
      .map(function(value, index){
        return value.item;
      });
  }
  
  return (
    <FlatList
      data={displaySongs}
      //TODO: fuse.search needs to be interpreted as an array for FlatList to understand!
      extraData={selectedAttr}
      ListHeaderComponent={
        <LListHeader 
          listReversed={listReversed}
          setListReversed={setListReversed}
          setViewing={viewingPair.setViewing}
          setSearch={setSearch}
          songsList={songsList}
          setSelectedAttr={updateSelectedAttr}
          setSelectedTune={setSelectedTune}
          setSelectedPlaylist={setSelectedPlaylist}
          playlists={playlists}
        />
      }
      renderItem={({item, index, separators}) => (
        <TouchableHighlight
          key={item.title}
          onPress={() => {setSelectedTune(item); viewingPair.setViewing(1);}}
          onLongPress={() => {setSelectedTune(item); viewingPair.setViewing(2);}}
          onShowUnderlay={separators.highlight}
          style={styles.bordered}
          onHideUnderlay={separators.unhighlight}>
          <View style={{backgroundColor: 'black', padding: 8}}>
            <Text>{item.title}</Text>
            <SubText>{selectedAttr != "title" ? prettyPrint(item[selectedAttr as keyof tune]) : prettyPrint(item["composers"])}</SubText>
          </View>
        </TouchableHighlight>
    )}
  />
  );
}

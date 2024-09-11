// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
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
  Button,
  ButtonText,
  ConfidenceBarView
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
import {playlist, tune_draft } from '../types.tsx';
import Slider from '@react-native-community/slider';
import reactotron from 'reactotron-react-native';
import Tune from '../model/Tune.js';
import Composer from '../model/Composer.js';
const prettyAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternativeTitle", "Alternative Title"],
  ["composers", "Composer(s)"],
  ["form", "Form"],
//  ["notableRecordings", "Notable recordings"],
  ["keys", "Key(s)"],
  ["styles", "Styles"],
  ["tempi", "Tempi"],
//  ["contrafacts", "Contrafacts"],
  ["playthroughs", "Playthrough Count"],
  ["formConfidence", "Form Confidence"],
  ["melodyConfidence", "Melody Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
  ["playedAt", "Played At"],
]);

function prettyPrint(object: unknown): string{
  if (typeof object == "string") return object as string;
  if (typeof object == "number") return JSON.stringify(object);
  if (Array.isArray(object)) return object.join(", ");
  return "(Empty)";
}

type HeaderInputStates = {
  listReversed: boolean
  setListReversed: Function
  confidenceVisible: boolean
  setConfidenceVisible: Function
  setSearch: Function
}
function ComposerListHeader({
  headerInputStates,
  navigation,
  playlists,
  selectedAttr
}: {
  headerInputStates: HeaderInputStates
  navigation: any,
  playlists: Playlists,
  selectedAttr: String
}){
//const selectedAttrItems = Array.from(prettyAttrs.entries()).map(
//  (entry) => {return {label: entry[1], value: entry[0]}}
//);

//const selectedPlaylistItems = Array.from(playlists.getPlaylists().map(
//  (playlist) => {return {label: playlist.title, value: playlist.id}}
//));
//selectedPlaylistItems.unshift(
//  {
//    label: "All Songs",
//    value: " "
//  }
//)

  return(
  <View>
    <View style={{flexDirection: 'row', borderBottomWidth:1}}>
      <View style={{flex:1}}>
        <TextInput
          style={{backgroundColor: "#222"}}
          placeholder={"Enter your composer here"}
          placeholderTextColor={"white"}
          onChangeText={(text) => {headerInputStates.setSearch(text)}}
        />
      </View>
    {
    //<View style={{flex:1}}>
    //  <RNPickerSelect
    //    onValueChange={(value) => headerInputStates.setSelectedPlaylist(value)}
    //    items={selectedPlaylistItems}
    //    useNativeAndroidPickerStyle={false}
    //    placeholder={{label: "Select a playlist", value: ""}}
    //    style={{inputAndroid:
    //      {
    //      backgroundColor: 'transparent', color: 'white', fontSize: 20, fontWeight: "300",
    //      }
    //    }}
    //  />
    //</View>
    }
    </View>
  </View>
);
}
export default function ComposerListDisplay({
  composers,
  navigation,
  playlists,
}: {
  composers: Array<Composer>,
  navigation: any,
  playlists: Playlists,
}){
  useEffect(() => {bench.stop("Full render")}, [])
  const bench = reactotron.benchmark("ComposerListDisplay benchmark");
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState("title");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [search, setSearch] = useState("");
  const [confidenceVisible, setConfidenceVisible] = useState(false);

  let displayComposers = composers;
  const fuse = new Fuse(displayComposers, fuseOptions);
  if(search === ""){
    //composerSort(displayComposers, selectedAttr, listReversed);
  }else{
    displayComposers = fuse.search(search)
      .map(function(value, index){
        return value.item;
      });
  }
  bench.step("Pre-render")

  const headerInputStates = 
  {
    listReversed: listReversed,
    setListReversed: setListReversed,
    confidenceVisible: confidenceVisible,
    setConfidenceVisible: setConfidenceVisible,
    setSearch: setSearch,
    setSelectedAttr: setSelectedAttr,
  }
  return (
    <FlatList
      data={displayComposers}
      //TODO: fuse.search needs to be interpreted as an array for FlatList to understand!
      extraData={selectedAttr}
      ListHeaderComponent={
        <ComposerListHeader
          headerInputStates={headerInputStates}
          navigation={navigation}
          playlists={playlists}
          selectedAttr={selectedAttr}
        />
      }
      ListEmptyComponent={
        <View style={{backgroundColor: "black", flex: 1}}>
          <SubText>Enter your composer above to search/add a composer.</SubText>
        </View>
      }
      renderItem={({item, index, separators}) => (
        <TouchableHighlight
          key={item.name}
          onShowUnderlay={separators.highlight}
          onHideUnderlay={separators.unhighlight}>
          <View style={{backgroundColor: 'black', padding: 8}}>
            <Text>{item.name}</Text>
          {typeof bench.step("Item render") === "undefined"}
          </View>
        </TouchableHighlight>
    )}
  />
  );
}
          //<SubText>{selectedAttr != "title"
          //  ? prettyPrint(item[selectedAttr as keyof Tune])
          //  : prettyPrint(item["composerPlaceholder" as keyof Tune])}</SubText>

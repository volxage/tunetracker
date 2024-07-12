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
import { tune } from '../types.tsx';
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
  return "(Empty)"
}

function LListHeader({listReversed, setListReversed, updateSelectedAttr, setViewing, setSearch, addNewTune, setSelectedTune}:
{listReversed: boolean | undefined,
      setListReversed: Function,
      updateSelectedAttr: Function,
      setViewing: Function,
      setSearch: Function,
      addNewTune: Function
      setSelectedTune: Function}){

  const selectedAttrItems = Array.from(prettyAttrs.entries()).map((x) => {return {label: x[1], value: x[0]}});
  return(
  <View>
    <TextInput
    placeholder={"Search"}
    placeholderTextColor={"white"}
    onChangeText={(text) => {setSearch(text)}}
    />
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 2}}>
          <RNPickerSelect
          onValueChange={(value) => updateSelectedAttr(value)}
          items={selectedAttrItems as Array<any>} // THIS IS SO STUPID
          useNativeAndroidPickerStyle={false}
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
            addNewTune(tn);
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
export default function LList({songs, viewingPair, setSelectedTune, addNewTune}:
{songs: Array<tune>, viewingPair: viewingPair, setSelectedTune: Function, addNewTune: Function}){
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, updateSelectedAttr] = useState("title");
  const [search, setSearch] = useState("");

  let displaySongs = songs
  const fuse = new Fuse(songs, fuseOptions);
  if(search === ""){
    tuneSort(displaySongs, selectedAttr, listReversed);
  }else{
    displaySongs = fuse.search(search)
      .map(function(value, index){
        return value.item;
      })
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
          updateSelectedAttr={updateSelectedAttr}
          setViewing={viewingPair.setViewing}
          setSearch={setSearch}
          addNewTune={addNewTune}
          setSelectedTune={setSelectedTune}
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

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

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
  DeleteButton,
  ButtonText,
} from '../Style.tsx'
import tuneSort from '../tuneSort.tsx'
import RNPickerSelect from 'react-native-picker-select';
import Fuse from 'fuse.js';

const standardAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternative_title", "Alternative Title"],
  ["form", "Form"],
  //  ["bio", "Bio"],
  ["year", "Year"],
]);

import { tune, standard } from '../types.tsx';
import SongsList from '../SongsList.tsx';

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
    "Composers.name"
	]
};

function prettyPrint(object: unknown): string{
  if (typeof object == "string") return object as string;
  if (typeof object == "number") return JSON.stringify(object);
  if (Array.isArray(object)) return object.join(", ");
  return "(Empty)";
}

function ImporterHeader({
  listReversed,
  setListReversed,
  updateSelectedAttr,
  setViewing,
  setSearch
}: {
    listReversed: boolean | undefined,
    setListReversed: Function,
    updateSelectedAttr: Function,
    setViewing: Function,
    setSearch: Function
}){
  const selectedAttrItems = Array.from(standardAttrs.entries())
    .map((x) => {return {label: x[1], value: x[0]}});
  return(
    <View style={{backgroundColor: "#222"}}>
      <TextInput
        placeholder={"Search"}
        placeholderTextColor={"white"}
        onChangeText={(text) => setSearch(text)}
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
    </View>
    <DeleteButton onPress={() => setViewing(0)}>
      <ButtonText>Cancel import</ButtonText>
    </DeleteButton>
    </View>
  );
}
type viewingPair = {
  viewing: number;
  setViewing: Function;
}
export default function Importer({
  viewingPair,
  setSelectedTune,
  songsList
}: {
  viewingPair: viewingPair,
  setSelectedTune: Function,
  songsList: SongsList
}){
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, updateSelectedAttr] = useState("Title");
  const [search, setSearch] = useState("");
  const [standards, setStandards] = useState([] as Array<standard>);
  useEffect(() => {
    //The below functions may also create "template" json files if either is not present.
    fetch("https://api.jhilla.org/tunetracker/tunes", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(
      (response) => {
        console.log('response');
        if(response.ok){
          console.log("response ok!");
          response.json().then(json => {
            setStandards(json as standard[]);
            console.log("Standards:");
            console.log(standards);
          }).catch(reason => {
            console.error("ERROR:");
            console.error(reason);
          });
        }else{
          console.log("response not ok");
          console.log(response.status);
        }
      }
    ).catch(reason => {
      console.error("ERROR on sending http request");
      console.error(reason);
    });
  }, []);

  let displayStandards = standards;
  const fuse = new Fuse(standards, fuseOptions);
  if(search === ""){
    tuneSort(displayStandards, selectedAttr, listReversed);
  }else{
    displayStandards = fuse.search(search)
      .map(function(value){
        return value.item;
      });
  }
  return (
    standards.length ?
    <FlatList
      data={displayStandards}
      extraData={selectedAttr}
      ListHeaderComponent={
        <ImporterHeader listReversed={listReversed}
          setListReversed={setListReversed}
          updateSelectedAttr={updateSelectedAttr}
          setViewing={viewingPair.setViewing}
          setSearch={setSearch}/>
      }
      renderItem={({item, index, separators}) => (
        <TouchableHighlight
          key={item.title}
          onPress={() => {
            const tn: tune = {};
            tn.title = item.title;
            tn.composers = item['Composers'].map(comp => comp.name);
            songsList.addNewTune(tn);
            setSelectedTune(tn);
            viewingPair.setViewing(1);
          }}
          onLongPress={() => {
            const tn: tune = {};
            tn.title = item.title;
            tn.composers = item['Composers'].map(comp => comp.name);
            songsList.addNewTune(tn);
            setSelectedTune(tn);
            viewingPair.setViewing(2);
          }}
          onShowUnderlay={separators.highlight}
          onHideUnderlay={separators.unhighlight}>
          <View style={{backgroundColor: 'black', padding: 8}}>
            <Text>{item.title}</Text>
            <SubText>
              {selectedAttr != "Title"
                ? prettyPrint(item[selectedAttr as keyof standard])
                : prettyPrint(item["Composers"].map(comp => comp.name).join(", "))}
            </SubText>
          </View>
        </TouchableHighlight>
    )}
  />
  : <View style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
    <Text>Loading... (Your internet or the server may be down. Email jhilla@jhilla.org if you believe the server is down.)</Text>
  </View>
  );
}

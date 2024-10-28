//Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
import {
  FlatList,
  Switch,
  View,
  TouchableHighlight,
  BackHandler,
} from 'react-native';

import {
  Text,
  SubText,
  TextInput,
  DeleteButton,
  ButtonText,
  SMarginView
} from '../Style.tsx'
import itemSort from '../itemSort.tsx'
import {Picker} from '@react-native-picker/picker';
import Fuse from 'fuse.js';
import OnlineDB from '../OnlineDB.tsx';

const standardTuneAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternative_title", "Alternative Title"],
  ["form", "Form"],
  //  ["bio", "Bio"],
  ["year", "Year"],
]);
const standardComposersAttrs = new Map<string, string>([
  ["name", "Name"],
  ["birth", "Birth"],
  ["death", "Death"],
]);

import { composer, standard } from '../types.tsx';
import dateDisplay from '../dateDisplay.tsx';

const tuneFuseOptions = { // For finetuning the search algorithm
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
const composerFuseOptions = { // For finetuning the search algorithm
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
    "name",
	]
};

function prettyPrint(object: unknown): string{
  if (typeof object == "string") return object as string;
  if (typeof object == "number") return JSON.stringify(object);
  if (Array.isArray(object)) return object.join(", ");
  if (object instanceof Date) return dateDisplay(object);
  return "(Empty)";
}
function renderStandard(item: standard | composer, importFn: Function, separators: any, selectedAttr: keyof standard | composer, isComposer: boolean){
  let text = "";
  let subtext = "";
  if(isComposer){
    const comp = item as composer;
    text = comp.name;
    if(selectedAttr !== "name" as keyof composer){
      subtext = prettyPrint(comp[selectedAttr as keyof composer])
    }else{
      subtext = dateDisplay(comp["birth"])
    }
  }else{
    const stand = item as standard;
    text = stand.title;
    if(selectedAttr !== "Title" as keyof standard){
      subtext = prettyPrint(stand[selectedAttr as keyof standard])
    }else{
      if(stand["Composers"]){
        subtext = prettyPrint(stand["Composers"].map(comp => comp.name).join(", "));
      }else{
        subtext = "(No composers listed)"
      }
    }
  }
  return {text: text, subtext: subtext};
}

function ImporterHeader({
  listReversed,
  setListReversed,
  updateSelectedAttr,
  navigation,
  setSearch,
  importingId,
  importingComposers
}: {
  listReversed: boolean | undefined,
  setListReversed: Function,
  updateSelectedAttr: Function,
  navigation: any,
  setSearch: Function,
  importingId: boolean,
  importingComposers: boolean
}){
  const standardAttrs = importingComposers ? standardComposersAttrs : standardTuneAttrs;
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
        <Picker
          onValueChange={(value) => updateSelectedAttr(value)}
        >
          {
            (selectedAttrItems).map(
              (attrPair) => 
              <Picker.Item label={attrPair.label} value={attrPair.value} key={attrPair.value}
                style={{color: "white", backgroundColor: "#222", fontSize: 20, fontWeight: 200}}
              />
              )
          }
        </Picker>
      </View>
      <View style={{alignItems: "flex-end"}}>
        <SubText style={{fontWeight: "medium"}}>{"Reverse sort:"}</SubText>
      </View>
      <View style={{flex: 1, alignItems: "center"}}>
        <Switch value={listReversed} onValueChange={() => setListReversed(!listReversed)}/>
      </View>
    </View>
    <DeleteButton onPress={() => navigation.goBack()}>
      <ButtonText>Cancel import</ButtonText>
    </DeleteButton>
    </View>
  );
}

export default function Importer({
  importFn,
  navigation,
  importingId,
  importingComposers
}: {
  importFn: Function,
  navigation: any,
  importingId: boolean,
  importingComposers: boolean
}){
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', navigation.goBack)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', navigation.goBack)
    }
  }, []);
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, updateSelectedAttr] = useState(importingComposers ? "name" : "Title");
  const [search, setSearch] = useState("");
  const standards = importingComposers ? OnlineDB.getComposers() : OnlineDB.getStandards();

  let displayStandards = standards;
  const fuse = new Fuse(standards, importingComposers ? composerFuseOptions : tuneFuseOptions);
  if(search === ""){
    itemSort(displayStandards, selectedAttr, listReversed);
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
          navigation={navigation}
          importingId={importingId}
          importingComposers={importingComposers}
          setSearch={setSearch}/>
      }
      renderItem={({item, index, separators}) => {
        let texts = renderStandard(item, importFn, separators, selectedAttr as keyof standard | composer, importingComposers)
        return (
          <TouchableHighlight
            key={item.name}
            onPress={() => {
              //TODO: Abstract into function
              importFn(item, true);
            }}
            onLongPress={() => {
              importFn(item);
            }}
            onShowUnderlay={separators.highlight}
            onHideUnderlay={separators.unhighlight}>
            <View style={{backgroundColor: 'black', padding: 8}}>
              <Text>{texts?.text}</Text>
              <SubText>{texts?.subtext}</SubText>
            </View>
          </TouchableHighlight>
      )}
    }
  />
  : <View style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
    <SMarginView>
      <View style={{alignItems: "center"}}>
        <Text>Loading...</Text>
      </View>
      <SMarginView>
        <SubText>Your internet or the server may be down. Email jhilla@jhilla.org if you believe the server is down. If the server is down, then tunetracker.jhilla.org should also be down!</SubText>
      </SMarginView>
      <DeleteButton onPress={() => {navigation.goBack()}}><ButtonText>Cancel import</ButtonText></DeleteButton>
    </SMarginView>
    </View>
  );
}

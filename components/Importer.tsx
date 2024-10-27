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

const standardAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternative_title", "Alternative Title"],
  ["form", "Form"],
  //  ["bio", "Bio"],
  ["year", "Year"],
]);

import { standard } from '../types.tsx';

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
  navigation,
  setSearch,
  importingId
}: {
  listReversed: boolean | undefined,
  setListReversed: Function,
  updateSelectedAttr: Function,
  navigation: any,
  setSearch: Function,
  importingId: boolean
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
        <Picker
          onValueChange={(value) => updateSelectedAttr(value)}
        >
          {
            (selectedAttrItems).map(
              (attrPair) => 
              <Picker.Item label={attrPair.label} value={attrPair.value} key={attrPair.value}
                style={{color: "white", backgroundColor:"black"}}
              />
              )
          }
        </Picker>
      </View>
      <View style={{alignItems: "flex-end"}}>
        <SubText>{"Reverse sort:"}</SubText>
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
  importingId
}: {
  importFn: Function,
  navigation: any,
  importingId: boolean
}){
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', navigation.goBack)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', navigation.goBack)
    }
  }, []);
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, updateSelectedAttr] = useState("Title");
  const [search, setSearch] = useState("");
  const standards = OnlineDB.getStandards();

  let displayStandards = standards;
  const fuse = new Fuse(standards, fuseOptions);
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
          setSearch={setSearch}/>
      }
      renderItem={({item, index, separators}) => (
        <TouchableHighlight
          key={item.title}
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

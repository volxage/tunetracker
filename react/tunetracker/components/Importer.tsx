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
  DeleteButton,
  ButtonText,
} from '../Style.tsx'
import tuneSort from '../tuneSort.tsx'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import RNPickerSelect from 'react-native-picker-select';

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
const standardAttrs = new Map<string, string>([
  ["Rank", "JazzStandards.com ranking"],
  ["Title", "Title"],
  ["Year", "Year"],
  ["Composer(s)", "Composer(s)"],
  ["Lyricist(s)", "Lyricist(s)"],
]);

export type standard = {
  "Rank": string
  "Title": string
  "Year": string
  "Composer(s)": string
  "Lyricist(s)": string
}


function prettyPrint(object: unknown): string{
  if (typeof object == "string") return object as string;
  if (typeof object == "number") return JSON.stringify(object);
  if (Array.isArray(object)) return object.join(", ");
  return "(Empty)"
}

function ImporterHeader({listReversed, setListReversed, updateSelectedAttr, setViewing}:
{listReversed: boolean | undefined, setListReversed: Function, updateSelectedAttr: Function, setViewing: Function}){
  const selectedAttrItems = Array.from(standardAttrs.entries()).map((x) => {return {label: x[1], value: x[0]}});
return(
  <View>
  <TextInput
  placeholder={"Search"}
  placeholderTextColor={"white"}
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
export default function Importer({standards, viewingPair, setSelectedTune, addNewTune}:
{standards: Array<standard>, viewingPair: viewingPair, setSelectedTune: Function, addNewTune: Function}){
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, updateSelectedAttr] = useState("Title");
  tuneSort(standards, selectedAttr, listReversed);
  return (
    <FlatList
      data={standards}
      extraData={selectedAttr}
      ListHeaderComponent={
        <ImporterHeader listReversed={listReversed} setListReversed={setListReversed} updateSelectedAttr={updateSelectedAttr} setViewing={viewingPair.setViewing}/>
      }
      renderItem={({item, index, separators}) => (
        <TouchableHighlight
          key={item.Title}
          onPress={() => {
            const tn: tune = {};
            tn.title = item.Title;
            tn.composers = item['Composer(s)'].split(", ");
            addNewTune(tn);
            setSelectedTune(tn);
            viewingPair.setViewing(1);
          }}
          onShowUnderlay={separators.highlight}
          style={styles.bordered}
          onHideUnderlay={separators.unhighlight}>
          <View style={{backgroundColor: 'black', padding: 8}}>
            <Text>{item.Title}</Text>
            <SubText>{selectedAttr != "Title" ? prettyPrint(item[selectedAttr as keyof standard]) : prettyPrint(item["Composer(s)"])}</SubText>
          </View>
        </TouchableHighlight>
    )}
  />
  );
}

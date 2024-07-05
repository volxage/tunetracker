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

function LListHeader({listReversed, setListReversed, updateSelectedAttr, setViewing}:
{listReversed: boolean | undefined, setListReversed: Function, updateSelectedAttr: Function, setViewing:Function}){
  const selectedAttrItems = Array.from(prettyAttrs.entries()).map((x) => {return {label: x[1], value: x[0]}});
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
  <Button onPress={() => setViewing(3)}>
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
export default function LList({songs, viewingPair, setSelectedTune}: {songs: Array<tune>, viewingPair: viewingPair, setSelectedTune: Function}){
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, updateSelectedAttr] = useState("title");
  tuneSort(songs, selectedAttr, listReversed);
  return (
    <FlatList
      data={songs}
      extraData={selectedAttr}
      ListHeaderComponent={
        <LListHeader listReversed={listReversed} setListReversed={setListReversed} updateSelectedAttr={updateSelectedAttr} setViewing={viewingPair.setViewing} />
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

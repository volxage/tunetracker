/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {isValidElement, useState} from 'react';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {
  Text,
  TextInput,
  styles
} from '../Style.tsx'
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
  Button,
} from 'react-native';

type editPair = {
  editing: number;
  setEditorVisible: Function;
}
import TypeField from './TypeField.tsx';

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
function Editor({prettyAttrs, editPair, selectedTune, setSelectedTune}:
{prettyAttrs: Array<[string, string]>, editPair: editPair, selectedTune: tune, setSelectedTune: Function}): React.JSX.Element {
  function handleSetSelectedTune(attr_key: keyof tune, value: undefined){
    selectedTune[attr_key] = value
    setSelectedTune(selectedTune)
  }
  return (
    <SafeAreaView>
      <FlatList
        data={prettyAttrs}
        renderItem={({item, index, separators}) => (
          //Why is this a TouchableHighlight and not a regular view?
          <TouchableHighlight
            key={item[0]}
            onShowUnderlay={separators.highlight}
            style={styles.bordered}
            onHideUnderlay={separators.unhighlight}>
            <TypeField attr={selectedTune[item[0] as keyof tune]} attrKey={item[0] as keyof tune} attrName={item[1]} handleSetSelectedTune={handleSetSelectedTune}/>
          </TouchableHighlight>

      )}
      ListFooterComponent={
        <Button
          title="Save"
          onPress={() => {console.log(selectedTune); editPair.setEditorVisible(!editPair.editing)}}
        />
      }
    />
  </SafeAreaView>
  );
}
export default Editor;

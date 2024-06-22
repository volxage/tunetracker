/**
 * Tunetracker
 * https://github.com/volxage/tunetracker
 *
 * @format
 */

import React, {isValidElement, useState} from 'react';
import {
  styles,
  Button,
  DeleteButton,
  ButtonText,
  Text,
  SubText,
} from '../Style.tsx'
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
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
function Editor({prettyAttrs, editPair, selectedTune, replaceSelectedTune}:
{prettyAttrs: Array<[string, string]>, editPair: editPair, selectedTune: tune, replaceSelectedTune: Function}): React.JSX.Element {
  const [currentTune, setCurrentTune] = useState(JSON.parse(JSON.stringify(selectedTune)) as tune) //Intentional copy to allow cancelling of edits
  function handleSetCurrentTune(attr_key: keyof tune, value: undefined){
    //Inefficient solution, but there are no Map functions such as "filter" in mapped types
    const cpy = JSON.parse(JSON.stringify(selectedTune)) as tune
    cpy[attr_key] = value
    setCurrentTune(cpy)
  }
  return (
    <SafeAreaView style={{flex: 1}}>
      <FlatList
        data={prettyAttrs}
        renderItem={({item, index, separators}) => (
          //Why is this a TouchableHighlight and not a regular view?
          <TouchableHighlight
            key={item[0]}
            onShowUnderlay={separators.highlight}
            style={styles.bordered}
            onHideUnderlay={separators.unhighlight}>
            <TypeField attr={currentTune[item[0] as keyof tune]} attrKey={item[0] as keyof tune} attrName={item[1]} handleSetCurrentTune={handleSetCurrentTune}/>
          </TouchableHighlight>

      )}
      ListFooterComponent={
        <View style={{flexDirection: "row", backgroundColor: "black"}}>
          <View style={{flex: 1}}>
            <Button
              onPress={() => {replaceSelectedTune(selectedTune, currentTune); editPair.setEditorVisible(!editPair.editing);}}
            ><ButtonText>Save</ButtonText></Button>
          </View>
          <View style={{flex: 1}}>
            <DeleteButton
              onPress={() => {editPair.setEditorVisible(!editPair.editing)}}
            ><ButtonText>Cancel Changes</ButtonText></DeleteButton>
          </View>
        </View>
      }
    />
  </SafeAreaView>
  );
}
export default Editor;

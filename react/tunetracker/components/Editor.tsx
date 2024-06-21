/**
 * Tunetracker
 * https://github.com/volxage/tunetracker
 *
 * @format
 */

import React, {isValidElement, useState} from 'react';
import {
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
function Editor({prettyAttrs, editPair, selectedTune, replaceSelectedTune}:
{prettyAttrs: Array<[string, string]>, editPair: editPair, selectedTune: tune, replaceSelectedTune: Function}): React.JSX.Element {
  const [currentTune, setCurrentTune] = useState(JSON.parse(JSON.stringify(selectedTune)) as tune) //Intentional copy to allow cancelling of edits
  function handleSetCurrentTune(attr_key: keyof tune, value: undefined){
    currentTune[attr_key] = value
    setCurrentTune(currentTune)
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
            <TypeField attr={currentTune[item[0] as keyof tune]} attrKey={item[0] as keyof tune} attrName={item[1]} handleSetCurrentTune={handleSetCurrentTune}/>
          </TouchableHighlight>

      )}
      ListFooterComponent={
        <View style={{flexDirection: "row"}}>
          <View style={{flex: 1}}>
            <Button
              title="Save"
              onPress={() => {replaceSelectedTune(selectedTune, currentTune); editPair.setEditorVisible(!editPair.editing);}}
              />
          </View>
          <View style={{flex: 1}}>
            <Button
              title="Cancel Changes"
              onPress={() => {editPair.setEditorVisible(!editPair.editing)}}
            />
          </View>
        </View>
      }
    />
  </SafeAreaView>
  );
}
export default Editor;

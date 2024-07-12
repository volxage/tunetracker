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

type viewingPair = {
  viewing: number;
  setViewing: Function;
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
  "id"?: string
}
function Editor({prettyAttrs, viewingPair, selectedTune, replaceSelectedTune, deleteTune}:
{prettyAttrs: Array<[string, string]>, viewingPair: viewingPair, selectedTune: tune, replaceSelectedTune: Function, deleteTune: Function}): React.JSX.Element {
  const [currentTune, setCurrentTune] = useState(JSON.parse(JSON.stringify(selectedTune)) as tune) //Intentional copy to allow cancelling of edits
  function handleSetCurrentTune(attr_key: keyof tune, value: undefined){
    //Inefficient solution, but there are no Map functions such as "filter" in mapped types
    const cpy = JSON.parse(JSON.stringify(currentTune)) as tune
    cpy[attr_key] = value
    setCurrentTune(cpy)
  }
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "black"}}>
      <FlatList
        data={prettyAttrs}
        renderItem={({item, index, separators}) => (
          //Why is this a TouchableHighlight and not a regular view?
          <View>
          <TouchableHighlight
            key={item[0]}
            onShowUnderlay={separators.highlight}
            style={styles.bordered}
            onHideUnderlay={separators.unhighlight}>
            <TypeField attr={currentTune[item[0] as keyof tune]} attrKey={item[0] as keyof tune} attrName={item[1]} handleSetCurrentTune={handleSetCurrentTune}/>
          </TouchableHighlight>
        </View>
      )}
      ListFooterComponent={
        <View>
          <DeleteButton
            onLongPress={() => {deleteTune(selectedTune); viewingPair.setViewing(0);}} >
            <ButtonText>DELETE TUNE (CAN'T UNDO! Press and hold)</ButtonText>
          </DeleteButton>
          <View style={{flexDirection: "row", backgroundColor: "black"}}>
            <View style={{flex: 1}}>
              <Button
                onPress={() => {replaceSelectedTune(selectedTune, currentTune); viewingPair.setViewing(!viewingPair.viewing);}}
              ><ButtonText>Save</ButtonText>
              </Button>
            </View>
          <View style={{flex: 1}}>
            <DeleteButton
              onPress={() => {viewingPair.setViewing(!viewingPair.viewing)}}
            ><ButtonText>Cancel Edit</ButtonText></DeleteButton>
          </View>
        </View>
      </View>
      }
    />
  </SafeAreaView>
  );
}
export default Editor;

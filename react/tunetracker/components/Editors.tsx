/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {isValidElement, useState} from 'react';
import songsJson from '../songs.json';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {
  Text,
  SubText,
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
  editing: boolean;
  setEditorVisible: Function;
}
const songs: Array<tune> = songsJson

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

function MiniEditor({songMiniAttrs, editPair, selectedTune}: {songMiniAttrs: Array<[string, string, number]>, editPair: editPair, selectedTune: tune}): React.JSX.Element {
  return (
    <SafeAreaView>
      <FlatList
        data={songMiniAttrs}
        renderItem={({item, index, separators}) => (
          //Why is this a TouchableHighlight and not a regular view?
          <TouchableHighlight
            key={item[0]}
            onShowUnderlay={separators.highlight}
            style={styles.bordered}
            onHideUnderlay={separators.unhighlight}>
            <View style={{backgroundColor: 'black', padding: 8}}>
              <Text>{item[1]}</Text>
              <MultiSlider
                min={0}
                max={100}
                values={[(selectedTune[item[0] as keyof tune] as unknown) as number]}
                onValuesChangeFinish={(values) => (selectedTune[item[0] as keyof tune] as number) = values[0]}
              />
            </View>
          </TouchableHighlight>
      )}
    />
    <Button
      title="Save"
      onPress={() => editPair.setEditorVisible(!editPair.editing)}
    />
  </SafeAreaView>
  );
}
export default MiniEditor;

import {
  Text,
  TextInput,
  DeleteButton,
  styles
} from '../Style.tsx'
import React, {isValidElement, useState} from 'react';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
  Button,
} from 'react-native';
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
const tuneDefaults = {
  "title": "New song",
  "alternative_title": "",
  "composers": [],
  "form": [],
  "notable_recordings": [],
  "keys": [],
  "styles": [],
  "tempi": [],
  "contrafacts": [], // In the future, these could link to other tunes
  "playthroughs": 0,
  "form_confidence": 0,
  "melody_confidence": 0,
  "solo_confidence": 0,
  "lyrics_confidence": 0,
  "played_at": []
}

function TypeField({attr, attrKey, attrName, handleSetCurrentTune}: {attr: unknown, attrKey: keyof tune, attrName: string, handleSetCurrentTune: Function}){
  if(attr == null){
    attr = tuneDefaults[attrKey]
  }
  if (typeof attr == "string"){
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Text>{attrName}</Text>
        <TextInput defaultValue={attr} placeholderTextColor={"grey"}
          onChangeText={(text) => handleSetCurrentTune(attrKey, text)}
        />
      </View>
    );
  }else if (typeof attr == "number"){
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Text>{attrName}</Text>
        <MultiSlider
          min={0}
          max={100}
          values={[attr as number]}
          onValuesChangeFinish={(values) => handleSetCurrentTune(attrKey, values[0])}
        />
      </View>
    );
  }else if (Array.isArray(attr)){
    const [arrAttr, setarrAttr] = useState(attr)
    //    console.log(arrAttr)

    function handleReplace(value: string, index: number){
      const newArrAttr = arrAttr.map((c, i) => {
        return i === index ? value : c;
      });
      setarrAttr(newArrAttr)
      handleSetCurrentTune(attrKey, arrAttr)
    }

    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Text>{attrName}</Text>
        <FlatList
          data={arrAttr}
          renderItem={({item, index, separators}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 4}}>
                <TextInput placeholder={"Type new value here"} placeholderTextColor={"grey"} defaultValue={item} onChangeText={(text) => handleReplace(text, index)}/>
              </View>
              <View style={{flex:1, alignContent: 'flex-end'}}>
                <DeleteButton title={"Delete"} onPress={() => setarrAttr((arrAttr as string[]).filter((a) => {return a !== item})) } />
              </View>
            </View>
          )}
        />
        <Button title={"Add new item"} onPress={() => setarrAttr((arrAttr as string[]).concat(["New item"]))}/>
      </View>
    )
  }
}

export default TypeField;

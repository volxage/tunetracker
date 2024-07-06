import {
  Text,
  TextInput,
  DeleteButton,
  ButtonText,
  Button,
  styles,
  Title,
} from '../Style.tsx'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, {isValidElement, useEffect, useState} from 'react';
import MultiSlider from '@react-native-community/slider';
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
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
        <Title>{attrName.toUpperCase()}</Title>
        <TextInput defaultValue={attr} placeholderTextColor={"grey"}
          onChangeText={(text) => handleSetCurrentTune(attrKey, text)}
        />
      </View>
    );
  }else if (typeof attr == "number"){
    const [icon, setIcon] = useState();

    useEffect(() => {
      Icon.getImageSource('circle', 26, 'white')
        .then(setIcon);
    }, []);
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <MultiSlider
          minimumValue={0}
          maximumValue={100}
          value={attr as number}
          onSlidingComplete={(value) => {handleSetCurrentTune(attrKey, value)}}
          thumbImage={icon}
          style={{marginVertical: 20}}
          minimumTrackTintColor='cadetblue'
          maximumTrackTintColor='gray'
        />
      </View>
    );
  }else if (Array.isArray(attr)){
    const [arrAttr, setarrAttr] = useState(attr)

    function handleReplace(value: string, index: number){
      const newArrAttr = arrAttr.map((c, i) => {
        return i === index ? value : c;
      });
      setarrAttr(newArrAttr)
      handleSetCurrentTune(attrKey, arrAttr)
    }
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 3}}>
            <Title>{attrName.toUpperCase()}</Title>
          </View>
          <View style={{alignContent: 'flex-end', flex: 1}}>
            <Button onPress={() => setarrAttr((arrAttr as string[]).concat(["New item"]))}>
              <ButtonText><Icon name="plus" size={30}/></ButtonText>
            </Button>
          </View>
        </View>
        <FlatList
          data={arrAttr}
          renderItem={({item, index, separators}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 3}}>
                <TextInput placeholder={"Type new value here"} placeholderTextColor={"grey"} defaultValue={item} onChangeText={(text) => handleReplace(text, index)}/>
              </View>
              <View style={{flex:1, alignContent: 'flex-end'}}>
                <DeleteButton onPress={() => setarrAttr((arrAttr as string[]).filter((a) => {return a !== item})) } >
                  <ButtonText><Icon name="close" size={30}/></ButtonText>
                </DeleteButton>
              </View>
            </View>
          )}
        />
      </View>
    )
  }
}

export default TypeField;

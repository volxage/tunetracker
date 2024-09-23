import {
  TextInput,
  DeleteButton,
  ButtonText,
  Button,
  Title,
  Text,
  SubText,
  SMarginView
} from '../../Style.tsx'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Switch,
  View,
} from 'react-native';
import OnlineDB from '../../OnlineDB.tsx';
import Composer from '../../model/Composer.js';
import {composer} from '../../types.tsx';

function prettyPrint(object: unknown): string{
//                    {((item.birth && item.birth !== null && item.birth.split) ? "B: " + item.birth.split("T")[0] : "B: none") + ", " + ((item.death && item.death !== null && item.death.split) ? "D: " + item.death.split("T")[0]  : "D: none")}
  if(object instanceof Date){
    // For some reason the month number for January in this system is 0...
    return `${object.getFullYear()}-${object.getMonth() + 1}-${object.getUTCDate()}`;
  }else if (!object){
    return "None";
  }else{
    return (object as string).split("T")[0];
  }
}

export default function ComposerField({
  attr,
  navigation
}:{
  attr: Array<composer | Composer>,
  navigation: any
}){
  const [composerExpanded, setComposerExpanded] = useState(false);
  let stand = null;
  if(typeof attr !== "undefined" && attr !== 0){
    stand = OnlineDB.getStandardById(attr as number);
  }
  return(
    <View>
      <Title>COMPOSERS</Title>
      <FlatList
        data={attr}
        renderItem={({item, index, separators}) => (
          <View style={{padding: 8}}>
            <Text>{item.name}</Text>
            <SubText>{`B: ${prettyPrint(item.birth)}, D: ${prettyPrint(item.death)}`}</SubText>
          </View>
      )}
    />
    {
      <View>
        <Button
          onPress={() => {navigation.navigate("ComposerSelector")}}
        >
          <ButtonText>Select Composers</ButtonText>
        </Button>
      </View>
    }
    </View>
  )
}

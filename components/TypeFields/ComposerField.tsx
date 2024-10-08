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
import dateDisplay from '../../dateDisplay.tsx';


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
            <SubText>{`B: ${dateDisplay(item.birth)}, D: ${dateDisplay(item.death)}`}</SubText>
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

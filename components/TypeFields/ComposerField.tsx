import {
  TextInput,
  DeleteButton,
  ButtonText,
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
import {composer} from '../../types.ts';
import dateDisplay from '../../textconverters/dateDisplay.tsx';
import { Button } from '../../simple_components/Button.tsx';


export default function ComposerField({
  attr,
  navigation
}:{
  attr: Array<composer | Composer>,
  navigation: any
}){
  const [composerExpanded, setComposerExpanded] = useState(false);
  return(
    <View style={{padding: 8}}>
      <Title style={{textAlign: "center"}}>COMPOSERS</Title>
      <FlatList
        data={attr}
        renderItem={({item, index, separators}) => (
          <View style={{padding: 8}}>
            <Text style={{textAlign: "center", fontWeight: "300"}}>{item.name}</Text>
            <SubText style={{textAlign: "center"}}>{`B: ${dateDisplay(item.birth)}, D: ${dateDisplay(item.death)}`}</SubText>
          </View>
      )}
    />
    {
      <View style={{flexDirection: "row"}}>
        <View style={{flex:1}}></View>
        <Button
          onPress={() => {navigation.navigate("ComposerSelector")}}
          style={{flex: 3}}
          text='Select Composers'
        />
        <View style={{flex:1}}></View>
      </View>
    }
    </View>
  )
}

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

export default function ComposerField({
  attr,
  navigation
}:{
  attr: unknown,
  navigation: any
}){
  const [composerExpanded, setComposerExpanded] = useState(false);
  let stand = null;
  if(typeof attr !== "undefined" && attr !== 0){
    stand = OnlineDB.getStandardById(attr as number);
  }
  return(
    <View>
      <Title></Title>
      <Button
        onPress={() => {setComposerExpanded(!composerExpanded)}}
        style={{backgroundColor: "#222"}}
      >
        <ButtonText>
          <Icon
            name={composerExpanded ? "earth-minus" : "earth-plus"}
            size={30}
          />
        </ButtonText>
      </Button>
      {
        composerExpanded &&
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

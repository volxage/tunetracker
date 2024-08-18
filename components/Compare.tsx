import React, {isValidElement, useEffect, useState} from 'react';
import {
  Button,
  DeleteButton,
  ButtonText,
  SubText,
  Title,
  BackgroundView,
  Text,
} from '../Style.tsx'

import { editorAttrs } from '../types.tsx';

import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
} from 'react-native';

import TypeField from './TypeField.tsx';
import SongsList from '../SongsList.tsx';
import Playlists from '../Playlists.tsx';
import { tune, standard, playlist } from '../types.tsx';
import reactotron from 'reactotron-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons.js';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import {BackHandler} from 'react-native';

//Anything that ends with "confidence" is also excluded
const exclude_set = new Set([
  "db_id",
  "playlists",
  "playthroughs"
]);

const empty_equivalent = new Set([
  "",
  "[]",
  "{}"
]);
function stringify(value: any): string{
  switch(typeof value){
    case "string":
      return value
    case "number":
      return JSON.stringify(value);
  }
  if(Array.isArray(value)){
    return value.join(", ");
  }
  return "Unable to parse"
}
export default function Compare({
  currentTune,
  currentStandard,
  navigation
}:
{
  currentTune: tune,
  currentStandard: standard,
  navigation: any
}){
  return(
  <BackgroundView>
  <FlatList
    data={editorAttrs.filter((item) => (!exclude_set.has(item[0]) && !item[0].endsWith("confidence")))}
    renderItem={({item, index, separators}) => (
      <>
        <Title>{item[1]}</Title>
        {
          (item[0] in currentStandard && !empty_equivalent.has(currentStandard[item[0] as keyof standard].toString().trim())) ?
          <View>
            <View>
              <SubText>{stringify(currentStandard[item[0] as keyof standard])}</SubText>
            </View>
            <View style={{flexDirection: "row"}}>
              <Button style={{backgroundColor: "#222", flex: 1}}>
                <ButtonText><Icon name="database-arrow-up" size={30} /></ButtonText>
              </Button>
              <Button style={{backgroundColor: "#222", flex: 1}}>
                <ButtonText><Icon name="dots-horizontal" size={30} /></ButtonText>
              </Button>
              <Button style={{backgroundColor: "#222", flex: 1}}>
                <ButtonText><Icon name="account-arrow-down" size={30} /></ButtonText>
              </Button>
            </View>
            <View>
              <SubText>{stringify(currentTune[item[0] as keyof tune])}</SubText>
            </View>
          </View>
          :
          <View>
            <Text>
              <Icon name="database-off" size={30} color="darkred" />
            </Text>
          </View>
          }
        </>
      )}
      ListFooterComponent={(props) => (
        <>
          <View>
            <Button style={{backgroundColor: "darkgreen"}}
            >
              <ButtonText>Submit draft to database</ButtonText>
            </Button>
          </View>
          <View style={{flexDirection: "row"}}>
            <Button style={{flex: 1}}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <ButtonText>Save changes</ButtonText>
            </Button>
            <DeleteButton style={{flex: 1}}
              onPress={() => {navigation.goBack()}}
            >
              <ButtonText>Cancel changes</ButtonText>
            </DeleteButton>
          </View>
        </>
      )}
    />
</BackgroundView>
  );
}

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
import { playlist, tune_draft } from '../../types.tsx';
import OnlineDB from '../../OnlineDB.tsx';

export default function DbConnection({
  attr,
  navigation
}:{
  attr: unknown,
  navigation: any
}){
  const [connectTuneExpanded, setConnectTuneExpanded] = useState(false);
  let stand = null;
  if(typeof attr !== "undefined" && attr !== 0){
    stand = OnlineDB.getStandardById(attr as number);
  }
  return(
    <View>
      <Title>DATABASE CONNECTION</Title>
      <Button
        onPress={() => {setConnectTuneExpanded(!connectTuneExpanded)}}
        style={{backgroundColor: "#222"}}
      >
        <ButtonText>
          <Icon
            name={connectTuneExpanded ? "earth-minus" : "earth-plus"}
            size={30}
          />
        </ButtonText>
      </Button>
      {
        connectTuneExpanded &&
        <View>
          {
            (stand === null || typeof stand === "undefined") ?
            <View>
              <SMarginView>
                <SubText>
                  You haven't connected this item to the database yet! Connecting an item allows you to request changes to the online copy of the item, meaning other users can use your updated information, and new users can import more accurate information! It also gives you the ability to import changes from the database uploaded from other users.
                </SubText>
              </SMarginView>
              <Button
                onPress={() => {navigation.navigate("ImportID")}}
              >
                <ButtonText>Connect to a tune</ButtonText>
              </Button>
            </View>
            :
            <View>
              <SubText>Connected!</SubText>
              <SubText>Title: {stand.title}</SubText>
              <SubText>Bio: {stand.bio}</SubText>
              <SubText>Year: {stand.year}</SubText>
              <Button onPress={() => {navigation.navigate("Compare")}}>
                <ButtonText>Compare and Change</ButtonText>
              </Button>
            </View>
          }
        </View>
      }
    </View>
  )
}

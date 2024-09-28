import {
  ButtonText,
  Button,
  Title,
  SubText,
  SMarginView
} from '../../Style.tsx'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, {useEffect, useState} from 'react';
import {composer, standard, tune_draft} from '../../types.tsx';
import {
  View,
} from 'react-native';
import OnlineDB from '../../OnlineDB.tsx';
import dateDisplay from '../../dateDisplay.tsx';

export default function DbConnection({
  attr,
  navigation,
  isComposer
}:{
  attr: unknown,
  navigation: any,
  isComposer: boolean
}){
  const [connectTuneExpanded, setConnectTuneExpanded] = useState(false);
  let item = null;
  if(typeof attr !== "undefined" && attr !== 0){
    if(isComposer){
      item = OnlineDB.getComposerById(attr as number);
      console.log(item);
      console.log("is compoesr");
    }else{
      item = OnlineDB.getStandardById(attr as number);
    }
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
            (item === null || typeof item === "undefined") ?
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
            <Preview item={item} isComposer={isComposer} navigation={navigation} />
          }
        </View>
      }
    </View>
  )
}
function Preview({
  item, isComposer, navigation
}:
{
  item: composer | standard,
  isComposer: boolean,
  navigation: any
}
){
  if(isComposer){
    const comp = item as composer
    return (
            <View>
              <SubText>Connected!</SubText>
              <SubText>Name: {comp.name}</SubText>
              <SubText>Bio: {comp.bio}</SubText>
              <SubText>Birth: {dateDisplay(comp.birth)}</SubText>
              <SubText>Death: {dateDisplay(comp.death)}</SubText>
              <Button onPress={() => {navigation.navigate("ComposerCompare")}}>
                <ButtonText>Compare and Change (Coming soon!)</ButtonText>
              </Button>
            </View>
    );
  }
  if(!isComposer){
    const tn = item as tune_draft
    return (
            <View>
              <SubText>Connected!</SubText>
              <SubText>Title: {tn.title}</SubText>
              <SubText>Bio: {tn.bio}</SubText>
              <SubText>Year: {tn.year}</SubText>
              <Button onPress={() => {navigation.navigate("Compare")}}>
                <ButtonText>Compare and Change</ButtonText>
              </Button>
            </View>
    );
  }
}

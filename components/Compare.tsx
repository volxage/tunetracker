//Copyright 2024 Jonathan Hiliard
import React, {isValidElement, useEffect, useState} from 'react';
import {
  Button,
  DeleteButton,
  ButtonText,
  SubText,
  Title,
  BackgroundView,
  Text,
  SMarginView,
} from '../Style.tsx'

import { composer, editorAttrs, tune_draft, tuneDefaults } from '../types.tsx';

import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
} from 'react-native';

import { standard, playlist } from '../types.tsx';
import reactotron from 'reactotron-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons.js';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import {BackHandler} from 'react-native';
import Tune from '../model/Tune.js';
import Composer from '../model/Composer.js';

//Anything that ends with "confidence" is also excluded
const exclude_set = new Set([
  "dbId",
  "playlists",
  "playthroughs",
  "composers"
]);

const empty_equivalent = new Set([
  "",
  "[]",
  "{}",
  "unknown"
]);
function stringify(value: any): string{
  switch(typeof value){
    case "string":
      return value
    case "number":
      return JSON.stringify(value);
    case "boolean":
      if(value){
        return "True"
      }
      return "False"
  }
  if(Array.isArray(value)){
    return value.join(", ");
  }
  return "Unable to parse"
}
type local_type = tune_draft | composer;
type online_type = standard | composer;
function CompareField({item, index, onlineVersion, currentItem, handleReplaceAttr}:
{
  item: string[],
  index: number,
  onlineVersion: online_type
  currentItem: local_type,
  handleReplaceAttr: Function
}){
  const standardAttrPresent = (item[0] in onlineVersion
            && !empty_equivalent.has(onlineVersion[item[0] as keyof online_type]
              .toString().trim()));
  const tuneAttrPresent = (item[0] in currentItem
            && !empty_equivalent.has(currentItem[item[0] as keyof local_type]
              .toString().trim()));
  if(!standardAttrPresent && !tuneAttrPresent){
    return(<></>)
  }
  if(onlineVersion[item[0] as keyof online_type] === currentItem[item[0] as keyof local_type]){
    return(
      <View>
        <Title>{item[1]}</Title>
        <SubText>{currentItem[item[0] as keyof local_type]}</SubText>
      </View>
    )
  }
  const [choice, setChoice] = useState(1); // 0 - DB   1 - Neither   2 - Local
  return(
    <>
      <Title>{item[1]}</Title>
      <View>
        {
          (item[0] in onlineVersion
            && !empty_equivalent.has(onlineVersion[item[0] as keyof online_type]
              .toString().trim())) &&
              <View>
                <SMarginView>
                  <SubText>{stringify(onlineVersion[item[0] as keyof online_type])}</SubText>
                </SMarginView>
              </View>
            }
            <View style={{flexDirection: "row"}}>
              {
                (item[0] in onlineVersion
                  && !empty_equivalent.has(onlineVersion[item[0] as keyof online_type]
                    .toString().trim())) ?
                    <Button style={{
                        backgroundColor: choice === 0 ? "#338" : "#222",
                        flex: 1
                      }}
                      onPress={() => {
                        setChoice(0);
                        handleReplaceAttr(item[0], onlineVersion[item[0] as keyof online_type], true);
                        handleReplaceAttr(item[0], onlineVersion[item[0] as keyof online_type], false);
                      }}
                      >
                      <ButtonText><Icon name="database-arrow-up" size={30} /></ButtonText>
                    </Button>
                    :
                    <Button style={{
                      flex:1,
                        backgroundColor: "#111"
                    }}>
                      <ButtonText><Icon name="database-off" size={30} color="darkred" /></ButtonText>
                    </Button>
                  }
                  <Button style={{
                    backgroundColor: choice === 1 ? "#338" : "#222",
                      flex: 1
                    }}
                    onPress={() => {
                      setChoice(1);
                      // Reset both tune and standard
                      handleReplaceAttr(item[0], currentItem[item[0] as keyof local_type], false);
                      handleReplaceAttr(item[0], onlineVersion[item[0] as keyof online_type], true);
                    }}
                  >
                    <ButtonText><Icon name="dots-horizontal" size={30} /></ButtonText>
                  </Button>
                  <Button style={{
                    backgroundColor: choice === 2 ? "#338" : "#222",
                      flex: 1
                  }}
                  onPress={() => {
                    setChoice(2);
                    handleReplaceAttr(item[0], currentItem[item[0] as keyof local_type], false);
                    handleReplaceAttr(item[0], currentItem[item[0] as keyof local_type], true);
                  }}
                  >
                    <ButtonText><Icon name="account-arrow-down" size={30} /></ButtonText>
                  </Button>
                </View>
                <View>
                  <SMarginView>
                    <SubText>{stringify(currentItem[item[0] as keyof local_type])}</SubText>
                  </SMarginView>
                </View>
              </View>
            </>
          );
}
export default function Compare({
  currentItem,
  onlineVersion,
  navigation,
  handleSetCurrentTune
}:
{
  currentItem: tune_draft,
  onlineVersion: standard,
  navigation: any,
  handleSetCurrentTune: Function
}){
  const [comparedDbDraft, setComparedDbDraft] = useState(onlineVersion);
  const [comparedTuneDraft, setComparedTuneDraft] = useState(currentItem);
  function handleReplaceAttr(attrKey: keyof (Tune | tune_draft), value: any, onlineSelected: boolean){
    const cpy: online_type = {}
    if(onlineSelected){
      for(let attr in onlineVersion){
        cpy[attr as keyof online_type] = onlineVersion[attr as keyof online_type];
      }
    }else{
      for(let attr in currentItem){
        cpy[attr as keyof local_type] = onlineVersion[attr as keyof local_type];
      }
    }
    //Inefficient solution, but there are no Map functions such as "filter" in mapped types
    //const cpy = JSON.parse(JSON.stringify(onlineSelected ? onlineVersion : currentItem));
    cpy[attrKey] = value;
    if(onlineSelected){
      setComparedDbDraft(cpy)
    }else{
      setComparedTuneDraft(cpy);
    }
  }
  const comparedTuneDraftDebugString = JSON.stringify(comparedTuneDraft, ["title", "alternativeTitle", "form", "composers","id", "birth", "death"]).replaceAll(",", "\n");
  const comparedDbDraftDebugString = JSON.stringify(comparedDbDraft).replaceAll(",", "\n");
  return(
  <BackgroundView>
  <FlatList
    data={editorAttrs.filter((item) => (!exclude_set.has(item[0]) && !item[0].endsWith("Confidence")))}
    ListHeaderComponent={(props) => (
      <SMarginView>
        <SubText>Here, you can assess the differences between the online version of the tune (on top in each category) and your local version (at the bottom of each category) and choose which one you think to be more accurate. If you think neither are accurate, return to the Editor (via Cancel changes) to fix your version and then come back to upload your changes! Categories where both your local tune and the online tune are empty won't show up here.</SubText>
      </SMarginView>
    )}
    renderItem={({item, index, separators}) => (
      <CompareField item={item}
        index={index}
        currentItem={currentItem}
        onlineVersion={onlineVersion}
        handleReplaceAttr={handleReplaceAttr}/>
    )}
    ListFooterComponent={(props) => (
      <>
        {
      //<Text>Tune draft:</Text>
      //<SubText>{comparedTuneDraftDebugString}</SubText>
      //<Text>Online draft:</Text>
      //<SubText>{comparedDbDraftDebugString}</SubText>
        }
        <View>
          <Button style={{backgroundColor: "grey"}}
          >
            <ButtonText>Upload (coming soon!)</ButtonText>
          </Button>
        </View>
        <View style={{flexDirection: "row"}}>
          <Button style={{flex: 1}}
            onPress={() => {
              navigation.goBack();
              for(let attr in comparedTuneDraft){
                if(attr in comparedTuneDraft){
                  handleSetCurrentTune(attr, comparedTuneDraft[attr as keyof (Tune | tune_draft)]);
                }
              }
              }}>
            <ButtonText>Save to phone</ButtonText>
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

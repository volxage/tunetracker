//Copyright 2024 Jonathan Hilliard
import React, {useEffect, useReducer, useState} from 'react';
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
import { Realm, useQuery, useRealm } from '@realm/react'
const debugMode = true;

import { composer, composerEditorAttrs, editorAttrs, standard_draft, tune_draft, tuneDefaults } from '../types.tsx';

import {
  FlatList,
  View,
} from 'react-native';

import { standard } from '../types.tsx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Tune from '../model/Tune.js';
import dateDisplay from '../textconverters/dateDisplay.tsx';
import OnlineDB from '../OnlineDB.tsx';
import {AxiosResponse} from 'axios';
import Composer from '../model/Composer.ts';
import standardTuneDraftReducer, {comparedAttrEqual} from '../DraftReducers/StandardTuneDraftReducer.ts';
import tuneDraftReducer from '../DraftReducers/TuneDraftReducer.ts';
import composerDraftReducer from '../DraftReducers/ComposerDraftReducer.ts';
import standardComposerDraftReducer from '../DraftReducers/StandardComposerDraftReducer.ts';
import {OrderedCollection} from 'realm';
import {localAttrPresent, onlineAttrPresent} from '../DraftReducers/utils/attrPresent.ts';
import displayLocalAttr, {debugDisplayLocal, debugDisplayOnline, displayOnlineAttrs} from '../DraftReducers/utils/displayAttrs.ts';
import {translateAttrFromLocal, translateKeyFromLocal} from '../DraftReducers/utils/translate.ts';

//Anything that ends with "confidence" is also excluded
const exclude_set = new Set([
  "dbId",
  "playlists",
  "playthroughs",
  //"composers"
]);

const empty_equivalent = new Set([
  "",
  "[]",
  "{}",
  "unknown"
]);
function AttrBasicRender({attr, attr_key, pretty_attr_key}:{attr: any, attr_key: keyof local_type, pretty_attr_key: string}){
  switch(attr_key){
    case "composers": {
      return(
        <View>
          <Title>Composers</Title>
          <SubText>{(attr as Composer[]).map(cmp => cmp.name).join(", ")}</SubText>
        </View>
      );
    }
    default: {
      return(
        <View>
          <Title>{pretty_attr_key}</Title>
          <SubText>{displayLocalAttr(attr_key, attr)}</SubText>
        </View>
      )
    }
  }
}
type local_type = tune_draft & composer;
type local_key = keyof local_type
type online_type = standard & composer;
type online_key = keyof online_type;
function CompareField({item, index, onlineVersion, currentItem, localDispatch, dbDispatch}:
{
  item: string[],
  index: number,
  onlineVersion: online_type
  currentItem: local_type,
  localDispatch: React.Dispatch<any>; 
  dbDispatch: React.Dispatch<any>;
  
}){
  const compQuery = useQuery(Composer);
  const realm = useRealm();
  let standardAttrPresent = false;
  const translatedKey = translateKeyFromLocal(item[0] as local_key);
  const [choice, setChoice] = useState(1); // 0 - DB   1 - Neither   2 - Local
  if(!onlineVersion){
    console.error("No online version to compare against!")
    return(<></>);
  }
  if(translatedKey in onlineVersion){
    standardAttrPresent = onlineAttrPresent(translatedKey, onlineVersion[translatedKey]);
  }
  let tuneAttrPresent = false;
  if(item[0] in currentItem){
    tuneAttrPresent = localAttrPresent(item[0] as local_key, currentItem[item[0] as local_key]);
  }
  if(!standardAttrPresent && !tuneAttrPresent){
    return(<></>)
  }
  if(comparedAttrEqual(item[0] as keyof tune_draft, currentItem[item[0] as keyof local_type], onlineVersion)){
    return(
      <AttrBasicRender attr={currentItem[item[0] as keyof local_type]} attr_key={item[0] as local_key} pretty_attr_key={item[1]}/>
    );
  }
  let local_item = currentItem[item[0] as keyof local_type];
  let online_item = onlineVersion[translatedKey];
  let local_display = displayLocalAttr(item[0] as keyof local_type, currentItem[item[0] as keyof local_type]);
  let online_display = displayOnlineAttrs(translatedKey, onlineVersion[translatedKey]);
  if(item[0] === "birth" || item[0] === "death"){
    if((local_item && online_item) && local_item.toString() === online_item.toString()){
      return(
        <View>
          <Title>{item[1]}</Title>
          <SubText>{dateDisplay(local_item)}</SubText>
        </View>
      );
    }
  }
  return(
    <View style={{borderWidth: 1, borderColor: "#222222", marginVertical: 12}}>
      <Title style={{alignSelf: "center"}}>{item[1]}</Title>
      <View>
        <View style={{flexDirection: "row"}}>
          {
            (standardAttrPresent) ?
            <SMarginView style={{flex: 1}}>
              <View>
                <SubText
                  style={{
                    textDecorationLine: choice === 2 ? "line-through" : "none",
                      color: choice === 2 ? "#777" : "white"
                  }}
                >
                  {online_display}
                </SubText>
              {
                choice === 2 &&
                <SubText
                  style={{
                    color: "#CFC"
                  }}>
                    {local_display} <Icon size={20} name='arrow-left'/>
                  </SubText>
              }
            </View>
          </SMarginView>
          :
          <SMarginView style={{flex: 1}}>
                <SubText
                  style={{
                    textDecorationLine: choice === 2 ? "line-through" : "none",
                      color: choice === 2 ? "#777" : "darkred"
                  }}
                >
                Not defined!
                </SubText>
              {
                choice === 2 &&
                <SubText
                  style={{
                    color: "#CFC"
                  }}>
                    {local_display} <Icon size={20} name='arrow-left'/>
                  </SubText>
              }
          </SMarginView>
        }
      {
        (tuneAttrPresent) ?
        <SMarginView style={{flex: 1}}>
          <View>
            <SubText
              style={{
                textDecorationLine: choice === 0 ? "line-through" : "none",
                  color: choice === 0 ? "#777" : "white"
              }}>
                {local_display} 
              </SubText>
            {
              choice === 0 &&
              <SubText
                style={{
                  color: "#CFC"
                }}>
                  <Icon size={20} name='arrow-right'/>{online_display}
                </SubText>
            }
          </View>
        </SMarginView>
        :
        <SMarginView style={{flex: 1}}>
          <SubText
            style={{
              textDecorationLine: choice === 2 ? "line-through" : "none",
                color: choice === 2 ? "#777" : "darkred"
            }}
          >
            Not defined!
          </SubText>
          {
            choice === 2 &&
            <SubText
              style={{
                color: "#CFC"
              }}>
                {online_display} <Icon size={20} name='arrow-left'/>
              </SubText>
          }
        </SMarginView>
      }
    </View>
        <View style={{flexDirection: "row"}}>
          {
            (standardAttrPresent) ?
            <Button
              style={{
                backgroundColor: choice === 0 ? "#338" : "#222",
                  flex: 1
              }}
              onPress={() => {
                setChoice(0);
                dbDispatch({
                  type: 'update_attr',
                  //attr: item[0],
                  attr: translatedKey,
                  value: onlineVersion[translatedKey]
                });
                localDispatch({
                  //"Update from other" translates the attr from the online standard
                  type: 'update_from_other',
                  attr: translatedKey,
                  value: onlineVersion[translatedKey],
                  composerQuery: compQuery,
                  realm: realm
                });
                // (From Editor.tsx) dispatch({type: 'update_attr', attr: attr_key, value: value});
              }}
            >
              <ButtonText><Icon name="database" size={30} /></ButtonText>
            </Button>
            :
            <Button style={{
              flex:1,
                backgroundColor: "#111"
            }}>
              <ButtonText><Icon name="database-off" size={30} color="darkred" /></ButtonText>
            </Button>
          }
          <Button
            style={{
              backgroundColor: choice === 1 ? "#338" : "#222",
                flex: 1
            }}
            onPress={() => {
              setChoice(1);
              dbDispatch({
                type: 'update_attr',
                //attr: item[0],
                attr: translatedKey,
                value: online_item
              });
              localDispatch({
                type: 'update_attr',
                attr: item[0],
                value: local_item
              });
            }}
          >
            <ButtonText><Icon name="dots-horizontal" size={30} /></ButtonText>
          </Button>
          <Button
            style={{
              backgroundColor: choice === 2 ? "#338" : "#222",
                flex: 1
            }}
            onPress={() => {
              setChoice(2);
              dbDispatch({
                //"Update from other" translates the attr to the online standard
                type: 'update_from_other',
                attr: item[0],
                value: local_item
              });
              localDispatch({
                type: 'update_attr',
                attr: item[0],
                value: local_item
              });
            }}
          >
            <ButtonText><Icon name="account" size={30} /></ButtonText>
          </Button>
        </View>
      </View>
    </View>
  );
}
export default function Compare({
  currentItem,
  onlineVersion,
  navigation,
  handleSetCurrentItem,
  isComposer
}:
{
  currentItem: tune_draft,
  onlineVersion: standard,
  navigation: any,
  handleSetCurrentItem: Function,
  isComposer: boolean
}){
  const [dbState, dbDispatch] = useReducer(
    (isComposer ? standardComposerDraftReducer : standardTuneDraftReducer), {currentDraft: {}}
  );
  const [localState, localDispatch] = useReducer(
    (isComposer ? composerDraftReducer : tuneDraftReducer), {currentDraft: {}}
  );

  useEffect(() => {
    dbDispatch({
      type: 'set_to_selected',
      selectedItem: onlineVersion
    });
    localDispatch({
      type: 'set_to_selected',
      selectedItem: currentItem
    });
  }, []);
  //const comparedDbChanges = dbState[isComposer ? "currentStandardComposer" : "currentStandard"]
  const comparedDbChanges = dbState["currentDraft"];
  //  const [comparedDbChanges, setComparedDbChanges] = useState(onlineVersion);
  //const comparedTuneChanges = localState[isComposer ? "currentComposer" : "currentTune"]
  const comparedTuneChanges = localState["currentDraft"];
  //  const [comparedTuneChanges, setComparedTuneChanges] = useState(currentItem);
  const [uploadResult, setUploadResult] = useState({} as any);
  const resultAsAny = uploadResult as any;

  const comparedTuneChangesDebugString = debugDisplayLocal(comparedTuneChanges, isComposer);
  const comparedDbChangesDebugString = debugDisplayOnline(comparedDbChanges, isComposer);
  const attrs = (isComposer ? composerEditorAttrs : editorAttrs).filter((item) => (!exclude_set.has(item[0]) && !item[0].endsWith("Confidence")))
  console.log(uploadResult);
  return(
  <BackgroundView>
  <FlatList
    data={attrs}
    ListHeaderComponent={(props) => (
      <SMarginView>
        <SubText>Here, you can assess the differences between the online version of the tune (on the left in each category) and your local version (on the right of each category) and choose which one you think to be more accurate. If you think neither are accurate, return to the Editor (via Cancel changes) to fix your version and then come back to upload your changes! Categories where both your local tune and the online tune are empty won't show up here.</SubText>
        <SubText>When you're finished, you can save what you changed on the right side to your phone, and you can upload what's on the left side to tunetracker.jhilla.org for others to use!</SubText>
      </SMarginView>
    )}
    renderItem={({item, index, separators}) => (
      <CompareField item={item}
        index={index}
        currentItem={currentItem}
        onlineVersion={onlineVersion}
        localDispatch={localDispatch}
        dbDispatch={dbDispatch}
      />
    )}
    ListFooterComponent={(props) => (
      <>
        {
          debugMode &&
          <View>
            <Text>Tune changes:</Text>
            <SubText>{comparedTuneChangesDebugString}</SubText>
            <Text>Online changes:</Text>
            <SubText>{comparedDbChangesDebugString}</SubText>
          </View>
        }
        <View>
          <Button style={{backgroundColor: ("data" in uploadResult) ? "grey" : "cadetblue"}}
            onPress={() => {
              if(!("data" in uploadResult)){
                if(!isComposer){
                  const toUpload = comparedDbChanges as standard_draft;
                  const copyToSend = {
                    title: toUpload.title,
                    alternative_title: toUpload.alternative_title,
                    composer_placeholder: toUpload.composer_placeholder,
                    id: toUpload.id,
                    form: toUpload.formt,
                    bio: toUpload.bio,
                    composers: toUpload.Composers
                  }
                  OnlineDB.sendUpdateDraft(copyToSend).then(res => {
                    setUploadResult(((res as AxiosResponse).data))
                  });
                }
              }
            }}
          >
            <ButtonText>Upload</ButtonText>
          </Button>
      {
        "data" in uploadResult &&
        <View style={{borderWidth: 1, borderColor: "grey"}}>
          <SubText>Uploaded tune "{uploadResult["data"]["title"]}"</SubText>
          <SubText>Attached to composers:</SubText>
          <SubText style={{fontWeight: 500}}>{uploadResult["composers"].map(comp => comp.name).join(", ")}</SubText>
          <SubText>Custom composers suggested:</SubText>
          <SubText>{uploadResult["data"]["composer_placeholder"]}</SubText>
        </View>
      }
        </View>
        <View style={{flexDirection: "row"}}>
          <Button style={{flex: 1}}
            onPress={() => {
              navigation.goBack();
              for(let attr in comparedTuneChanges){
                if(attr in comparedTuneChanges){
                  handleSetCurrentItem(attr, comparedTuneChanges[attr as keyof (Tune | tune_draft)]);
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

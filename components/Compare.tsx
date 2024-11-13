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

import { composer, composerEditorAttrs, editorAttrs, standard_composer, standard_draft, standardEditorAttrs, tune_draft, tuneDefaults } from '../types.tsx';

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
const debugMode = false;

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
        <View style={{borderColor: "#222", borderWidth: 1}}>
          <Title style={{alignSelf: "center"}}>Composers</Title>
          <SubText style={{alignSelf: "center"}}>{(attr as Composer[]).map(cmp => cmp.name).join(", ")}</SubText>
          <SubText style={{alignSelf: "center", color: "#777", margin: 16}}>Your version and the server's version are the same for this item's {pretty_attr_key}</SubText>
        </View>
      );
    }
    default: {
      return(
        <View style={{borderColor: "#222", borderWidth: 1}}>
          <Title style={{alignSelf: "center"}}>{pretty_attr_key}</Title>
          <SubText style={{alignSelf: "center"}}>{displayLocalAttr(attr_key, attr)}</SubText>
          <SubText style={{alignSelf: "center", color: "#777", margin: 16}}>Your version and the server's version are the same for this item's {pretty_attr_key}</SubText>
        </View>
      )
    }
  }
}
type local_type = tune_draft & composer;
type local_key = keyof local_type
type online_type = standard_draft & composer;
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
  currentItem: tune_draft | composer,
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
  //const comparedLocalChanges = localState[isComposer ? "currentComposer" : "currentTune"]
  const comparedLocalChanges = localState["currentDraft"];
  //  const [comparedLocalChanges, setComparedTuneChanges] = useState(currentItem);
  const [uploadResult, setUploadResult] = useState({} as any);
  const [uploadError, setUploadError] = useState({} as any);

  const comparedLocalChangesDebugString = debugDisplayLocal(comparedLocalChanges, isComposer);
  const comparedDbChangesDebugString = debugDisplayOnline(comparedDbChanges, isComposer);
  const attrs = (isComposer ? composerEditorAttrs : standardEditorAttrs).filter((item) => (!exclude_set.has(item[0]) && !item[0].endsWith("Confidence")))
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
            <SubText>{comparedLocalChangesDebugString}</SubText>
            <Text>Online changes:</Text>
            <SubText>{comparedDbChangesDebugString}</SubText>
          </View>
        }
        <View>
      {
        !isComposer && uploadResult && ("data" in uploadResult) &&
        <View style={{borderWidth: 1, borderColor: "green", padding: 16, margin: 8}}>
          <SubText>Uploaded tune "{uploadResult["data"]["data"]["title"]}"</SubText>
          <SubText>Attached to composers:</SubText>
          <SubText>{uploadResult["data"]["composers"].map(comp => comp.name).join(", ")}</SubText>
        {
          uploadResult && ("composer_placeholder" in uploadResult["data"] && uploadResult["data"]["composer_placeholder"] != "") && 
          <View>
            <SubText>Custom composers suggested:</SubText>
            <SubText>{uploadResult["data"]["composer_placeholder"]}</SubText>
          </View>
        }
        </View>
      }
      {
        isComposer && (uploadResult&& "data" in uploadResult) &&
        <View style={{borderWidth: 1, borderColor: "green", padding: 16, margin: 8}}>
          <SubText>Uploaded composer "{uploadResult["data"]["name"]}"</SubText>
        </View>
      }
      {
        uploadError && ("message" in uploadError) &&
        <View style={{borderWidth: 1, borderColor: "red", padding: 16, margin: 8}}>
          <SubText>ERROR: {uploadError["message"]}</SubText>
        </View>
      }
        </View>
        <Button style={{backgroundColor: (uploadResult && "data" in uploadResult) ? "grey" : "cadetblue"}}
          onPress={() => {
            //TODO: Handle other errors besides Axios ones
            if(!uploadResult || !("data" in uploadResult)){
              if(!isComposer){
                const toUpload = comparedDbChanges as standard_draft;
                const copyToSend = {
                  title: toUpload.title,
                  alternative_title: toUpload.alternative_title,
                  composer_placeholder: toUpload.composer_placeholder,
                  id: toUpload.id,
                  form: toUpload.form,
                  bio: toUpload.bio,
                  composers: toUpload.Composers
                }
                  OnlineDB.sendUpdateDraft(copyToSend).then(res => {
                    setUploadResult(((res as AxiosResponse)))
                  }).catch((e) => {
                    try{
                      setUploadError(e);
                    }catch{
                      setUploadError("An unknown error occured while submitting the tune.")
                    }
                  });
              }else{
                const toUpload = comparedDbChanges as standard_composer;
                const copyToSend = {
                  name: toUpload.name,
                  bio: toUpload.bio,
                  birth: toUpload.birth,
                  death: toUpload.death,
                  id: toUpload.id
                }
                  OnlineDB.sendComposerUpdateDraft(copyToSend).then(res => {
                    setUploadResult(((res as AxiosResponse)))
                  }).catch((e) => {
                    try{
                      setUploadError(e);
                    }catch{
                      setUploadError("An unknown error occured while submitting the tune.")
                    }
                  });
              }
            }
          }}
        >
          <ButtonText>Upload left side</ButtonText>
        </Button>
        <View style={{flexDirection: "row"}}>
          <Button style={{flex: 1}}
            onPress={() => {
              navigation.goBack();
              for(let attr in comparedLocalChanges){
                if(attr in comparedLocalChanges){
                  handleSetCurrentItem(attr, comparedLocalChanges[attr as keyof (Tune | tune_draft)]);
                }
              }
            }}>
            <ButtonText>Save right side</ButtonText>
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

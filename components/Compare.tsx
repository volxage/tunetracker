//Copyright 2024 Jonathan Hiliard
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
import { Realm, useRealm } from '@realm/react'
const debugMode = true;

import { composer, composerEditorAttrs, editorAttrs, tune_draft, tuneDefaults } from '../types.tsx';

import {
  FlatList,
  View,
} from 'react-native';

import { standard } from '../types.tsx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons.js';
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
          <SubText>{attr}</SubText>
        </View>
      )
    }
  }
}
function stringify(value: any): string{
  if (value instanceof Composer) return value.name;
  if (Array.isArray(value) || value instanceof OrderedCollection) return value.map(obj => {return stringify(obj)}).join(", ");
  if(value instanceof Realm.List){
    try{
      return JSON.stringify(value.toJSON());
    }catch{
      return "geez cyclical object or smth like that";
    }
  }
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
  if(value instanceof Date){
    return(dateDisplay(value))
  }
  return "Unable to parse"
}
type local_type = tune_draft & composer;
type online_type = standard & composer;
function CompareField({item, index, onlineVersion, currentItem, localDispatch, dbDispatch}:
{
  item: string[],
  index: number,
  onlineVersion: online_type
  currentItem: local_type,
  localDispatch: React.Dispatch<any>; 
  dbDispatch: React.Dispatch<any>;
  
}){
  let standardAttrPresent = false;
  if(item[0] in onlineVersion){
    const tmpAttr = onlineVersion[item[0] as keyof online_type]
    if(tmpAttr){
      if(!empty_equivalent.has(stringify(tmpAttr))){
        standardAttrPresent = true;
      }
    }
  }
  let tuneAttrPresent = false;
  if(item[0] in currentItem){
    const tmpAttr = currentItem[item[0] as keyof online_type]
    if(tmpAttr){
      if(!empty_equivalent.has(stringify(tmpAttr))){
        standardAttrPresent = true;
      }
    }
  }
  if(!standardAttrPresent && !tuneAttrPresent){
    return(<></>)
  }
  if(comparedAttrEqual(item[0] as keyof tune_draft, currentItem[item[0] as keyof local_type], onlineVersion)){
    return(
      <AttrBasicRender attr={currentItem[item[0] as keyof local_type]} attr_key={item[0]} pretty_attr_key={item[1]}/>
    );
  }
  let local_item = currentItem[item[0] as keyof local_type]
  let online_item = onlineVersion[item[0] as keyof online_type]
  let local_display = stringify(local_item)
  let online_display = stringify(online_item)
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
  const [choice, setChoice] = useState(1); // 0 - DB   1 - Neither   2 - Local
  return(
    <>
      <Title>{item[1]}</Title>
      <View>
        {
          (item[0] in onlineVersion
            && !empty_equivalent.has(online_display)) &&
              <View>
                <SMarginView>
                  <SubText>{online_display}</SubText>
                </SMarginView>
              </View>
            }
            <View style={{flexDirection: "row"}}>
              {
                (item[0] in onlineVersion
                  && !empty_equivalent.has(online_display)) ?
                  <Button style={{
                        backgroundColor: choice === 0 ? "#338" : "#222",
                        flex: 1
                      }}
                      onPress={() => {
                        setChoice(0);
                        dbDispatch({
                          type: 'update_attr',
                          attr: item[0],
                          value: onlineVersion[item[0] as keyof online_type]
                        });
                        localDispatch({
                          //type: 'update_from_other',
                          type: 'update_from_other',
                          attr: item[0],
                          value: onlineVersion[item[0] as keyof online_type]
                        });
                          // (From Editor.tsx) dispatch({type: 'update_attr', attr: attr_key, value: value});
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
                      dbDispatch({
                        type: 'update_attr',
                        attr: item[0],
                        value: local_item
                      });
                      localDispatch({
                        type: 'update_attr',
                        attr: item[0],
                        value: online_item
                      });
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
                    dbDispatch({
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
                    <ButtonText><Icon name="account-arrow-down" size={30} /></ButtonText>
                  </Button>
                </View>
                <View>
                  <SMarginView>
                    <SubText>{local_display}</SubText>
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

  const comparedTuneChangesDebugString = JSON.stringify(comparedTuneChanges, ["Composers"]).replaceAll(",", "\n");
  const comparedDbChangesDebugString = JSON.stringify(comparedDbChanges, ["Composers"]).replaceAll(",", "\n");
  const attrs = (isComposer ? composerEditorAttrs : editorAttrs).filter((item) => (!exclude_set.has(item[0]) && !item[0].endsWith("Confidence")))
  return(
  <BackgroundView>
  <FlatList
    data={attrs}
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
              //TODO: Get the compiler to chill out
              if(!("data" in uploadResult)){
                const copyToSend = {
                  title: comparedDbChanges.title,
                  alternative_title: comparedDbChanges.alternative_title,
                  id: comparedDbChanges.id,
                  form: comparedDbChanges.form,
                  bio: comparedDbChanges.bio,
                  composers: (comparedDbChanges.Composers ? comparedDbChanges.Composers : comparedDbChanges.composers).map(comp => {
                    if("dbId" in comp){
                      return comp["dbId"]
                    }
                    return comp.id;
                  })
                }
                OnlineDB.sendUpdateDraft(copyToSend).then(res => {
                  setUploadResult(((res as AxiosResponse).data))
                });
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

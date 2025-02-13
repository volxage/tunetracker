//Copyright 2024 Jonathan Hilliard
import React, {useContext, useEffect, useReducer, useState} from 'react';
import {
  DeleteButton,
  ButtonText,
  SubText,
  Title,
  Text,
  SMarginView,
  BgView,
} from '../Style.tsx'
import { Realm, useQuery, useRealm } from '@realm/react'

import { composer, composerEditorAttrs, editorAttrs, standard, standard_composer, standard_draft, compareTuneEditorAttrs, tune_draft, tuneDefaults, standard_composer_draft } from '../types.ts';

import {
  FlatList,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Tune from '../model/Tune.js';
import dateDisplay from '../textconverters/dateDisplay.tsx';
import OnlineDB from '../OnlineDB.tsx';
import {AxiosError, AxiosResponse, isAxiosError} from 'axios';
import Composer from '../model/Composer.ts';
import standardTuneDraftReducer from '../DraftReducers/StandardTuneDraftReducer.ts';
import tuneDraftReducer from '../DraftReducers/TuneDraftReducer.ts';
import composerDraftReducer from '../DraftReducers/ComposerDraftReducer.ts';
import standardComposerDraftReducer from '../DraftReducers/StandardComposerDraftReducer.ts';
import {OrderedCollection} from 'realm';
import {localAttrPresent, onlineAttrPresent} from '../DraftReducers/utils/attrPresent.ts';
import displayLocalAttr, {debugDisplayLocal, debugDisplayOnline, displayOnlineAttrs} from '../DraftReducers/utils/displayAttrs.ts';
import {translateAttrFromLocal, translateKeyFromLocal} from '../DraftReducers/utils/translate.ts';
import {comparedAttrEqual} from '../DraftReducers/utils/comparedAttrEqual.ts';
import {useNavigation} from '@react-navigation/native';
import ResponseBox from './ResponseBox.tsx';
import ResponseHandler from '../services/ResponseHandler.ts';
import InformationExpand from './InformationExpand.tsx';
import {Button} from '../simple_components/Button.tsx';
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
type online_type = standard& standard_composer;
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
              textDecorationLine: choice === 0 ? "line-through" : "none",
                color: choice === 0 ? "#777" : "darkred"
            }}
          >
            Not defined!
          </SubText>
          {
            choice === 0 &&
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
              iconName='database'
            />
            :
            <Button 
              style={{
                flex:1,
                  backgroundColor: "#111"
              }}
              iconName='database-off'
              iconColor='darkred'
            />
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
            iconName='dots-horizontal'
          />
        { tuneAttrPresent ?
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
            iconName="account"
          />
          :
          <Button style={{
            flex:1,
              backgroundColor: "#111"
          }}
          iconName='account-off'
          iconColor='darkred'
        />
      }
        </View>
      </View>
    </View>
  );
}

export default function Compare({
  currentItem,
  onlineVersion,
  handleSetCurrentItem,
  isComposer
}:
{
  currentItem: tune_draft | composer,
  onlineVersion: standard & standard_composer,
  handleSetCurrentItem: Function,
  isComposer: boolean
}){
  const navigation = useNavigation() as any;
  const [dbState, dbDispatch] = useReducer(
    (isComposer ? standardComposerDraftReducer : standardTuneDraftReducer), {currentDraft: {}}
  );
  const [localState, localDispatch] = useReducer(
    (isComposer ? composerDraftReducer : tuneDraftReducer), {currentDraft: {}, changedAttrsList: []}
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
  const [uploadResult, setUploadResult] = useState("");
  const [uploadError, setUploadError] = useState({} as AxiosError);
  const uploadSuccessful = false;
  const [uploadErrorPresent, setUploadErrorPresent] = useState(false);
  const errorReceived = uploadError && "message" in uploadError;

  const comparedLocalChangesDebugString = debugDisplayLocal(comparedLocalChanges, isComposer);
  const comparedDbChangesDebugString = debugDisplayOnline(comparedDbChanges, isComposer);
  const attrs = (isComposer ? composerEditorAttrs : compareTuneEditorAttrs).filter((item) => (!exclude_set.has(item[0]) && !item[0].endsWith("Confidence")))
  const onlineDbState = useContext(OnlineDB.DbStateContext);
  const onlineDbDispatch = useContext(OnlineDB.DbDispatchContext);
  const realm = useRealm();

  function submit(first=true){
    if(!uploadSuccessful && !errorReceived){
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
        ResponseHandler(
          OnlineDB.sendUpdateDraft(copyToSend), 
          (response => {
            return `Successfully uploaded your version of ${response.data.title}`;
          }),
          submit,
          first,
          navigation,
          onlineDbDispatch
        ).then(res => {
          setUploadResult(res.result);
          setUploadErrorPresent(res.isError);
          handleSetCurrentItem("dbDraftId", res.data.data.id, true);
        })
      }else{
        const toUpload = comparedDbChanges as standard_composer;
        const copyToSend = {
          name: toUpload.name,
          bio: toUpload.bio,
          birth: toUpload.birth,
          death: toUpload.death,
          id: toUpload.id
        }
        ResponseHandler(
          OnlineDB.sendComposerUpdateDraft(copyToSend),
          (response => {
            return `Successfully uploaded your vesion of ${response.data.name}`;
          }),
          submit,
          first,
          navigation,
          onlineDbDispatch
        ).then(res => {
          setUploadResult(res.result);
          setUploadErrorPresent(res.isError);
          handleSetCurrentItem("dbDraftId", res.data.data.id, true);
        })
      }
    }
  }

  return(
    <BgView>
      <FlatList
        data={attrs}
        ListHeaderComponent={(props) => (
          <InformationExpand Content={() =>
            <View>
              <SubText>Here, you can assess the differences between the online version of the tune (on the left in each category) and your local version (on the right of each category) and choose which one you think to be more accurate. If you think neither are accurate, return to the Editor (via Cancel changes) to fix your version and then come back to upload your changes! Categories where both your local tune and the online tune are empty won't show up here.</SubText>
              <SubText>When you're finished, you can save what you changed on the right side to your phone, and you can upload (or update a previous upload) for what's on the left side to tunetracker.jhilla.org for others to use!</SubText>
            </View>
            }/>
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
              <ResponseBox
                result={uploadResult}
                isError={uploadErrorPresent}
              />
              <Button style={{backgroundColor: (uploadResult === "") ? "cadetblue" : "grey"}}
                onPress={() => {
                  //TODO: Add type for tunetracker server responses/errors
                  //Abstract error handling to a service?
                  if(uploadResult === ""){
                    submit();
                  }
                }}
                text='Upload/Update left side'
              />
              <View style={{flexDirection: "row"}}>
                <Button style={{flex: 1}}
                  onPress={() => {
                    navigation.goBack();
                    for(let attr of localState.changedAttrsList){
                      handleSetCurrentItem(attr, comparedLocalChanges[attr as keyof (Tune | tune_draft)]);
                    }
                  }}
                  text='Save right side'
                />
                <DeleteButton style={{flex: 1}}
                  onPress={() => {navigation.goBack()}}
                >
                  <ButtonText>Cancel changes</ButtonText>
                </DeleteButton>
              </View>
            </>
        )}
      />
    </BgView>
  );
}

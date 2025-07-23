//Copyright 2025 Jonathan Hilliard
import React, {useContext, useEffect, useReducer, useState} from 'react';
import {
  DeleteButton,
  ButtonText,
  SubText,
  Title,
  Text,
  SMarginView,
  BgView,
  SafeBgView,
  SubDimText,
  RowView,
  SubBoldText,
} from '../Style.tsx'
import { Realm, useQuery, useRealm } from '@realm/react'

import { composer, composerEditorAttrs, editorAttrs, standard, standard_composer, standard_draft, compareTuneEditorAttrs, tune_draft, tuneDefaults, standard_composer_draft } from '../types.ts';

import {
  FlatList,
  ScrollView,
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
import TypeField from './TypeField.tsx';
import {useTheme} from 'styled-components';
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
          <SMarginView>
            <SubBoldText style={{alignSelf: "center", textAlign: "center"}}>
              Your version and the server's version are the same for this item's {pretty_attr_key}
            </SubBoldText>
          </SMarginView>
        </View>
      );
    }
    default: {
      return(
        <View style={{borderColor: "#222", borderWidth: 1}}>
          <Title style={{alignSelf: "center"}}>{pretty_attr_key}</Title>
          <SubText style={{alignSelf: "center"}}>{displayLocalAttr(attr_key, attr)}</SubText>
          <SMarginView>
            <SubBoldText style={{alignSelf: "center", textAlign: "center"}}>
              Your version and the server's version are the same for this item's {pretty_attr_key}
            </SubBoldText>
          </SMarginView>
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
  useEffect(() => {
    setChoice(1);
  }, [item[0]])
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
  if(comparedAttrEqual(item[0], currentItem[item[0] as keyof local_type], onlineVersion)){
    return(
      <AttrBasicRender
        attr={currentItem[item[0] as keyof local_type]}
        attr_key={item[0] as local_key}
        pretty_attr_key={item[1]}
      />
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
  } return(
    <View style={{borderWidth: 1, borderColor: "#222222", marginVertical: 12}}>
      <Title style={{alignSelf: "center"}}>{item[1]}</Title>
      <View>
        <View style={{flexDirection: "row"}}>
          {(standardAttrPresent) ?
            <SMarginView style={{flex: 1}}>
              <View>
                <SubDimText>Online Version</SubDimText>
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
                    <View>
                      <SubText
                        style={{
                          color: "#CFC"
                        }}>
                        {local_display} <Icon size={20} name='arrow-left'/>
                      </SubText>
                    </View>
                }
              </View>
            </SMarginView>
          : <SMarginView style={{flex: 1}}>
                <SubDimText>Online Version</SubDimText>
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
                  <View>
                    <SubDimText>Online Version</SubDimText>
                    <SubText
                      style={{
                        color: "#CFC"
                      }}>
                {local_display} <Icon size={20} name='arrow-left'/>
                </SubText>
                </View>
              }
          </SMarginView>
        }
      {
        (tuneAttrPresent) ?
        <SMarginView style={{flex: 1}}>
          <View>
            <SubDimText>Your Version</SubDimText>
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
        <SubDimText>Your Version</SubDimText>
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
                localDispatch({
                  //"Update from other" translates the attr from the online standard
                  type: 'update_from_other',
                  attr: translatedKey,
                  value: onlineVersion[translatedKey],
                  composerQuery: compQuery,
                  realm: realm
                });
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
  const [finalMode, setFinalMode] = useState(false);
  const uploadSuccessful = false;
  const [uploadErrorPresent, setUploadErrorPresent] = useState(false);
  const errorReceived = uploadError && "message" in uploadError;

  const comparedLocalChangesDebugString = debugDisplayLocal(comparedLocalChanges, isComposer);
  const comparedDbChangesDebugString = debugDisplayOnline(comparedDbChanges, isComposer);
  const attrs = (isComposer ? composerEditorAttrs : compareTuneEditorAttrs)
    .filter(item => (!exclude_set.has(item[0]) && !item[0].endsWith("Confidence")))
  const presentAttrs = attrs;
    //.filter so that attrs not present in online version is ignored
  const onlineDbState = useContext(OnlineDB.DbStateContext);
  const [attrI, setAttrI] = useState(0);
  const onlineDbDispatch = useContext(OnlineDB.DbDispatchContext);
  const realm = useRealm();
  const theme = useTheme();

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
    <SafeBgView>
      <ScrollView>
        <InformationExpand
          Content={() =>
            <View>
              <SubText>Here, you can assess the differences between the online version of the tune (on the left in each category) and your local version (on the right of each category) and choose which one you think to be more accurate. If neither are accurate, pick the closest one and then edit from there to correct it. Categories where both your local tune and the online tune are empty won't show up here.</SubText>
            </View>
          }
        />
        {
          isComposer ? 
          <SMarginView>
              <SubDimText style={presentAttrs[attrI][0] === "title" && {textDecorationLine: "underline"}}>
                Name: <SubText>{localState.currentDraft.name}</SubText>
              </SubDimText>
              <SubDimText style={presentAttrs[attrI][0] === "alternativeTitle" && {textDecorationLine: "underline"}}>
                Birthday: <SubText>{dateDisplay(localState.currentDraft.birth)}</SubText>
              </SubDimText>
              <SubDimText style={presentAttrs[attrI][0] === "alternativeTitle" && {textDecorationLine: "underline"}}>
                Day of death: <SubText>{dateDisplay(localState.currentDraft.death)}</SubText>
              </SubDimText>
              <SubDimText style={presentAttrs[attrI][0] === "bio" && {textDecorationLine: "underline"}}>
                Bio: <SubText>{localState.currentDraft.bio}</SubText>
              </SubDimText>
          </SMarginView>
            :
            <SMarginView>
              <SubDimText style={presentAttrs[attrI][0] === "title" && {textDecorationLine: "underline"}}>
                Title: <SubText>{localState.currentDraft.title}</SubText>
              </SubDimText>
              <SubDimText style={presentAttrs[attrI][0] === "alternativeTitle" && {textDecorationLine: "underline"}}>
                Alternative Title: <SubText>{localState.currentDraft.alternativeTitle}</SubText>
              </SubDimText>
              <SubDimText style={presentAttrs[attrI][0] === "bio" && {textDecorationLine: "underline"}}>
                Bio: <SubText>{localState.currentDraft.bio}</SubText>
              </SubDimText>
              <SubDimText style={presentAttrs[attrI][0] === "form" && {textDecorationLine: "underline"}}>
                Form: <SubText>{localState.currentDraft.form}</SubText>
              </SubDimText>
              <SubDimText style={presentAttrs[attrI][0] === "composers" && {textDecorationLine: "underline"}}>
                Composers: <SubText>{(localState.currentDraft.composers as composer[])?.map(comp => comp.name).join(", ")}</SubText>
              </SubDimText>
            </SMarginView>
        }
        {
          finalMode ?
            <View>
              {
                (uploadResult || JSON.stringify(uploadError) !== "{}") ? 
                  <View>
                    <ResponseBox
                      result={uploadResult}
                      isError={uploadErrorPresent}
                    />
                    <SMarginView>
                      <SubText>Thank you for contributing to TuneTracker!</SubText>
                    </SMarginView>
                    <Button text="Continue" onPress={() => {navigation.goBack()}}/>
                  </View>
                  :
                  <View>
                    <SMarginView>
                      <SubText>
                        Would you like to submit your changes (above) to the server so others can use them?
                      </SubText>
                    </SMarginView>
                    <Button style={{flex: 1}}
                      onPress={() => {
                        if(uploadResult === ""){
                          submit();
                        }
                        for(let attr of localState.changedAttrsList){
                          handleSetCurrentItem(attr, comparedLocalChanges[attr as keyof (Tune | tune_draft)]);
                        }
                      }}
                      text='Submit to server and save'
                    />
                    <Button style={{flex: 1}}
                      onPress={() => {
                        navigation.goBack();
                        for(let attr of localState.changedAttrsList){
                          handleSetCurrentItem(attr, comparedLocalChanges[attr as keyof (Tune | tune_draft)]);
                        }
                        handleSetCurrentItem("lastSeenDraftState", "PENDING", true);
                        handleSetCurrentItem("lastRecordedStandardChange", new Date(), true);
                      }}
                      text='Save only for me'
                    />
                    <DeleteButton style={{flex: 1}}
                      onPress={() => {setFinalMode(false)}}
                    >
                      <ButtonText>Oops, I'm not done</ButtonText>
                    </DeleteButton>
                  </View>
              }
            </View>
            :
            <View>
              <RowView>
                <Button
                  style={{flex:1}}
                  iconName='arrow-up'
                  onPress={() => {
                    //Mod (%) doesn't really do what it should in JS for negatives, this is an efficient fix
                    setAttrI( (((attrI - 1) % presentAttrs.length) + presentAttrs.length) % presentAttrs.length );
                  }}
                />
                <Button style={{flex:1}}
                  iconName='arrow-down'
                  onPress={() => {
                    setAttrI((attrI + 1) % presentAttrs.length);
                  }}
                />
              </RowView>
              {
                debugMode &&
                  <View>
                    <Text>Tune changes:</Text>
                    <SubText>{comparedLocalChangesDebugString}</SubText>
                    <Text>Online changes:</Text>
                    <SubText>{comparedDbChangesDebugString}</SubText>
                  </View>
              }
              <TypeField attr={localState.currentDraft[presentAttrs[attrI][0]]} attrKey={presentAttrs[attrI][0]} attrName={presentAttrs[attrI][1]} handleSetCurrentItem={handleSetCurrentItem} isComposer={isComposer}/>
              <CompareField item={presentAttrs[attrI]} index={1} onlineVersion={onlineVersion} currentItem={currentItem} localDispatch={localDispatch} dbDispatch={dbDispatch}/>
              <RowView>
                <Button style={{flex: 1}}
                  onPress={() => {
                    setFinalMode(true);
                  }}
                  text='Done'
                />
                <DeleteButton style={{flex: 1}}
                  onPress={() => {navigation.goBack()}}
                >
                  <ButtonText>Cancel changes</ButtonText>
                </DeleteButton>
              </RowView>
            </View>
      }
      </ScrollView>
    </SafeBgView>
  );
}

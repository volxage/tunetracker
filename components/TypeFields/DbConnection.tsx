import {
  ButtonText,
  Button,
  Title,
  SubText,
  SMarginView
} from '../../Style.tsx'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, {useContext, useState} from 'react';
import {Status, composer, standard, standard_composer, tune_draft} from '../../types.ts';
import {
  View,
} from 'react-native';
import OnlineDB from '../../OnlineDB.tsx';
import dateDisplay from '../../textconverters/dateDisplay.tsx';

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
  const status = useContext(OnlineDB.DbStateContext).status;
  let item = null;
  if(typeof attr !== "undefined" && attr !== 0){
    if(isComposer){
      item = OnlineDB.getComposerById(attr as number);
    }else{
      item = OnlineDB.getStandardById(attr as number);
    }
  }
  return(
    <View style={{padding: 8}}>
      <View style={{flexDirection: "row"}}>
        <View style={{flex:1}} />
        <Button
          onPress={() => {setConnectTuneExpanded(!connectTuneExpanded)}}
          style={{backgroundColor: "#222", flex:2}}
        >
          <ButtonText>
            <Icon
              name={connectTuneExpanded ? "earth-minus" : "earth-plus"}
              size={30}
            />Connection Details
          </ButtonText>
        </Button>
        <View style={{flex:1}} />
      </View>
      {
        connectTuneExpanded &&
        <View>
          {
            (attr === 0 || typeof attr === "undefined") ?
            <View>
              <SMarginView>
                <SubText>
                  You haven't connected this {isComposer ? "composer" : "tune"} to the database yet! Connecting an item allows you to request changes to the online copy of the item, meaning other users can use your updated information, and new users can import more accurate information! It also gives you the ability to import changes from the database uploaded from other users.
                </SubText>
              </SMarginView>
              <Button
                onPress={() => {
                  if(isComposer){
                    navigation.navigate("ComposerImportId")
                  }else {
                    navigation.navigate("ImportID")}
                  }
                }
              >
                <ButtonText>Connect to database</ButtonText>
              </Button>
            </View>
            :
            (item === null || typeof item === "undefined")
            ? <View>
              <Diagnoser item={item} dbIdAttr={attr as number}/>
              {
                status === Status.Complete && 
                <Button
                  onPress={() => {
                    if(isComposer){
                      navigation.navigate("ComposerImportId")
                    }else {
                      navigation.navigate("ImportID")}
                  }
                  }
                >
                  <ButtonText>Connect to database</ButtonText>
                </Button>
              }
              </View>
            : <Preview item={item} isComposer={isComposer} navigation={navigation} />
          }
        </View>
      }
    </View>
  )
}

function Diagnoser({
  dbIdAttr,
  item
}:
{
  dbIdAttr: number,
  item: standard_composer | standard | undefined | null
}
){
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);
  const dbStatus = useContext(OnlineDB.DbStateContext).status;
  if(dbStatus === Status.Failed){
    return(
      <View>
        <SubText>You are not connected to the server right now, so we can't fetch your connected composer. Click below to retry at your connection.</SubText>
        <Button onPress={() => {OnlineDB.updateDispatch(dbDispatch)}}><ButtonText>Retry connection</ButtonText></Button>
      </View>
    );
  }
  if(dbStatus === Status.Waiting){
    return(
      <View>
        <SubText>Attempting to connect to the server, please wait...</SubText>
      </View>
    );
  }
  return(
    <View>
      <SubText>You seem to be connected to the server, but the ID doesn't match any of our items, so it may have been deleted. We suggest connecting it again!</SubText>
    </View>
  );
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
          <ButtonText>Compare and Change</ButtonText>
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

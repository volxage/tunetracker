import {
  ButtonText,
  Title,
  SubText,
  SMarginView,
  DeleteButton
} from '../../Style.tsx'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, {useContext, useState} from 'react';
import {Status, composer, standard, standard_composer, tune_draft} from '../../types.ts';
import {
  View,
} from 'react-native';
import OnlineDB from '../../OnlineDB.tsx';
import dateDisplay from '../../textconverters/dateDisplay.tsx';
import {Button} from '../../simple_components/Button.tsx';
import {useTheme} from 'styled-components';

export default function DbConnection({
  attr,
  navigation,
  isComposer,
  handleSetCurrentItem
}:{
  attr: unknown,
  navigation: any,
  isComposer: boolean,
  handleSetCurrentItem: Function
}){
  const [connectTuneExpanded, setConnectTuneExpanded] = useState(false);
  const status = useContext(OnlineDB.DbStateContext).status;
  const theme = useTheme();
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
          style={{backgroundColor: theme.panelBg, flex:2}}
          iconName={connectTuneExpanded ? "earth-minus" : "earth-plus"}
        />
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
                text='Connect to database'
              />
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
                  }}
                  text='Connect to database'
                />
              }
              </View>
            : <Preview item={item} isComposer={isComposer} navigation={navigation} handleSetCurrentItem={handleSetCurrentItem}/>
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
        <Button onPress={() => {OnlineDB.updateDispatch(dbDispatch)}} text='Retry connection'/>
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
  item, isComposer, navigation, handleSetCurrentItem
}:
{
  item: composer | standard,
  isComposer: boolean,
  navigation: any,
  handleSetCurrentItem: Function
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
        <SubText style={{fontSize: 20, color:'grey', alignSelf: 'center'}}>
          Press and hold to disconnect this Composer from the online version above
        </SubText>
        <DeleteButton onLongPress={() => {
            handleSetCurrentItem("dbId", undefined);
        }}><ButtonText>Detach</ButtonText></DeleteButton>
        <Button onPress={() => {navigation.navigate("ComposerCompare")}}
          text='Compare and Change'
        />
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
        <SubText style={{fontSize: 20, color:'grey', alignSelf: 'center'}}>
          Press and hold to disconnect this Tune from the online version above
        </SubText>
        <DeleteButton onLongPress={() => {
            handleSetCurrentItem("dbId", undefined);
        }}><ButtonText>Detach</ButtonText></DeleteButton>
        <Button onPress={() => {navigation.navigate("Compare")}}
          text='Compare and Change'
        />
      </View>
    );
  }
}

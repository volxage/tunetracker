// Copyright 2025 Jonathan Hilliard

import {FlatList, TouchableHighlight, View} from "react-native";
import {SMarginView, SubBoldText, SubDimText, SubText, Text} from "../../Style";
import {useContext, useEffect, useState} from "react";
import TuneDraftContext, {tune_draft_context_t} from "../../contexts/TuneDraftContext";
import ComposerDraftContext, {composer_draft_context_t} from "../../contexts/ComposerDraftContext";
import {tune_draft, composer, standard_composer, standard} from "../../types";
import {useNavigation} from "@react-navigation/native";
import {Button} from "../../simple_components/Button";
import {NewTuneContext} from "../Editor";
import {useTheme} from "styled-components";
import {NewComposerContext} from "../ComposerEditor";

type notification_t = {
  name: string
  description: string
  choices: {
    text?: string
    icon?: string
    action: Function
  }[]
}
type draft_context_t = tune_draft_context_t | composer_draft_context_t;
function ParseNotifications(draftContext: draft_context_t, navigation: any){
  const notifications = [] as notification_t[];
  if("cd" in draftContext){
    const cd = draftContext.cd;
    if(!cd.dbId || cd.dbId === 0){
      notifications.push({
        name: "Not attached to database",
        description: "Your composer draft isn't connected to TuneTracker's database. Connecting your composer makes it easier for users to properly credit them for their compositions!",
        choices: [
          {
            text: "Resolve",
            action: () => {
              navigation.navigate("SimilarItemPrompt");
            }
          }
        ]
      });
    }
  }else{
    const td = draftContext.td;
    if(!td.dbId || td.dbId === 0){
      notifications.push({
        name: "Not attached to database",
        description: "Your tune draft isn't connected to TuneTracker's database. Connecting your tunes will make it easier for you to determine which songs you have in common with your friends, along with other benefits.",
        choices: [
          {
            text: "Resolve",
            action: () => {
              navigation.navigate("SimilarItemPrompt");
            }
          }
        ]
      });
    }else{
    }
  }
  return notifications;
}

function NotifItems({
  notifications,
  setNotifications
}:{
  notifications: notification_t[],
  setNotifications: Function
}){

  return(
    <View>
      <FlatList
        data={notifications}
        ListEmptyComponent={() => <View><SubText style={{textAlign: "center"}}>No alerts! Your draft is in good health.</SubText></View>}
        renderItem={entry => {
          return(
            <TouchableHighlight key={entry.index} onPress={() => {}}>
              <SMarginView>
                <Text style={{textAlign: "center"}}>{entry.item.name}</Text>
                <SubText>{entry.item.description}</SubText>
                <FlatList data={entry.item.choices} renderItem={({item: choice}) => 
                  <View>
                    <Button text={choice.text} onPress={() => {choice.action()}}/>
                  </View>
                }/>
              </SMarginView>
            </TouchableHighlight>
          )
        }
        }
      />
    </View>
  );
}
export default function DraftNotif({
}: {
}){
  const [notifications, setNotifications] = useState([] as notification_t[])
  const td = useContext(TuneDraftContext);
  const cd = useContext(ComposerDraftContext);
  const isNewTune = useContext(NewTuneContext);
  const isNewComposer = useContext(NewComposerContext);
  //Test if the tunedraft context is an empty object
  const isComposer = Object.keys(cd).length > 0;
  const draftContext = isComposer ? cd : td;
  const draft = isComposer ? cd.cd : td.td;
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const notificationsPresent = notifications.length > 0;
  
  if( (!isComposer && isNewTune) || (isComposer && isNewComposer) ){
    return(<></>);
  }
  useEffect(() => {
    setNotifications(ParseNotifications(draftContext, navigation));
  }, [draft.dbId])
  return(
    <SMarginView>
      <Button
        onPress={() => {setExpanded(!expanded)}}
        iconName={notificationsPresent ? "cloud-alert" : "cloud-check"}
        iconColor={notificationsPresent ? theme.pending : theme.on}
        text={notificationsPresent ? notifications.length.toString() : ""}
        textStyle={{color: theme.detailText}}
      />
      {
        expanded &&
          <View style={{borderColor: theme.panelBg, borderWidth: 8}}>
            <SubBoldText style={{textAlign: "center"}}>Draft Alerts</SubBoldText>
            <NotifItems notifications={notifications} setNotifications={setNotifications}/>
          </View>
      }
    </SMarginView>
  );
}

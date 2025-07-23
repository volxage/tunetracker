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
import OnlineDB from "../../OnlineDB";
import {AxiosError} from "axios";
import ResponseHandler from "../../services/ResponseHandler";

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
async function tuneDraftFetch(id: number, navigation: any, onlineDbDispatch: any){
  async function attempt(first: boolean){
    return ResponseHandler(
      OnlineDB.getTuneDraft(id),
      ()=>"",
      attempt,
      first, 
      navigation, 
      onlineDbDispatch,
      new Map<number, string>([
        [404, "Your draft was rejected and deleted, or simply lost by the server. Typically drafts are only deleted (rather than just rejected) if they contain offensive/inappropriate material. Please refrain from including those things in your drafts!"]
      ])
    )
  }
  return attempt(true);
}
async function composerDraftFetch(id: number, navigation: any, onlineDbDispatch: any){
  async function attempt(first: boolean){
    return ResponseHandler(
      OnlineDB.getComposerDraft(id),
      ()=>"",
      attempt,
      first, 
      navigation, 
      onlineDbDispatch,
      new Map<number, string>([
        [404, "Your composer draft was rejected and deleted, or simply lost by the server. Typically drafts are only deleted (rather than just rejected) if they contain offensive/inappropriate material. Please refrain from including those things in your drafts!"]
      ])
    )
  }
  return attempt(true);
}
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
    }else{
      //Composer has a non-zero dbId
    }
  }else{
    //draftContext is for a Tune.
    const td = draftContext.td;
    if(td.dbDraftId){
      const names = new Map<string, string>([
        ["PENDING", "Your draft is pending review."],
        ["REJECTED", "Your draft was rejected."],
        ["DELETED", "Your draft was deleted, or can't be found."],
        ["ACCEPTED", "Your draft was accepted!"]
      ])
      const descriptions = new Map<string, string>([
        ["PENDING", "Your draft is pending review from TuneTracker moderators before other users can use it."],
        ["REJECTED", "Your draft was rejected by moderators, it was either very innacurate or inappropriate."],
        ["DELETED", "Your draft seems to have been deleted. It probably contained inappropriate material, or the server is having problems."],
        ["ACCEPTED", "Congratulations! Your draft was accepted by moderators and can now be used by other users."]
      ])
      let res = "";
      OnlineDB.getTuneDraft(td.dbDraftId).then(({data: data}) => {
        if(data.pending_review === true){res = "PENDING";}
        if(!data.pending_review && data.accepted === false){res = "REJECTED"}
        if(!data.pending_review && data.accepted === true){
          res = "ACCEPTED"
          draftContext.updateTd("dbId", data.TuneId, true);
        }
      }).catch(err => {
        if(err instanceof AxiosError){
          if(err.status === 404){
            res = "DELETED";
          }
        }
      }).finally(() => {
        if(res !== "" && td.lastSeenDraftState !== res){
          notifications.push({
            name: names.get(res) as string,
            description: descriptions.get(res) as string,
            choices: [
              {
                text: "Hide this message",
                action: () => {
                  draftContext.updateTd("lastSeenDraftState", res, true);
                }
              }
            ]
          });
        }
      })
    }
    if(!td.dbId || td.dbId === 0){
      notifications.push({
        name: td.lastSeenDraftState === "PENDING" ? "Not connected: Draft pending" : "Not attached to database",
        description: td.lastSeenDraftState === "PENDING" ? "You have uploaded your tune, but you won't be connected to the database until it has been accepted. We recommend periodically checking in to make sure it hasn't been added by someone else." : "Your tune draft isn't connected to TuneTracker's database. Connecting your tunes will make it easier for you to determine which songs you have in common with your friends, along with other benefits.",
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
      //Tune has a non-zero dbId
      const standard = OnlineDB.getStandardById(td.dbId);
      if(!standard || typeof standard === "undefined"){
        notifications.push({
          name: "Can't reach online version",
          description: "We can't reach to the online version you connected to. (It was probably deleted, or there's a problem connecting with the server). If you believe the version you previously connected to is now replaced, you should reconnect to the new version!",
          choices: [
            {
              text: "Replace connection",
              action: () => {
                navigation.navigate("SimilarItemPrompt");
              }
            }
          ]
        });
      }else{
        //Standard is valid
        if(!td.lastRecordedStandardChange || td.lastRecordedStandardChange < standard.updatedAt){
          notifications.push({
            name: "New changes detected",
            description: "It seems there has been some modifications to the online version since the last time you checked. You should take a look!",
            choices: [
              {
                text: "Check out new changes",
                action: () => {
                  navigation.navigate("Compare");
                }
              }
            ]
          });
        }
      }
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
  const newItem = (!isComposer && isNewTune) || (isComposer && isNewComposer);
  
  useEffect(() => {
    if(!newItem){
      setNotifications(ParseNotifications(draftContext, navigation));
    }
  }, [draft.dbId, newItem, draft.lastRecordedStandardChange, draft.lastSeenDraftState])
  if(newItem){
    return(<></>);
  }
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

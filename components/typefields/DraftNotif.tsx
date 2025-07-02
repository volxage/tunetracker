import {FlatList, TouchableHighlight, View} from "react-native";
import {SubText, Text} from "../../Style";
import {useContext, useEffect, useState} from "react";
import TuneDraftContext, {tune_draft_context_t} from "../../contexts/TuneDraftContext";
import ComposerDraftContext, {composer_draft_context_t} from "../../contexts/ComposerDraftContext";
import {tune_draft, composer} from "../../types";
import {useNavigation} from "@react-navigation/native";
import {Button} from "../../simple_components/Button";

type notification_t = {
  name: string
  description: string
  choices: {
    text?: string
    icon?: string
    action: Function
  }[]
}

function ParseNotifications(draftContext: tune_draft_context_t | composer_draft_context_t, navigation: any){
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
    }
  }
  return notifications;
}

export default function DraftNotif({

}:{

}){
  const td = useContext(TuneDraftContext);
  const cd = useContext(ComposerDraftContext);
  //Test if the tunedraft context is an empty object
  const isComposer = Object.keys(td).length !== 0;
  const draftContext = isComposer ? cd : td;
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState([] as notification_t[])
  useEffect(() => {
    setNotifications(ParseNotifications(draftContext, navigation));
  }, [])
  return(
    <View>
      <FlatList
        data={notifications}
        renderItem={entry => 
          <TouchableHighlight>
            <Text>{entry.item.name}</Text>
            <SubText>{entry.item.description}</SubText>
            <FlatList data={entry.item.choices} renderItem={({item: choice}) => 
            <View>
              <Button text={choice.text} onPress={() => {choice.action()}}/>
            </View>
            }/>
          </TouchableHighlight>
        }
      />
    </View>
  );
}

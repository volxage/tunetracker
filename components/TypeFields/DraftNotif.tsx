import {FlatList, View} from "react-native";
import {SubText, Text} from "../../Style";
import {useContext, useEffect} from "react";
import TuneDraftContext from "../../contexts/TuneDraftContext";
import ComposerDraftContext from "../../contexts/ComposerDraftContext";
import {tune_draft, composer} from "../../types";

type notification_t = {
  name: string
  description: string
  actions: {
    text?: string
    icon?: string
    action: Function
  }[]
}

function GetNotifications(draft: tune_draft | composer, isComposer: boolean){
  if(isComposer){
    const cd = draft as composer;
  }else{
    const td = draft as tune_draft;
  }
}

export default function DraftNotif({

}:{

}){
  const td = useContext(TuneDraftContext);
  const cd = useContext(ComposerDraftContext);
  //Test if the tunedraft context is an empty object
  const isComposer = Object.keys(td).length !== 0;

  const notifications = [] as notification_t[];
  useEffect(() => {
    //Fetch notifications
    //notifications.push(notif);
  }, [])
  return(
    <View>
      <FlatList
        data={notifications}
        renderItem={entry => 
          <View>
            <Text>{entry.item.name}</Text>
            <SubText>{entry.item.description}</SubText>
          </View>
        }
      />
    </View>
  );
}

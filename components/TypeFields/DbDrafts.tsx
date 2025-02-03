import {View} from "react-native";
import {Button, ButtonText, SMarginView, SubText} from "../../Style";
import {useEffect, useState} from "react";
import {submitted_tune_draft} from "../../types";
import OnlineDB from "../../OnlineDB";

export default function DbDrafts({
  attr,
  navigation,
  isComposer,
  handleSetCurrentItem
}:{
  attr: undefined | number,
  navigation: any,
  isComposer: boolean,
  handleSetCurrentItem: Function
}){
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState({} as submitted_tune_draft);
  useEffect(() => {
    if(typeof attr !== "undefined" && attr !== 0){
      OnlineDB.getTuneDraft(attr).then(res => {
        setDraft(res.data);
      })
    }
  }, [])
  if(typeof attr === "undefined" || attr === 0){
    console.log("Draft undefined or 0");
    return(<></>);
  }
  return(
    <SMarginView>
      <SubText>You've submitted a version of this tune to tunetracker.jhilla.org!</SubText>
      <Button
          onPress={() => {setIsExpanded(!isExpanded)}}
          style={{backgroundColor: "#222", flex:2}}
        ><ButtonText>{isExpanded ? "Hide uploaded details" : "Show uploaded details"}</ButtonText></Button>
      <SMarginView>
        {
          isExpanded &&
          <View>
            {
              isComposer ?
              <SubText>
              </SubText>
              :
              <SubText>
                Uploaded Tune-draft details:{"\n\n"}
                Title: {draft.title + "\n"}
                Alternative Title: {draft.alternativeTitle + "\n"}
                Composers: {draft.Composers?.map(comp => {comp.name}).join(", ") + "\n"}
                Bio: {draft.bio + "\n"}
                Form: {draft.form + "\n"}
                Year: {draft.year + "\n"}
            </SubText>
            }
          </View>
        }
      </SMarginView>
    </SMarginView>
  )
}

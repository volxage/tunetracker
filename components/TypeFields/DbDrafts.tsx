import {View} from "react-native";
import {Button, ButtonText, DeleteButton, SMarginView, SubText} from "../../Style";
import {useContext, useEffect, useState} from "react";
import {submitted_tune_draft} from "../../types";
import OnlineDB from "../../OnlineDB";
import ResponseHandler from "../../services/ResponseHandler";
import {useNavigation} from "@react-navigation/native";
import ResponseBox from "../ResponseBox";

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
  const [fetchResult, setFetchResult] = useState("");
  const [fetchError, setFetchError] = useState(false);
  const onlineDbDispatch = useContext(OnlineDB.DbDispatchContext);
  useEffect(() => {
    if(typeof attr !== "undefined" && attr !== 0){
      tuneDraftFetch(attr, navigation, onlineDbDispatch).then(res => {
        if(!res.isError){
          setFetchError(false);
          setDraft(res.data);
        }else{
          setFetchResult(res.result);
          setFetchError(true);
        }
      });
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
              fetchError ?
              <View>
                <ResponseBox result={fetchResult} isError={true}/>
                <DeleteButton onPress={() => {
                  handleSetCurrentItem("dbDraftId", 0);
                }}>
                  <ButtonText>Clear</ButtonText>
                </DeleteButton>
              </View>
              :
              <View>
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
          </View>
            }
          </View>
        }
      </SMarginView>
    </SMarginView>
  )
}

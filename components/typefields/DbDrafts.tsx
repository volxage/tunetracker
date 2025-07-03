import {View} from "react-native";
import {ButtonText, DeleteButton, SMarginView, SubBoldText, SubText} from "../../Style";
import {useContext, useEffect, useState} from "react";
import {submitted_tune_draft} from "../../types";
import OnlineDB from "../../OnlineDB";
import ResponseHandler from "../../services/ResponseHandler";
import {useNavigation} from "@react-navigation/native";
import ResponseBox from "../ResponseBox";
import {Button} from "../../simple_components/Button";
import axios from "axios";
import TuneDraftContext from "../../contexts/TuneDraftContext";
import ComposerDraftContext from "../../contexts/ComposerDraftContext";

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
  handleSetCurrentItem
}:{
  attr: undefined | number,
  handleSetCurrentItem: Function
}){
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [fetchResult, setFetchResult] = useState("");
  const [fetchError, setFetchError] = useState(false);

  const td = useContext(TuneDraftContext);
  const cd = useContext(ComposerDraftContext);
  const isComposer = Object.keys(td).length === 0;
  const itemHandler = isComposer ? cd.updateCd : td.updateTd;

  const [draft, setDraft] = useState({} as submitted_tune_draft);
  const onlineDbDispatch = useContext(OnlineDB.DbDispatchContext);

  useEffect(() => {
    if(typeof attr !== "undefined" && attr !== 0){
      tuneDraftFetch(attr, navigation, onlineDbDispatch).then(res => {
        if(!res.isError){
          setFetchError(false);
          setDraft(res.data);
          if(res.data.accepted){
            //Find draft's online version and connect immediately (don't wait for confirmation)
            itemHandler("dbId", res.data.TuneId, true);
          }
        }else{
          setFetchResult(res.result);
          setFetchError(true);
        }
      });
    }
  }, [attr])
  if(typeof attr === "undefined" || attr === 0){
    //console.log("Draft undefined or 0");
    return(<></>);
  }
  return(
    <SMarginView>
      <SubText>You've submitted a version of this tune to tunetracker.jhilla.org!</SubText>
      <Button
        onPress={() => {setIsExpanded(!isExpanded)}}
        style={{backgroundColor: "#222", flex:2}}
        text={isExpanded ? "Hide uploaded details" : "Show uploaded details"}
      />
      <SMarginView>
        {
          isExpanded &&
          <View>
            {
              fetchError ?
              <View>
                <ResponseBox result={fetchResult} isError={true}/>
                <DeleteButton onPress={() => {
                  handleSetCurrentItem("dbDraftId", 0, true);
                }}>
                  <ButtonText>Detach from Server Submission</ButtonText>
                </DeleteButton>
              </View>
              :
              <View>
                <SubBoldText>
                  {
                    draft.pending_review
                    ? "Pending review!"
                    : (draft.accepted ? "Accepted!" : "Rejected by moderator")
                  }
                </SubBoldText>
                {
                  isComposer ?
                  <SubText>
                  </SubText>
                  :
                  <SubText>
                    Uploaded Tune-draft details:{"\n\n"}
                    Title: {draft.title + "\n"}
                    Alternative Title: {draft.alternativeTitle || "(none)" + "\n"}
                    Composers: {draft.Composers?.map(comp => comp.name).join(", ") + "\n"}
                    Bio: {(draft.bio || "(none)").concat("\n")}
                    Form: {(draft.form || "(none)").concat("\n")}
                    Year: {(String(draft.year) !== "null" ? String(draft.year) : "(none)").concat("\n")}
                  </SubText>
                }
            </View>
            }
          </View>
        }
      </SMarginView>
    </SMarginView>
  )
}

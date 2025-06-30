import {View} from "react-native";
import {ButtonText, DeleteButton, SafeBgView, SMarginView, SubBoldText, SubText, Text, Title} from "../../Style";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {Button} from "../../simple_components/Button";
import {useNavigation} from "@react-navigation/native";
import {useContext, useEffect, useReducer, useState} from "react";
import TuneDraftContext from "../../contexts/TuneDraftContext";
import ComposerDraftContext from "../../contexts/ComposerDraftContext";
import standardComposerDraftReducer from "../../DraftReducers/StandardComposerDraftReducer";
import standardTuneDraftReducer from "../../DraftReducers/StandardTuneDraftReducer";
import ResponseHandler from '../../services/ResponseHandler.ts';
import {AxiosError} from "axios";
import OnlineDB from "../../OnlineDB";
import {compareTuneEditorAttrs, composer, composerEditorAttrs, standard_composer, standard_draft, tune_draft} from "../../types";
import DraftSummary, {DbDraftSummary} from "../../simple_components/DraftSummary.tsx";

const exclude_set = new Set([
  "dbId",
  "playlists",
  "playthroughs",
  //"composers"
]);

export default function UploadRequest({}: {}){
  //TODO: Translate tune to standard, fix submit button, hide cancel button if success
  const navigation = useNavigation();
  const [uploadResult, setUploadResult] = useState("");
  const [uploadError, setUploadError] = useState({} as AxiosError);
  const uploadSuccessful = false;
  const [uploadErrorPresent, setUploadErrorPresent] = useState(false);
  const errorReceived = uploadError && "message" in uploadError;
  const TDContext = useContext(TuneDraftContext);
  const CDContext = useContext(ComposerDraftContext);
  //If the composerDraftContext isn't empty.
  const isComposer = Object.keys(CDContext).length > 0;
  const [dbState, dbDispatch] = useReducer(
    (isComposer ? standardComposerDraftReducer : standardTuneDraftReducer), {currentDraft: {}}
  );
  const convertedStd = dbState.currentDraft;
  const onlineDbDispatch = useContext(OnlineDB.DbDispatchContext);
  const attrs = (isComposer ? composerEditorAttrs : compareTuneEditorAttrs)
    .filter(item => (!exclude_set.has(item[0]) && !item[0].endsWith("Confidence")))
  useEffect(() => {
    if(isComposer){
      const draft = CDContext.cd;
      for(const attr of attrs){
        dbDispatch({
          //"Update from other" translates the attr to the online standard
          type: 'update_from_other',
          attr: attr[0],
          value: draft[attr[0] as keyof composer]
        });
      }
    }else{
      const draft = TDContext.td;
      for(const attr of attrs){
        dbDispatch({
          //"Update from other" translates the attr to the online standard
          type: 'update_from_other',
          attr: attr[0],
          value: draft[attr[0] as keyof tune_draft]
        });
      }
    }
  }, [])
  function submit(first=true){
    if(!uploadSuccessful && !errorReceived){
      if(!isComposer){
        const toUpload = convertedStd as standard_draft;
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
        })
      }else{
        const toUpload = convertedStd as standard_composer;
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
        })
      }
    }
  }
  return(
    <SafeBgView>
      <Title><Icon name="upload" size={28}/></Title>
      <Text style={{textAlign: "center"}}>Upload your tune?</Text>
      <SMarginView>
        <SubText>Uploading your work means that other TuneTracker users can import it easily without having to type it again like you did! You will receive credit.</SubText>
        <SubText>It also means that future users won't encounter problems when determining songs that a group of people all know.</SubText>
      </SMarginView>
      <DbDraftSummary dbDraft={dbState.currentDraft}/>
      <Button text="Upload tune"/>
      <DeleteButton onPress={() => {navigation.goBack();}}>
        <ButtonText>Cancel</ButtonText>
      </DeleteButton>
    </SafeBgView>
  );
}

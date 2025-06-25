import {View} from "react-native";
import {ButtonText, DeleteButton, SafeBgView, SMarginView, SubText, Text, Title} from "../../Style";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {Button} from "../../simple_components/Button";
import {useNavigation} from "@react-navigation/native";
import {useContext, useEffect, useReducer, useState} from "react";
import TuneDraftContext from "../../contexts/TuneDraftContext";
import ComposerDraftContext from "../../contexts/ComposerDraftContext";
import standardComposerDraftReducer from "../../DraftReducers/StandardComposerDraftReducer";
import standardTuneDraftReducer from "../../DraftReducers/StandardTuneDraftReducer";
import ResponseHandler from '../services/ResponseHandler.ts';
import {AxiosError} from "axios";
import OnlineDB from "../../OnlineDB";
import {standard_composer, standard_draft} from "../../types";

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
  useEffect(() => {
  })
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
        <SubText>It also means that future users won't encounter problems when comparing which songs a group of people know all know.</SubText>
      </SMarginView>
      <Button text="Upload tune"/>
      <DeleteButton onPress={() => {navigation.goBack();}}>
        <ButtonText>Cancel</ButtonText>
      </DeleteButton>
    </SafeBgView>
  );
}

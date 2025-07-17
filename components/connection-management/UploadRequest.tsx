import {View} from "react-native";
import {ButtonText, DeleteButton, RowView, SafeBgView, SMarginView, SubBoldText, SubDimText, SubText, Text, Title} from "../../Style";
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
import ResponseBox from "../ResponseBox.tsx";
import {NewTuneContext} from "../Editor.tsx";

const exclude_set = new Set([
  "dbId",
  "playlists",
  "playthroughs",
  //"composers"
]);

export default function UploadRequest({}: {}){
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
  const isNewTune = useContext(NewTuneContext);
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
          OnlineDB.createTuneDraft(copyToSend), 
          (response => {
            return `Successfully ${isNewTune ? "uploaded" : "updated"} your version of ${response.data.title}`;
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
          OnlineDB.createComposerDraft(copyToSend),
          (response => {
            return `Successfully ${isNewTune ? "uploaded" : "updated"} your vesion of ${response.data.name}`;
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
        {
          isNewTune ?
            <View><SubText>Updating your work means that after review, other users can import your revisions and TuneTracker's information can be more accurate!</SubText><SubText>It also means that future users won't encounter problems when determining songs that a group of people all know.</SubText>
</View>:
            <SubText>Uploading your work means that other TuneTracker users can import it easily without having to type it again like you did! You will receive credit.</SubText>
        }
              </SMarginView>
      <UploadSummary/>
      <ResponseBox
        result={uploadResult}
        isError={uploadErrorPresent}
      />
      {
        uploadResult === "" ?
          <View>
            <Button text={isNewTune ? "Upload tune" : "Update submission"} onPress={() => {
              submit();
            }}/>
            <DeleteButton onPress={navigation.goBack}>
              <ButtonText>Cancel</ButtonText>
            </DeleteButton>
          </View>
          :
          <View>
            <Button text="Done" onPress={navigation.goBack}/>
          </View>
      }
    </SafeBgView>
  );
}

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
        [404, "Your tune draft was rejected and deleted, or simply lost by the server. Typically drafts are only deleted (rather than just rejected) if they contain offensive/inappropriate material. Please refrain from including those things in your drafts!"]
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

function UploadSummary({dbState}:{dbState: {currentDraft: tune_draft | composer}}){
  const isNewTune = useContext(NewTuneContext);
  const navigation = useNavigation();
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);
  let PreviousUploadComponent = () => {return <View><SubText>This is your first upload!</SubText></View>};
  if(isNewTune){
    return(
      <View>
        <DbDraftSummary dbDraft={dbState.currentDraft}/>
      </View>
    );
  }else{
    if(dbState.currentDraft.dbDraftId){
      if("title" in dbState.currentDraft){
        tuneDraftFetch(dbState.currentDraft.dbDraftId, navigation, dbDispatch).then(({result: result, isError: isError, data: data}) => {
          if(!isError){
            PreviousUploadComponent = () => {
              return(
                <DbDraftSummary dbDraft={data}/>
              )
            }
          }
        });
      }else{

      }
    }
    return(
      <RowView>
        <View>
          <SubDimText>Previously uploaded:</SubDimText>
          <PreviousUploadComponent/>
        </View>
        <View>
          <SubDimText>New version to submit:</SubDimText>
          <DbDraftSummary dbDraft={dbState.currentDraft}/>
        </View>
      </RowView>
    );
  }
}

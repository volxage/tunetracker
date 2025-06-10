import {useContext} from "react";
import OnlineDB from "../../OnlineDB";
import TuneDraftContext from "../../contexts/TuneDraftContext";
import ComposerDraftContext from "../../contexts/ComposerDraftContext";
import {ButtonText, DeleteButton, SafeBgView, SubText, Text} from "../../Style";
import {Button} from "../../simple_components/Button";
import {useNavigation} from "@react-navigation/native";

  function SimilarItemPrompt({
  }:{
  }){
    const navigation = useNavigation();
    const dbState = useContext(OnlineDB.DbStateContext);
    const standards = dbState.standards;
    const composers = dbState.composers;
    const TDContext = useContext(TuneDraftContext);
    const CDContext = useContext(ComposerDraftContext);
    //If the composerDraftContext isn't empty.
    const isComposer = Object.keys(CDContext).length > 0;
    const activeDraft = isComposer ? CDContext.cd : TDContext.td;
    if(!activeDraft.dbId){
      return(
        <SafeBgView>
          <Text>Oops!</Text>
          <SubText>This {isComposer ? "composer" : "tune" } doesn't seem to be connected. You shouldn't be on this menu, please email code@jhilla.org if you are able to consistently reach this message after pressing "Back."</SubText>
          <DeleteButton onPress={()=>{navigation.goBack();}}><ButtonText>Back</ButtonText></DeleteButton>
        </SafeBgView>
      );
    }

}

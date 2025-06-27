import {useContext} from "react";
import {SMarginView, SubBoldText} from "../Style";
import TuneDraftContext from "../contexts/TuneDraftContext";
import ComposerDraftContext from "../contexts/ComposerDraftContext";

export default function DraftSummary({}:{}){
  const TDContext = useContext(TuneDraftContext);
  const CDContext = useContext(ComposerDraftContext);
  const isComposer = Object.keys(CDContext).length > 0;
  if(isComposer){
    return(
      <SMarginView>
        <SubBoldText></SubBoldText>
      </SMarginView>
    );
  }else{
    return(
      <SMarginView>
        <SubBoldText></SubBoldText>
      </SMarginView>
    );
  }
}

export function DbDraftSummary({dbDraft}:{dbDraft: any}){

}

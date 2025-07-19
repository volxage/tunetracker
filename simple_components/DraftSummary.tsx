import {useContext} from "react";
import {SMarginView, SubBoldText, SubDimText, SubText} from "../Style";
import TuneDraftContext from "../contexts/TuneDraftContext";
import ComposerDraftContext from "../contexts/ComposerDraftContext";
import {standard, standard_composer, standard_composer_draft, standard_draft} from "../types";
import OnlineDB from "../OnlineDB";
import Tune from "../model/Tune";
import Composer from "../model/Composer";
import dateDisplay from "../textconverters/dateDisplay";

export default function DraftSummary({}:{}){
  const TDContext = useContext(TuneDraftContext);
  const CDContext = useContext(ComposerDraftContext);
  const isComposer = Object.keys(CDContext).length > 0;
  if(isComposer){
    const cd = CDContext.cd;
    return(
      <SMarginView>
        <SubDimText>
          Name: <SubText>{cd.name}</SubText>
        </SubDimText>
        <SubDimText>
          Birth-Death: <SubText>{dateDisplay(cd.birth)} - {dateDisplay(cd.death)}</SubText>
        </SubDimText>
        <SubDimText>
          Bio: <SubText>{cd.bio}</SubText>
        </SubDimText>
      </SMarginView>
    );
  }else{
    const td = TDContext.td;
    return(
      <SMarginView>
        <SubDimText>
          Title: <SubText>{td.title}</SubText>
        </SubDimText>
        <SubDimText>
          Alternative Title: <SubText>{td.alternativeTitle}</SubText>
        </SubDimText>
        <SubDimText>
          Bio: <SubText>{td.bio}</SubText>
        </SubDimText>
        <SubDimText>
          Form: <SubText>{td.form}</SubText>
        </SubDimText>
        <SubDimText>
          Composers: <SubText>{(td.composers as composer[])?.map(comp => comp.name).join(", ")}</SubText>
        </SubDimText>
      </SMarginView>
    );
  }
}
//Summary for existing saved item in local device
export function ItemSummary({item}:{item: Tune | Composer}){
  if("title" in item){
    const td = item;
    return(
      <SMarginView>
        <SubDimText>
          Title: <SubText>{td.title}</SubText>
        </SubDimText>
        <SubDimText>
          Alternative Title: <SubText>{td.alternativeTitle}</SubText>
        </SubDimText>
        <SubDimText>
          Bio: <SubText>{td.bio}</SubText>
        </SubDimText>
        <SubDimText>
          Form: <SubText>{td.form}</SubText>
        </SubDimText>
        <SubDimText>
          Composers: <SubText>{td.composers?.map(comp => comp.name).join(", ")}</SubText>
        </SubDimText>
      </SMarginView>
    );
  }else{
    const cd = item;
      <SMarginView>
        <SubDimText>
          Name: <SubText>{cd.name}</SubText>
        </SubDimText>
        <SubDimText>
          Birth-Death: <SubText>{dateDisplay(cd.birth)} - {dateDisplay(cd.death)}</SubText>
        </SubDimText>
        <SubDimText>
          Bio: <SubText>{cd.bio}</SubText>
        </SubDimText>
      </SMarginView>
  }
}

export function ToUploadDbDraftSummary({dbDraft}:{dbDraft: any}){
  const TDContext = useContext(TuneDraftContext);
  const CDContext = useContext(ComposerDraftContext);
  const isComposer = Object.keys(CDContext).length > 0;
  const allComposers = useContext(OnlineDB.DbStateContext).composers;

  if(isComposer){
    const cd = dbDraft as standard_composer_draft;
    return(
      <SMarginView>
        <SubDimText>
          Name: <SubText>{cd.name}</SubText>
        </SubDimText>
        <SubDimText>
          Birth-Death: <SubText>{dateDisplay(cd.birth)} - {dateDisplay(cd.death)}</SubText>
        </SubDimText>
        <SubDimText>
          Bio: <SubText>{cd.bio}</SubText>
        </SubDimText>
      </SMarginView>
    );
  }else{
    const sd = dbDraft as standard_draft;
    return(
      <SMarginView>
        <SubDimText>
          Title: <SubText>{sd.title}</SubText>
        </SubDimText>
        <SubDimText>
          Alternative Title: <SubText>{sd.alternative_title}</SubText>
        </SubDimText>
        <SubDimText>
          Bio: <SubText>{sd.bio}</SubText>
        </SubDimText>
        <SubDimText>
          Form: <SubText>{sd.form}</SubText>
        </SubDimText>
        <SubDimText>
          Composers: <SubText>{(sd.Composers as number[])?.map(id => allComposers.find(comp => comp.id === id)?.name).join(", ")}</SubText>
        </SubDimText>
      </SMarginView>
    );
  }
}

export function ExistingDbDraftSummary({dbDraft}:{dbDraft: any}){
  const TDContext = useContext(TuneDraftContext);
  const CDContext = useContext(ComposerDraftContext);
  const isComposer = Object.keys(CDContext).length > 0;
  const allComposers = useContext(OnlineDB.DbStateContext).composers;

  if(isComposer){
    const cd = dbDraft as standard_composer;
    return(
      <SMarginView>
        <SubDimText>
          Name: <SubText>{cd.name}</SubText>
        </SubDimText>
        <SubDimText>
          Birth-Death: <SubText>{dateDisplay(cd.birth)} - {dateDisplay(cd.death)}</SubText>
        </SubDimText>
        <SubDimText>
          Bio: <SubText>{cd.bio}</SubText>
        </SubDimText>
      </SMarginView>
    );
  }else{
    const sd = dbDraft as standard;
    return(
      <SMarginView>
        <SubDimText>
          Title: <SubText>{sd.title}</SubText>
        </SubDimText>
        <SubDimText>
          Alternative Title: <SubText>{sd.alternative_title}</SubText>
        </SubDimText>
        <SubDimText>
          Bio: <SubText>{sd.bio}</SubText>
        </SubDimText>
        <SubDimText>
          Form: <SubText>{sd.form}</SubText>
        </SubDimText>
        <SubDimText>
          Composers: <SubText>{(sd.Composers as standard_composer[])?.map(comp => comp.name).join(", ")}</SubText>
        </SubDimText>
      </SMarginView>
    );
  }
}

import {createContext} from "react"
import {standard_composer_draft} from "../types";
type standard_composer_draft_struct = {
  cd: standard_composer_draft,
  setCd: (cd: standard_composer_draft) => void,
  //There's a technical difference between optional parameters and initialized ones,
  //but I think functionally they could be considered the same.
  updateCd: (key: keyof standard_composer_draft, value: any, immediate?: boolean) => void
}
const StandardComposerDraftContext = createContext({} as standard_composer_draft_struct);
export default StandardComposerDraftContext;

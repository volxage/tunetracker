import {createContext} from "react"
import {composer} from "../types";
export type composer_draft_context_t = {
  cd: composer,
  setCd: (cd: composer) => void,
  //There's a technical difference between optional parameters and initialized ones,
  //but I think functionally they could be considered the same.
  updateCd: (key: keyof composer, value: any, immediate?: boolean) => void
}
const ComposerDraftContext = createContext({} as composer_draft_context_t);
export default ComposerDraftContext;

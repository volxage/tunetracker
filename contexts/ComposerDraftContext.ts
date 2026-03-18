import {createContext} from "react"
import {composer} from "../types";
import {BSON} from "realm";
export type composer_draft_context_t = {
  cd: composer,
  setCd: (cd: composer) => void,
  //There's a technical difference between optional parameters and initialized ones,
  //but I think functionally they could be considered the same.
  updateCd: (key: keyof composer, value: any, immediate?: boolean) => void,
  id?: BSON.ObjectId
}
const ComposerDraftContext = createContext({} as composer_draft_context_t);
export default ComposerDraftContext;

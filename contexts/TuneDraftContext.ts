import {createContext} from "react"
import {tune_draft, tune_draft_extras} from "../types";
import {BSON} from "realm";
export type tune_draft_context_t = {
  td: tune_draft,
  setTd: (td: tune_draft) => void,
  //There's a technical difference between optional parameters and initialized ones,
  //but I think functionally they could be considered the same.
  updateTd: (key: keyof (tune_draft & tune_draft_extras), value: any, immediate?: boolean) => void,
  id?: BSON.ObjectId
}
const TuneDraftContext = createContext({} as tune_draft_context_t);
export default TuneDraftContext;

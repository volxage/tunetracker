import {createContext} from "react"
import {tune_draft} from "../types";
type tune_draft_context_t = {
  td: tune_draft,
  setTd: (td: tune_draft) => void,
  //There's a technical difference between optional parameters and initialized ones,
  //but I think functionally they could be considered the same.
  updateTd: (key: keyof tune_draft, value: any, immediate?: boolean) => void
}
const TuneDraftContext = createContext({} as tune_draft_context_t);
export default TuneDraftContext;

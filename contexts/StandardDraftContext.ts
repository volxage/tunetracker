import {createContext} from "react"
import {standard_draft} from "../types";
type standard_draft_struct = {
  sd: standard_draft,
  dispatch: React.Dispatch<any>,
  //There's a technical difference between optional parameters and initialized ones,
  //but I think functionally they could be considered the same.
  updateSd: (key: keyof standard_draft, value: any, immediate?: boolean) => void
}
const StandardDraftContext = createContext({} as standard_draft_struct);
export default StandardDraftContext;

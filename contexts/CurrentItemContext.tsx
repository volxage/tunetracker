import {createContext} from "react"
import {tune_draft, composer} from "../types";
type CurrentItem_t = {
  currentItem: tune_draft | composer,
  setCurrentItem: (item: tune_draft | composer) => void,
  update: (key: keyof (tune_draft | composer), value: any) => void
}
const CurrentItemContext = createContext({} as CurrentItem_t);
export default CurrentItemContext;

import Composer from "../../model/Composer";
import {tune_draft, composer, standard_composer, standard} from "../../types";
type local_key = keyof (composer & tune_draft)
type online_key = keyof (standard_composer & standard)
export default function displayLocalAttr(attrKey: local_key, attr: any){
  switch(attrKey){
    case "composers": {
      const comps = attr as Composer[];
      return comps.map(comp => comp.name).join(", ");
    }
    case "hasLyrics": {
      const hasLyrics = attr as boolean;
      return hasLyrics ? "Has lyrics" : "Does not have lyrics";
    }
    default: {
      return attr;
    }
  }
}

export function displayOnlineAttrs(attrKey: online_key, attr: any){
  switch(attrKey){
    case "Composers": {
      const comps = attr as composer[];
      return comps.map(comp => comp.name).join(", ");
    }
    default: {
      return attr;
    }
  }
}

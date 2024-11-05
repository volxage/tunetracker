import Composer from "../../model/Composer";
import {tune_draft, composer, standard_composer, standard, tuneDefaults, standardDefaults} from "../../types";
type local_key = keyof (composer & tune_draft)
type online_key = keyof (standard_composer & standard)
export default function displayLocalAttr(attrKey: local_key, attr: any){
  if(attr === "undefined"){
    return "";
  }
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
  if(attr === "undefined"){
    return "";
  }
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

export function debugDisplayLocal(localItem: (composer & tune_draft), isComposer: boolean){
  if(isComposer){
    return "";
  }else{
    let ret = "";
    for(const keyPair of tuneDefaults){
      if(keyPair[0] in localItem){
        const key = keyPair[0] as keyof tune_draft;
        ret += keyPair[0] + ": " + displayLocalAttr(key, localItem[key]) + "\n";
      }
    }
    return ret;
  }
}
export function debugDisplayOnline(onlineItem: (standard_composer & standard), isComposer: boolean){
  if(isComposer){
    return "";
  }else{
    let ret = "";
    for(const keyPair of standardDefaults){
      if(keyPair[0] in onlineItem){
        const key = keyPair[0] as keyof standard;
        ret += keyPair[0] + ": " + displayOnlineAttrs(key, onlineItem[key]) + "\n";
      }
    }
    return ret;
  }
}

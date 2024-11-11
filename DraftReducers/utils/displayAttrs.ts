import OnlineDB from "../../OnlineDB";
import Composer from "../../model/Composer";
import dateDisplay from "../../textconverters/dateDisplay";
import {tune_draft, composer, standard_composer, standard, tuneDefaults, standardDefaults, standard_draft} from "../../types";
type local_key = keyof (composer & tune_draft)
type online_key = keyof (standard_composer & standard_draft)
export default function displayLocalAttr(attrKey: local_key, attr: any){
  if(typeof attr === "undefined"){
    return "(Undefined)";
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
    case "birth":
    case "death":{
      return dateDisplay(attr)
    }
    default: {
      return attr;
    }
  }
}

export function displayOnlineAttrs(attrKey: online_key, attr: any){
  if(typeof attr === "undefined"){
    return "";
  }
  switch(attrKey){
    case "Composers": {
      const comps = attr as number[];
      return comps.map(comp => {
        const result = OnlineDB.getComposerById(comp);
        if(typeof result !== "undefined"){
          return result.name;
        }else{
          //Below is for calls to displayAttrs with "raw" standards that haven't been processed by the Reducer.
          if(typeof comp !== "number") return ((comp as composer).name);
          return "ERROR RETRIEVING COMPOSER FROM ID"
        }
      }).join(", ");
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

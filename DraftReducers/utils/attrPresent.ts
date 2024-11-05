import Composer from "../../model/Composer";
import {tune_draft, composer, standard_composer, standard} from "../../types";
type local_key = keyof (composer & tune_draft)
type online_key = keyof (standard_composer & standard)
const empty_equivalent = new Set([
  "",
  //Bro what is even going on here???
  '""',
  "[]",
  "{}",
  "unknown",
  "0",
]);
export function localAttrPresent(attrKey: local_key, attr: any): boolean{
  if(typeof attr === "undefined"){
    return false;
  }
  switch(attrKey){
    case "composers": {
      const comps = attr as Composer[];
      if(comps && comps[0]){
        return true;
      }
    }
    default: {
      if(attrKey === "mainKey"){
      }
      return !(empty_equivalent.has(JSON.stringify(attr).trim()));
    }
  }
}
export function onlineAttrPresent(attrKey: online_key, attr: any): boolean{
  if(typeof attr === "undefined"){
    return false;
  }
  switch(attrKey){
    case "Composers": {
      const comps = attr as standard_composer[];
      if(comps && comps[0]){
        return true;
      }
    }
    default: {
      return !empty_equivalent.has(JSON.stringify(attr));
    }
  }
}

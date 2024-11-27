import {standard, standard_composer, tune_draft} from "../../types";
import {translateAttrFromTune} from "./translate";

//TODO: Generalize for tunes vs composers
export function comparedAttrEqual(tuneDraftAttrKey: keyof tune_draft, tuneDraftAttr: any, standard: standard){
  //The following only takes the first attribute and compares it.
  // => [standardKey, attr][]
  const translatedAttrs = translateAttrFromTune(tuneDraftAttrKey, tuneDraftAttr);
  const translatedAttr = translatedAttrs[0];
  
  if(translatedAttr[1] === standard[translatedAttr[0]]) return true;
  if(translatedAttr[1] instanceof Array && translatedAttr[1][0] && standard[translatedAttr[0]] instanceof Array && (standard[translatedAttr[0]] as Array<standard_composer>)[0]){
    //Non-empty array comparison
    switch(translatedAttr[0]){
      case "Composers":{
        const standardComps = standard[translatedAttr[0]] as standard_composer[];
        // If a placeholder was passed, and it isn't empty, then it can't be a part of the server.
        if(translatedAttrs[1] && translatedAttrs[1][0] === "composer_placeholder" && translatedAttrs[1][1] !== ""){
          return false;
        }
        return (translatedAttr[1] as Array<number>).every(compId => standardComps.some(standComp => standComp.id === compId));
      }
    }
  }
  return false;
}

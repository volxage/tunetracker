import {standard, standard_composer, tune_draft} from "../../types";
import {translateAttrFromTune} from "./translate";


function nonEmptyArray(array: unknown){
  if( !(array instanceof Array) ) return false;
  if( !(array[0]) ) return false;
  return true;
}

//TODO: Generalize for tunes vs composers
export function comparedAttrEqual(tuneDraftAttrKey: keyof tune_draft, tuneDraftAttr: any, standard: standard){
  //The following only takes the first attribute and compares it.
  // => [standardKey, attr][]
  const translatedAttrs = translateAttrFromTune(tuneDraftAttrKey, tuneDraftAttr);
  //Grab first translation
  const translatedAttr = translatedAttrs[0];
  const standardKey = translatedAttr[0];
  const attr = translatedAttr[1];
  const standardAttr = standard[standardKey]
  
  //If primitive comparison works, return true
  if(attr === standardAttr) return true;
  if(nonEmptyArray(attr) && nonEmptyArray(standardAttr)){
    //Non-empty array comparison
    switch(standardKey){
      case "Composers":{
        const standardComps = standardAttr as standard_composer[];
        //TODO: Figure out what this means and better document it
        // If a placeholder was passed, and it isn't empty, then it can't be a part of the server.
        if(translatedAttrs[1] && translatedAttrs[1][0] === "composer_placeholder" && translatedAttrs[1][1] !== ""){
          return false;
        }
        return (attr as Array<number>).every(compId => standardComps.some(standComp => standComp.id === compId));
      }
    }
  }
  return false;
}

import {tune_draft, standard_draft, tuneDefaults, standardDefaults, standard_composer} from '../types.tsx';
import Tune from '../model/Tune.ts';
import {translateAttrFromTune} from './utils/translate.ts';
import {Realm} from 'realm';

export default function standardTuneDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_from_other':
    {
      let copy: standard_draft = {}
      for(let attr in state["currentDraft"]){
        copy[attr as keyof standard_draft] = state["currentDraft"][attr];
      }
      const translations = translateAttrFromTune(action["attr"], action["value"]);
      for(const t of translations){
        copy[t[0]] = t[1];
      }
      // Mark attr as changed for it to be saved
      return {currentDraft: copy};
    }
    case 'update_attr':
    {
      let copy: standard_draft = {}
      for(let attr in state["currentDraft"]){
        copy[attr as keyof standard_draft] = state["currentDraft"][attr];
      }
      
      //Workaround to prevent issues with composer_placeholder staying after a local composer is reverted.
      //Could maybe be abstracted with "attribute pairs" if this pattern needs to occur multiple times.
      if(action["attr"] === "Composers"){
        copy.composer_placeholder = "";
      }

      copy[action["attr"] as keyof standard_draft] = action["value"];
      // Mark attr as changed for it to be saved
      return {currentDraft: copy};
    }
    case 'set_to_selected':
    {
      const tune: standard_draft = {}
      if(action["selectedItem"] instanceof Tune){
        //TODO: Use translate functions in this portion, considering it's a Tune converting to a Standard
        for(let attr of tuneDefaults){
          let key = attr[0] as keyof Tune;
          if(key in action["selectedItem"]
            && typeof action["selectedItem"][key] !== "undefined"
            && action["selectedItem"][key] !== null
          ){
            tune[key as keyof standard_draft] = action["selectedItem"][key as keyof Tune]
          }else{
            tune[key as keyof standard_draft] = attr[1]
          }
        }
      }else{
        for(let attr of standardDefaults){
          let key = attr[0] as keyof standard_draft;
          if(action["selectedItem"] && key in action["selectedItem"] && typeof action["selectedItem"][key] !== "undefined"){
            if(key === "Composers"){
              tune[key] = (action["selectedItem"][key] as standard_composer[]).map(comp => comp.id);
              tune["composer_placeholder"] = action["selectedItem"]["composer_placeholder"]
            }else{
              tune[key] = action["selectedItem"][key as keyof tune_draft]
            }
          }else{
            tune[key] = attr[1]
          }
        }
        //tune.dbId = action["selectedItem"]["id"]
      }
      return {currentDraft: tune};
    }
    default:{
      return {currentDraft: state["currentDraft"]}
    }
  }
}
export function comparedAttrEqual(tuneDraftAttrKey: keyof tune_draft, tuneDraftAttr: any, standard: standard_draft){
  //The following only takes the first attribute and compares it.
  // => [standardKey, attr][]
  const translatedAttrs = translateAttrFromTune(tuneDraftAttrKey, tuneDraftAttr);
  const translatedAttr = translatedAttrs[0];
  
  if(translatedAttr[1] === standard[translatedAttr[0]]) return true;
  if(translatedAttr[1] instanceof Array && translatedAttr[1][0] && standard[translatedAttr[0]] instanceof Array && standard[translatedAttr[0]][0]){
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

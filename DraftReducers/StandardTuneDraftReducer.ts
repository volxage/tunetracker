import {tune_draft, standard_draft, tuneDefaults, standardDefaults, standard_composer} from '../types.tsx';
import Tune from '../model/Tune.ts';
import {List} from 'realm';
import Composer from '../model/Composer.ts';
import {translateAttrFromTune} from './utils/translate.ts';

export default function standardTuneDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_from_other':
    {
      let copy: standard_draft = {}
      for(let attr in state["currentDraft"]){
        copy[attr as keyof standard_draft] = state["currentDraft"][attr];
      }
      const translation = translateAttrFromTune(action["attr"], action["value"]);
      copy[translation[0]] = translation[1];
      // Mark attr as changed for it to be saved
      return {currentDraft: copy};
    }
    case 'update_attr':
    {
      let copy: standard_draft = {}
      for(let attr in state["currentDraft"]){
        copy[attr as keyof standard_draft] = state["currentDraft"][attr];
      }

      copy[action["attr"] as keyof standard_draft] = action["value"];
      // Mark attr as changed for it to be saved
      return {currentDraft: copy};
    }
    case 'set_to_selected':
    {
      const tune: tune_draft = {}
      if(action["selectedItem"] instanceof Tune){
        for(let attr of tuneDefaults){
          let key = attr[0] as keyof Tune;
          if(key in action["selectedItem"]
            && typeof action["selectedItem"][key] !== "undefined"
            && action["selectedItem"][key] !== null
          ){
            tune[key as keyof tune_draft] = action["selectedItem"][key as keyof Tune]
          }else{
            tune[key as keyof tune_draft] = attr[1]
          }
        }
      }else{
        for(let attr of standardDefaults){
          let key = attr[0] as keyof standard_draft;
          if(key in action["selectedItem"] && typeof action["selectedItem"][key] !== "undefined"){
            tune[key as keyof tune_draft] = action["selectedItem"][key as keyof tune_draft]
          }else{
            tune[key as keyof tune_draft] = attr[1]
          }
        }
        //tune.dbId = action["selectedItem"]["id"]
      }
      return {currentDraft: tune};
    }
  }
}
export function comparedAttrEqual(tuneDraftAttrKey: keyof tune_draft, tuneDraftAttr: any, standard: standard_draft){
  // => [standardKey, attr]
  const translatedAttr = translateAttrFromTune(tuneDraftAttrKey, tuneDraftAttr)
  if(translatedAttr[1] === standard[translatedAttr[0]]) return true;
  if(translatedAttr[1] instanceof Array && translatedAttr[1][0] && standard[translatedAttr[0]] instanceof Array && standard[translatedAttr[0]][0]){
    //Non-empty array comparison
    switch(translatedAttr[0]){
      case "Composers":{
        const standardComps = standard[translatedAttr[0]] as standard_composer[];
        return (translatedAttr[1] as Array<number>).every(compId => standardComps.some(standComp => standComp.id === compId));
      }
    }
  }
  return false;
}

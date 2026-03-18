import {tune_draft, standard_draft, tuneDefaults, standardDefaults, standard_composer, standard} from '../types.ts';
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
        for(let attr of tuneDefaults){
          //Right now the only reason we have to use "as" here is because mainStyle isn't implemented yet.
          const translations = translateAttrFromTune(attr[0] as keyof tune_draft, action["selectedItem"][attr[0]])
          for(let translation of translations){
            let key = translation[0];
            if(key in action["selectedItem"]
              && typeof action["selectedItem"][attr[0]] !== "undefined"
              && action["selectedItem"][attr[0]] !== null
            ){
              tune[key] = translation[1];
            }else{
              tune[key] = attr[1]
            }
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

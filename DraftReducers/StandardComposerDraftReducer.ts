//TODO:
//Add "standard" functionality and translation!
import { standard_composer_draft, composerDefaults, standardComposerDefaults } from "../types"
import Composer from "../model/Composer";
import {translateAttrFromComposer} from "./utils/translate";
export default function standardComposerDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_attr':
    {
      const cd: standard_composer_draft = {}
      for(let attr of composerDefaults){
        let key = attr[0] as keyof standard_composer_draft;
        if(key in state["currentDraft"]
          && typeof state["currentDraft"][key] !== "undefined"
          && state["currentDraft"][key] !== null
        ){
          cd[key as keyof standard_composer_draft] = state["currentDraft"][key as keyof Composer]
        }else{
          cd[key as keyof standard_composer_draft] = attr[1]
        }
      }
      cd[action["attr"] as keyof standard_composer_draft] = action["value"];
      let newChangedAttrsList = state["changedAttrsList"];
      if(!newChangedAttrsList.includes(action["attr"])){
        newChangedAttrsList = newChangedAttrsList.concat(action["attr"]);
      }
      return {currentDraft: cd, changedAttrsList: newChangedAttrsList};
    }
    case 'update_from_other':
    {
      let copy: standard_composer_draft = {}
      for(let attr in state["currentDraft"]){
        copy[attr as keyof standard_composer_draft] = state["currentDraft"][attr];
      }
      const translations = translateAttrFromComposer(action["attr"], action["value"]);

      let newChangedAttrsList = state["changedAttrsList"];
      //This for loop is necessary for translations that may return multiple attributes, but this is uncommon
      for(const t of translations){
        copy[t[0]] = t[1];
        if(!newChangedAttrsList.includes(t[0])){
          newChangedAttrsList = newChangedAttrsList.concat(t[0]);
        }
      }

      // Mark attr as changed for it to be saved
      return {currentDraft: copy, changedAttrsList: newChangedAttrsList};
    }
    case 'set_to_selected':
    {
      //TODO: Translate attr from local to standard
      const cd: standard_composer_draft = {}
      if(action["selectedItem"] instanceof Composer){
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedItem"]
            && typeof action["selectedItem"][key] !== "undefined"
            && action["selectedItem"][key] !== null
          ){
            cd[key as keyof standard_composer_draft] = action["selectedItem"][key as keyof Composer]
          }else{
            cd[key as keyof standard_composer_draft] = attr[1]
          }
        }
      }else{
        for(let attr of standardComposerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedItem"] && typeof action["selectedItem"][key] !== "undefined"){
            cd[key as keyof standard_composer_draft] = action["selectedItem"][key as keyof Composer]
          }else{
            cd[key as keyof standard_composer_draft] = attr[1]
          }
        }
      }
      return {currentDraft: cd, changedAttrsList: []};
    }
    default:{
      return {currentDraft: state["currentDraft"], changedAttrsList: []}
    }
  }
}

//TODO:
//Add translation
import { composer, composerDefaults } from "../types"
import Composer from "../model/Composer";
import {translateAttrFromStandardComposer} from "./utils/translate";
export default function composerDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_attr':
    {
      const cd: composer = {}
      for(let attr in state["currentDraft"]){
        cd[attr as keyof composer] = state["currentDraft"][attr];
      }
      cd[action["attr"] as keyof composer] = action["value"];
      let newChangedAttrsList = state["changedAttrsList"];
      if(!newChangedAttrsList.includes(action["attr"])){
        newChangedAttrsList = newChangedAttrsList.concat(action["attr"]);
      }
      return {currentDraft: cd, changedAttrsList: newChangedAttrsList};
    }
    case 'update_from_other':
    {
      let copy: composer = {}
      for(let attr in state["currentDraft"]){
        copy[attr as keyof composer] = state["currentDraft"][attr];
      }
      const translations = translateAttrFromStandardComposer(action["attr"], action["value"]);

      let newChangedAttrsList = state["changedAttrsList"];
      //This for loop is necessary for translations that may return multiple attributes, but this is uncommon
      for(const t of translations){
        console.log(t);
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
      console.log("Set to selected");
      const cd: composer = {}
      if(action["selectedItem"] instanceof Composer){
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedItem"]
            && typeof action["selectedItem"][key] !== "undefined"
            && action["selectedItem"][key] !== null
          ){
            cd[key as keyof composer] = action["selectedItem"][key as keyof Composer]
          }else{
            cd[key as keyof composer] = attr[1]
          }
        }
      }else{
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedItem"] && typeof action["selectedItem"][key] !== "undefined"){
            cd[key as keyof composer] = action["selectedItem"][key as keyof Composer]
          }else{
            cd[key as keyof composer] = attr[1]
          }
        }
      }
      return {currentDraft: cd, changedAttrsList:[]};
    }
    default:{
      console.error(`${action.type} not implemented for ComposerDraftReducer!`)
      return {currentDraft: state["currentDraft"], changedAttrsList: state["changedAttrsList"]}
    }
  }
}

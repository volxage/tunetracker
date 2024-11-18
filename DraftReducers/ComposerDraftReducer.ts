//TODO:
//Add translation
import { composer, composerDefaults } from "../types"
import Composer from "../model/Composer";
import {translateAttrFromStandardComposer} from "./utils/translate";
type state_t= {
  "currentDraft": composer,
  "changedAttrsList": (keyof composer)[]
}
type action_t= {
  "value"?: any,
  "attr"?: keyof composer,
  "type": string,
  "selectedItem"?: Composer | composer
}
export default function composerDraftReducer(state: state_t, action: action_t){
  switch(action.type){
    case 'update_attr':
    {
      if(!action["attr"]){
        console.error("update_attr called with missing attr");
        return {currentDraft: state["currentDraft"], changedAttrsList: state["changedAttrsList"]}
      }

      const cd: composer = {}

      let attr: keyof composer
      for(attr in state["currentDraft"]){
        cd[attr] = state["currentDraft"][attr];
      }
      cd[action["attr"]] = action["value"];

      let newChangedAttrsList = state["changedAttrsList"];
      if(!newChangedAttrsList.includes(action["attr"])){
        newChangedAttrsList = newChangedAttrsList.concat(action["attr"]);
      }
      return {currentDraft: cd, changedAttrsList: newChangedAttrsList};
    }
    case 'update_from_other':
    {
      let copy: composer = {}

      let attr: keyof composer
      for(attr in state["currentDraft"]){
        copy[attr] = state["currentDraft"][attr];
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
            //TODO: Use translator here
            cd[key as keyof composer] = action["selectedItem"][key as keyof Composer]
          }else{
            cd[key as keyof composer] = attr[1]
          }
        }
      }else{
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(action["selectedItem"] && key in action["selectedItem"] && typeof action["selectedItem"][key] !== "undefined"){
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

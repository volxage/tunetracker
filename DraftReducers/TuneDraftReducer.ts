import {tune_draft, standard, tuneDefaults, standard_composer} from '../types.ts';
import Tune from '../model/Tune.ts';
import {useQuery, useRealm} from '@realm/react';
import Composer from '../model/Composer.ts';
import {Results, Realm, BSON} from 'realm';
import {translateAttrFromStandardTune} from './utils/translate.ts';

export default function tuneDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_from_other':
    {
      let copy: tune_draft = {}
      for(let attr in state["currentDraft"]){
        copy[attr as keyof tune_draft] = state["currentDraft"][attr];
      }
      const translations = translateAttrFromStandardTune(action["attr"], action["value"], action["composerQuery"], action["realm"]);

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
    case 'update_attr':
    {
      let tuneCopy: tune_draft = {}
      for(let attr in state["currentDraft"]){
        tuneCopy[attr as keyof tune_draft] = state["currentDraft"][attr];
      }

      tuneCopy[action["attr"] as keyof tune_draft] = action["value"];
      let newChangedAttrsList = state["newChangedAttrsList"];
      if(!newChangedAttrsList){
        newChangedAttrsList = [];
      }
      if(!newChangedAttrsList.includes(action["attr"])){
        newChangedAttrsList = newChangedAttrsList.concat(action["attr"]);
      }
      return {currentDraft: tuneCopy, changedAttrsList: state["changedAttrsList"].concat(action["attr"])};
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
        for(let attr of tuneDefaults){
          let key = attr[0] as keyof tune_draft;
          if(key in action["selectedItem"] && typeof action["selectedItem"][key] !== "undefined"){
            tune[key as keyof tune_draft] = action["selectedItem"][key as keyof tune_draft]
          }else{
            tune[key as keyof tune_draft] = attr[1]
          }
        }
        //tune.dbId = action["selectedItem"]["id"]
      }
      return {currentDraft: tune, changedAttrsList: []};
    }
    default: {
      console.error(`${action.type} not implemented for TuneDraftReducer!`)
      return {currentDraft: state["currentDraft"], changedAttrsList: state["changedAttrsList"]};
    }
  }
}

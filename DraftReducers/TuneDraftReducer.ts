import {tune_draft, standard, tuneDefaults} from '../types.tsx';
import Tune from '../model/Tune.ts';
import {useQuery, useRealm} from '@realm/react';
import Composer from '../model/Composer.ts';

function findAllLocalComposers(compIds: Array<number>){
  return useQuery(Composer)
    .filtered("!(id in $0)", compIds);
}
function translateAttrFromStandardTune(attrKey: keyof standard, attr: any): [keyof tune_draft, any]{
  switch(attrKey){
    case 'alternative_title': {
        return ["alternativeTitle", attr];
      }
    case 'Composers': {
        //NOTE! THIS ASSUMES THE STANDARD'S COMPOSERS ARE LOCALLY STORED ALREADY!
        //TODO: Handle "edge" case referenced above
        return ["composers", findAllLocalComposers(attr)]
      }
    default: {
      //THIS ASSUMES ANY KEY NOT REFERENCED ABOVE IS A SHARED KEY!
      return [attrKey as keyof tune_draft, attr];
    }
  }
}
export default function tuneDraftReducer(state: any, action: any){
  switch(action.type){
    case 'obtain_attr_from_standard':
    {
      let copy: tune_draft = {}
      for(let attr in state["currentTune"]){
        copy[attr as keyof tune_draft] = state["currentTune"][attr];
      }
      const translation = translateAttrFromStandardTune(action["attr"], action["value"]);
      copy[translation[0]] = translation[1];
      // Mark attr as changed for it to be saved
      return {currentTune: copy};
    }
    case 'update_attr':
    {
      console.log("Updating attr " + action["attr"]);
      let tuneCopy: tune_draft = {}
      for(let attr in state["currentTune"]){
        tuneCopy[attr as keyof tune_draft] = state["currentTune"][attr];
      }

      tuneCopy[action["attr"] as keyof tune_draft] = action["value"];
      return {currentTune: tuneCopy};
    }
    case 'set_to_selected':
    {
      const tune: tune_draft = {}
      if(action["selectedTune"] instanceof Tune){
        for(let attr of tuneDefaults){
          let key = attr[0] as keyof Tune;
          if(key in action["selectedTune"]
            && typeof action["selectedTune"][key] !== "undefined"
            && action["selectedTune"][key] !== null
          ){
            tune[key as keyof tune_draft] = action["selectedTune"][key as keyof Tune]
          }else{
            tune[key as keyof tune_draft] = attr[1]
          }
        }
      }else{
        for(let attr of tuneDefaults){
          let key = attr[0] as keyof tune_draft;
          if(key in action["selectedTune"] && typeof action["selectedTune"][key] !== "undefined"){
            tune[key as keyof tune_draft] = action["selectedTune"][key as keyof tune_draft]
          }else{
            tune[key as keyof tune_draft] = attr[1]
          }
        }
        //tune.dbId = action["selectedTune"]["id"]
      }
      return {currentTune: tune};
    }
  }
}

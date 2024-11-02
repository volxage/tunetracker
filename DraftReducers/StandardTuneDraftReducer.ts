import {tune_draft, standard_draft, tuneDefaults} from '../types.tsx';
import Tune from '../model/Tune.ts';
import {List} from 'realm';
import Composer from '../model/Composer.ts';

function translateAttrFromTune(attrKey: keyof tune_draft, attr: any): [keyof standard_draft, any]{
  switch(attrKey){
    case 'alternativeTitle': {
      return ["alternative_title", attr];
    }
    case 'composers': {
      //NOTE! THIS ASSUMES THE TUNEDRAFT'S COMPOSERS ARE TIED TO THE DATABASE ALREADY!
      //TODO: Handle "edge" case referenced above
      return ["composers", (attr as List<Composer>).map(comp => comp.dbId)];
    }
    default: {
      //THIS ASSUMES ANY KEY NOT REFERENCED ABOVE IS A SHARED KEY!
      return [attrKey as keyof standard_draft, attr];
    }
  }
}
export default function standardTuneDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_from_tune_attr':
    {
      let copy: standard_draft = {}
      for(let attr in state["currentStandard"]){
        copy[attr as keyof standard_draft] = state["currentStandard"][attr];
      }
      const translation = translateAttrFromTune(action["attr"], action["value"]);
      copy[translation[0]] = translation[1];
      // Mark attr as changed for it to be saved
      return {currentStandard: copy};
    }
    case 'update_attr':
    {
      console.log("Updating attr " + action["attr"]);
      let copy: standard_draft = {}
      for(let attr in state["currentStandard"]){
        copy[attr as keyof standard_draft] = state["currentStandard"][attr];
      }

      copy[action["attr"] as keyof standard_draft] = action["value"];
      // Mark attr as changed for it to be saved
      return {currentStandard: copy};
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
      return {currentStandard: tune};
    }
  }
}

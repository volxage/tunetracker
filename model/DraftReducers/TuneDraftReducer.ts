import {tune_draft, standard, tuneDefaults} from '../../types.tsx';
import Tune from '../Tune.ts';

export default function tuneDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_attr':
    {
      console.log("Updating attr " + action["attr"]);
      let tuneCopy: tune_draft = {}
      for(let attr in state["currentTune"]){
        tuneCopy[attr as keyof tune_draft] = state["currentTune"][attr];
      }

      tuneCopy[action["attr"] as keyof tune_draft] = action["value"];
      // Mark attr as changed for it to be saved
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

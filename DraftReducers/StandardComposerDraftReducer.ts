//TODO:
//Add "standard" functionality and translation!
import { composer, composerDefaults } from "../types"
import Composer from "../model/Composer";
export default function standardComposerDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_attr':
    {
      const cd: composer = {}
      for(let attr of composerDefaults){
        let key = attr[0] as keyof Composer;
        if(key in state["currentComposer"]
          && typeof state["currentComposer"][key] !== "undefined"
          && state["currentComposer"][key] !== null
        ){
          cd[key as keyof composer] = state["currentComposer"][key as keyof Composer]
        }else{
          cd[key as keyof composer] = attr[1]
        }
      }
      cd[action["attr"] as keyof composer] = action["value"];
      return {currentComposer: cd};
    }
    case 'set_to_selected':
    {
      const cd: composer = {}
      if(action["selectedComposer"] instanceof Composer){
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedComposer"]
            && typeof action["selectedComposer"][key] !== "undefined"
            && action["selectedComposer"][key] !== null
          ){
            cd[key as keyof composer] = action["selectedComposer"][key as keyof Composer]
          }else{
            cd[key as keyof composer] = attr[1]
          }
        }
      }else{
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedComposer"] && typeof action["selectedComposer"][key] !== "undefined"){
            cd[key as keyof composer] = action["selectedComposer"][key as keyof Composer]
          }else{
            cd[key as keyof composer] = attr[1]
          }
        }
      }
      return {currentComposer: cd};
    }
  }
}

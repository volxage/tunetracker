//TODO:
//Add translation
import { composer, composerDefaults } from "../types"
import Composer from "../model/Composer";
export default function composerDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_attr':
    {
      const cd: composer = {}
      for(let attr of composerDefaults){
        let key = attr[0] as keyof Composer;
        if(key in state["currentDraft"]
          && typeof state["currentDraft"][key] !== "undefined"
          && state["currentDraft"][key] !== null
        ){
          cd[key as keyof composer] = state["currentDraft"][key as keyof Composer]
        }else{
          cd[key as keyof composer] = attr[1]
        }
      }
      cd[action["attr"] as keyof composer] = action["value"];
      return {currentDraft: cd};
    }
    case 'set_to_selected':
    {
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
      return {currentDraft: cd};
    }
  }
}

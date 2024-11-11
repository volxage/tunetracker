//TODO:
//Add "standard" functionality and translation!
import { standard_composer_draft, composerDefaults, standardComposerDefaults } from "../types"
import Composer from "../model/Composer";
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
      return {currentDraft: cd};
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
      return {currentDraft: cd};
    }
  }
}

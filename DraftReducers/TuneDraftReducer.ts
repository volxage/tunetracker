import {tune_draft, standard, tuneDefaults, standard_composer} from '../types.tsx';
import Tune from '../model/Tune.ts';
import {useQuery, useRealm} from '@realm/react';
import Composer from '../model/Composer.ts';
import {Results, Realm, BSON} from 'realm';

function translateAttrFromStandardTune(attrKey: keyof standard, attr: any, composerQuery: Results<Composer> | undefined, realm: Realm): [keyof tune_draft, any]{
  switch(attrKey){
    case 'alternative_title': {
      return ["alternativeTitle", attr];
    }
    case 'Composers': {
      //NOTE! THIS ASSUMES THE STANDARD'S COMPOSERS ARE LOCALLY STORED ALREADY!
      //TODO: Handle "edge" case referenced above
      if(!composerQuery){
        console.error("Composer query not passed, cannot translate from standard");
        return ["composers", []];
      }
      const comps = attr as standard_composer[];
      if(!comps){
        console.error("Composer field empty, cannot translate from Standard");
        return ["composers", []];
      }
      let filtered: Results<Composer> | Composer[] = composerQuery.filtered("dbId IN $0", comps.map(c => c.id));
      const remainingStandardComposers = comps.filter(comp => !filtered.some(C => C.dbId === comp.id));
      if(remainingStandardComposers.length > 0 && !realm){
        console.error("Realm was not passed, unable to import missing composers from Standard");
        return ["composers", filtered];
      }
      for(const comp of remainingStandardComposers){
        realm.write(() => {
          realm.create(Composer,
            {
              id: new BSON.ObjectId(),
              name: comp.name,
              bio: comp.bio,
              birth: comp.birth,
              death: comp.death,
              dbId: comp.id
            }) as Composer;
          //No need to concatenate, the filter automatically updates!
        });
      }
      return ["composers", filtered];
    }
    default: {
      //THIS ASSUMES ANY KEY NOT REFERENCED ABOVE IS A SHARED KEY!
      return [attrKey as keyof tune_draft, attr];
    }
  }
}
export default function tuneDraftReducer(state: any, action: any){
  switch(action.type){
    case 'update_from_other':
    {
      let copy: tune_draft = {}
      for(let attr in state["currentDraft"]){
        copy[attr as keyof tune_draft] = state["currentDraft"][attr];
      }
      const translation = translateAttrFromStandardTune(action["attr"], action["value"], action["composerQuery"], action["realm"]);
      copy[translation[0]] = translation[1];

      // Mark attr as changed for it to be saved
      return {currentDraft: copy};
    }
    case 'update_attr':
    {
      let tuneCopy: tune_draft = {}
      for(let attr in state["currentDraft"]){
        tuneCopy[attr as keyof tune_draft] = state["currentDraft"][attr];
      }

      tuneCopy[action["attr"] as keyof tune_draft] = action["value"];
      return {currentDraft: tuneCopy};
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
      return {currentDraft: tune};
    }
  }
}

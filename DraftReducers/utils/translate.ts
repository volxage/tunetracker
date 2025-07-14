import {BSON, List, Results, Realm} from "realm";
import { tune_draft, standard_draft, composer, standard_composer, standard } from "../../types";
import Composer from "../../model/Composer";
import OnlineDB from "../../OnlineDB";
type local_key = keyof (tune_draft & composer)
type online_key = keyof (standard_draft & standard_composer)
export function translateAttrFromLocal(attrKey: local_key, attr: any, isComposer: boolean): [online_key, any][]{

  //TODO: Interface for Composers as well!
  if(!isComposer){
    return translateAttrFromTune(attrKey as keyof tune_draft, attr)
  }
  return translateAttrFromComposer(attrKey as keyof composer, attr)
}
export function translateKeyFromLocal(attrKey: local_key): online_key{
  switch(attrKey){
    case "alternativeTitle":{
      return "alternative_title";
    }
    case "composers":{
      return "Composers";
    }
    default:{
      //THIS ASSUMES ANY KEY NOT REFERENCED ABOVE IS A SHARED KEY!
      return(attrKey as online_key);
    }
  }
}
export function translateAttrFromTune(attrKey: keyof tune_draft, attr: any): [keyof standard_draft, any][]{
  const translatedKey = translateKeyFromLocal(attrKey) as keyof standard_draft;
  switch(attrKey){
    case 'alternativeTitle': {
      return [["alternative_title", attr]];
    }
    case 'composers': {
      //NOTE! THIS ASSUMES THE TUNEDRAFT'S COMPOSERS ARE TIED TO THE DATABASE ALREADY!
      //TODO: Handle "edge" case referenced above
      if(typeof attr === "undefined"){
        return [["Composers", []]]
      }
      const ids: number[] = []
      const namesNoIds: string[] = []
      for(const comp of (attr as List<Composer>)){
        if("dbId" in comp && typeof comp.dbId !== "undefined" && comp.dbId !== 0){
          ids.push(comp.dbId);
        }else{
          namesNoIds.push(comp.name);
        }
      }
      const results = ids.map(id => OnlineDB.getComposerById(id));
      return [["Composers", ids], ["composer_placeholder", namesNoIds.join(", ")]];
    }
    default: {
      return [[translatedKey, attr]];
    }
  }
}
export function translateAttrFromComposer(attrKey: keyof composer, attr: any): [keyof standard_composer, any][]{
  switch(attrKey){
    default: {
      //THIS ASSUMES ANY KEY NOT REFERENCED ABOVE IS A SHARED KEY!
      return [[attrKey as keyof standard_composer, attr]];
    }
  }
}
export function translateAttrFromStandardComposer(attrKey: keyof standard_composer, attr: any): [keyof composer, any][]{
  switch(attrKey){
    default: {
      //THIS ASSUMES ANY KEY NOT REFERENCED ABOVE IS A SHARED KEY!
      return [[attrKey as keyof composer, attr]];
    }
  }
}
export function translateAttrFromStandardTune(attrKey: keyof standard, attr: any, composerQuery: Results<Composer> | undefined, realm: Realm): [keyof tune_draft, any][]{
  switch(attrKey){
    case 'alternative_title': {
      return ["alternativeTitle", attr];
    }
    case 'Composers': {
      //NOTE! THIS ASSUMES THE STANDARD'S COMPOSERS ARE LOCALLY STORED ALREADY! (I.E. are stored either directly in Realm or are stored as standard_composers from the DB)
      //TODO: Handle "edge" case referenced above
      if(!composerQuery){
        console.error("Composer query not passed, cannot translate from standard");
        return [["composers", []]];
      }
      const comps = attr as standard_composer[];
      if(!comps){
        console.error("Composer field empty, cannot translate from Standard");
        return [["composers", []]];
      }
      let filtered: Results<Composer> | Composer[] = composerQuery.filtered("dbId IN $0", comps.map(c => c.id));
      const remainingStandardComposers = comps.filter(comp => !filtered.some(C => C.dbId === comp.id));
      if(remainingStandardComposers.length > 0 && !realm){
        console.error("Realm was not passed, unable to import missing composers from Standard");
        return [["composers", filtered]];
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
      return [["composers", filtered]];
    }
    default: {
      //THIS ASSUMES ANY KEY NOT REFERENCED ABOVE IS A SHARED KEY!
      return [[attrKey as keyof tune_draft, attr]];
    }
  }
}

import {List} from "realm";
import { tune_draft, standard_draft, composer, standard_composer } from "../../types";
import Composer from "../../model/Composer";
type local_key = keyof (tune_draft & composer)
type online_key = keyof (standard_draft & standard_composer)
export function translateAttrFromLocal(attrKey: local_key, attr: any, isComposer: boolean): [online_key, any]{

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
      return ["alternative_title", attr];
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
      return [["Composers", ids], ["composer_placeholder", namesNoIds]];
    }
    default: {
      return [[translatedKey, attr]];
    }
  }
}
export function translateAttrFromComposer(attrKey: keyof composer, attr: any): [keyof standard_composer, any]{
  switch(attrKey){
    default: {
      //THIS ASSUMES ANY KEY NOT REFERENCED ABOVE IS A SHARED KEY!
      return [attrKey as keyof standard_composer, attr];
    }
  }
}

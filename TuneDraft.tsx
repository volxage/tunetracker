//Copyright 2024 Jonathan Hilliard
import Tune from "./model/Tune";
import {tuneDefaults, tune_draft} from "./types";

//If an attr is empty, the default value is supplied to the array and not the mapped type.
//If an attr is non-empty, it's sent to both the array and the mapped type.

export default class TuneDraft{
  //I don't like this dual storage strategy but in this extremely specific use-case
  //The stack just isn't working well with typescript's types.
  //TODO: Consider deleting td_t.
  td_arr: Array<any>;
  readonly td_t: tune_draft;
  length = 17
  constructor(selectedTune: Tune | tune_draft){
    console.log("ORIGINAL TUNE:");
    console.log(selectedTune);
    const tune: tune_draft = {}
    const tuneCopy: Array<Array<any>> = []
    if(selectedTune instanceof Tune){
      for(let attr of tuneDefaults){
        let key = attr[0] as keyof Tune;
        if(key in selectedTune){
          tuneCopy.push([attr, selectedTune[key as keyof Tune]])
          tune[key as keyof tune_draft] = selectedTune[key as keyof Tune]
        }else{
          tune[key as keyof tune_draft] = attr[1]
        }
      }
    }else{
      for(let attr of tuneDefaults){
        let key = attr[0] as keyof tune_draft;
        if(key in selectedTune){
          tuneCopy.push([attr, selectedTune[key as keyof tune_draft]])
          tune[key as keyof tune_draft] = selectedTune[key as keyof tune_draft]
        }else{
          tune[key as keyof tune_draft] = attr[1]
        }
      }
    }
    this.td_arr = tuneCopy;
    this.td_t = tune;
    console.log(this.td_t);
  }
  get(attr: keyof tune_draft){
    return this.td_t[attr];
  }
  replaceAttr(attr_key: keyof tune_draft, value: any){
    const i = this.td_arr.findIndex((pair) => pair[0] == attr_key);
    this.td_arr[i] = value;
    this.td_t[attr_key] = value;
  }
}

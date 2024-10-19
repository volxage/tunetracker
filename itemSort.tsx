// Copyright 2024 Jonathan Hilliard
import {Results} from "realm";
import Composer from "./model/Composer";
import Tune from "./model/Tune";
import { composer, standard } from "./types";
import Realm from "realm";
function itemSort(songs: Array<Tune | standard | Composer | composer> | Results<Tune>, selected: string, reversed: boolean){
  let reverse_null_multiplier = 1;
  let reversed_multiplier = reversed ? -1 : 1;
  if (selected.endsWith("confidence") || selected == "playthroughs"){
    reverse_null_multiplier = -1 * reversed_multiplier;
  }
  function itemCompare(a_item, b_item){
    let a = a_item[selected as keyof typeof a_item] as unknown;
    let b = b_item[selected as keyof typeof b_item] as unknown;
    if(selected === "Rank" || selected === "Year" || selected === "birth" || selected === "death"){
      if (Number(a) < Number(b)){
        return -1 * reversed_multiplier;
      }
      else if (Number(a) > Number(b)){
        return 1 * reversed_multiplier;
      }
      return 0;
    }


    if (a == null) return 1 * reverse_null_multiplier;
    if (b == null) return -1 * reverse_null_multiplier;

    if (typeof a == "string"){
      if (a.toLowerCase() < (b as String).toLowerCase()){
        return -1 * reversed_multiplier;
      }
      else if (a.toLowerCase() > (b as String).toLowerCase()){
        return 1 * reversed_multiplier;
      }
      return 0;
    }
    else if(typeof a == "number"){
      if ((a as number) < (b as number)){
        return -1 * reversed_multiplier;
      }
      else if ((a as number) > (b as number)){
        return 1 * reversed_multiplier;
      }
      return 0;
    }
    else if (Array.isArray(a) && Array.isArray(b)){
      if (a.length == 0) return 1;
      if (b.length == 0) return -1;
      if (typeof a[0] == "string"){
        if (a[0].toLowerCase() < (b[0] as string).toLowerCase()){
          return -1 * reversed_multiplier;
        }else if (a[0].toLowerCase() > (b[0] as string).toLowerCase()){
          return 1 * reversed_multiplier;
        }
        return 0;
      }
      else { if (typeof a[0] == "number"){
        if ((a[0]) < (b[0] as number)){
          return -1 * reversed_multiplier;
        }
        if ((a[0]) > (b[0] as number)){
          return 1 * reversed_multiplier;
        }
        return 0;
      }
      }
    }
    else if ((a instanceof Results && b instanceof Results) || (a instanceof Realm.List && b instanceof Realm.List)){
      if (a.length == 0) return 1;
      if (b.length == 0) return -1;
      const firstStr = a[0] instanceof Tune ? a[0].title : (a[0] as Composer).name;
      const secondStr = b[0] instanceof Tune ? b[0].title : (b[0] as Composer).name;
      if (firstStr.toLowerCase() < secondStr.toLowerCase()){
        return -1 * reversed_multiplier;
      }else if (firstStr.toLowerCase() > secondStr.toLowerCase()){
        return 1 * reversed_multiplier;
      }
    }
    console.log(a.constructor.name);
    console.log("Type not found.");
    return 0;
  }
  if(songs instanceof Results){
    if(selected === "composers"){
      return songs.map(s => s as Tune).sort(itemCompare)
    }else{
      return songs.sorted(selected, reversed);
    }
  }else{
    return songs.sort(itemCompare);
  }
}

export default itemSort

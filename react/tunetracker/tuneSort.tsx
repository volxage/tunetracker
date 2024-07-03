import { standard } from "./components/Importer";
type tune = {
  "title"?: string
  "alternative_title"?: string
  "composers"?: string[]
  "form"?: string
  "notable_recordings"?: string[]
  "keys"?: string[]
  "styles"?: string[]
  "tempi"?: string[]
  "contrafacts"?: string[] // In the future, these could link to other tunes
  "playthroughs"?: number
  "form_confidence"?: number
  "melody_confidence"?: number
  "solo_confidence"?: number
  "lyrics_confidence"?: number
  "played_at"?: string[]
}
function tuneSort(songs: Array<tune | standard>, selected: string, reversed: boolean){
  let reverse_null_multiplier = 1;
  let reversed_multiplier = reversed ? -1 : 1;
  if (selected.endsWith("confidence") || selected == "playthroughs") reverse_null_multiplier = -1 * reversed_multiplier;
  
  songs.sort(function(a_song, b_song){
    let a = a_song[selected as keyof typeof a_song] as unknown;
    let b = b_song[selected as keyof typeof b_song] as unknown;


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
    return 0;
  });
}
export default tuneSort

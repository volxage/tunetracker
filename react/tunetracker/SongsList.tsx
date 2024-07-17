import RNFS from 'react-native-fs'
const songsFilePath = RNFS.DocumentDirectoryPath + "/songs.json"
import { tune } from "./types";
import defaultSongsJson from './songs.json'
import uuid from 'react-native-uuid'

class SongsList{
  songsList: tune[];
  readonly setSongs: Function;
  constructor(songsList: tune[], setSongs: Function){
    this.songsList = songsList;
    this.setSongs = setSongs;
  }
  writeToSongsJson(tuneList=defaultSongsJson as tune[]){
    const stringified = JSON.stringify(tuneList);
    RNFS.writeFile(songsFilePath, stringified)
      .then(() => this.setSongs(tuneList));
  }
  readFromSongsJson(){
    RNFS.readFile(songsFilePath)
      .then((results) => {
        this.updateSongs(JSON.parse(results))
      })
      .catch((reason) => {
        console.log("ERROR CAUGHT BELOW:")
        console.log(reason)
        console.log("Assuming file doesn't exist, creating one:")
        RNFS.writeFile(songsFilePath, JSON.stringify(defaultSongsJson))
      })
  }
  replaceSelectedTune(oldTune:tune, newTune:tune){
    if(oldTune.id === undefined){
      const new_id = uuid.v4() as string;
      newTune.id = new_id;
    }else{
      newTune.id = oldTune.id;
    }
    const result = this.songsList.map( (value: tune, index: number, array: tune[]) => {
      if(value === oldTune){
        return newTune;
      }
      else{
        return value;
      }
    });
    this.writeToSongsJson(result)
    this.updateSongs(result)
    if(!("id" in newTune)){
      console.error("Tune-ID failed to transfer to updated tune")
    }
    return newTune.id as string;
  }
  addNewTune(tune:tune){
    this.writeToSongsJson(this.songsList.concat(tune))
  }
  deleteTune(tune:tune){
    const i = this.songsList.indexOf(tune);
    this.writeToSongsJson((this.songsList.slice(0, i)).concat(this.songsList.slice(i + 1)));
  }
  updateSongs(songsList: tune[]){
    this.setSongs(songsList)
  }
}
export default SongsList

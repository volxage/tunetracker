//Copyright 2024 Jonathan Hilliard
import RNFS from 'react-native-fs'
const songsFilePath = RNFS.DocumentDirectoryPath + "/songs.json"
import { tune } from "./types";
import defaultSongsJson from './songs.json'
import uuid from 'react-native-uuid'

class SongsList{
  readonly songsList: tune[];
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
    const result = this.songsList.map((value: tune) => {
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
    if(tune.id === undefined){
      const new_id = uuid.v4() as string;
      tune.id = new_id;
    }
    const songsWithNewTune = this.songsList.concat(tune);
    this.updateSongs(songsWithNewTune);
    this.writeToSongsJson(songsWithNewTune);
    return tune.id
  }
  deleteTune(tune:tune){
    const songsWithoutTune = this.songsList.filter(currentTune => currentTune != tune);
    this.writeToSongsJson(songsWithoutTune);
    this.updateSongs(songsWithoutTune);
  }
  updateSongs(songsList: tune[]){
    this.setSongs(songsList)
  }
}
export default SongsList

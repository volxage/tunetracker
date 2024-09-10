//Copyright 2024 Jonathan Hilliard
import RNFS from 'react-native-fs'
const songsFilePath = RNFS.DocumentDirectoryPath + "/songs.json"
import { editorAttrs} from "./types";
import defaultSongsJson from './songs.json'
import uuid from 'react-native-uuid'
import {database} from '.';
import TuneModel from './model/Tune';
import Composer from './model/Composer';

//TODO: Move functions to TuneModel
class SongsList{
  readonly songsList: TuneModel[];
  composerList: Composer[];
  readonly setSongs: Function;
  constructor(songsList: TuneModel[], setSongs: Function){
    this.songsList = songsList;
    this.setSongs = setSongs;
    this.composerList = [];
  }
  rereadDb(){
  //RNFS.readFile(songsFilePath)
  //  .then((results) => {
  //    this.updateSongs(JSON.parse(results))
  //  })
  //  .catch((reason) => {
  //    console.log("ERROR CAUGHT BELOW:")
  //    console.log(reason)
  //    console.log("Assuming file doesn't exist, creating one:")
  //    RNFS.writeFile(songsFilePath, JSON.stringify(defaultSongsJson))
  //  })
    database.get("tunes").query().fetch().then(tunes => {
      this.setSongs(tunes);
    });
    database.get("composers").query().fetch().then(composers => {
      this.composerList = composers as Composer[];
    });
  }
  replaceSelectedTune(oldTune:TuneModel, newTune:TuneModel){
  // TODO: Implement in WatermelonDB
  //if(oldTune.id === undefined){
  //  const new_id = uuid.v4() as string;
  //  newTune.id = new_id;
  //}else{
  //  newTune.id = oldTune.id;
  //}
  //const result = this.songsList.map((value: tune) => {
  //  if(value === oldTune){
  //    return newTune;
  //  }
  //  else{
  //    return value;
  //  }
  //});
  //this.writeToSongsJson(result)
  //this.updateSongs(result)
  //if(!("id" in newTune)){
  //  console.error("Tune-ID failed to transfer to updated tune")
  //}
  //return newTune.id as string;
  }
  addNewTune(tune:TuneModel){
//  if(tune.id === undefined){
//    const new_id = uuid.v4() as string;
//    tune.id = new_id;
//  }
    const songsWithNewTune = this.songsList.concat(tune);
    //this.updateSongs(songsWithNewTune);
//  this.writeToSongsJson(songsWithNewTune);
    return tune.id
  }
  deleteTune(tune:TuneModel){
    //TODO: Reimpement in WatermelondDB
  //const songsWithoutTune = this.songsList.filter(currentTune => currentTune != tune);
  //this.writeToSongsJson(songsWithoutTune);
  //this.updateSongs(songsWithoutTune);
  }
  updateSongs(){
    database.get('tunes').query().fetch().then(result => this.setSongs(result));
  }
}
export default SongsList

//Copyright 2024 Jonathan Hilliard
import RNFS from 'react-native-fs'
const songsFilePath = RNFS.DocumentDirectoryPath + "/songs.json"
import { editorAttrs} from "./types";
import defaultSongsJson from './songs.json'
import uuid from 'react-native-uuid'
import TuneModel from './model/Tune';
import Composer from './model/Composer';

//TODO: Move functions to TuneModel
class SongsList{
  readonly songsList: TuneModel[];
  readonly setSongs: Function;
  readonly composersList: Composer[];
  readonly setComposers: Function;
  constructor(songsList: TuneModel[], setSongs: Function, composers: Composer[], setComposers: Function){
    this.songsList = songsList;
    this.setSongs = setSongs;
    this.composersList = composers;
    this.setComposers = setComposers;
  }
  rereadDb(){
  }
  replaceSelectedTune(oldTune:TuneModel, newTune:TuneModel){
  }
  addNewTune(tune:TuneModel){
    const songsWithNewTune = this.songsList.concat(tune);
    return tune.id
  }
  deleteTune(tune:TuneModel){
  }
}
export default SongsList

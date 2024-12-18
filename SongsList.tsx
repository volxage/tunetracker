//Copyright 2024 Jonathan Hilliard
import RNFS from 'react-native-fs'
const songsFilePath = RNFS.DocumentDirectoryPath + "/songs.json"
import TuneModel from './model/Tune';
import Composer from './model/Composer';

//TODO: Delete file entirely
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
  updateSongs(){
  }
  addNewTune(tune:TuneModel){
  }
  deleteTune(tune:TuneModel){
  }
}
export default SongsList

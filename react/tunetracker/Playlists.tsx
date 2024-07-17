import RNFS from 'react-native-fs'
const playlistsFilePath = RNFS.DocumentDirectoryPath + "/songs.json"
import { tune, playlist } from "./types";
import uuid from 'react-native-uuid'

class Playlists{
  playlists: playlist[];
  constructor(playlists: playlist[] = []){
    this.playlists = playlists;
  }
  getPlaylist(playlist_id: string): playlist | undefined{
    return this.playlists.find((playlist) => {return playlist.id === playlist_id})
  }
  getTunePlaylists(tune_id: string): playlist[]{
    return this.getPlaylists().filter((playlist) => {return tune_id in playlist})
  }
  writeToPlaylistsJson(playlists: playlist[] = []){
    const stringified = JSON.stringify(playlists);
    RNFS.writeFile(playlistsFilePath, stringified);
  }
  addPlaylist(playlistName: string){
    if(this.playlists.some((playlist) => {return playlist.title === playlistName})){
      //TODO: Generate visible "Error" on screen for user using return value
      console.log("Duplicate name, not creating new playlist")
      return(undefined);
    }else{
      const plist: playlist = {
        title: playlistName,
        id: uuid.v4() as string,
        tunes: []
      }
      this.playlists.push(plist)
      return(plist);
    }
  }
  readFromPlaylistsJson(){
    //TODO: FIX
    RNFS.readFile(playlistsFilePath)
      .then((results) => {
        this.updatePlaylists(JSON.parse(results))
      })
      .catch((reason) => {
        console.log("ERROR CAUGHT BELOW:")
        console.log(reason)
        console.log("Assuming file doesn't exist, creating one:")
        RNFS.writeFile(playlistsFilePath, "[]")
      });
  }
  getPlaylists(){
    return this.playlists;
  }
  addTune(tuneId:keyof tune, playlistId:string){
    const playList = this.getPlaylist(playlistId)
    if(typeof tuneId === 'undefined'){
      console.error("Id-less tune attempted to add to playlist (This shouldn't be possible)");
    }
    else if(typeof playlistId === 'undefined'){
      console.error("Id-less playlist attempted to add tune to (This shouldn't be possible)");
    }
    else if(typeof playList === 'undefined'){
      console.error("Playlist lookup failed (playlistId invalid?)");
      console.error("Playlists:");
      console.error(this.playlists);
      console.error("Searched playlist id:");
      console.error(playlistId);
    }
    else if(!(tuneId in playList)){
      playList.tunes.push(tuneId)
      this.writeToPlaylistsJson(this.playlists)
    }
  }
  deleteTune(tune:tune, playlistId: string){
    const playList = this.getPlaylist(playlistId)
    if(typeof playList === 'undefined'){
      console.error("Id-less playlist attempted to be deleted from(This shouldn't be possible)")
    }else if(typeof tune.id === 'undefined'){
      console.error("Tune delete from playlist attempt without ID (This shouldn't be possible)")
    }else{
      const i = playList.tunes.indexOf(tune.id);
      this.writeToPlaylistsJson(this.playlists)
    }
  }
  updatePlaylists(playlists: playlist[]){
    this.playlists = playlists
  }
}
export default Playlists

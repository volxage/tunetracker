import RNFS from 'react-native-fs'
const playlistsFilePath = RNFS.DocumentDirectoryPath + "/playlists.json"
import { tune, playlist } from "./types";
import uuid from 'react-native-uuid'

class Playlists{
  readonly playlists: playlist[];
  setRawPlaylists: Function;
  constructor(playlists: playlist[] = [], setRawPlaylists: Function){
    this.playlists = playlists;
    this.setRawPlaylists = setRawPlaylists;
  }
  getPlaylist(playlist_id: string): playlist | undefined{
    return this.playlists.find((playlist) => {return playlist.id === playlist_id})
  }
  getTunePlaylists(tune_id: string): playlist[]{
    const result = this.playlists.filter((playlist) => {console.log(playlist.tunes.includes(tune_id)); return playlist.tunes.includes(tune_id)})
    return result
  }
  writeToPlaylistsJson(playlists: playlist[] = []){
    const stringified = JSON.stringify(playlists);
    RNFS.writeFile(playlistsFilePath, stringified);
  }
  addPlaylist(playlistName: string){
    if(this.playlists.some((playlist) => {return playlist.title === playlistName})){
      //TODO: Generate visible "Error" on screen for user using return value
      console.error("Duplicate name, not creating new playlist")
      return(undefined);
    }else{
      const plist: playlist = {
        title: playlistName,
        id: uuid.v4() as string,
        tunes: []
      }
      this.setRawPlaylists(this.playlists.concat(plist))
      console.log("New playlist added")
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
  replacePlaylist(oldPlaylist:playlist, newPlaylist:playlist){
    newPlaylist.id = oldPlaylist.id;
    const result = this.playlists.map( (value: playlist) => {
      if(value === oldPlaylist){
        return newPlaylist;
      }
      else{
        return value;
      }
    });
    this.writeToPlaylistsJson(result);
    this.updatePlaylists(result)
    return newPlaylist.id;
  }
  getPlaylists(){
    return this.playlists;
  }
  addTune(tuneId:string, playlistId:string){
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
      const cpy = JSON.parse(JSON.stringify(playList)) as playlist;
      cpy.tunes.push(tuneId)
      this.replacePlaylist(playList, cpy)
      this.writeToPlaylistsJson(this.playlists)
      console.log("Playlists after adding tune:")
      console.log(this.playlists)
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
    this.setRawPlaylists(playlists)
  }
}
export default Playlists

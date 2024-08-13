import RNFS from 'react-native-fs'
const playlistsFilePath = RNFS.DocumentDirectoryPath + "/playlists.json"
import { tune, playlist } from "./types";
import uuid from 'react-native-uuid'

class Playlists{
  playlists: playlist[];
  readonly setRawPlaylists: Function;
  constructor(playlists: playlist[] = [], setRawPlaylists: Function){
    this.playlists = playlists;
    this.setRawPlaylists = setRawPlaylists;
  }
  getPlaylist(playlist_id: string): playlist | undefined{
    return this.playlists.find((playlist) => {return playlist.id === playlist_id})
  }
  getTunePlaylists(tune_id: string): playlist[]{
    const result = this.playlists.filter((playlist) => {
      return playlist.tunes.includes(tune_id)
    })
    return result
  }
  writeToPlaylistsJson(playlists: playlist[] = []){
    const stringified = JSON.stringify(playlists);
    RNFS.writeFile(playlistsFilePath, stringified);
  }
  addPlaylist(playlistName: string){
    if(this.playlists.some(playlist => playlist.title === playlistName)){
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
        console.log("Initial playlists read:");
        console.log(JSON.parse(results));
        this.updatePlaylists(JSON.parse(results));
        this.setRawPlaylists(JSON.parse(results));
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
    }
  }
  removeTune(tuneId:string, playlistId: string){
    const playList = this.getPlaylist(playlistId)
    if(typeof playList === 'undefined'){
      console.error("Id-less playlist attempted to be deleted from (This shouldn't be possible)")
    }else if(typeof tuneId === 'undefined'){
      console.error("Tune delete from playlist attempt without ID (This shouldn't be possible)")
    }else{
       this.replacePlaylist(playList, {
        title: playList.title,
        id: playList.id,
        description: playList.description,
        tunes: playList.tunes.filter(id => id !== tuneId)
      })
      const newPlaylist = this.getPlaylist(playlistId);
      if(typeof newPlaylist !== 'undefined'){
        if(newPlaylist.tunes.length === 0){
          const playlistsWithoutEmpty = this.playlists.filter(playlist => playlist.id != playlistId)
          console.log("Empty playlist " + newPlaylist.title + " deleted.");
          this.updatePlaylists(playlistsWithoutEmpty);
          this.writeToPlaylistsJson(playlistsWithoutEmpty);
        }
      }
    }
  }
  updatePlaylists(playlists: playlist[]){
    this.setRawPlaylists(playlists)
    this.playlists = playlists
  }
}
export default Playlists

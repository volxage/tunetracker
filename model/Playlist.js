
//Copyright 2024 Jonathan Hilliard
import { Model, relation, Q} from '@nozbe/watermelondb'
import { field, text, children, lazy, writer, json} from '@nozbe/watermelondb/decorators'
import {tuneDefaults} from '../types';
import Composer from './Composer';


class Playlist extends Model {
  static table = 'playlists';
  static associations= {
    tune_playlists: { type: 'has_many', key: 'playlist_id' },
  }

  @lazy
  tunes = this.collections
    .get('tunes')
    .query(Q.on('tune_playlists', 'playlist_id', this.id));

  @writer async addTune(tune){
    await this.collections.get('tune_playlists').create(tc => {
      tc.playlist.set(this);
      tc.tune.set(tune);
    });
  }
  @writer async removeTune(tune){
    this.collections.get("tune_playlists")
      .query(Q.where("playlist_id", this.id))
      .fetch().then(results => {
        console.log("Removing PT relation with:");
        console.log(results);
        for(let result of results){
          result.delete();
        }
      });
  }



  @text('title') title
  @text('description') description
}
export default Playlist


//Copyright 2024 Jonathan Hilliard
import { Model, relation, Q} from '@nozbe/watermelondb'
import { field, text, children, lazy, writer, json} from '@nozbe/watermelondb/decorators'
import {tuneDefaults} from '../types';
import Composer from './Composer';


class Playlist extends Model {
  static table = 'tunes';
  static associations= {
    playlist_tunes: { type: 'has_many', key: 'playlist_id' },
  }

  @lazy
  tunes = this.collections
    .get('tunes')
    .query(Q.on('playlist_tunes', 'playlist_id', this.id));

  @writer async addTune(tune){
    await this.collections.get('playlist_tunes').create(tc => {
      tc.playlist.set(this);
      tc.tune.set(tune);
    });
  }
  @writer async removeTune(tune){
    this.collections.get("playlist_tunes")
      .query(Q.where("playlist_id", this.id))
      .fetch().then(results => {
        console.log("Removing PT relation with:");
        console.log(results);
        for(let result of results){
          result.delete();
        }
      });
  }

  *attrs(start = 0, end = Infinity, step = 1){
    for(let attrPair of tuneDefaults){
      if(attrPair[0] in this){
        yield this[attrPair[0]];
      }else{
        yield attrPair[1];
      }
    }
  }




  @text('title') title
  @text('description') description
}
export default Playlist

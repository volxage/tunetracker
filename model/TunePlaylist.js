import { immutableRelation, writer } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'

export default class TunePlaylist extends Model {
  static table = 'tune_playlists'
  static associations = {
    tunes: { type: 'belongs_to', key: 'tune_id' },
    playlists: { type: 'belongs_to', key: 'playlist_id' },
  }
  @writer async deleteIfInvalid(){
    // Deletes TC relation if there is a missing id for a Tune or Composer
    // After these relations are reliably created, these will only be invalid if
    // a tune or playlist is deleted. This should be handled by Tune and Composer anyway.
    const playlist_id = this._getRaw("playlist_id");
    const tune_id = this._getRaw("tune_id");
    if(typeof playlist_id === "undefined" || typeof tune_id === "undefined"){
      this.destroyPermanently();
    }else if(playlist_id === "" || tune_id === ""){
      this.destroyPermanently()
    }
  }
  @writer async delete(){
    this.destroyPermanently();
  }
  @immutableRelation('tunes', 'tune_id') tune;
  @immutableRelation('playlists', 'playlist_id') playlist;
}

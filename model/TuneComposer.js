import { immutableRelation, writer } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'

export default class TuneComposer extends Model {
  static table = 'tune_composers'
  static associations = {
    tunes: { type: 'belongs_to', key: 'tune_id' },
    composers: { type: 'belongs_to', key: 'composer_id' },
  }
  @writer async deleteIfInvalid(){
    // Deletes TC relation if there is a missing id for a Tune or Composer
    // After these relations are reliably created, these will only be invalid if
    // a tune or composer is deleted. This should be handled by Tune and Composer anyway.
    const comp_id = this._getRaw("composer_id");
    const tune_id = this._getRaw("tune_id");
    if(typeof comp_id === "undefined" || typeof tune_id === "undefined"){
      this.destroyPermanently();
    }else if(comp_id === "" || tune_id === ""){
      this.destroyPermanently()
    }
  }
  @writer async delete(){
    this.destroyPermanently();
  }
  @immutableRelation('tunes', 'tune_id') tune;
  @immutableRelation('composers', 'composer_id') composer;
}

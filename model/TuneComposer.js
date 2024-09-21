import { immutableRelation, writer } from '@nozbe/watermelondb/decorators'
import { Model } from '@nozbe/watermelondb'

export default class TuneComposer extends Model {
  static table = 'tune_composers'
  static associations = {
    tunes: { type: 'belongs_to', key: 'tune_id' },
    composers: { type: 'belongs_to', key: 'composer_id' },
  }
  @writer async create(tune, composer){
    //TODO: Validate type. Import prettyAttrs?
    await this.update(tc => {
      tc.tune.set(tune);
      tc.tune.set(composer);
    });
  }
  @immutableRelation('tunes', 'tune_id') tune;
  @immutableRelation('composers', 'composer_id') composer;
}

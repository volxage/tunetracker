import { immutableRelation } from '@nozbe/watermelondb/decorators'
import { field, text, children, lazy, writer} from '@nozbe/watermelondb/decorators'

export default class TuneComposer extends Model {
  static table = 'tune_composers'
  static associations = {
    tunes: { type: 'belongs_to', key: 'tune_id' },
    composers: { type: 'belongs_to', key: 'composer_id' },
  }
  @immutableRelation('tunes', 'tune_id') tune
  @immutableRelation('composers', 'composer_id') composer
}


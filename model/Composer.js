//Copyright 2024 Jonathan Hilliard
import { Model } from '@nozbe/watermelondb'
import { text, lazy, date} from '@nozbe/watermelondb/decorators'

export default class Composer extends Model {
  static table = 'composers';
  static associations= {
//    tunes: { type: 'belongs_to', key: 'contrafact_id' }
    tune_composers: { type: 'has_many', foreignKey: 'composer_id' }
  }

  @lazy
  tunes = this.collections
    .get('tunes')
    .query(Q.on('tune_composers', 'composer_id', this.id));

  @text('name') name
  @date('birth') birth
  @date('death') death
  @text('bio') bio
}

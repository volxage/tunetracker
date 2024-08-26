//Copyright 2024 Jonathan Hilliard
import { Model } from '@nozbe/watermelondb'

export default class Composer extends Model {
  static table = 'composers';
  static associations= {
//    tunes: { type: 'belongs_to', key: 'contrafact_id' }
    tune_composers: { type: 'has_many', foreignKey: 'composer_id' }
  }

  @lazy
  tunes = this.collections
    .get('users')
    .query(Q.on('post_authors', 'post_id', this.id));

  @text('name') name
  @date('birth') 
  @date('death')
  @text('bio') bio
}

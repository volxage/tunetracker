//Copyright 2024 Jonathan Hilliard
import { Model, relation} from '@nozbe/watermelondb'

export default class Tune extends Model {
  static table = 'tunes';
  static associations= {
    //  tunes: { type: 'has_many', key: 'contrafact_id' }
    tune_composers: { type: 'has_many', foreignKey: "tune_id" },
  }

  @lazy
  composers = this.collections
    .get('users')
    .query(Q.on('tune_composers', 'tune_id', this.id));

  @writer async changeAttr(attr, newValue){
    //TODO: Validate type. Import prettyAttrs?
    await this.update(tune => {
      tune.get(attr) = newValue;
    });
  }

  @text('title') title
  @text('alternative_title') alternative_title
  @text('form') form
  @field('year') year
  @field('has_lyricts') hasLyricist
  @field('keys') keys // (Look into RxJS and @json to make json serialization that is observable)
  @field('tempi') tempi
  @field('playthroughs') playthroughs
  @field('form_confidence') formConfidence
  @field('melody_confidence') melodyConfidence
  @field('solo_confidence') soloConfidence
  @field('lyrics_confidence') lyricsConfidence

  @children('tunes') contrafacts
  @relation('tunes', 'contrafact_of_id') contrafactOf
}

import { Model } from '@nozbe/watermelondb'

export default class Tune extends Model {
  static table = 'tunes';
  static associations= {
    tunes: { type: 'belongs_to', key: 'contrafact_id' }
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
}

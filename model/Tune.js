//Copyright 2024 Jonathan Hilliard
import { Model, relation} from '@nozbe/watermelondb'
import { field, text, children, lazy, writer} from '@nozbe/watermelondb/decorators'
import {tuneDefaults} from '../types';


export default class Tune extends Model {
  static table = 'tunes';
  static associations= {
    tunes: { type: 'has_many', key: 'contrafact_id' },
    tune_composers: { type: 'has_many', foreignKey: "tune_id" },
  }

//The below thing isn't working right now.
//@lazy
//composers = this.collections
//  .get('composers')
//  .query(Q.on('tune_composers', 'tune_id', this.id));

  @writer async changeAttr(attr, newValue){
    //TODO: Validate type. Import prettyAttrs?
    await this.update(tune => {
      tune[attr] = newValue;
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
  @text('alternative_title') alternativeTitle
  @text('form') form
  @text('composer_placeholder') composerPlaceholder
  @field('year') year
  @field('has_lyricts') hasLyricist
  @field('keys') keys // (Look into RxJS and @json to make json serialization that is observable)
  @field('tempi') tempi
  @field('playthroughs') playthroughs
  @field('form_confidence') formConfidence
  @field('melody_confidence') melodyConfidence
  @field('solo_confidence') soloConfidence
  @field('lyrics_confidence') lyricsConfidence
  @field('db_id') dbId

  @children('tunes') contrafacts
}

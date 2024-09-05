//Copyright 2024 Jonathan Hilliard
import { Model, relation} from '@nozbe/watermelondb'
import { field, text, children, lazy, writer, json} from '@nozbe/watermelondb/decorators'
import {tuneDefaults} from '../types';


const sanitizeKeys = json => json;
const sanitizeTempi = json => json;
class Tune extends Model {
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
  @writer async replace(newTune){
    await this.update(tune => {
      for(let attrPair of tuneDefaults){
        if(attrPair[0] in newTune){
          console.log(attrPair[0]);
          tune[attrPair[0]] = newTune[attrPair[0]];
        }
      }
    })
    console.log(this.dbId);
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
  @field('main_key') mainKey
  @json('keys', sanitizeKeys) keys
  @field('main_tempo') mainTempo
  @json('tempi', sanitizeTempi) tempi
  @field('playthroughs') playthroughs
  @field('form_confidence') formConfidence
  @field('melody_confidence') melodyConfidence
  @field('solo_confidence') soloConfidence
  @field('lyrics_confidence') lyricsConfidence
  @field('db_id') dbId

  @children('tunes') contrafacts
}
export default Tune

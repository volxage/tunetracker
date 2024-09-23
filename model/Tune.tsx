
//Copyright 2024 Jonathan Hilliard
import { Model, Q} from '@nozbe/watermelondb'
import { field, text, children, lazy, writer, json} from '@nozbe/watermelondb/decorators'
import {tuneDefaults} from '../types';
import Composer from './Composer';


const sanitizeKeys = json => json;
const sanitizeTempi = json => json;
class Tune extends Model {
  static table = 'tunes';
  static associations= {
    tunes: { type: 'has_many', key: 'contrafact_id' },
    tune_composers: { type: 'has_many', foreignKey: "tune_id" },
  }

  @lazy
  composers = this.collections
    .get('composers')
    .query(Q.on('tune_composers', 'tune_id', this.id));

  @writer async changeAttr(attr, newValue){
    //TODO: Validate type. Import prettyAttrs?
    await this.update(tune => {
      tune[attr] = newValue;
    });
  }
  @writer async replace(newTune){
    await this.update(tune => {
      for(let attrPair of tuneDefaults){
        if(attrPair[0] in newTune && attrPair[0] !== "composers"){
          console.log(attrPair[0]);
          tune[attrPair[0]] = newTune[attrPair[0]];
        }
      }
    })

    this.composers.fetch().then(comps => {
      //Remove any old composer not selected, add any new composer not previously saved
      for(let oldComposer of comps){
        if(!newTune.composers.includes(oldComposer)){
          this.removeComposer(oldComposer);
        }
      }
      for(let newComposer of newTune["composers"]){
        if(!comps.includes(newComposer)){
          this.addComposer(newComposer);
        }
      }
    });
  }
  @writer async addComposer(composer){
  //await this.collections.get('tune_composers').create(tc => {
  //  tc.tune = this
  //  tc.composer = composer
  //});
    //composer.tunes.set(this);
    this.composers.set(composer);
  }
  @writer async removeComposer(composer){
    this.composers.extend(
      Q.on("composer", "composer_id", composer.id)
    ).fetch().then(results => {
        console.log("Removing TC relation with:");
        console.log(results);
        for(let result of results){
          result.destroyPermanently();
        }
      }
    );
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
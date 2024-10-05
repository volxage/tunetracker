//Copyright 2024 Jonathan Hilliard
import { Model } from '@nozbe/watermelondb'
import { text, lazy, date, field, writer} from '@nozbe/watermelondb/decorators'
import {composerDefaults} from '../types';
import dateDisplay from '../dateDisplay';

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

  @writer async changeAttr(attr, newValue){
    //TODO: Validate type. Import prettyAttrs?
    await this.update(composer => {
      composer[attr] = newValue;
    });
  }
  @writer async replace(newComposer){
    if(!(newComposer)){
      console.error("Composer-Replace called on undefined object");
    }else{
      await this.update(composer => {
        for(let attrPair of composerDefaults){
          if(attrPair[0] in newComposer){
            console.log(attrPair[0]);
            composer[attrPair[0]] = newComposer[attrPair[0]];
            console.log();
          }
        }
        if("id" in newComposer){
          composer.dbId = newComposer["id"] 
          console.log("DBID:");
        }
      })
      console.log(this.dbId);
    }
  }
  *attrs(start = 0, end = Infinity, step = 1){
    for(let attrPair of composerDefaults){
      if(attrPair[0] in this){
        yield this[attrPair[0]];
      }else{
        yield attrPair[1];
      }
    }
  }
  @writer async delete(){
    this.destroyPermanently();
  }
  toString(){
    return(`B: ${dateDisplay(this["birth"])} D: ${dateDisplay(this["death"])}`);
  }
  debugString(){
    let returnString = this.toString();
    returnString = returnString.concat(
      `\ndbId: ${this.dbId}\n`
    );
  }

  @text('name') name
  @date('birth') birth
  @date('death') death
  @text('bio') bio
  @field('db_id') dbId
}

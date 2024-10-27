import React from "react";
import { Realm, useRealm } from '@realm/react'
import {tune_draft} from "../types";
import Composer from '../model/Composer.ts'
import Playlist from '../model/Playlist.ts'

export default class Tune extends Realm.Object<Tune, 'title'> {
  id!: Realm.BSON.ObjectId;
  title!: string;
  alternativeTitle?: string;
  composers?: Realm.List<Composer>;
  form?: string;
  year?: number;
  hasLyrics?: boolean;
  mainKey?: string;
  // Note that "keys" is reserved in Realm.Object
  keyCenters?: string[]; 
  mainTempo?: number;
  tempi?: number[];
  playthroughs?: number;
  formConfidence?: number;
  melodyConfidence?: number;
  soloConfidence?: number;
  lyricsConfidence?: number;
  dbId?: number;
  playlists?: Realm.List<Playlist>;

  static generate(tn: tune_draft){
    return {
      id: new Realm.BSON.ObjectId(),
      title: tn.title,
      alternativeTitle: tn.alternativeTitle,
      form: tn.form,
      year: tn.year,
      hasLyricts: tn.hasLyrics,
      mainKey: tn.mainKey,
      keyCenters: tn.keyCenters,
      mainTempo: tn.mainTempo,
      tempi: tn.tempi,
      playthroughs: tn.playthroughs,
      formConfidence: tn.formConfidence,
      melodyConfidence: tn.melodyConfidence,
      soloConfidence: tn.soloConfidence,
      lyricsConfidence: tn.lyricsConfidence,
      dbId: tn.dbId,
    }
  }
  static schema: Realm.ObjectSchema = {
    name: 'Tune',
    properties: {
      id: {type: 'objectId', default: new Realm.BSON.ObjectId()},
      title: {type: 'string', indexed: true},
      alternativeTitle: "string?",
      form: "string?",
      year: "int?",
      hasLyrics: "bool?",
      mainKey: "string?",
      keyCenters: "string?[]",
      mainTempo: "int?",
      tempi: "int?[]",
      playthroughs: "int?",
      formConfidence: "double?",
      melodyConfidence: "double?",
      soloConfidence: "double?",
      lyricsConfidence: "double?",
      dbId: {type: "int", indexed: true, optional: true},

      composers: 'Composer[]',
      playlists: 'Playlist[]'
    },
    primaryKey: 'id'
  }
}

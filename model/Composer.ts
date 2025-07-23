import React from "react";
import { Realm, useRealm } from '@realm/react'
import {composer, tune_draft} from "../types";
import Tune from '../model/Tune.ts'

export default class Composer extends Realm.Object<Composer, 'name'> {
  id!: Realm.BSON.ObjectId;
  name!: string;
  birth?: Date;
  death?: Date;
  bio?: string;
  dbId?: number;
  dbDraftId?: number;
  lastSeenDraftState?: string;
  lastRecordedStandardChange?: Date;
  tunes?: Realm.List<Tune>;

  static generate(tn: composer){
    return {
      id: new Realm.BSON.ObjectId(),
      name: tn.name,
      birth: tn.birth,
      death: tn.death,
      bio: tn.bio,
      dbId: tn.dbId
    }
  }
  static schema: Realm.ObjectSchema = {
    name: 'Composer',
    properties: {
      id: {type: 'objectId', default: new Realm.BSON.ObjectId()},
      name: {type: 'string', indexed: true},
      birth: "date?",
      death: "date?",
      bio: "string?",
      dbId: {type: "int", indexed: true, optional: true},
      dbDraftId: "int?",
      lastSeenDraftState: "string?",
      lastRecordedStandardChange: "date?",
      tunes: {type: "linkingObjects", objectType: "Tune", property: "composers"}
    },
    primaryKey: 'id'
  }
}

import React from "react";
import { Realm, useRealm } from '@realm/react'
import {composer, tune_draft} from "../types";
import Tune from '../model/Tune.ts'

export default class Composer extends Realm.Object<Composer, 'name'> {
  _id!: Realm.BSON.ObjectId;
  name!: string;
  birth?: Date;
  death?: Date;
  bio?: string;
  dbId?: number;
  tunes?: Realm.List<Tune>;

  static generate(tn: composer){
    return {
      _id: new Realm.BSON.ObjectId(),
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
      _id: {type: 'objectId', default: new Realm.BSON.ObjectId()},
      name: {type: 'string', indexed: true},
      birth: "date?",
      death: "date?",
      bio: "string?",
      dbId: {type: "int", indexed: true, optional: true},
      tunes: {type: "linkingObjects", objectType: "Tune", property: "composers"}
    },
    primaryKey: '_id'
  }
}

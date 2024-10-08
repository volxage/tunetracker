import React from "react";
import { Realm, useRealm } from '@realm/react'
import {playlist} from "../types";
import Tune from '../model/Tune.ts'

export default class Playlist extends Realm.Object<Playlist, 'title'> {
  _id!: Realm.BSON.ObjectId;
  title!: string;
  description?: string;
  tunes?: Realm.List<Tune>;

  static generate(pl: playlist){
    return {
      _id: new Realm.BSON.ObjectId(),
      title: pl.title,
      description: pl.description,
    }
  }
  static schema: Realm.ObjectSchema = {
    name: 'Playlist',
    properties: {
      _id: 'objectId',
      name: {type: 'string', indexed: true},
      description: 'string',
      tunes: {type: "linkingObjects", objectType: "Tune", property: "playlists"}
    },
    primaryKey: '_id'
  }
}

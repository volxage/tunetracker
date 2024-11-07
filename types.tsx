import {BSON} from "realm"
import Composer from "./model/Composer"

//Copyright 2024 Jonathan Hilliard
export type tune_draft = {
  "title"?: string
  "alternativeTitle"?: string
  "composers"?: Composer[]
  "form"?: string
  "notableRecordings"?: string[]
  "mainKey"?: string
  "keyCenters"?: string[]
  "styles"?: string[]
  "mainTempo"?: number
  "tempi"?: string[]
//  "contrafacts"?: string[] // In the future, these could link to other tunes
  "playthroughs"?: number
  "formConfidence"?: number
  "melodyConfidence"?: number
  "soloConfidence"?: number
  "lyricsConfidence"?: number
  "hasLyrics"?: boolean
  "id"?: BSON.ObjectId
  "dbId"?: number
  "bio"?: string
  "year"?: number
  playedAt?: Date
  //  "playedAt"?: string[]
}
export type composer = {
  "name"?: string
  "bio"?: string
  "birth"?: Date
  "death"?: Date
  "dbId"?: string
}
export type standard_composer = {
  "name"?: string
  "bio"?: string
  "birth"?: Date
  "death"?: Date
  "id": number
}
export type standard = {
  "title": string
  "alternative_title"?: string
  "Composers"?: Array<composer>
  "form"?: string
  "bio"?: string
  "year"?: string
  "id"?: number
  //  "Composers": composer[]
}
export type standard_draft = {
  "title"?: string
  "alternative_title"?: string
  "Composers"?: Array<number>
  "composer_placeholder"?: string
  "form"?: string
  "bio"?: string
  "year"?: string
  "id"?: number
  //  "Composers": composer[]
}
export type playlist = {
  "title": string
  "description"?: string
  "id": BSON.ObjectId
  "tunes": string[]
}

export enum Status{
  Waiting,
  Failed,
  Complete
}

export const editorAttrs = [
  ["dbId", "Database Connection"],
  ["title", "Title"],
  ["alternativeTitle", "Alternative Title"],
  ["composers", "Composers"],
  ["form", "Form"],
  //  ["notable_recordings", "Notable Recordings"],
  ["mainKey", "Main Key"],
  ["mainTempo", "Main Tempo"],
  ["keyCenters", "Keys"],
  ["styles", "Styles"],
  ["tempi", "Tempi"],
  //["contrafacts", "Contrafacts"],
  ["playlists", "Playlists"],
  ["playthroughs", "Playthroughs"],
  ["hasLyrics", "Has lyrics?"],
  ["formConfidence", "Form Confidence"],
  ["melodyConfidence", "Melody Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
  ["playedAt", "Last played"]
];
export const composerEditorAttrs = [
  ["dbId", "Database Connection"],
  ["name", "Name"],
  ["birth", "Birthday"],
  ["death", "Day of Death"],
  ["bio", "Biography"]
];
export const miniEditorAttrs = new Map<string, string>([
  ["title", "Title"],
  ["melodyConfidence", "Melody Confidence"],
  ["formConfidence", "Form Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
  ["playlists", "Playlists"],
  ["justPlayed", "'I Just Played This'"]
])
export const composerDefaults = new Map<string, any>([
  ["name", ""],
  ["birth", new Date(0,0,1)],
  ["death", new Date(0,0,1)],
  ["bio", ""],
  ["dbId", 0]
])
export const tuneDefaults = new Map<string, any>([
  ["title", "New song"],
  ["alternativeTitle", ""],
  ["composers", []],
  ["playlists", []],
  ["form", ""],
  ["notableRecordings", []],
  ["mainKey", ""],
  ["mainTempo", 0],
  ["keyCenters", []],
  ["styles", []],
  ["tempi", []],
  //  ["contrafacts", [],],
  ["hasLyrics", false],
  ["playthroughs", 0],
  ["melodyConfidence", 0],
  ["formConfidence", 0],
  ["soloConfidence", 0],
  ["lyricsConfidence", 0],
  ["dbId", 0]
  //  ["id", "THIS SHOULD NOT BE HERE"] // If the user sees this text at any point, there's an error in the progra],
]);

export const standardDefaults = new Map<string, any>([
  ["title", "New song"],
  ["alternative_title", ""],
  ["Composers", []],
  ["composer_placeholder", ""],
  ["form", ""],
  ["bio", ""],
  ["year", 0],
  ["id", 0],
]);

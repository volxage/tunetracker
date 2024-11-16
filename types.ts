//Copyright 2024 Jonathan Hilliard
import {BSON} from "realm"
import Composer from "./model/Composer"
import Tune from "./model/Tune"

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
  "name"?: string// All enum members in 'E1' and 'E2' are constant.
  "bio"?: string
  "birth"?: Date | undefined
  "death"?: Date | undefined
  "dbId"?: string
}
export type standard_composer = {
  "name"?: string
  "bio"?: string
  "birth"?: Date | undefined
  "death"?: Date | undefined
  "id": number
}
export type standard_composer_draft = {
  "name"?: string
  "bio"?: string
  "birth"?: Date | undefined
  "death"?: Date | undefined
  "id"?: number
}
export type standard = {
  "title": string
  "alternative_title"?: string
  "Composers"?: Array<composer>
  "composer_placeholder"?: string
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

export const editorAttrs: [keyof Tune, string][] = [
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
export const composerEditorAttrs: [keyof Composer, string][] = [
  ["dbId", "Database Connection"],
  ["name", "Name"],
  ["birth", "Birthday"],
  ["death", "Day of Death"],
  ["bio", "Biography"]
];
export const compareTuneEditorAttrs: [keyof tune_draft, string][] = [
  ["title", "Title"],
  ["alternativeTitle", "Alternative Title"],
  ["bio", "Bio"],
  ["form", "Form"],
  ["composers", "Composers"],
];
export const miniEditorAttrs = new Map<keyof Tune, string>([
  ["title", "Title"],
  ["melodyConfidence", "Melody Confidence"],
  ["formConfidence", "Form Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
  ["playlists", "Playlists"],
  //["justPlayed", "'I Just Played This'"]
])
export const composerDefaults = new Map<keyof composer, any>([
  ["name", ""],
  //These need to be undefined so that new composers aren't labeled
  //as being born on a totally reasonable day of 1900-1-1
  ["birth", undefined],
  ["death", undefined],
  ["bio", ""],
  ["dbId", 0]
])
export const tuneDefaults = new Map<keyof Tune, any>([
  ["title", "New song"],
  ["alternativeTitle", ""],
  ["composers", []],
  ["playlists", []],
  ["form", ""],
  //  ["notableRecordings", []],
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

export const standardDefaults = new Map<keyof standard, any>([
  ["title", "New song"],
  ["alternative_title", ""],
  ["Composers", []],
  ["composer_placeholder", ""],
  ["form", ""],
  ["bio", ""],
  ["year", 0],
  ["id", 0],
]);
export const standardComposerDefaults = new Map<string, any>([
  ["name", ""],
  //These need to be undefined so that new composers aren't labeled
  //as being born on a totally reasonable day of 1900-1-1
  ["birth", undefined],
  ["death", undefined],
  ["bio", ""],
  ["id", 0]
])
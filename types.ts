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
  "tempi"?: number[]
//  "contrafacts"?: string[] // In the future, these could link to other tunes
  "playthroughs"?: number
  "confidence"?: number
  "formConfidence"?: number
  "melodyConfidence"?: number
  "soloConfidence"?: number
  "lyricsConfidence"?: number
  "hasLyrics"?: boolean
  "id"?: BSON.ObjectId
  "dbId"?: number
  "dbDraftId"?: number
  "bio"?: string
  "year"?: number
  playedAt?: Date
  //  "playedAt"?: string[]
}
type submitted_draft = {
  "pending_review"?: boolean
  "accepted"?: boolean
}
type submitted_tune_draft_composer_extension = {
  "Composers"?: Array<standard_composer>
}
export type submitted_tune_draft = tune_draft & submitted_draft & submitted_tune_draft_composer_extension;
export type submitted_composer_draft = composer & submitted_draft;
export type tune_draft_extras = {
  "playlists"?: undefined
}
export type composer = {
  "name"?: string// All enum members in 'E1' and 'E2' are constant.
  "bio"?: string
  "birth"?: Date | undefined
  "death"?: Date | undefined
  "dbId"?: number
  "dbDraftId"?: number
}
export type standard_composer = {
  "name": string
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
  "Composers"?: Array<standard_composer>
  "composer_placeholder"?: string
  "form"?: string
  "bio"?: string
  "year"?: string
  "id": number
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
  Complete,
  Waiting,
  Failed
}

export const editorAttrs: [keyof (tune_draft & tune_draft_extras), string][] = [
  ["dbId", "Database Connection"],
  ["dbDraftId", "Submitted Draft"],
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
//["playlists", "Playlists"],
  ["playthroughs", "Playthroughs"],
  ["hasLyrics", "Has lyrics?"],
//Below fields were removed because there's no reason to have these in two places.
//["confidence", "Confidence"],
//["formConfidence", "Form Confidence"],
//["melodyConfidence", "Melody Confidence"],
//["soloConfidence", "Solo Confidence"],
//["lyricsConfidence", "Lyrics Confidence"],
//["playedAt", "Last played"]
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
export const miniEditorAttrs = new Map<keyof (tune_draft & tune_draft_extras), string>([
//["melodyConfidence", "Melody Confidence"],
//["formConfidence", "Form Confidence"],
//["soloConfidence", "Solo Confidence"],
//["lyricsConfidence", "Lyrics Confidence"],
  ["playlists", "Playlists"],
  ["playedAt", "Last played"]
])
export const confidenceAttrs = new Map<keyof (tune_draft & tune_draft_extras), string>([
  ["melodyConfidence", "Melody Confidence"],
  ["formConfidence", "Form Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"]
]);
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
  ["confidence", 0],
  ["melodyConfidence", 0],
  ["formConfidence", 0],
  ["soloConfidence", 0],
  ["lyricsConfidence", 0],
  ["playedAt", undefined],
  ["dbId", 0],
  ["dbDraftId", 0]
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

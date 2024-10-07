import Composer from "./model/Composer"

//Copyright 2024 Jonathan Hilliard
export type tune_draft = {
  "title"?: string
  "alternativeTitle"?: string
  "composers"?: Composer[]
  "form"?: string
  "notableRecordings"?: string[]
  "mainKey"?: string
  "keys"?: string[]
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
  "id"?: string
  "dbId"?: number
  "bio"?: string
  "year"?: number
  //  "playedAt"?: string[]
}
export type composer = {
  "name"?: string
  "bio"?: string
  "birth"?: Date
  "death"?: Date
  "id": string
  "dbId"?: string
}
export type standard = {
  "title": string
  "alternative_title": string
  "Composers": Array<composer>
  "form": string
  "bio": string
  "year": string
  "id": number
  //  "Composers": composer[]
}
export type playlist = {
  "title": string
  "description"?: string
  "id": string
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
  ["keys", "Keys"],
  ["styles", "Styles"],
  ["tempi", "Tempi"],
  //  ["contrafacts", "Contrafacts"],
  ["playlists", "Playlists"],
  ["playthroughs", "Playthroughs"],
  ["hasLyrics", "Has lyrics?"],
  ["formConfidence", "Form Confidence"],
  ["melodyConfidence", "Melody Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
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
  ["formConfidence", "Form Confidence"],
  ["melodyConfidence", "Melody Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
  ["playlists", "Playlists"]
  //  ["justPlayed", "'I Just Played This'"],
])
export const composerDefaults = new Map<string, any>([
  ["name", ""],
  ["birth", ""],
  ["death", ""],
  ["bio", ""],
  ["dbId", 0]
])
export const tuneDefaults = new Map<string, any>([
  ["title", "New song"],
  ["alternativeTitle", ""],
  ["composers", []],
  ["form", ""],
  ["notableRecordings", []],
  ["mainKey", ""],
  ["mainTempo", 0],
  ["keys", []],
  ["styles", []],
  ["tempi", []],
  //  ["contrafacts", [],],
  ["hasLyrics", false],
  ["playthroughs", 0],
  ["formConfidence", 0],
  ["melodyConfidence", 0],
  ["soloConfidence", 0],
  ["lyricsConfidence", 0],
  //  ["played_at", []],
  ["dbId", 0]
  //  ["id", "THIS SHOULD NOT BE HERE"] // If the user sees this text at any point, there's an error in the progra],
])

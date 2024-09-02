//Copyright 2024 Jonathan Hilliard
export type tune_draft = {
  "title"?: string
  "alternativeTitle"?: string
  "composers"?: string[]
  "composer_placeholder"?: string
  "form"?: string
  "notableRecordings"?: string[]
  "keys"?: string[]
  "styles"?: string[]
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
  "playedAt"?: string[]
}
export type composer = {
  "name": string
  "bio": string
  "birth": string
  "death": string
}
export type standard = {
  "title": string
  "alternative_title": string
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

export const editorAttrs = [
  ["db_id", "Database Connection"],
  ["title", "Title"],
  ["alternative_title", "Alternative Title"],
  ["composers", "Composers"],
  ["composer_placeholder", "Composers (Placeholder)"],
  ["form", "Form"],
  //  ["notable_recordings", "Notable Recordings"],
  ["keys", "Keys"],
  ["styles", "Styles"],
  ["tempi", "Tempi"],
  //  ["contrafacts", "Contrafacts"],
  ["playlists", "Playlists"],
  ["playthroughs", "Playthroughs"],
  ["has_lyrics", "Has lyrics?"],
  ["form_confidence", "Form Confidence"],
  ["melody_confidence", "Melody Confidence"],
  ["solo_confidence", "Solo Confidence"],
  ["lyrics_confidence", "Lyrics Confidence"],
];
export const miniEditorAttrs = new Map<string, string>([
  ["title", "Title"],
  ["form_confidence", "Form Confidence"],
  ["melody_confidence", "Melody Confidence"],
  ["solo_confidence", "Solo Confidence"],
  ["lyrics_confidence", "Lyrics Confidence"],
  ["just_played", "'I Just Played This'"],
])
export const tuneDefaults = new Map<string, any>([
  ["title", "New song"],
  ["alternative_title", ""],
  ["composers", []],
  ["form", ""],
  ["notable_recordings", []],
  ["keys", []],
  ["styles", []],
  ["tempi", []],
  //  ["contrafacts", [],],
  ["has_lyrics", false],
  ["playthroughs", 0],
  ["form_confidence", 0],
  ["melody_confidence", 0],
  ["solo_confidence", 0],
  ["lyrics_confidence", 0],
  ["played_at", [],],
  ["id", "THIS SHOULD NOT BE HERE"] // If the user sees this text at any point, there's an error in the progra],
])

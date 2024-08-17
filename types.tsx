export type tune = {
  "title"?: string
  "alternative_title"?: string
  "composers"?: string[]
  "form"?: string
  "notable_recordings"?: string[]
  "keys"?: string[]
  "styles"?: string[]
  "tempi"?: string[]
  "contrafacts"?: string[] // In the future, these could link to other tunes
  "playthroughs"?: number
  "form_confidence"?: number
  "melody_confidence"?: number
  "solo_confidence"?: number
  "lyrics_confidence"?: number
  "has_lyrics"?: boolean
  "id"?: string
  "db_id"?: number
  "played_at"?: string[]
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
  "Composers": composer[]
}
export type playlist = {
  "title": string
  "description"?: string
  "id": string
  "tunes": string[]
}

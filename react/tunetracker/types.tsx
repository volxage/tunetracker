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
  "id"?: string
  "played_at"?: string[]
}
export type standard = {
  "Rank": string
  "Title": string
  "Year": string
  "Composer(s)": string
  "Lyricist(s)": string
}
export type playlist = {
  "title"?: string
  "description"?: string
  "id": string
  "tunes": string[]
}

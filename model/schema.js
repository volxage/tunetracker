// Copyright 2024 Jonathan Hilliard
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  // Incrrement version number after schema upgrade
  version: 1,
  // TODO: Add foreign keys, figure out json object
  tables: [
    tableSchema({
      name: 'tunes',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'alternative_title', type: 'string', isOptional: true},
//        {composers, type: "string"},
        {name: 'form', type: "string", isOptional: true},
        {name: 'year', type: "number", isOptional: true},
        //      {notable_recordings, type: "string" },[]
        {name: 'has_lyricts', type: "boolean", isOptional: true},
        //      "lyricists"?: string[]
        {name: 'keys', type: "string", isOptional: true},
        //      "styles"?: string[]
        {name: 'tempi', type: "string", isOptional: true},
        {name: 'contrafact_id', type: "string", isOptional: true, isIndexed: true},
        {name: 'playthroughs', type: "number" },
        {name: 'form_confidence', type: "number" },
        {name: 'melody_confidence', type: "number" },
        {name: 'solo_confidence', type: "number" },
        {name: 'lyrics_confidence', type: "number", isOptional: true},
        //      {played_at, type: "string" },[]
      ]
    }),
    tableSchema({
      name: 'composers',
      columns: [
        {name: 'name', type: 'string'},
        {name: 'birth', type: 'number', isOptional: true},
        {name: 'death', type: 'number', isOptional: true},
        {name: 'bio', type: 'string', isOptional: true},
      ]
    }),
  ]
})

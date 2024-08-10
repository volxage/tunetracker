import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  // Incrrement version number after schema upgrade
  version: 1,
  // TODO: Add foreign keys, figure out json object
  tables: [
    tableSchema({
      name: 'tunes',
      columns: [
        {title, type: 'string'},
        {alternative_title, type: 'string', isOptional: true},
//        {composers, type: "string"},
        {form, type: "string", isOptional: true},
        {year, type: "number", isOptional: true},
        //      {notable_recordings, type: "string" },[]
        {has_lyricts, type: "boolean", isOptional: true},
        //      "lyricists"?: string[]
        {keys, type: "string", isOptional: true},
        //      "styles"?: string[]
        {tempi, type: "string", isOptional: true},
        {contrafact_id, type: "string", isOptional: true, isIndexed: true},
        {playthroughs, type: "number" },
        {form_confidence, type: "number" },
        {melody_confidence, type: "number" },
        {solo_confidence, type: "number" },
        {lyrics_confidence, type: "number", isOptional},
        //      {played_at, type: "string" },[]
      ]
    }),
    tableSchema({
      name: 'composers',
      columns: [
        {name, type: 'string'},
        {birth, type: 'number', isOptional: true},
        {death, type: 'number', isOptional: true},
        {bio, type: 'string', isOptional: true},
      ]
    }),
  ]
})

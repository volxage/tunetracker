// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useContext, useEffect, useState} from 'react';
import {
  FlatList,
  Switch,
  View,
  TouchableHighlight,
} from 'react-native';

import {
  Text,
  SubText,
  TextInput,
  Button,
  ButtonText,
  ConfidenceBarView,
  DeleteButton
} from '../Style.tsx'
import itemSort from '../itemSort.tsx'
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import OnlineDB from '../OnlineDB.tsx';

import Fuse from 'fuse.js';
const fuseOptions = { // For finetuning the search algorithm
	// isCaseSensitive: false,
	// includeScore: false,
	// shouldSort: true,
	// includeMatches: false,
	// findAllMatches: false,
	// minMatchCharLength: 1,
	// location: 0,
	// threshold: 0.6,
	// distance: 100,
	// useExtendedSearch: false,
	// ignoreLocation: false,
	// ignoreFieldNorm: false,
	// fieldNormWeight: 1,
	keys: [
		"title",
    { name: "composerName", getFn: (tn: Tune) => tn.composers?.map(cmp => cmp.name).join(", ")}
	]
};

enum playlist_enum {
  AllTunes = "AllTunes"
}

import { Status, tune_draft } from '../types.ts';
import Tune from '../model/Tune.ts';
import Composer from '../model/Composer.ts';
import {useQuery, useRealm} from '@realm/react';
import {BSON, List, OrderedCollection, Results} from 'realm';
import Playlist from '../model/Playlist.ts';
import dateDisplay from '../textconverters/dateDisplay.tsx';
const selectionAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternativeTitle", "Alternative Title"],
  ["composers", "Composer(s)"],
  ["form", "Form"],
//  ["notableRecordings", "Notable recordings"],
  ["mainKey", "Main Key"],
  //  ["keyCenters", "Key(s)"],
  ["mainStyle", "Main Style"],
  ["mainTempo", "Main Tempo"],
//  ["contrafacts", "Contrafacts"],
  ["melodyConfidence", "Melody Confidence"],
  ["formConfidence", "Form Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
  ["playthroughs", "Playthrough Count"],
  ["playedAt", "Last Played"],
]);

function prettyPrint(object: unknown): string{
  if (typeof object == "string") return object as string;
  if (typeof object == "number") return JSON.stringify(object);
  if (object instanceof Composer) return object.name;
  if (Array.isArray(object) || object instanceof OrderedCollection) return object.map(obj => {return prettyPrint(obj)}).join(", ");
  if (object instanceof Date){
    if(dateDisplay(object) === dateDisplay(new Date())) return dateDisplay(object) + " (TODAY)"
    return dateDisplay(object);
  }
  return "(Empty)";
}

function ConfidenceBar({
  tune,
  confidenceType,
  color
}: {
  tune: Tune
  confidenceType: keyof Tune
  color: string
}){
  //TODO: Add confidence type to remove "as number"
  let confidence = tune[confidenceType] as number;
  return(
    <ConfidenceBarView>
      <View 
        style={{width: `${confidence}%`, backgroundColor: color, height:10, margin:4}}
      />
    </ConfidenceBarView>
  );
}

function ConfidenceBars({
  tune
}: {
  tune: Tune
}){
  return(
    <View style={{flexDirection: "column", padding: 4}}>
      <ConfidenceBar tune={tune} confidenceType='melodyConfidence' color='purple'/>
      <ConfidenceBar tune={tune} confidenceType='formConfidence' color='blue'/>
      <ConfidenceBar tune={tune} confidenceType='soloConfidence' color='darkcyan'/>
      {
        tune.hasLyrics &&
        <ConfidenceBar tune={tune} confidenceType='lyricsConfidence' color='darkgreen'/>
      }
    </View>
  );
}

function ItemRender({
  tune,
  setSelectedTune,
  navigation,
  selectedAttr,
  confidenceVisible,
  separators,
  selectMode,
  selectTune,
  selected
}: {
  tune: Tune,
  setSelectedTune: Function,
  navigation: any,
  selectedAttr: keyof Tune,
  confidenceVisible: boolean,
  separators: any,
  selectMode: boolean,
  selectTune: Function,
  selected: BSON.ObjectId[]
}){
  const composers = useQuery(Composer)
  const isSelected = selected.some(id => tune.id.equals(id))
  return(
  <TouchableHighlight
    key={tune.title}
    onPress={() => {
      setSelectedTune(tune);
      if(selectMode){
        selectTune(tune)
      }else{
        setSelectedTune(tune);
      }
      if(!selectMode){
        navigation.navigate("MiniEditor");
      }
    }}
    onLongPress={() => {
      setSelectedTune(tune);
      navigation.navigate("Editor");
    }}
    onShowUnderlay={separators.highlight}
    onHideUnderlay={separators.unhighlight}>
    {
      <View style={{backgroundColor: isSelected ? "#404040" : "black", padding: 8}}>
        <Text>{tune.title}</Text>
        <SubText>{selectedAttr != "title"
          ? prettyPrint(tune[selectedAttr])
          : prettyPrint(tune["composers"])}</SubText>
      {
        //CONFIDENCE
        confidenceVisible && 
        <View>
          <ConfidenceBars tune={tune} />
        </View>
    }
    </View>
  }
</TouchableHighlight>
  )
}
type HeaderInputStates = {
  listReversed: boolean
  setListReversed: Function
  confidenceVisible: boolean
  setConfidenceVisible: Function
  setSearch: Function
  setSelectedAttr: Function
  setSelectedTune: Function
  setSelectedPlaylist: Function
  allowNewTune?: boolean
}

function TuneListHeader({
  headerInputStates,
  navigation,
  setNewTune,
  selectedAttr,
  selectedPlaylist,
}: {
  headerInputStates: HeaderInputStates
  navigation: any,
  setNewTune: Function,
  selectedAttr: String,
  selectedPlaylist: Playlist | playlist_enum,
}){
  const dbStatus = useContext(OnlineDB.DbStateContext).status;
  const selectedAttrItems = Array.from(selectionAttrs.entries()).map(
    (entry) => {return {label: entry[1], value: entry[0]}}
  );

  const allPlaylists = useQuery(Playlist)
  const selectedPlaylistItems: {label: string, value: BSON.ObjectId | playlist_enum}[] = (allPlaylists.map(
    (playlist) => {return {label: playlist.title, value: playlist.id}}
  ));
  selectedPlaylistItems.push({label: "No playlist", value: playlist_enum.AllTunes});
  const statusColorMap = new Map([
    [Status.Waiting, "goldenrod"],
    [Status.Complete, "cadetblue"],
    [Status.Failed, "darkred"]
  ]);

  return(
    <View style={{backgroundColor: "#222"}}>
    <View style={{flexDirection: 'row', borderBottomWidth:1}}>
      <View style={{flex:1}}>
        <TextInput
          placeholder={"Search"}
          placeholderTextColor={"white"}
          onChangeText={(text) => {headerInputStates.setSearch(text)}}
        />
      </View>
    {
      <View style={{flex:1}}>
        <Picker
          selectedValue={selectedPlaylist}
          onValueChange={(value) => headerInputStates.setSelectedPlaylist(value)}
        >
          {
            allPlaylists.map(playlist => 
              <Picker.Item label={playlist.title} value={playlist.title} key={playlist.id.toString()}
                style={{color: "white", backgroundColor: "#222", fontSize: 20, fontWeight: 200}}
              />
            )
          }
          <Picker.Item label="No playlist" value={playlist_enum.AllTunes}
            style={{color: "white", backgroundColor: "#222", fontSize: 20, fontWeight: 200}}
          />
        </Picker>
      </View>
    }
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth:1}}>
      <View style={{flex: 5}}>
        <Picker
          selectedValue={selectedAttr}
          onValueChange={(value) => headerInputStates.setSelectedAttr(value)}
          numberOfLines={2}
        >
        {
          selectedAttrItems.map(val => 
          <Picker.Item label={val.label} value={val.value} key={val.value}
            style={{color: "white", backgroundColor: "#222222", fontSize: 16, fontWeight: 200, flexWrap: "wrap"}}
          />
          )
        }
        </Picker>
      </View>
      <Button
        style={{
          flex:1,
            backgroundColor: "purple"
        }}
        onPress={() => {
          headerInputStates.setSelectedAttr("melodyConfidence");
        }}>
          <ButtonText>
            <Icon name="music" size={30} />
          </ButtonText>
      </Button>
      <Button
        style={{
          flex:1,
            backgroundColor: "darkblue"
        }}
        onPress={() => {
          headerInputStates.setSelectedAttr("formConfidence");
        }}>
          <ButtonText>
              <Icon name="file-music-outline" size={30}/>
          </ButtonText>
      </Button>
      <Button
        style={{
          flex:1,
            backgroundColor: "darkcyan"
        }}
        onPress={() => {
          headerInputStates.setSelectedAttr("soloConfidence");
        }}>
        <ButtonText><Icon name="alpha-s-circle-outline" size={30} /></ButtonText>
      </Button>
      <Button
        style={{
          flex:1,
            backgroundColor: "darkgreen"
        }}
        onPress={() => {
          headerInputStates.setSelectedAttr("lyricsConfidence");
        }}>
        <ButtonText><Icon name="script-text" size={30} /></ButtonText>
      </Button>
    </View>
    <View style={{flexDirection: "row", flex: 3}}>
      <Button
        style={{
          flex:1,
            backgroundColor: !headerInputStates.confidenceVisible
            ? "darkgreen"
            : "darkred",
        }}
        onPress={() => {
          headerInputStates.setConfidenceVisible(!headerInputStates.confidenceVisible)
        }}>
        <ButtonText><Icon name="segment" size={30} /></ButtonText>
      </Button>
      <Button
        style={{
          flex:1,
            backgroundColor: !headerInputStates.listReversed
            ? "darkgreen"
            : "darkred",
        }}
        onPress={() => {
          headerInputStates.setListReversed(!headerInputStates.listReversed)
        }}>
        <ButtonText><Icon name="menu-swap" size={30} /></ButtonText>
      </Button>
      {
        headerInputStates.allowNewTune &&
        <View style={{flexDirection: "row", flex: 3}}>
          <Button style={{flex:1}} onPress={() => {
            const tn: tune_draft = {};
            headerInputStates.setSelectedTune(tn);
            //TODO: Figure out why this needs to be false in order for TLD to have newTune be true!
            setNewTune(true);

            navigation.navigate("Editor");
          }}>
            <ButtonText><Icon name="plus" size={30}/></ButtonText>
          </Button>
          <Button style={{
            flex:1,
              backgroundColor: statusColorMap.get(dbStatus)
          }}
          onPress={() => navigation.navigate("Importer")}>
          <ButtonText><Icon name="database-arrow-down" size={30}/></ButtonText>
        </Button>
        <Button style={{
          flex:1
        }}
        onPress={() => navigation.navigate("ExtrasMenu")}>
        <ButtonText><Icon name="dots-horizontal" size={30}/></ButtonText>
      </Button>
    </View>
    }
    </View>
  </View>
);
}
export default function TuneListDisplay({
  navigation,
  setSelectedTune,
  setNewTune,
  allowNewTune,
  selectMode,
  selectedTunes,
  setSelectedTunes
}: {
  navigation: any,
  setSelectedTune: Function,
  setNewTune: Function,
  allowNewTune: boolean,
  selectMode: boolean,
  selectedTunes: Tune[],
  setSelectedTunes: Function
}){
  useEffect(() => {
  })
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState("title" as keyof tune_draft);
  const [selectedPlaylist, setSelectedPlaylist]: [BSON.ObjectId | playlist_enum.AllTunes, Function] = useState(playlist_enum.AllTunes);
  const [search, setSearch] = useState("");
  const [confidenceVisible, setConfidenceVisible] = useState(false);
  const allPlaylists = useQuery(Playlist)
  let selectedIds: BSON.ObjectId[] = []

  useEffect(() => {
  })
  const allSongs = useQuery(Tune);
  let displaySongs: List<Tune> | Results<Tune> | Tune[] = allSongs;
  if(selectedPlaylist !== playlist_enum.AllTunes){
    //In case the selected playlist was deleted
    const pl = allPlaylists.filtered("title == $0", selectedPlaylist)[0];
    if(pl){
      displaySongs = pl.tunes;
    }else{
      setSelectedPlaylist(playlist_enum.AllTunes);
    }
  }
  //Workaround for development error "access to invalidated Results"
  if(!displaySongs){
    displaySongs = [];
  }
  const fuse = new Fuse<Tune>(displaySongs, fuseOptions);
  if(selectMode){
    const selected = displaySongs.filtered("id IN $0", selectedTunes.map(s => s.id));
    const deselected = displaySongs.filtered("!(id IN $0)", selectedTunes.map(s => s.id))
    displaySongs = [...selected, ...deselected]
    selectedIds = selected.map(tn => tn.id);
  }
  if(search === ""){
    displaySongs = itemSort(displaySongs, selectedAttr, listReversed);
  }else{
    displaySongs = fuse.search(search)
      .map(function(value, index){
        return value.item;
      });
  }

  const headerInputStates = 
  {
    listReversed: listReversed,
    setListReversed: setListReversed,
    confidenceVisible: confidenceVisible,
    setConfidenceVisible: setConfidenceVisible,
    setSearch: setSearch,
    setSelectedAttr: setSelectedAttr,
    setSelectedTune: setSelectedTune,
    setSelectedPlaylist: setSelectedPlaylist,
    allowNewTune: allowNewTune
  }
  return (
    <FlatList
      data={displaySongs}
      extraData={selectedAttr}
      ListHeaderComponent={
        <TuneListHeader
          headerInputStates={headerInputStates}
          navigation={navigation}
          setNewTune={setNewTune}
          selectedAttr={selectedAttr}
          selectedPlaylist={selectedPlaylist}
        />
      }
      ListEmptyComponent={
        <View style={{backgroundColor: "black", flex: 1}}>
          <SubText>Click the blue database icon to download a tune from tunetracker.jhilla.org, or click the plus icon to make a new one!</SubText>
        </View>
      }
      renderItem={({item, index, separators}) => (
        <ItemRender 
          tune={item}
          setSelectedTune={setSelectedTune}
          navigation={navigation}
          selectedAttr={selectedAttr}
          confidenceVisible={confidenceVisible}
          separators={separators}
          selectMode={selectMode}
          selected={selectedIds}
          selectTune={(res: Tune) => {
              if(!selectedTunes.some(val => val.id.equals(res.id))){
                setSelectedTunes(selectedTunes.concat(res))
              }else{
                setSelectedTunes(selectedTunes.filter(t => !t.id.equals(res.id)))
              }
          }}
        />
    )}
  />
  );
}

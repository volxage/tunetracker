// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
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
import RNPickerSelect from 'react-native-picker-select';
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
		"composers"
	]
};

enum playlist_enum {
  AllTunes = "AllTunes"
}

import {playlist, Status, tune_draft } from '../types.tsx';
import SongsList from '../SongsList.tsx';
import Slider from '@react-native-community/slider';
import reactotron from 'reactotron-react-native';
import Tune from '../model/Tune.ts';
import Composer from '../model/Composer.ts';
import {useQuery} from '@realm/react';
import {BSON, List, OrderedCollection, Results} from 'realm';
import Playlist from '../model/Playlist.ts';
const selectionAttrs = new Map<string, string>([
  ["title", "Title"],
  ["alternativeTitle", "Alternative Title"],
  ["composers", "Composer(s)"],
  ["form", "Form"],
//  ["notableRecordings", "Notable recordings"],
  ["keys", "Key(s)"],
  ["styles", "Styles"],
  ["tempi", "Tempi"],
//  ["contrafacts", "Contrafacts"],
  ["playthroughs", "Playthrough Count"],
  ["formConfidence", "Form Confidence"],
  ["melodyConfidence", "Melody Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
  ["playedAt", "Played At"],
]);

function prettyPrint(object: unknown): string{
  if (typeof object == "string") return object as string;
  if (typeof object == "number") return JSON.stringify(object);
  if (object instanceof Composer) return object.name;
  if (Array.isArray(object) || object instanceof OrderedCollection) return object.map(obj => {return prettyPrint(obj)}).join(", ");
  return "(Empty)";
}

function ConfidenceBar({
  tune,
  confidenceType,
  color
}: {
  tune: Tune
  confidenceType: string
  color: string
}){
  let confidence = tune[confidenceType as keyof Tune] as number;
  // TODO: Replace below with dynamically sized View object instead of slider to save on rendering speed
  return(
    <ConfidenceBarView>
      <Slider
        value={confidence}
        lowerLimit={confidence}
        upperLimit={confidence}
        minimumValue={0}
        maximumValue={100}
        minimumTrackTintColor={color}
        thumbTintColor='#00000000'
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
    <View>
      <ConfidenceBar tune={tune} confidenceType='formConfidence' color='purple'/>
      <ConfidenceBar tune={tune} confidenceType='melodyConfidence' color='blue'/>
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
  bench,
  separators,
  selectMode
}: {
  tune: Tune,
  setSelectedTune: Function,
  navigation: any,
  selectedAttr: string,
  confidenceVisible: boolean,
  bench: any,
  separators: any,
  selectMode: boolean
}){
  const composers = useQuery(Composer)
  return(
  <TouchableHighlight
    key={tune.title}
    onPress={() => {
      setSelectedTune(tune);
      if(!selectMode){
        navigation.navigate("MiniEditor");
      }
    }}
    onLongPress={() => {
      setSelectedTune(tune);
      if(!selectMode){
        navigation.navigate("Editor");
      }
    }}
    onShowUnderlay={separators.highlight}
    onHideUnderlay={separators.unhighlight}>
    {
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Text>{tune.title}</Text>
        <SubText>{selectedAttr != "title"
          ? prettyPrint(tune[selectedAttr as keyof Tune])
          : prettyPrint(tune["composers"])}</SubText>
      {
        //CONFIDENCE
        confidenceVisible && 
        <View>
          <ConfidenceBars tune={tune} />
        </View>
    }
      {typeof bench.step("Item render") === "undefined"}
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
  dbStatus
}: {
  headerInputStates: HeaderInputStates
  navigation: any,
  setNewTune: Function,
  selectedAttr: String,
  selectedPlaylist: Playlist | playlist_enum,
  dbStatus: Status
}){
  const selectedAttrItems = Array.from(selectionAttrs.entries()).map(
    (entry) => {return {label: entry[1], value: entry[0]}}
  );

  const allPlaylists = useQuery(Playlist)
  const selectedPlaylistItems: {label: string, value: BSON.ObjectId | playlist_enum}[] = (allPlaylists.map(
    (playlist) => {return {label: playlist.title, value: playlist.id}}
  ));
  const statusColorMap = new Map([
    [Status.Waiting, "goldenrod"],
    [Status.Complete, "cadetblue"],
    [Status.Failed, "darkred"]
  ])

  return(
  <View>
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
        <RNPickerSelect
          value={selectedPlaylist}
          onValueChange={(value) => headerInputStates.setSelectedPlaylist(value)}
          items={selectedPlaylistItems}
          useNativeAndroidPickerStyle={false}
          placeholder={{label: "No playlist", value: playlist_enum.AllTunes}}
          style={{inputAndroid:
            {
            backgroundColor: 'transparent', color: 'white', fontSize: 20, fontWeight: "300",
            }
          }}
        />
      </View>
    }
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth:1}}>
      <View style={{flex: 4}}>
        <RNPickerSelect
          value={selectedAttr}
          onValueChange={(value) => headerInputStates.setSelectedAttr(value)}
          items={selectedAttrItems as Array<{label:string, value:string}>}
          useNativeAndroidPickerStyle={false}
          placeholder={{label: "Sort by...", value: "title"}}
          style={{inputAndroid:
            {backgroundColor: 'transparent', color: 'white', fontSize: 20, fontWeight: "300"}
          }}
        />
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
        headerInputStates.allowNewTune ?
        <View style={{flexDirection: "row", flex: 3}}>
          <Button style={{flex:1}} onPress={() => {
            const tn: tune_draft = {};
            headerInputStates.setSelectedTune(tn);
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
    </View>:
    <DeleteButton style={{flex: 3}}>
      <ButtonText>Go back</ButtonText>
    </DeleteButton>
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
  selectMode
}: {
  navigation: any,
  setSelectedTune: Function,
  setNewTune: Function,
  allowNewTune: boolean,
  selectMode: boolean
}){
  useEffect(() => {
    bench.stop("Full render");
  })
  const bench = reactotron.benchmark("TuneListDisplay benchmark");
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState("title");
  const [selectedPlaylist, setSelectedPlaylist]: [BSON.ObjectId | playlist_enum.AllTunes, Function] = useState(playlist_enum.AllTunes);
  const [search, setSearch] = useState("");
  const [confidenceVisible, setConfidenceVisible] = useState(false);
  const [dbStatus, setDbStatus] = useState(Status.Waiting);
  const [selectedTunes, setSelectedTunes]: [Tune[], Function] = useState([]);
  const allPlaylists = useQuery(Playlist)

  useEffect(() => {
    bench.stop("Full render");
    OnlineDB.addListener(setDbStatus);
  })
  const allSongs = useQuery(Tune);
  let displaySongs = allSongs
  if(selectedPlaylist !== playlist_enum.AllTunes){
    displaySongs = allPlaylists.filtered("id == $0", selectedPlaylist)[0].tunes
  }
  if(selectMode){
    const selected = allSongs.filtered("id IN $0", selectedTunes);
  }
  const fuse = new Fuse(displaySongs, fuseOptions);
  if(search === ""){
    //itemSort(displaySongs, selectedAttr, listReversed);
  }else{
    displaySongs = fuse.search(search)
      .map(function(value, index){
        return value.item as Tune;
      });
  }
  bench.step("Pre-render")

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
          dbStatus={dbStatus}
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
          setSelectedTune={selectMode ? ((res: Tune) => {
              if(!selectedTunes.some(val => val.id.equals(res.id))){
console.log("Added tune");
                setSelectedTunes(selectedTunes.concat(res))
              }
          }) : setSelectedTune}
          navigation={navigation}
          selectedAttr={selectedAttr}
          confidenceVisible={confidenceVisible}
          bench={bench}
          separators={separators}
          selectMode={selectMode}
        />
    )}
  />
  );
}

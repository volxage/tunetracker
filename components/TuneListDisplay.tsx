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
  ConfidenceBarView
} from '../Style.tsx'
import itemSort from '../itemSort.tsx'
import Playlists from '../Playlists.tsx'
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

import {playlist, Status, tune_draft } from '../types.tsx';
import SongsList from '../SongsList.tsx';
import Slider from '@react-native-community/slider';
import reactotron from 'reactotron-react-native';
import Tune from '../model/Tune.ts';
import Composer from '../model/Composer.ts';
import {useQuery} from '@realm/react';
import {OrderedCollection} from 'realm';
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

function ItemRender({
  tune,
  setSelectedTune,
  navigation,
  selectedAttr,
  confidenceVisible,
  bench,
  separators,
}: {
  tune: Tune,
  setSelectedTune: Function,
  navigation: any,
  selectedAttr: string,
  confidenceVisible: boolean,
  bench: any,
  separators: any,
}){
  const composers = useQuery(Composer)
  return(
  <TouchableHighlight
    key={tune.title}
    onPress={() => {setSelectedTune(tune); navigation.navigate("MiniEditor");}}
    onLongPress={() => {setSelectedTune(tune); navigation.navigate("Editor");}}
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
          <ConfidenceBarView>
            <Slider
              value={tune.melodyConfidence}
              lowerLimit={tune.melodyConfidence}
              upperLimit={tune.melodyConfidence}
              minimumValue={0}
              maximumValue={100}
              minimumTrackTintColor='purple'
              thumbTintColor='#00000000'
            />
          </ConfidenceBarView>
          <ConfidenceBarView>
            <Slider
              value={tune.formConfidence}
              lowerLimit={tune.formConfidence}
              upperLimit={tune.formConfidence}
              minimumValue={0}
              maximumValue={100}
              minimumTrackTintColor='darkblue'
              thumbTintColor='#00000000'
            />
          </ConfidenceBarView>
          <ConfidenceBarView>
            <Slider
              value={tune.soloConfidence}
              lowerLimit={tune.soloConfidence}
              upperLimit={tune.soloConfidence}
              minimumValue={0}
              maximumValue={100}
              minimumTrackTintColor='darkcyan'
              thumbTintColor='#00000000'
            />
          </ConfidenceBarView>
        { tune.hasLyricts &&
        <ConfidenceBarView>
          <Slider
            value={tune.lyricsConfidence}
            lowerLimit={tune.lyricsConfidence}
            upperLimit={tune.lyricsConfidence}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor='green'
            thumbTintColor='#00000000'
          />
        </ConfidenceBarView>
        }
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
}

function TuneListHeader({
  headerInputStates,
  navigation,
  setNewTune,
  selectedAttr,
  dbStatus
}: {
  headerInputStates: HeaderInputStates
  navigation: any,
  setNewTune: Function,
  selectedAttr: String,
  dbStatus: Status
}){
  const selectedAttrItems = Array.from(selectionAttrs.entries()).map(
    (entry) => {return {label: entry[1], value: entry[0]}}
  );

//const selectedPlaylistItems = Array.from(playlists.getPlaylists().map(
//  (playlist) => {return {label: playlist.title, value: playlist.id}}
//));
//selectedPlaylistItems.unshift(
//  {
//    label: "All Songs",
//    value: " "
//  }
//)
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
      <View style={{flex:1}}>
        <RNPickerSelect
          onValueChange={(value) => headerInputStates.setSelectedPlaylist(value)}
          items={[]}
          useNativeAndroidPickerStyle={false}
          placeholder={{label: "Select a playlist", value: ""}}
          style={{inputAndroid:
            {
            backgroundColor: 'transparent', color: 'white', fontSize: 20, fontWeight: "300",
            }
          }}
        />
      </View>
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
    <View style={{flexDirection: "row"}}>
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
    </View>
  </View>
);
}
export default function TuneListDisplay({
  navigation,
  setSelectedTune,
  setNewTune
}: {
  navigation: any,
  setSelectedTune: Function,
  setNewTune: Function
}){
  useEffect(() => {
    bench.stop("Full render");
  })
  const bench = reactotron.benchmark("TuneListDisplay benchmark");
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState("title");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [search, setSearch] = useState("");
  const [confidenceVisible, setConfidenceVisible] = useState(false);
  const [dbStatus, setDbStatus] = useState(Status.Waiting);

  useEffect(() => {
    bench.stop("Full render");
    OnlineDB.addListener(setDbStatus);
  })
  let displaySongs = useQuery('Tune');
  if(selectedPlaylist !== " "){
    //const playlist = playlists.getPlaylist(selectedPlaylist)
  //if(typeof playlist !== "undefined"){
  //  displaySongs = songs.filter(
  //    tune => typeof tune.id !== "undefined" && playlist.tunes.includes(tune.id)
  //  )
  //}
  }
  const fuse = new Fuse(displaySongs, fuseOptions);
  if(search === ""){

    //itemSort(displaySongs, selectedAttr, listReversed);
  }else{
    displaySongs = fuse.search(search)
      .map(function(value, index){
        return value.item;
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
    setSelectedPlaylist: setSelectedPlaylist
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
          setSelectedTune={setSelectedTune}
          navigation={navigation}
          selectedAttr={selectedAttr}
          confidenceVisible={confidenceVisible}
          bench={bench}
          separators={separators}
        />
    )}
  />
  );
}

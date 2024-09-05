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
import tuneSort from '../tuneSort.tsx'
import Playlists from '../Playlists.tsx'
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
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
import {playlist, tune_draft } from '../types.tsx';
import Slider from '@react-native-community/slider';
import reactotron from 'reactotron-react-native';
import Tune from '../model/Tune.js';
const prettyAttrs = new Map<string, string>([
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
  if (Array.isArray(object)) return object.join(", ");
  return "(Empty)";
}

type HeaderInputStates = {
  listReversed: boolean
  setListReversed: Function
  confidenceVisible: boolean
  setConfidenceVisible: Function
  setSearch: Function
  setSelectedAttr: Function
  setSelectedTune: Function
}
function ComposerListHeader({
  headerInputStates,
  navigation,
  playlists,
  setNewTune,
  selectedAttr
}: {
  headerInputStates: HeaderInputStates
  navigation: any,
  playlists: Playlists,
  setNewTune: Function,
  selectedAttr: String
}){
  const selectedAttrItems = Array.from(prettyAttrs.entries()).map(
    (entry) => {return {label: entry[1], value: entry[0]}}
  );

  const selectedPlaylistItems = Array.from(playlists.getPlaylists().map(
    (playlist) => {return {label: playlist.title, value: playlist.id}}
  ));
  selectedPlaylistItems.unshift(
    {
      label: "All Songs",
      value: " "
    }
  )

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
          items={selectedPlaylistItems}
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
      <Button style={{flex:1}} onPress={() => navigation.navigate("Importer")}>
        <ButtonText><Icon name="database-arrow-down" size={30}/></ButtonText>
      </Button>
    </View>
  </View>
);
}
export default function ComposerListDisplay({
  composers,
  navigation,
  setSelectedTune,
  playlists,
  setNewTune
}: {
  composers: Array<Composer>,
  navigation: any,
  setSelectedTune: Function,
  playlists: Playlists,
  setNewTune: Function
}){
  useEffect(() => {bench.stop("Full render")}, [])
  const bench = reactotron.benchmark("ComposerListDisplay benchmark");
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState("title");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [search, setSearch] = useState("");
  const [confidenceVisible, setConfidenceVisible] = useState(false);

  let displayComposers = composers;
  const fuse = new Fuse(displayComposers, fuseOptions);
  if(search === ""){
    composerSort(displayComposers, selectedAttr, listReversed);
  }else{
    displayComposers = fuse.search(search)
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
  }
  return (
    <FlatList
      data={displayComposers}
      //TODO: fuse.search needs to be interpreted as an array for FlatList to understand!
      extraData={selectedAttr}
      ListHeaderComponent={
        <ComposerListHeader
          headerInputStates={headerInputStates}
          navigation={navigation}
          playlists={playlists}
          setNewTune={setNewTune}
          selectedAttr={selectedAttr}
        />
      }
      ListEmptyComponent={
        <View style={{backgroundColor: "black", flex: 1}}>
          <SubText>Click the blue database icon to download a tune from tunetracker.jhilla.org, or click the plus icon to make a new one!</SubText>
        </View>
      }
      renderItem={({item, index, separators}) => (
        <TouchableHighlight
          key={item.title}
          onPress={() => {setSelectedTune(item); navigation.navigate("MiniEditor");}}
          onLongPress={() => {setSelectedTune(item); navigation.navigate("Editor");}}
          onShowUnderlay={separators.highlight}
          onHideUnderlay={separators.unhighlight}>
          {
          <View style={{backgroundColor: 'black', padding: 8}}>
            <Text>{item.title}</Text>
            <SubText>{selectedAttr != "title"
              ? prettyPrint(item[selectedAttr as keyof Tune])
              : prettyPrint(item["composerPlaceholder" as keyof Tune])}</SubText>
            {
              //CONFIDENCE
              confidenceVisible && 
              <View>
                <ConfidenceBarView>
                  <Slider
                    value={item.melodyConfidence}
                    lowerLimit={item.melodyConfidence}
                    upperLimit={item.melodyConfidence}
                    minimumValue={0}
                    maximumValue={100}
                    minimumTrackTintColor='purple'
                    thumbTintColor='#00000000'
                  />
                </ConfidenceBarView>
                <ConfidenceBarView>
                  <Slider
                    value={item.formConfidence}
                    lowerLimit={item.formConfidence}
                    upperLimit={item.formConfidence}
                    minimumValue={0}
                    maximumValue={100}
                    minimumTrackTintColor='darkblue'
                    thumbTintColor='#00000000'
                  />
                </ConfidenceBarView>
                <ConfidenceBarView>
                  <Slider
                    value={item.soloConfidence}
                    lowerLimit={item.soloConfidence}
                    upperLimit={item.soloConfidence}
                    minimumValue={0}
                    maximumValue={100}
                    minimumTrackTintColor='darkcyan'
                    thumbTintColor='#00000000'
                  />
                </ConfidenceBarView>
              { item.hasLyrics &&
              <ConfidenceBarView>
                <Slider
                  value={item.lyricsConfidence}
                  lowerLimit={item.lyricsConfidence}
                  upperLimit={item.lyricsConfidence}
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
    )}
  />
  );
}
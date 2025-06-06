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
  ButtonText,
  RowView,
  SubBoldText,
  SMarginView,
  PanelView
} from '../Style.tsx'
import itemSort from '../itemSort.tsx'
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import OnlineDB from '../OnlineDB.tsx';
import {Button} from '../simple_components/Button.tsx';

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
import {useNavigation} from '@react-navigation/native';
import {BgView} from '../Style.tsx';
import {useTheme} from 'styled-components';
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
  ["confidence", "General Confidence"],
  ["melodyConfidence", "Melody Confidence"],
  ["formConfidence", "Form Confidence"],
  ["soloConfidence", "Solo Confidence"],
  ["lyricsConfidence", "Lyrics Confidence"],
  ["queued", "Queued"],
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
  if (typeof object == "boolean") return object ? "Yes" : "No";
  return "(Empty)";
}

function ConfidenceBar({
  tune,
  confidenceType,
  color
}: {
  tune: Tune
  confidenceType: "melodyConfidence" | "formConfidence" | "soloConfidence" | "lyricsConfidence"
  color: string
}){
  const iconMap = {
    "melodyConfidence": "music",
    "formConfidence": "file-music-outline",
    "soloConfidence": "alpha-s-circle-outline",
    "lyricsConfidence": "script-text"
  }
  //TODO: Add confidence type to remove "as number"
  let confidence = tune[confidenceType] as number;
  if(!confidence || confidence === 0){
    return;
  }
  return(
    <View style={{margin:0}}>
      <View 
        style={{width: `${confidence}%`, backgroundColor: color, height:20}}
      >
      <ButtonText>
        <Icon size={20} name={iconMap[confidenceType]}/>
      </ButtonText>
      </View>
    </View>
  );
}

function ConfidenceBars({
  tune
}: {
  tune: Tune
}){
  const theme = useTheme();
  return(
    <View style={{flexDirection: "column", padding: 4}}>
      <ConfidenceBar tune={tune} confidenceType='melodyConfidence' color={theme.melodyConf}/>
      <ConfidenceBar tune={tune} confidenceType='formConfidence' color={theme.formConf}/>
      <ConfidenceBar tune={tune} confidenceType='soloConfidence' color={theme.soloConf}/>
      {
        tune.hasLyrics &&
        <ConfidenceBar tune={tune} confidenceType='lyricsConfidence' color={theme.lyricsConf}/>
      }
    </View>
  );
}
function ExtraInfo({

}: {
}){

}

function TuneDetails({
  tune,
  edit
}: {
  tune: Tune,
  edit: () => void
}){
  const realm = useRealm();
  return(
    <SMarginView>
      <RowView>
        <SubBoldText>Alternative title: </SubBoldText>
        <SubText>{tune.alternativeTitle}</SubText>
      </RowView>
      <RowView>
        <SubBoldText>Form: </SubBoldText>
        <SubText>{tune.form}</SubText>
      </RowView>
      <RowView>
        <SubBoldText>Main key: </SubBoldText>
        <SubText>{tune.mainKey}</SubText>
      </RowView>
      <RowView>
        <SubBoldText>Main tempo: </SubBoldText>
        <SubText>{tune.mainTempo}</SubText>
      </RowView>
      <RowView>
        <SubBoldText>Last played: </SubBoldText>
        <SubText>{dateDisplay(tune.playedAt)}</SubText>
      </RowView>
      <View style={{flexDirection: "row"}}>
        <Button text='Edit' style={{flex:1}} onPress={() => {
          edit();
        }}/>
        <Button style={{flex: 1}} text={tune.queued ? "Unqueue" : "Queue"} onPress={() => {
          realm.write(() => {
          tune.queued = !tune.queued
          });
        }}/>
      </View>
    </SMarginView>
  )
}
function ItemRender({
  tune,
  setSelectedTune,
  selectedAttr,
  confidenceVisible,
  separators,
  selectMode,
  selectTune,
  selected
}: {
  tune: Tune,
  setSelectedTune: Function,
  selectedAttr: keyof Tune,
  confidenceVisible: boolean,
  separators: any,
  selectMode: boolean,
  selectTune: Function,
  selected: BSON.ObjectId[]
}){
  const composers = useQuery(Composer)
  const isSelected = selected.some(id => tune.id.equals(id))
  const navigation = useNavigation() as any;
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();
  return(
  <TouchableHighlight
    key={tune.title}
    onPress={() => {
      if(selectMode){
        selectTune(tune)
      }else{
        setIsExpanded(!isExpanded);
      }
    }}
    onLongPress={() => {
      setSelectedTune(tune);
      navigation.navigate("Editor");
    }}
    onShowUnderlay={separators.highlight}
    onHideUnderlay={separators.unhighlight}>
    {
      <BgView style={{backgroundColor: isSelected ? theme.panelBg : theme.bg, padding: 8}}>
        <Text>{tune.queued && <SubText><Icon name="bell-alert" size={20} style={{color: theme.pending}}/> </SubText>}{tune.title}</Text>
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
      {
        isExpanded && 
        //EXTRA INFO
        <TuneDetails tune={tune} edit={() => {setSelectedTune(tune); navigation.navigate("Editor")}}/>
      }
    </BgView>
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
  setNewTune,
  selectedAttr,
  selectedPlaylist,
}: {
  headerInputStates: HeaderInputStates
  setNewTune: Function,
  selectedAttr: String,
  selectedPlaylist: Playlist | playlist_enum,
}){
  const theme = useTheme();
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
  const navigation = useNavigation() as any;
  return(
    <PanelView>
      <View style={{flexDirection: 'row', borderBottomWidth:1}}>
        <View style={{flex:1}}>
        <Picker
          selectedValue={selectedPlaylist}
          onValueChange={(value) => headerInputStates.setSelectedPlaylist(value)}
          itemStyle={{color: theme.text}}
        >
          {
            allPlaylists.map(playlist => 
              <Picker.Item label={playlist.title} value={playlist.title} key={playlist.id.toString()}
                style={{color: theme.text, backgroundColor: theme.panelBg, fontSize: 20, fontWeight: 200}}
              />
            )
          }
          <Picker.Item label="No playlist" value={playlist_enum.AllTunes}
            style={{color: theme.text, backgroundColor: theme.panelBg, fontSize: 20, fontWeight: 200}}
          />
        </Picker>
        </View>
    {
      <View style={{flex:1}}>
        <Picker
          selectedValue={selectedAttr}
          onValueChange={(value) => {headerInputStates.setSelectedAttr(value)}}
          numberOfLines={2}
          itemStyle={{color: theme.text}}
        >
        {
          selectedAttrItems.map(val => 
          <Picker.Item label={val.label} value={val.value} key={val.value}
            style={{color: theme.text, backgroundColor: theme.panelBg, fontSize: 20, fontWeight: 200}}
          />
          )
        }
        </Picker>
      </View>
    }
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center', borderBottomWidth:1}}>
      <View style={{flex: 5}}>
        <TextInput
          placeholder={"Search"}
          placeholderTextColor={theme.text}
          onChangeText={(text) => {headerInputStates.setSearch(text)}}
        />
      </View>
      <Button
        style={{
          flex:1,
          borderColor: theme.melodyConf
        }}
        iconName='music'
        onPress={() => {
          headerInputStates.setSelectedAttr("melodyConfidence");
        }}/>
      <Button
        style={{
          flex:1,
          borderColor: theme.formConf
        }}
        onPress={() => {
          headerInputStates.setSelectedAttr("formConfidence");
        }}
        iconName='file-music-outline'
      />
      <Button
        style={{
          flex:1,
          borderColor: theme.soloConf
        }}
        onPress={() => {
          headerInputStates.setSelectedAttr("soloConfidence");
        }}
        iconName='alpha-s-circle-outline'
      />
      <Button
        style={{
          flex:1,
          borderColor: theme.lyricsConf
        }}
        onPress={() => {
          headerInputStates.setSelectedAttr("lyricsConfidence");
        }}
        iconName='script-text'
      />
    </View>
    <View style={{flexDirection: "row", flex: 3}}>
      <Button
        style={{
          flex:1,
            borderColor: !headerInputStates.confidenceVisible
            ? "darkgreen"
            : "darkred",
        }}
        onPress={() => {
          headerInputStates.setConfidenceVisible(!headerInputStates.confidenceVisible)
        }}
        iconName='segment'
      />
      <Button
        style={{
          flex:1,
            borderColor: !headerInputStates.listReversed
            ? "darkgreen"
            : "darkred",
        }}
        onPress={() => {
          headerInputStates.setListReversed(!headerInputStates.listReversed)
        }}
        iconName='menu-swap'
      />
      {
        headerInputStates.allowNewTune &&
        <View style={{flexDirection: "row", flex: 2}}>
          <Button style={{flex:1}} onPress={() => {
            const tn: tune_draft = {};
            headerInputStates.setSelectedTune(tn);
            setNewTune(true);

            navigation.navigate("NewTuneSelector");
          }}
          iconName='plus'
        />
        <Button 
          style={{
            flex:1
          }}
          onPress={() => navigation.navigate("ExtrasMenu")}
          iconName="dots-horizontal"
        />
    </View>
    }
    </View>
  </PanelView>
);
}
export default function TuneListDisplay({
  setSelectedTune,
  setNewTune,
  allowNewTune,
  selectMode,
  selectedTunes,
  setSelectedTunes
}: {
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
  const allPlaylists = useQuery(Playlist);
  let selectedIds: BSON.ObjectId[] = []
  //console.log("Full rerender: selected playlist: " + selectedPlaylist);

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
  if(search === ""){
    displaySongs = itemSort(displaySongs, selectedAttr, listReversed);
  }else{
    displaySongs = fuse.search(search)
      .map(function(value, index){
        return value.item;
      });
  }
  if(selectMode){
    const selected = displaySongs.filtered("id IN $0", selectedTunes.map(s => s.id));
    const deselected = displaySongs.filtered("!(id IN $0)", selectedTunes.map(s => s.id))
    displaySongs = [...selected, ...deselected]
    selectedIds = selected.map(tn => tn.id);
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
  const navigation = useNavigation();
  return (
    <FlatList
      data={displaySongs}
      extraData={selectedAttr}
      ListHeaderComponent={
        <TuneListHeader
          headerInputStates={headerInputStates}
          setNewTune={setNewTune}
          selectedAttr={selectedAttr}
          selectedPlaylist={selectedPlaylist}
        />
      }
      ListEmptyComponent={
        <BgView style={{flex: 1}}>
          <SubText>Click the blue database icon to download a tune from tunetracker.jhilla.org, or click the plus icon to make a new one!</SubText>
        </BgView>
      }
      renderItem={({item, index, separators}) => (
        <ItemRender 
          tune={item}
          setSelectedTune={setSelectedTune}
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

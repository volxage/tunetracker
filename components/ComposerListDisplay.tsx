// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useState} from 'react';
import {
  FlatList,
  Switch,
  View,
  TouchableHighlight,
  SafeAreaView,
} from 'react-native';

import {
  Text,
  SubText,
  TextInput,
  Button,
  ButtonText,
  ConfidenceBarView,
  BackgroundView
} from '../Style.tsx'
import itemSort from '../itemSort.tsx'
import Playlists from '../Playlists.tsx'
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Fuse from 'fuse.js';


const fuseOptions = { // For finetuning the search algorithm
	// isCaseSensitive: false,
	includeScore: true,
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
		"name",
//		"composers"
	]
};
import {composer, composer_draft, composerEditorAttrs, playlist, tune_draft } from '../types.tsx';
import Slider from '@react-native-community/slider';
import reactotron from 'reactotron-react-native';
import Tune from '../model/Tune.js';
import Composer from '../model/Composer.js';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ComposerEditor from './ComposerEditor.tsx';
import SongsList from '../SongsList.tsx';
import {database} from '../index.js';
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
  navigation: any
  setNewComposer: Function
}
function ComposerListHeader({
  headerInputStates,
  addComposerOptionFlag
}: {
  headerInputStates: HeaderInputStates,
  addComposerOptionFlag: boolean
}){
  const [addComposerExpanded, setAddComposerExpanded] = useState(false);
  return(
    <View>
      <View style={{flexDirection: 'row', borderBottomWidth:1, backgroundColor: "#222"}}>
        <View style={{flex:1}}>
          <TextInput
            placeholder={"Enter your composer here"}
            placeholderTextColor={"white"}
            onChangeText={(text) => {headerInputStates.setSearch(text)}}
          />
          <Button onPress={() => setAddComposerExpanded(!addComposerExpanded)}>
            {
              addComposerExpanded ?
                <ButtonText>(Collapse)</ButtonText>
                :
                <ButtonText>Can't find my composer below</ButtonText>
            }
          </Button>
          {
            addComposerExpanded &&
              <BackgroundView>
                {
                  addComposerOptionFlag ?
                    <View>
                      <SubText>This search doesn't seem to match well with any composer you've entered before, or any composer from our database. You can add a new composer by pressing the button below.</SubText>
                      <Button
                        onPress={() => {headerInputStates.setNewComposer(true); headerInputStates.navigation.navigate("ComposerEditor")}}
                      >
                        <ButtonText>Add *Brand New* composer</ButtonText>
                      </Button>
                    </View>
                    :
                    <View>
                      <SubText>You have very similar search results. Tap and hold the button below to add a brand new composer ONLY if you're sure that it's a different composer from the composers shown in the results. (For instance, you might reasonably end up adding Bill Evans twice as there have been two Bill Evans's in jazz history.)</SubText>
                      <Button>
                        <ButtonText>Add *brand new* composer</ButtonText>
                      </Button>
                    </View>
                }
              </BackgroundView>
          }
        </View>
        {
          //<View style={{flex:1}}>
          //  <RNPickerSelect
          //    onValueChange={(value) => headerInputStates.setSelectedPlaylist(value)}
          //    items={selectedPlaylistItems}
          //    useNativeAndroidPickerStyle={false}
          //    placeholder={{label: "Select a playlist", value: ""}}
          //    style={{inputAndroid:
          //      {
          //      backgroundColor: 'transparent', color: 'white', fontSize: 20, fontWeight: "300",
          //      }
          //    }}
          //  />
          //</View>
        }
      </View>
    </View>
  );
}

function LocalityIndicators({
  item
}: {
  item: Composer | composer_draft
}){
  if(item instanceof Composer){
    if(item.dbId && item.dbId !== 0){
      return(
        <View style={{flexDirection: "row"}}>
          <SubText><Icon name='database' size={24}></Icon></SubText>
          <SubText><Icon name='account' size={24}></Icon></SubText>
        </View>
      );
    }else{
      return(
        <SubText><Icon name='account' size={24}></Icon></SubText>
      );
    }
  }else{
    return(
      <SubText><Icon name='database' size={24}></Icon></SubText>
    );
  }
}

export default function ComposerListDisplay({
  composers,
  navigation,
  playlists,
  songsList
}: {
  composers: Array<Composer | composer>,
  navigation: any,
  playlists: Playlists,
  songsList: SongsList
}){
  useEffect(() => {bench.stop("Full render")}, [])
  const bench = reactotron.benchmark("ComposerListDisplay benchmark");
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState("name");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [search, setSearch] = useState("");
  const [confidenceVisible, setConfidenceVisible] = useState(false);
  const [selectedComposers, setSelectedComposers] = useState([]);
  const [newComposer, setNewComposer] = useState(false);
  let suggestAddComposer = false;

  let displayComposers = composers;
  console.log(displayComposers);
  const fuse = new Fuse(displayComposers, fuseOptions);
  database.get('composers').query().fetch().then(result => console.log(result));
  if(search === ""){
    itemSort(displayComposers, selectedAttr, listReversed);
  }else{
    const searchResults = fuse.search(search);
    //If there's no composer in the results, or the top result has a low score, add option to add a new composer
    suggestAddComposer = false;
    if(!searchResults || !searchResults[0]){
      suggestAddComposer = true;
    }
    else if(searchResults[0].score && searchResults[0].score > 0.6){
      suggestAddComposer = true;
    }
    displayComposers = searchResults.map(function(value, index){
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
    navigation: navigation,
    setNewComposer: setNewComposer
  }
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={"ComposerListDisplay"} >
        {props => 
          <SafeAreaView>
            <FlatList
              data={displayComposers}
              extraData={selectedAttr}
              ListHeaderComponent={
                <ComposerListHeader
                  headerInputStates={headerInputStates}
                  addComposerOptionFlag={suggestAddComposer}
                />
              }
              renderItem={({item, index, separators}) => (
                <TouchableHighlight
                  key={item.name}
                  onShowUnderlay={separators.highlight}
                  onHideUnderlay={separators.unhighlight}>
                  <View style={{backgroundColor: 'black', padding: 8}}>
                    <Text>{item.name}</Text>
                    <SubText>{(item.birth ? "B: " + item.birth.split("T")[0] : "B: none") + ", " + (item.death ? "D: " + item.death.split("T")[0]  : "D: none")}</SubText>
                    <LocalityIndicators item={item}/>
                    {typeof bench.step("Item render") === "undefined"}
                  </View>
                </TouchableHighlight>
              )}
            />
          </SafeAreaView>
        }
    </Stack.Screen>
      <Stack.Screen name='ComposerEditor'>
        {props =>
          <ComposerEditor
            selectedComposer={{}}
            prettyAttrs={(composerEditorAttrs as [string, string][])}
            songsList={songsList}
            playlists={playlists}
            setNewComposer={setNewComposer}
            newComposer={newComposer}
            navigation={props.navigation}
          />
        }
      </Stack.Screen>

  </Stack.Navigator>
  );
}
          //<SubText>{selectedAttr != "title"
          //  ? prettyPrint(item[selectedAttr as keyof Tune])
          //  : prettyPrint(item["composerPlaceholder" as keyof Tune])}</SubText>

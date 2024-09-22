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
  BackgroundView,
  DeleteButton
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
import {composer, composerEditorAttrs, playlist, tune_draft } from '../types.tsx';
import Slider from '@react-native-community/slider';
import reactotron from 'reactotron-react-native';
import Tune from '../model/Tune.js';
import Composer from '../model/Composer.js';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ComposerEditor from './ComposerEditor.tsx';
import SongsList from '../SongsList.tsx';
import {database} from '../index.js';

function prettyPrint(object: unknown): string{
//                    {((item.birth && item.birth !== null && item.birth.split) ? "B: " + item.birth.split("T")[0] : "B: none") + ", " + ((item.death && item.death !== null && item.death.split) ? "D: " + item.death.split("T")[0]  : "D: none")}
  if(object instanceof Date){
    // For some reason the month number for January in this system is 0...
    return `${object.getFullYear()}-${object.getMonth() + 1}-${object.getUTCDate()}`;
  }else if (!object){
    return "None";
  }else{
    return (object as string).split("T")[0];
  }
}

type HeaderInputStates = {
  setSearch: Function
  navigation: any
  setNewComposer: Function
  handleSetCurrentTune: Function
  selectedComposers: Array<composer | Composer>
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
          <View style={{flexDirection: "row"}}>
            <Button style={{flex: 1}} onPress={() => {
              const composers: Array<Composer | composer> = [];
              for(let comp of headerInputStates.selectedComposers){
                if(comp instanceof Composer){
                  composers.push(comp);
                }else{
                  database.write(async () => {database.get("composers").create(newLocalComp => {
                    (newLocalComp as Composer).replace(comp);
                  }).then(result => {
                    composers.push(result);
                  })});
                }
              }
              headerInputStates.handleSetCurrentTune("composers", composers);
              headerInputStates.navigation.navigate("EditorUnwrapped");
            }}>
              <ButtonText>Save selection</ButtonText>
            </Button>
            <DeleteButton style={{flex: 1}} onPress={() => {
              headerInputStates.navigation.navigate("EditorUnwrapped");
            }}>
              <ButtonText>Cancel changes</ButtonText>
            </DeleteButton>
          </View>
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
                      <SubText>You have very similar search results. Tap and hold the button below to add a brand new composer ONLY if you're sure that it's a different composer from the composers shown in the results.</SubText>
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
  item: Composer | composer
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
  songsList,
  handleSetCurrentTune
}: {
  composers: Array<Composer | composer>,
  navigation: any,
  playlists: Playlists,
  songsList: SongsList,
  handleSetCurrentTune: Function
}){
  useEffect(() => {bench.stop("Full render")}, [])
  const bench = reactotron.benchmark("ComposerListDisplay benchmark");
  const [listReversed, setListReversed] = useState(false);
  const [selectedAttr, setSelectedAttr] = useState("name");
  const [search, setSearch] = useState("");
  const [selectedComposers, setSelectedComposers]: [Array<Composer | composer>, Function] = useState([]);
  const [newComposer, setNewComposer] = useState(false);
  const [composerToEdit, setComposerToEdit]: [Composer | undefined, Function] = useState();
  let suggestAddComposer = false;

  function toggleComposerSelect(item: Composer | composer){
    if(selectedComposers.includes(item)){
      setSelectedComposers(selectedComposers.filter(comp => comp != item));
    }else{
      setSelectedComposers(selectedComposers.concat(item));
    }
  }

  let displayComposers = composers;
  const fuse = new Fuse(displayComposers, fuseOptions);
  if(search === ""){
    itemSort(displayComposers, selectedAttr, listReversed);
    displayComposers = displayComposers.filter(comp => !(selectedComposers.includes(comp)));
    displayComposers.unshift(...selectedComposers);
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
    displayComposers = displayComposers.filter(comp => !(selectedComposers.includes(comp)));
    displayComposers.unshift(...selectedComposers);
  }
  bench.step("Pre-render")

  const headerInputStates = 
  {
    setSearch: setSearch,
    navigation: navigation,
    setNewComposer: setNewComposer,
    handleSetCurrentTune: handleSetCurrentTune,
    selectedComposers: selectedComposers
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
                  onPress={() => {toggleComposerSelect(item)}}
                  onLongPress={() => {
                    if(item instanceof Composer){
                      setComposerToEdit(item);
                      navigation.navigate("ComposerEditor")
                    }
                  }}
                  onShowUnderlay={separators.highlight}
                  onHideUnderlay={separators.unhighlight}>
                  <View style={{backgroundColor: (selectedComposers.includes(item) ? '#404040' : 'black'), padding: 8}}>
                    <Text>{item.name}</Text>
                    <LocalityIndicators item={item}/>
                    <SubText>{prettyPrint(item.birth)}</SubText>
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
            selectedComposer={composerToEdit}
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

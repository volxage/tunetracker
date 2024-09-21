// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useEffect, useReducer, useState} from 'react';
import {
  Button,
  DeleteButton,
  ButtonText,
  SubText,
} from '../Style.tsx'
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
} from 'react-native';

import TypeField from './TypeField.tsx';
import SongsList from '../SongsList.tsx';
import Playlists from '../Playlists.tsx';
import {tune_draft, standard, playlist, tuneDefaults, editorAttrs, composerEditorAttrs, composer} from '../types.tsx';
import reactotron from 'reactotron-react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import {BackHandler} from 'react-native';
import Compare from './Compare.tsx';
import OnlineDB from '../OnlineDB.tsx';

import {database} from '../index.js';
import TuneModel from '../model/Tune.js';
import ComposerListDisplay from './ComposerListDisplay.tsx';
import ComposerEditor from './ComposerEditor.tsx';
import Composer from '../model/Composer.js';
import TuneComposer from '../model/TuneComposer.js';

function reducer(state: any, action: any){
  switch(action.type){
    case 'update_attr':
    {
      //const tuneCopy = JSON.parse(JSON.stringify(state["currentTune"]));
      let tuneCopy: composer = {}
      for(let attr in state["currentTune"]){
        tuneCopy[attr as keyof composer] = state["currentTune"][attr];
      }

      tuneCopy[action["attr"] as keyof composer] = action["value"];
      return {currentTune: tuneCopy};
    }
    case 'set_to_selected':
    {
      const tune: tune_draft = {}
      if(action["selectedTune"] instanceof TuneModel){
        for(let attr of tuneDefaults){
          let key = attr[0] as keyof TuneModel;
          if(key in action["selectedTune"]
            && typeof action["selectedTune"][key] !== "undefined"
            && action["selectedTune"][key] !== null
          ){
            tune[key as keyof tune_draft] = action["selectedTune"][key as keyof TuneModel]
          }else{
            tune[key as keyof tune_draft] = attr[1]
          }
        }
        //Only run on firs
        if(!state["currentTune"] ||
          !state["currentTune"].composers){
          action["selectedTune"].composers.fetch().then(comps => {
            tune.composers = (comps as Composer[])
          });
        }
      }else{
        for(let attr of tuneDefaults){
          let key = attr[0] as keyof tune_draft;
          if(key in action["selectedTune"] && typeof action["selectedTune"][key] !== "undefined"){
            tune[key as keyof tune_draft] = action["selectedTune"][key as keyof tune_draft]
          }else{
            tune[key as keyof tune_draft] = attr[1]
          }
        }
        //tune.dbId = action["selectedTune"]["id"]
      }
      return {currentTune: tune};
    }
  }
}

export default function Editor({
  prettyAttrs, 
  navigation,
  selectedTune,
  songsList,
  playlists,
  newTune,
  setNewTune
}: {
  prettyAttrs: Array<[string, string]>,
  navigation: any, //TODO: Find type of "navigation"
  selectedTune: TuneModel | tune_draft,
  songsList: SongsList,
  playlists: Playlists,
  newTune: boolean,
  setNewTune: Function
}): React.JSX.Element {
  //Intentional copy to allow cancelling of edits
  //  const [currentTune, setCurrentTune] = useState()
  console.log("Rerender Editor");
  const [state, dispatch] = useReducer(reducer, {currentTune: {}});
  const [tunePlaylists, setTunePlaylists]: [playlist[], Function] = useState([])
  const [originalPlaylistsSet, setOriginalPlaylistsSet]: [Set<playlist>, Function] = useState(new Set())
  const bench = reactotron.benchmark("Editor benchmark");
  const Stack = createNativeStackNavigator();

  useEffect(() => {
    dispatch({type: "set_to_selected", selectedTune: selectedTune});
    if(selectedTune instanceof TuneModel){
    }
    BackHandler.addEventListener('hardwareBackPress', navigation.goBack)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', navigation.goBack)
    }
  }, []);

  useEffect(() => {
    //If there's no id, it's impossible that the tune has been assigned playlists already.
    if (typeof selectedTune.id !== "undefined"){ 
      const tmpTunesPlaylist = playlists.getTunePlaylists(selectedTune.id);
      setTunePlaylists(tmpTunesPlaylist);
      setOriginalPlaylistsSet(new Set(tmpTunesPlaylist));
    }
    bench.stop("Post-render")
  }, [])
  function handleSetCurrentTune(attr_key: keyof tune_draft, value: any){
    console.log("attr_key: " + attr_key);
    console.log("value: ");
    console.log(value);
    dispatch({type: 'update_attr', attr: attr_key, value: value});
  }
  bench.step("Prerender")
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={"EditorUnwrapped"} >
        {props => <SafeAreaView style={{flex: 1, backgroundColor: "black"}}>
          <FlatList
            data={prettyAttrs}
            renderItem={({item, index, separators}) => (
              <View>
                { (item[0] !== "lyricsConfidence" || state["currentTune"]["hasLyrics"]) &&
                <TouchableHighlight
                  key={item[0]}
                  onShowUnderlay={separators.highlight}
                  onHideUnderlay={separators.unhighlight}
                >
                  <TypeField
                    attr={state["currentTune"][item[0]]}
                    attrKey={item[0]}
                    attrName={item[1]}
                    handleSetCurrentItem={handleSetCurrentTune}
                    playlists={playlists}
                    tunePlaylists={tunePlaylists}
                    setTunePlaylists={setTunePlaylists}
                    navigation={navigation}
                  />
                </TouchableHighlight>
                }{typeof bench.step("Item render") === "undefined"}
              </View>
            )}
            ListFooterComponent={
              <View>
                <SubText style={{fontSize: 16, color:'grey', alignSelf: 'center'}}>
                  Press and hold if you're sure
                </SubText>
              {
                !newTune && 
                <DeleteButton
                  onLongPress={() => {
                    database.write(async () => {
                      (selectedTune as TuneModel).destroyPermanently();
                    });
                    navigation.goBack();
                    songsList.rereadDb();
                  }}>
                    <ButtonText>DELETE TUNE (CAN'T UNDO!)</ButtonText>
                  </DeleteButton>
                }
                <View style={{flexDirection: "row", backgroundColor: "black"}}>
                  <View style={{flex: 1}}>

                    {
                    }
              {
                // newTune ? save new tune : update existing tune
                !newTune &&
                <Button
                  onPress={() => {
                    //Save to existing tune

                 ///const tune_id = songsList.replaceSelectedTune(selectedTune, currentTune);
                 ///const newPlaylistSet = new Set(tunePlaylists);
                 ///const removedPlaylists = [...originalPlaylistsSet]
                 ///  .filter(oldPlaylist => !newPlaylistSet.has(oldPlaylist));
                 ///const updatedPlaylists = [...newPlaylistSet]
                 ///  .filter(newPlaylist => !originalPlaylistsSet.has(newPlaylist));
                 ///for(var playlist of updatedPlaylists){
                 ///  console.log("Adding tune to " + playlist.title)
                 ///  playlists.addTune(tune_id, playlist.id)
                 ///}
                    //TODO: Implement playlists
                 // for(var playlist of removedPlaylists){
                 //   console.log("Removing tune from " + playlist.title)
                 //   playlists.removeTune(tune_id, playlist.id)
                 // }
                    console.log("Saving to existing tune");
                    (selectedTune as TuneModel).replace(state["currentTune"]).then( () => {
                      songsList.rereadDb();
                      navigation.goBack();
                    });
                  }}
                ><ButtonText>Save</ButtonText>
              </Button>
            }
              {
                newTune &&
                <Button
                  onPress={() => {
                    //Save to new tune
                    //TODO: Implement playlists
                  //const tune_id = songsList.addNewTune(currentTune);
                  //const newPlaylistSet = new Set(tunePlaylists);
                  //const addedPlaylists = [...newPlaylistSet]
                  //  .filter(newPlaylist => !originalPlaylistsSet.has(newPlaylist));
                  //for(var playlist of addedPlaylists){
                  //  console.log("Adding tune to " + playlist.title)
                  //  playlists.addTune(tune_id, playlist.id)
                  //}
                    console.log("Saving to new tune");
                    database.write(async () => {database.get('tunes').create(tn => {
                      // This should implicitly add and remove composer relations
                      (tn as TuneModel).replace(state["currentTune"]);
                      
                    }).then(resultingModel => {
                      console.log(resultingModel);
                      songsList.rereadDb();
                    })});
                    navigation.goBack();
                    setNewTune(false);
                  }}
                ><ButtonText>Save</ButtonText>
              </Button>
            }

          </View>
          <View style={{flex: 1}}>
            <DeleteButton
              onPress={() => {navigation.goBack(); songsList.rereadDb; setNewTune(false);}}
            ><ButtonText>Cancel Edit</ButtonText></DeleteButton>
        </View>
      </View>
    </View>
  }
/>
</SafeAreaView>}
</Stack.Screen>
<Stack.Screen name={"ImportID"}>
  {props => 
  <SafeAreaView style={{flex: 1}}>
    <Importer
      navigation={props.navigation}
      importingId={false}
      importFn={function(stand: standard, mini: boolean){
        handleSetCurrentTune("dbId", stand.id)
        props.navigation.goBack();
      }}/>
    </SafeAreaView>
  }
</Stack.Screen>
<Stack.Screen name="Compare">
  {props =>
    //Logically, this screen will never appear if there is no standard, so we can guarantee that getStandardById will return a standard.
    <Compare
      currentTune={state["currentTune"]}
      currentStandard={(state["currentTune"].dbId ? OnlineDB.getStandardById(state["currentTune"].dbId) : null) as standard}
      navigation={props.navigation}
      handleSetCurrentTune={handleSetCurrentTune}
    />
  }
</Stack.Screen>
<Stack.Screen name='ComposerSelector'>
  {props =>
    <ComposerListDisplay
      composers={(songsList.composersList as Array<Composer | composer>).concat(OnlineDB.getComposers())}
      songsList={songsList}
      navigation={navigation}
      handleSetCurrentTune={handleSetCurrentTune}
      playlists={[]}
    />
  }
</Stack.Screen>
</Stack.Navigator>
  );
}

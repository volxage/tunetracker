
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
import {composer_draft, standard, playlist, composerDefaults} from '../types.tsx';
import reactotron from 'reactotron-react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import {BackHandler} from 'react-native';
import OnlineDB from '../OnlineDB.tsx';

import {database} from '../index.js';
import TuneModel from '../model/Tune.js';
import Composer from '../model/Composer.js';

function reducer(state: any, action: any){
  switch(action.type){
    case 'update_attr':
    {
      const compCopy = JSON.parse(JSON.stringify(state["currentComposer"]));
      compCopy[action["attr"]] = action["value"];
      return {currentComposer: compCopy};
    }
    case 'set_to_selected':
    {
      const cd: composer_draft = {}
      if(action["selectedComposer"] instanceof Composer){
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedComposer"]
            && typeof action["selectedComposer"][key] !== "undefined"
            && action["selectedComposer"][key] !== null
          ){
            cd[key as keyof composer_draft] = action["selectedComposer"][key as keyof Composer]
          }else{
            cd[key as keyof composer_draft] = attr[1]
          }
        }
      }else{
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedComposer"] && typeof action["selectedComposer"][key] !== "undefined"){
            cd[key as keyof composer_draft] = action["selectedComposer"][key as keyof Composer]
          }else{
            cd[key as keyof composer_draft] = attr[1]
          }
        }
        //tune.dbId = action["selectedComposer"]["id"]
      }
      return {currentComposer: cd};
    }
  }
}

export default function ComposerEditor({
  prettyAttrs, 
  navigation,
  selectedComposer,
  songsList,
  playlists,
  newComposer,
  setNewComposer
}: {
  prettyAttrs: Array<[string, string]>,
  navigation: any, //TODO: Find type of "navigation"
  selectedComposer: Composer | composer_draft,
  songsList: SongsList,
  playlists: Playlists,
  newComposer: boolean,
  setNewComposer: Function
}): React.JSX.Element {
  //Intentional copy to allow cancelling of edits
  //  const [currentComposer, setCurrentTune] = useState()
  console.log("Rerender ComposerEditor");
  const [state, dispatch] = useReducer(reducer, {currentComposer: {}});
  const [tunePlaylists, setTunePlaylists]: [playlist[], Function] = useState([])
  const [originalPlaylistsSet, setOriginalPlaylistsSet]: [Set<playlist>, Function] = useState(new Set())
  const bench = reactotron.benchmark("Editor benchmark");
  const Stack = createNativeStackNavigator();

  useEffect(() => {
    dispatch({type: "set_to_selected", selectedComposer: selectedComposer});
    BackHandler.addEventListener('hardwareBackPress', navigation.goBack)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', navigation.goBack)
    }
  }, []);

  useEffect(() => {
    //If there's no id, it's impossible that the tune has been assigned playlists already.
    if (typeof selectedComposer.id !== "undefined"){ 
      const tmpTunesPlaylist = playlists.getTunePlaylists(selectedComposer.id);
      setTunePlaylists(tmpTunesPlaylist);
      setOriginalPlaylistsSet(new Set(tmpTunesPlaylist));
    }
    bench.stop("Post-render")
  }, [])
  function handleSetCurrentComposer(attr_key: keyof composer_draft, value: any){
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
                { (item[0] !== "lyricsConfidence" || state["currentComposer"]["hasLyrics"]) &&
                <TouchableHighlight
                  key={item[0]}
                  onShowUnderlay={separators.highlight}
                  onHideUnderlay={separators.unhighlight}
                >
                  <TypeField
                    attr={state["currentComposer"][item[0]]}
                    attrKey={item[0]}
                    attrName={item[1]}
                    handleSetCurrentItem={handleSetCurrentComposer}
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
                !newComposer && 
                <DeleteButton
                  onLongPress={() => {
                    database.write(async () => {
                      (selectedComposer as Composer).destroyPermanently();
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
                !newComposer &&
                <Button
                  onPress={() => {
                    //Save to existing tune

                 ///const tune_id = songsList.replaceSelectedTune(selectedComposer, currentComposer);
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
                    (selectedComposer as Composer).replace(state["currentComposer"]).then( () => {
                      songsList.rereadDb();
                      navigation.goBack();
                    });
                  }}
                ><ButtonText>Save</ButtonText>
              </Button>
            }
              {
                newComposer &&
                <Button
                  onPress={() => {
                    //Save to new tune
                    //TODO: Implement playlists
                  //const tune_id = songsList.addNewTune(currentComposer);
                  //const newPlaylistSet = new Set(tunePlaylists);
                  //const addedPlaylists = [...newPlaylistSet]
                  //  .filter(newPlaylist => !originalPlaylistsSet.has(newPlaylist));
                  //for(var playlist of addedPlaylists){
                  //  console.log("Adding tune to " + playlist.title)
                  //  playlists.addTune(tune_id, playlist.id)
                  //}
                    console.log("Saving to new tune");
                    database.write(async () => {database.get('composers').create(comp => {
                      (comp as Composer).replace(state["currentComposer"])
                    }).then(resultingModel => {
                      console.log(resultingModel);
                      songsList.rereadDb();
                    })});
                    navigation.goBack();
                    setNewComposer(false);
                  }}
                ><ButtonText>Save</ButtonText>
              </Button>
            }

          </View>
          <View style={{flex: 1}}>
            <DeleteButton
              onPress={() => {navigation.goBack(); songsList.rereadDb; setNewComposer(false);}}
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
        handleSetCurrentComposer("dbId", stand.id)
        props.navigation.goBack();
      }}/>
    </SafeAreaView>
  }
</Stack.Screen>
<Stack.Screen name="Compare">
  {props =>
  <View></View>
    //Logically, this screen will never appear if there is no standard, so we can guarantee that getStandardById will return a standard.
  //<Compare
  //  currentComposer={state["currentComposer"]}
  //  onlineComposer={(state["currentComposer"].dbId ? OnlineDB.getStandardById(state["currentComposer"].dbId) : null) as standard}
  //  navigation={props.navigation}
  //  handleSetCurrentItem={handleSetCurrentItem}
   //>
  }
</Stack.Screen>
</Stack.Navigator>
  );
}

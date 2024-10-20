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
import {tune_draft, standard, playlist, tuneDefaults, editorAttrs, composerEditorAttrs, composer} from '../types.tsx';
import reactotron from 'reactotron-react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import {BackHandler} from 'react-native';
import Compare from './Compare.tsx';
import OnlineDB from '../OnlineDB.tsx';

import Tune from '../model/Tune.ts';
import ComposerListDisplay from './ComposerListDisplay.tsx';
import Composer from '../model/Composer.ts';
import Playlist from '../model/Playlist.ts';
import {useRealm} from '@realm/react';

function reducer(state: any, action: any){
  switch(action.type){
    case 'update_attr':
    {
      //const tuneCopy = JSON.parse(JSON.stringify(state["currentTune"]));
      let tuneCopy: tune_draft = {}
      for(let attr in state["currentTune"]){
        tuneCopy[attr as keyof tune_draft] = state["currentTune"][attr];
      }

      tuneCopy[action["attr"] as keyof tune_draft] = action["value"];
      return {currentTune: tuneCopy};
    }
    case 'set_to_selected':
    {
      const tune: tune_draft = {}
      if(action["selectedTune"] instanceof Tune){
        for(let attr of tuneDefaults){
          let key = attr[0] as keyof Tune;
          if(key in action["selectedTune"]
            && typeof action["selectedTune"][key] !== "undefined"
            && action["selectedTune"][key] !== null
          ){
            tune[key as keyof tune_draft] = action["selectedTune"][key as keyof Tune]
          }else{
            tune[key as keyof tune_draft] = attr[1]
          }
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
  newTune,
  setNewTune
}: {
  prettyAttrs: Array<[string, string]>,
  navigation: any, //TODO: Find type of "navigation"
  selectedTune: Tune | tune_draft,
  newTune: boolean,
  setNewTune: Function
}): React.JSX.Element {
  //Intentional copy to allow cancelling of edits
  //  const [currentTune, setCurrentTune] = useState()
  console.log("Rerender Editor");
  const realm = useRealm();
  const [state, dispatch] = useReducer(reducer, {currentTune: {}});
  const bench = reactotron.benchmark("Editor benchmark");
  const Stack = createNativeStackNavigator();

  useEffect(() => {
    dispatch({type: "set_to_selected", selectedTune: selectedTune});
    if(selectedTune instanceof Tune){
    }
    BackHandler.addEventListener('hardwareBackPress', navigation.goBack)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', navigation.goBack)
    }
  }, []);

  function handleSetCurrentTune(attr_key: keyof tune_draft, value: any){
    console.log("attr_key: " + attr_key);
    console.log(`value: ${value}`);
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
                    navigation={navigation}
                    isComposer={false}
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
                    realm.write(() => {
                      realm.delete(selectedTune as Tune);
                    })
                    navigation.goBack();
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
                    console.log("Saving to existing tune");
                    realm.write(() => {
                      for(let attr in (state["currentTune"])){
                        selectedTune[attr as keyof (tune_draft | Tune)] = (state["currentTune"][attr as keyof tune_draft] as any)
                      }
                    });
                  //(selectedTune as Tune).replace(state["currentTune"]).then( () => {
                  //  songsList.rereadDb();
                    navigation.goBack();
                  //});
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
                    realm.write(() => {
                      realm.create("Tune",
                        state["currentTune"]
                      )
                    });
                  //database.write(async () => {database.get('tunes').create(tn => {
                  //  // This should implicitly add and remove composer relations
                  //  (tn as Tune).replace(state["currentTune"]);
                  //  
                  //}).then(resultingModel => {
                  //  console.log(resultingModel);
                  //  songsList.rereadDb();
                  //})});
                    navigation.goBack();
                    setNewTune(false);
                  }}
                ><ButtonText>Save</ButtonText>
              </Button>
            }

          </View>
          <View style={{flex: 1}}>
            <DeleteButton
              onPress={() => {navigation.goBack(); setNewTune(false);}}
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
      currentItem={state["currentTune"]}
      onlineVersion={(state["currentTune"].dbId ? OnlineDB.getStandardById(state["currentTune"].dbId) : null) as standard}
      navigation={props.navigation}
      handleSetCurrentItem={handleSetCurrentTune}
      isComposer={false}
    />
  }
</Stack.Screen>
<Stack.Screen name='ComposerSelector'>
  {props =>
  <SafeAreaView style={{flex: 1}}>
    <ComposerListDisplay
      originalTuneComposers={state["currentTune"]["composers"] ? state["currentTune"]["composers"] : []}
      navigation={navigation}
      handleSetCurrentTune={handleSetCurrentTune}
    />
  </SafeAreaView>
  }
</Stack.Screen>
</Stack.Navigator>
  );
}


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
import {composer, standard, playlist, composerDefaults} from '../types.tsx';
import reactotron from 'reactotron-react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import {BackHandler} from 'react-native';
import OnlineDB from '../OnlineDB.tsx';

import TuneModel from '../model/Tune.ts';
import Composer from '../model/Composer.ts';
import Compare from './Compare.tsx';

function reducer(state: any, action: any){
  switch(action.type){
    case 'update_attr':
    {
      const cd: composer = {}
      for(let attr of composerDefaults){
        let key = attr[0] as keyof Composer;
        if(key in state["currentComposer"]
          && typeof state["currentComposer"][key] !== "undefined"
          && state["currentComposer"][key] !== null
        ){
          cd[key as keyof composer] = state["currentComposer"][key as keyof Composer]
        }else{
          cd[key as keyof composer] = attr[1]
        }
      }
      cd[action["attr"] as keyof composer] = action["value"];
      return {currentComposer: cd};
    }
    case 'set_to_selected':
    {
      const cd: composer = {}
      if(action["selectedComposer"] instanceof Composer){
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedComposer"]
            && typeof action["selectedComposer"][key] !== "undefined"
            && action["selectedComposer"][key] !== null
          ){
            cd[key as keyof composer] = action["selectedComposer"][key as keyof Composer]
          }else{
            cd[key as keyof composer] = attr[1]
          }
        }
      }else{
        for(let attr of composerDefaults){
          let key = attr[0] as keyof Composer;
          if(key in action["selectedComposer"] && typeof action["selectedComposer"][key] !== "undefined"){
            cd[key as keyof composer] = action["selectedComposer"][key as keyof Composer]
          }else{
            cd[key as keyof composer] = attr[1]
          }
        }
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
  selectedComposer: Composer | composer,
  songsList: SongsList,
  playlists: Playlists,
  newComposer: boolean,
  setNewComposer: Function
}): React.JSX.Element {
  //Intentional copy to allow cancelling of edits
  //  const [currentComposer, setCurrentTune] = useState()
  console.log("Rerender ComposerEditor");
  //console.log(prettyAttrs);
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
    bench.stop("Post-render")
  }, [])
  function handleSetCurrentComposer(attr_key: keyof composer, value: any){
    dispatch({type: 'update_attr', attr: attr_key, value: value});
  }
  bench.step("Prerender")
  const onlineVersion = (state["currentComposer"].dbId ? OnlineDB.getComposerById(state["currentComposer"].dbId) : null) as composer
  if(onlineVersion){
    onlineVersion.birth = onlineVersion.birth ? new Date(onlineVersion.birth) : undefined;
    onlineVersion.death = onlineVersion.death ? new Date(onlineVersion.death) : undefined;
  }
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
                    isComposer={true}
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
                  //database.write(async () => {
                  //  (selectedComposer as Composer).delete();
                  //});
                    navigation.goBack();
                  }}>
                    <ButtonText>DELETE COMPOSER (CAN'T UNDO!)</ButtonText>
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
                  //(selectedComposer as Composer).replace(state["currentComposer"]).then( () => {
                  //  navigation.goBack();
                  //});
                  }}
                ><ButtonText>Save</ButtonText>
              </Button>
            }
              {
                newComposer &&
                <Button
                  onPress={() => {
                  //database.write(async () => {database.get('composers').create(comp => {
                  //  (comp as Composer).replace(state["currentComposer"])
                  //}).then(resultingModel => {
                  //  console.log(resultingModel);
                  //})});
                    navigation.goBack();
                    setNewComposer(false);
                  }}
                ><ButtonText>Save</ButtonText>
              </Button>
            }


          </View>
          <View style={{flex: 1}}>
            <DeleteButton
              onPress={() => {navigation.goBack(); setNewComposer(false);}}
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
<Stack.Screen name="ComposerCompare">
  {props =>
  <Compare
    currentItem={state["currentComposer"]}
    onlineVersion={(state["currentComposer"].dbId ? OnlineDB.getComposerById(state["currentComposer"].dbId) : null) as composer}
    navigation={props.navigation}
    handleSetCurrentItem={handleSetCurrentComposer}
    isComposer={true}
  />
  }
</Stack.Screen>
</Stack.Navigator>
  );
}

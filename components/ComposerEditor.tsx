// Copyright 2024 Jonathan Hilliard

import React, {useEffect, useReducer, useState} from 'react';
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
import {composer, standard} from '../types.ts';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import {BackHandler} from 'react-native';
import OnlineDB from '../OnlineDB.tsx';

import Composer from '../model/Composer.ts';
import Compare from './Compare.tsx';
import {useRealm} from '@realm/react';
import composerDraftReducer from '../DraftReducers/ComposerDraftReducer.ts';
import ComposerDraftContext from '../contexts/ComposerDraftContext.ts';


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
  playlists: any,
  newComposer: boolean,
  setNewComposer: Function
}): React.JSX.Element {
  //Intentional copy to allow cancelling of edits
  //  const [currentDraft, setCurrentTune] = useState()
  //console.log(prettyAttrs);
  const [state, dispatch] = useReducer(composerDraftReducer, {currentDraft: {}});
  const Stack = createNativeStackNavigator();
  const realm = useRealm();
  console.log("Rerender ComposerEditor");

  useEffect(() => {
    dispatch({type: "set_to_selected", selectedItem: selectedComposer});
    BackHandler.addEventListener('hardwareBackPress', navigation.goBack)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', navigation.goBack)
    }
  }, []);

  function handleSetCurrentComposer(attr_key: keyof composer, value: any){
    dispatch({type: 'update_attr', attr: attr_key, value: value});
  }
  const onlineVersion = (state["currentDraft"].dbId ? OnlineDB.getComposerById(state["currentDraft"].dbId) : null) as composer
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
                { (item[0] !== "lyricsConfidence" || state["currentDraft"]["hasLyrics"]) &&
                <TouchableHighlight
                  key={item[0]}
                  onShowUnderlay={separators.highlight}
                  onHideUnderlay={separators.unhighlight}
                >
                  <TypeField
                    attr={state["currentDraft"][item[0]]}
                    attrKey={item[0]}
                    attrName={item[1]}
                    handleSetCurrentItem={handleSetCurrentComposer}
                    navigation={navigation}
                    isComposer={true}
                  />
                </TouchableHighlight>
                }
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
                    realm.write(() => 
                      realm.delete(selectedComposer)
                    )
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
                    realm.write(() => {
                      for(let attr in state["currentDraft"]){
                        //TODO: Supress compiler warnings here
                        selectedComposer[attr] = state["currentDraft"][attr];
                      }
                    });
                    navigation.goBack()
                  }}
                ><ButtonText>Save</ButtonText>
              </Button>
            }
              {
                newComposer &&
                <Button
                  onPress={() => {
                  //database.write(async () => {database.get('composers').create(comp => {
                  //  (comp as Composer).replace(state["currentDraft"])
                  //}).then(resultingModel => {
                  //  console.log(resultingModel);
                  //})});
                    realm.write(() => {
                      realm.create("Composer", state["currentDraft"]);
                    });
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
<Stack.Screen name={"ComposerImportId"}>
  {props => 
  <SafeAreaView style={{flex: 1}}>
    <ComposerDraftContext.Provider value={state["currentDraft"]}>
      <Importer
        importingComposers={true}
        navigation={props.navigation}
        importingId={true}
        importFn={function(stand: standard, mini: boolean){
          handleSetCurrentComposer("dbId", stand.id)
          props.navigation.goBack();
        }}/>
      </ComposerDraftContext.Provider>
    </SafeAreaView>
  }
</Stack.Screen>
<Stack.Screen name="ComposerCompare">
  {props =>
  <Compare
    currentItem={state["currentDraft"]}
    onlineVersion={(state["currentDraft"].dbId ? OnlineDB.getComposerById(state["currentDraft"].dbId) : null) as composer}
    navigation={props.navigation}
    handleSetCurrentItem={handleSetCurrentComposer}
    isComposer={true}
  />
  }
</Stack.Screen>
</Stack.Navigator>
  );
}

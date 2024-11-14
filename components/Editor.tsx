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
import {tune_draft, standard, tuneDefaults} from '../types.ts';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import {BackHandler} from 'react-native';
import Compare from './Compare.tsx';
import OnlineDB from '../OnlineDB.tsx';

import Tune from '../model/Tune.ts';
import ComposerListDisplay from './ComposerListDisplay.tsx';
import {useRealm} from '@realm/react';
import {BSON} from 'realm';
import TuneDraftContext from '../contexts/TuneDraftContext.ts';
import tuneDraftReducer from '../DraftReducers/TuneDraftReducer.ts';


export default function Editor({
  prettyAttrs, 
  navigation,
  selectedTune,
  newTune,
  setNewTune
}: {
  prettyAttrs: Array<[keyof tune_draft, string]>,
  navigation: any, //TODO: Find type of "navigation"
  selectedTune: Tune | tune_draft,
  newTune: boolean,
  setNewTune: Function
}): React.JSX.Element {
  const realm = useRealm();
  const [state, dispatch] = useReducer(tuneDraftReducer, {currentDraft: {}, changedAttrsList: []});
  const Stack = createNativeStackNavigator();

  useEffect(() => {
    dispatch({type: "set_to_selected", selectedItem: selectedTune});
    if(selectedTune instanceof Tune){
    }
    BackHandler.addEventListener('hardwareBackPress', navigation.goBack)
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', navigation.goBack)
    }
  }, []);

  function handleSetCurrentTune(attr_key: keyof tune_draft, value: any){
    dispatch({type: 'update_attr', attr: attr_key, value: value});
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
                    handleSetCurrentItem={handleSetCurrentTune}
                    navigation={navigation}
                    isComposer={false}
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
                !newTune && 
                <DeleteButton
                  onLongPress={() => {
                    realm.write(() => {
                      realm.delete(selectedTune);
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
                    realm.write(() => {
                      for(let attr of state["changedAttrsList"]){
                        selectedTune[attr as keyof (tune_draft | Tune)] = (state["currentDraft"][attr as keyof tune_draft])
                      }
                    });
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
                    const ctCopy = state["currentDraft"]
                    ctCopy.id = new BSON.ObjectId()
                    realm.write(() => {
                      realm.create("Tune",
                        state["currentDraft"]
                      )
                    });
                    navigation.goBack();
                    setNewTune(false);
                  }}
                ><ButtonText>Save</ButtonText>
              </Button>
            }

          </View>
          {
            newTune ?
            <View style={{flex: 1}}>
              <DeleteButton
                onPress={() => {navigation.goBack(); setNewTune(false);}}
              >
                <ButtonText>Cancel creation</ButtonText>
              </DeleteButton>
            </View>
            :
            <View style={{flex: 1}}>
              <DeleteButton
                onPress={() => {navigation.goBack(); setNewTune(false);}}
              >
                <ButtonText>Cancel Edit</ButtonText>
              </DeleteButton>
            </View>
          }
      </View>
    </View>
  }
/>
</SafeAreaView>}
</Stack.Screen>
<Stack.Screen name={"ImportID"}>
  {props => 
  <SafeAreaView style={{flex: 1}}>
    <TuneDraftContext.Provider value={state["currentDraft"]}>
      <Importer
        importingComposers={false}
        navigation={props.navigation}
        importingId={true}
        importFn={function(stand: standard, mini: boolean){
          handleSetCurrentTune("dbId", stand.id)
          props.navigation.goBack();
        }}/>
      </TuneDraftContext.Provider>
    </SafeAreaView>
  }
</Stack.Screen>
<Stack.Screen name="Compare">
  {props =>
    //Logically, this screen will never appear if there is no standard, so we can guarantee that getStandardById will return a standard.
    <Compare
      currentItem={state["currentDraft"]}
      onlineVersion={(state["currentDraft"].dbId ? OnlineDB.getStandardById(state["currentDraft"].dbId) : null) as standard}
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
      originalTuneComposers={state["currentDraft"]["composers"] ? state["currentDraft"]["composers"] : []}
      navigation={navigation}
      handleSetCurrentTune={handleSetCurrentTune}
    />
  </SafeAreaView>
  }
</Stack.Screen>
</Stack.Navigator>
  );
}

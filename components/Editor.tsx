// Copyright 2024 Jonathan Hilliard

import React, {createContext, useContext, useEffect, useReducer, useState} from 'react';
import {
  DeleteButton,
  ButtonText,
  SubText,
  SafeBgView,
  SMarginView,
  SubBoldText,
  Title,
  SubDimText,
} from '../Style.tsx'
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
} from 'react-native';

import TypeField from './TypeField.tsx';
import {tune_draft, standard, miniEditorAttrs, editorAttrs, confidenceAttrs, tune_draft_extras} from '../types.ts';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import Compare from './Compare.tsx';
import OnlineDB from '../OnlineDB.tsx';

import Tune from '../model/Tune.ts';
import ComposerListDisplay from './ComposerListDisplay.tsx';
import {useRealm} from '@realm/react';
import {BSON} from 'realm';
import TuneDraftContext from '../contexts/TuneDraftContext.ts';
import tuneDraftReducer from '../DraftReducers/TuneDraftReducer.ts';
import {useNavigation} from '@react-navigation/native';
import { Button } from '../simple_components/Button.tsx';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useTheme} from 'styled-components';
import SimilarItemPrompt from './connection-management/SimilarItemPrompt.tsx';
import ConfirmConectionPrompt from './connection-management/ConfirmConnectionPrompt.tsx';
import UploadRequest from './connection-management/UploadRequest.tsx';


export const NewTuneContext = createContext(false);

export default function Editor({
  selectedTune,
  newTune,
  setNewTune
}: {
    selectedTune: Tune | tune_draft,
    newTune: boolean,
    setNewTune: Function
  }): React.JSX.Element {
  const realm = useRealm();
  const [state, dispatch] = useReducer(tuneDraftReducer, {currentDraft: {}, changedAttrsList: [], id: undefined});
  const [advancedSelected, setAdvancedSelected] = useState(newTune);
  const Stack = createNativeStackNavigator();
  const navigation = useNavigation();
  const theme = useTheme();
  const [icon, setIcon] =  useState();
  const [confidenceExpanded, setConfidenceExpanded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  let basicEditorArr = Array.from(miniEditorAttrs.entries());
  if(confidenceExpanded){
    basicEditorArr = [...Array.from(confidenceAttrs.entries()), ...basicEditorArr];
  }

  useEffect(() => {
    Icon.getImageSource('circle', 26, 'white')
      .then(setIcon);
    dispatch({type: "set_to_selected", selectedItem: selectedTune});
    if(selectedTune instanceof Tune){
    }
  }, []);

  function handleSetCurrentTune(attr_key: keyof (tune_draft & tune_draft_extras), value: any, immediate = false){
    if(immediate){
      if(selectedTune instanceof Tune){
        realm.write(() => {
          selectedTune[attr_key] = value
        })
      }
    }else{
      //Immediate changes don't need to be saved
      setHasUnsavedChanges(true);
    }
    dispatch({type: 'update_attr', attr: attr_key, value: value});
  }


  return (
    <TuneDraftContext.Provider value={{td: state["currentDraft"], setTd: () => {},  updateTd: handleSetCurrentTune, id: state.id}}>
      <NewTuneContext.Provider value={newTune}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name={"EditorUnwrapped"} >
            {props => 
              <SafeBgView>
                <FlatList
                  data={advancedSelected ? editorAttrs : basicEditorArr}
                  ListHeaderComponent={
                    <SMarginView>
                      <View style={{flexDirection: "row"}}>
                        <Button
                          style={{flex:1}}
                          onPress={() => {setAdvancedSelected(!advancedSelected)}}
                          text={advancedSelected ? "Set Confidence" : "Edit Tune"}
                        />
                        <Button
                          style={{flex:1}}
                          onPress={() => {
                            if(state.currentDraft.queued){
                              handleSetCurrentTune("queued", false, true)
                            }else{
                              handleSetCurrentTune("queued", true, true)
                            }
                          }}
                          text={state.currentDraft.queued ? "Unqueue" : "Queue"}
                        />
                      </View>
                      {
                        !advancedSelected &&
                          <View>
                            <SMarginView style={{paddingVertical: 16, paddingBottom: 32}}>
                              <Title>{state.currentDraft.title}</Title>
                              {
                                state.currentDraft.alternativeTitle &&
                                  <SubDimText style={{textAlign: "center"}}>AKA: <SubText>{state.currentDraft.alternativeTitle}</SubText></SubDimText>
                              }
                              {
                                state.currentDraft.composers &&
                                  <SubDimText style={{textAlign: "center"}}>By <SubText>{(state.currentDraft as tune_draft).composers?.map(cmp => cmp.name).join(", ")}</SubText></SubDimText>
                              }
                              <View style={{flexDirection: "row"}}>
                                <View style={{flex:1}}>
                                  <SubDimText style={{textAlign: "center"}}>Form</SubDimText>
                                  <SubText style={{textAlign: "center"}}>{state.currentDraft.form}</SubText>
                                </View>
                                <View style={{flex:1}}>
                                  <SubDimText style={{textAlign: "center"}}>Main Key</SubDimText>
                                  <SubText style={{textAlign: "center"}}>{state.currentDraft.mainKey}</SubText>
                                </View>
                              </View>
                            </SMarginView>
                            <View style={{flexDirection: "row"}}>
                              <Title style={{flex: 3, textAlign: "center", textAlignVertical: "center"}}>
                                ALL CONFIDENCE
                              </Title>
                              <Button
                                style={{flex: 1, borderColor: confidenceExpanded ? theme.delete : theme.defaultButton}} 
                                iconName={confidenceExpanded ? "arrow-up-drop-circle-outline" : "arrow-down-drop-circle-outline"}
                                onPress={() => {
                                  setConfidenceExpanded(!confidenceExpanded);
                                }}/>
                            </View>
                            <Slider
                              minimumValue={0}
                              maximumValue={100}
                              step={1}
                              value={state.currentDraft.confidence}
                              onSlidingComplete={(value) => {handleSetCurrentTune("confidence", value)}}
                              style={{marginVertical: 20, marginHorizontal: 16, backgroundColor: "black"}}
                              minimumTrackTintColor='cadetblue'
                              maximumTrackTintColor='gray'
                              thumbTintColor={theme.text || "gray"}
                              thumbImage={icon}
                            />
                          </View>
                      }
                    </SMarginView>
                  }
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
                          />
                        </TouchableHighlight>
                      }
                    </View>
                  )}
                  ListFooterComponent={
                    <View>
                      {
                        !newTune && 
                          <View>
                            <SubDimText style={{textAlign: "center"}}>
                              Press and hold if you're sure
                            </SubDimText>
                            <DeleteButton
                              onLongPress={() => {
                                realm.write(() => {
                                  realm.delete(selectedTune);
                                })
                                navigation.goBack();
                              }}>
                              <ButtonText>DELETE TUNE (CAN'T UNDO!)</ButtonText>
                            </DeleteButton>
                          </View>
                      }
                      {
                        !hasUnsavedChanges ? 
                          <View>
                            <Button text="Done" onPress={() => {navigation.goBack()}}/>
                          </View>
                          :
                          <View>
                            <View style={{flexDirection: "row"}}>
                              <View style={{flex: 1}}>
                                {
                                  // newTune ? save new tune : update existing tune
                                  !newTune &&
                                    <Button
                                      onPress={() => {
                                        console.log("Saving old tune");
                                        realm.write(() => {
                                          for(let attr of state["changedAttrsList"]){
                                            selectedTune[attr as keyof (tune_draft | Tune)] = (state["currentDraft"][attr as keyof tune_draft])
                                          }
                                        });
                                        setNewTune(false);
                                        setHasUnsavedChanges(false);
                                      }}
                                      text='Save'
                                    />
                                }
                                {
                                  newTune &&
                                    <Button
                                      onPress={() => {
                                        console.log("Saving new tune!!!");
                                        const ctCopy = state["currentDraft"]
                                        ctCopy.id = new BSON.ObjectId()
                                        realm.write(() => {
                                          realm.create("Tune",
                                            state["currentDraft"]
                                          )
                                        });
                                        setHasUnsavedChanges(false);
                                        setNewTune(false);
                                      }}
                                      text='Save'
                                    />
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
                    </View>
                  }
                />
              </SafeBgView>}
          </Stack.Screen>
          <Stack.Screen name={"ImportID"}>
            {props => 
              <SafeAreaView style={{flex: 1}}>
                <Importer
                  importingComposers={false}
                  importingId={true}
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
                currentItem={state["currentDraft"]}
                onlineVersion={(state["currentDraft"].dbId ? OnlineDB.getStandardById(state["currentDraft"].dbId) : null) as standard}
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
                  handleSetCurrentTune={handleSetCurrentTune}
                />
              </SafeAreaView>
            }
          </Stack.Screen>
          <Stack.Screen name='SimilarItemPrompt' component={SimilarItemPrompt}/>
          <Stack.Screen name='UploadRequest' component={UploadRequest}/>
          <Stack.Screen name='ConfirmConnectionPrompt' component={ConfirmConectionPrompt}/>
        </Stack.Navigator>
      </NewTuneContext.Provider>
    </TuneDraftContext.Provider>
);
}

// Copyright 2024 Jonathan Hilliard

import React, {createContext, useEffect, useReducer, useState} from 'react';
import {
  DeleteButton,
  ButtonText,
  SubText,
  SafeBgView,
} from '../Style.tsx'
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
} from 'react-native';

import TypeField from './TypeField.tsx';
import {composer, standard, standard_composer} from '../types.ts';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Importer from './Importer.tsx';
import OnlineDB from '../OnlineDB.tsx';

import Composer from '../model/Composer.ts';
import Compare from './Compare.tsx';
import {useRealm} from '@realm/react';
import composerDraftReducer from '../DraftReducers/ComposerDraftReducer.ts';
import ComposerDraftContext from '../contexts/ComposerDraftContext.ts';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../simple_components/Button.tsx';
import SimilarItemPrompt from './connection-management/SimilarItemPrompt.tsx';
import UploadRequest from './connection-management/UploadRequest.tsx';
import ConfirmConectionPrompt from './connection-management/ConfirmConnectionPrompt.tsx';
import {BSON} from 'realm';

export const NewComposerContext = createContext(false);

export default function ComposerEditor({
  prettyAttrs, 
  selectedComposer,
  playlists,
  newComposer,
  setNewComposer
}:{
  prettyAttrs: Array<[keyof Composer, string]>,
  selectedComposer: Composer | composer | undefined,
  playlists: any,
  newComposer: boolean,
  setNewComposer: Function
}): React.JSX.Element {
  //Intentional copy to allow cancelling of edits
  //  const [currentDraft, setCurrentTune] = useState()
  //console.log(prettyAttrs);
  const [state, dispatch] = useReducer(composerDraftReducer, {currentDraft: {}, changedAttrsList: [], id: undefined});
  const Stack = createNativeStackNavigator();
  const realm = useRealm();
  const navigation = useNavigation();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  useEffect(() => {
    console.log("Composereditor effect");
    dispatch({type: "set_to_selected", selectedItem: selectedComposer});
  }, []);

  function handleSetCurrentComposer(attr_key: keyof composer, value: any, immediate = false){
    if(immediate){
      if(selectedComposer instanceof Composer){
        realm.write(() => {
          selectedComposer[attr_key] = value
        })
      }
    }
    dispatch({type: 'update_attr', attr: attr_key, value: value});
  }
  const onlineVersion = (state["currentDraft"].dbId ? OnlineDB.getComposerById(state["currentDraft"].dbId) : null) as composer
  if(onlineVersion){
    onlineVersion.birth = onlineVersion.birth ? new Date(onlineVersion.birth) : undefined;
    onlineVersion.death = onlineVersion.death ? new Date(onlineVersion.death) : undefined;
  }
  return (
    <NewComposerContext.Provider value={newComposer}>
      <ComposerDraftContext.Provider value={{cd: state["currentDraft"], setCd: () => {},  updateCd: handleSetCurrentComposer, id: state.id}}>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name={"EditorUnwrapped"} >
            {props => <SafeBgView>
              <FlatList
                data={prettyAttrs}
                renderItem={({item, index, separators}) => (
                  <View>
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
                        isComposer={true}
                      />
                    </TouchableHighlight>
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
                            try{
                              realm.write(() => 
                                realm.delete(selectedComposer)
                              )
                            }catch(err){
                              console.log(err);
                            }
                            navigation.goBack();
                          }}>
                          <ButtonText>DELETE COMPOSER (CAN'T UNDO!)</ButtonText>
                        </DeleteButton>
                    }
                    {
                      !hasUnsavedChanges ?
                        <View>
                          <Button text="Done" onPress={() => {navigation.goBack()}}/>
                        </View>
                        :
                        <View style={{flexDirection: "row"}}>
                          <View style={{flex: 1}}>
                            {
                              !newComposer &&
                                <Button
                                  onPress={() => {
                                    realm.write(() => {
                                      let attr: keyof composer;
                                      for(attr in state["currentDraft"]){
                                        selectedComposer[attr] = state["currentDraft"][attr]; //as (string & Date | undefined); Why does the model want this type?
                                      }
                                    });
                                    setNewComposer(false);
                                    setHasUnsavedChanges(false);
                                  }}
                                  text='Save'
                                />
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
                                    //WHY DOES THIS WORK?
                                    const ctCopy = state["currentDraft"]
                                    ctCopy.id = new BSON.ObjectId()
                                    realm.write(() => {
                                      realm.create("Composer", state["currentDraft"]);
                                    });
                                    setNewComposer(false);
                                    setHasUnsavedChanges(false);
                                  }}
                                  text='Save'
                                />
                            }


                          </View>
                          <View style={{flex: 1}}>
                            <DeleteButton
                              onPress={() => {navigation.goBack(); setNewComposer(false);}}
                            ><ButtonText>Cancel Edit</ButtonText></DeleteButton>
                          </View>
                        </View>
                    }
                  </View>
                }
              />
            </SafeBgView>}
          </Stack.Screen>
          <Stack.Screen name={"ComposerImportId"}>
            {props => 
              <SafeAreaView style={{flex: 1}}>
                <ComposerDraftContext.Provider value={{cd: state["currentDraft"], setCd: () => {}, updateCd: handleSetCurrentComposer}}>
                  <Importer
                    importingComposers={true}
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
                onlineVersion={(state["currentDraft"].dbId ? OnlineDB.getComposerById(state["currentDraft"].dbId) : null) as standard_composer}
                handleSetCurrentItem={handleSetCurrentComposer}
                isComposer={true}
              />
            }
          </Stack.Screen>
          <Stack.Screen name='SimilarItemPrompt' component={SimilarItemPrompt}/>
          <Stack.Screen name='UploadRequest' component={UploadRequest}/>
          <Stack.Screen name='ConfirmConnectionPrompt' component={ConfirmConectionPrompt}/>
        </Stack.Navigator>
      </ComposerDraftContext.Provider>
    </NewComposerContext.Provider>
  );
}

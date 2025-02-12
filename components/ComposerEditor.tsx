// Copyright 2024 Jonathan Hilliard

import React, {useEffect, useReducer, useState} from 'react';
import {
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


export default function ComposerEditor({
  prettyAttrs, 
  selectedComposer,
  playlists,
  newComposer,
  setNewComposer
}: {
  prettyAttrs: Array<[keyof Composer, string]>,
  selectedComposer: Composer | composer | undefined,
  playlists: any,
  newComposer: boolean,
  setNewComposer: Function
}): React.JSX.Element {
  //Intentional copy to allow cancelling of edits
  //  const [currentDraft, setCurrentTune] = useState()
  //console.log(prettyAttrs);
  const [state, dispatch] = useReducer(composerDraftReducer, {currentDraft: {}, changedAttrsList: []});
  const Stack = createNativeStackNavigator();
  const realm = useRealm();
    const navigation = useNavigation();

  useEffect(() => {
    console.log("Composereditor effect");
    dispatch({type: "set_to_selected", selectedItem: selectedComposer});
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
                      let attr: keyof composer;
                      for(attr in state["currentDraft"]){
                        selectedComposer[attr] = state["currentDraft"][attr]; //as (string & Date | undefined); Why does the model want this type?
                      }
                    });
                    navigation.goBack()
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
                    realm.write(() => {
                      realm.create("Composer", state["currentDraft"]);
                    });
                    navigation.goBack();
                    setNewComposer(false);
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
</Stack.Navigator>
  );
}

// Copyright 2024 Jonathan Hilliard

import React, {isValidElement, useContext, useEffect, useState} from 'react';
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
  ButtonText,
  DeleteButton,
  BgView,
} from '../Style.tsx'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Fuse from 'fuse.js';
import {Button} from '../simple_components/Button.tsx'


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
import {Status, composer, composerEditorAttrs} from '../types.ts';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ComposerEditor from './ComposerEditor.tsx';
import dateDisplay from '../textconverters/dateDisplay.tsx';
import {useQuery, useRealm} from '@realm/react';
import OnlineDB from '../OnlineDB.tsx';
import {BSON} from 'realm';
import itemSort from '../itemSort.tsx';
import Composer from '../model/Composer.ts';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from 'styled-components';


type HeaderInputStates = {
  setSearch: Function
  setNewComposer: Function
  handleSetCurrentTune: Function
  selectedComposers: Array<Composer>
  selectedOnlineComposers: Array<composer>
  setComposerToEdit: Function
}
function ComposerListHeader({
  headerInputStates,
  addComposerOptionFlag
}: {
  headerInputStates: HeaderInputStates,
  addComposerOptionFlag: boolean
}){
  const [addComposerExpanded, setAddComposerExpanded] = useState(false);
  const realm = useRealm();
  const dbStatus = useContext(OnlineDB.DbStateContext).status;
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);
  const navigation = useNavigation() as any;
  const theme = useTheme();
  return(
    <View>
      <View style={{flexDirection: 'row', borderBottomWidth:1, backgroundColor: theme.panelBg}}>
        <View style={{flex:1}}>
          <TextInput
            placeholder={"Enter your composer here"}
            placeholderTextColor={theme.text}
            onChangeText={(text) => {headerInputStates.setSearch(text)}}
          />
          <View style={{flexDirection: "row"}}>
            <Button style={{flex: 1}} onPress={() => {
              const composers: Array<Composer | composer> = [];
              for(let comp of headerInputStates.selectedOnlineComposers){
                realm.write(() => {
                  composers.push(realm.create("Composer",
                    {
                      id: new BSON.ObjectId(),
                      name: comp.name,
                      bio: comp.bio,
                      birth: comp.birth,
                      death: comp.death,
                      dbId: comp.id
                    }) as Composer)
                });
              }
              headerInputStates.handleSetCurrentTune("composers", [...composers, ...headerInputStates.selectedComposers]);
              navigation.navigate("EditorUnwrapped");
            }}
            text='Save selection'
          />
            <DeleteButton style={{flex: 1}} onPress={() => {
              navigation.navigate("EditorUnwrapped");
            }}>
              <ButtonText>Cancel changes</ButtonText>
            </DeleteButton>
          </View>
          <Button onPress={() => setAddComposerExpanded(!addComposerExpanded)}
            text={addComposerExpanded ? "(Collapse)" : "Can't find my composer below"}
          />
          {
            dbStatus === Status.Failed &&
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{flex:1}}>
                <SubText style={{fontWeight: 300, textAlign: "center", color: "red"}}>
                  DISCONNECTED
                </SubText>
              </View>
              <Button style={{flex:1}} onPress={() => {OnlineDB.updateDispatch(dbDispatch)}}
                text='Retry connection'
              />
            </View>
          }
          {
            dbStatus === Status.Waiting &&
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{flex:1}}>
                <SubText style={{fontWeight: 300, textAlign: "center", color: "goldenrod"}}>
                  CONNECTING
                </SubText>
              </View>
              <Button style={{flex:1, backgroundColor: "#333"}}
                textStyle={{color: "777"}}
                text='(Please wait)'
              />
            </View>
          }
          {
            addComposerExpanded &&
              <BgView>
                {
                  addComposerOptionFlag ?
                    <View>
                      <SubText>This search doesn't seem to match well with any composer you've entered before, or any composer from our database. You can add a new composer by pressing the button below.</SubText>
                      <Button
                        onPress={() => {
                          headerInputStates.setNewComposer(true);
                          headerInputStates.setComposerToEdit({});
                          navigation.navigate("ComposerEditor")
                        }}
                        text='Add *Brand New* composer'
                      />
                    </View>
                    :
                    <View>
                      <SubText>You have very similar search results. Tap and hold the button below to add a brand new composer ONLY if you're sure that it's a different composer from the composers shown in the results.</SubText>
                      <Button
                        onLongPress={() => {
                          headerInputStates.setNewComposer(true);
                          headerInputStates.setComposerToEdit({});
                          navigation.navigate("ComposerEditor")
                        }}
                        text='Add *brand new* composer'
                      />
                    </View>
                }
              </BgView>
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
  handleSetCurrentTune,
  originalTuneComposers
}: {
  handleSetCurrentTune: Function,
  originalTuneComposers: Composer[]
}){
  const onlineComposers = useContext(OnlineDB.DbStateContext).composers;
  const [selectedAttr, setSelectedAttr] = useState("name");
  const [search, setSearch] = useState("");
  const [selectedComposers, setSelectedComposers]: [Array<Composer>, Function] = useState(originalTuneComposers);
  const [selectedOnlineComposers, setSelectedOnlineComposers]: [composer[], Function] = useState([])
  const [newComposer, setNewComposer] = useState(false);
  const [composerToEdit, setComposerToEdit]: [Composer | undefined, Function] = useState();
  let suggestAddComposer = false;

  function toggleComposerSelect(item: Composer | composer){
    // Realm is picky about checking what items are in arrays.
    // So we need to have two separate arrays so Realm can be sure one of the arrays...
    // only contains Composers.
    if(item instanceof Composer){
      console.log(item.id);
      if(selectedComposers.includes(item)){
        setSelectedComposers(selectedComposers.filter(comp => comp !== item));
      }else{
        console.log(`Concat ${item.name}`);
        console.log(selectedComposers);
        setSelectedComposers(selectedComposers.concat(item));
      }
    }else{
      if(selectedOnlineComposers.includes(item)){
        setSelectedOnlineComposers(selectedOnlineComposers.filter(comp => comp !== item));
      }else{
        setSelectedOnlineComposers(selectedOnlineComposers.concat(item));
      }
    }
  }
  function isSelected(item: Composer | composer){
    if(item instanceof Composer){
      if(selectedComposers.includes(item)){
      }
      //TODO: Make less janky? Why do we need to iterate once over the array to determine if it's present?
      //TODO: USE a set instead!
      return (selectedComposers.includes(item) || selectedComposers.some(sC => sC.id.equals(item.id)));
    }
    return selectedOnlineComposers.includes(item);
  }


  const localComposers = (useQuery("Composer").map(res => res as Composer))
  const localDbIds = localComposers.filter(lComp => lComp.dbId).map(lComp => lComp.dbId);
  let displayComposers = [...localComposers,
    ...(onlineComposers.filter(oComp => !localDbIds.includes(oComp.id)))].filter(comp => !isSelected(comp));
  const fuse = new Fuse(displayComposers, fuseOptions);
  if(search === ""){
    itemSort(displayComposers, "name", false);
    displayComposers = [...selectedComposers, ...selectedOnlineComposers, ...displayComposers]
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
    displayComposers = displayComposers.filter(comp => !isSelected(comp));
    displayComposers.unshift(...selectedComposers);
    displayComposers.unshift(...selectedOnlineComposers);
  }

  const headerInputStates = 
  {
    setSearch: setSearch,
    setNewComposer: setNewComposer,
    handleSetCurrentTune: handleSetCurrentTune,
    selectedComposers: selectedComposers,
    selectedOnlineComposers: selectedOnlineComposers,
    setComposerToEdit: setComposerToEdit
  }
  const Stack = createNativeStackNavigator();
  const navigation = useNavigation() as any;
  const theme = useTheme();
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
                  key={item.id as any}
                  onPress={() => {toggleComposerSelect(item)}}
                  onLongPress={() => {
                    if(item instanceof Composer){
                      setComposerToEdit(item);
                      navigation.navigate("ComposerEditor")
                    }
                  }}
                  onShowUnderlay={separators.highlight}
                  onHideUnderlay={separators.unhighlight}>
                  <View style={{backgroundColor: (isSelected(item) ? theme.panelBg : theme.bg), padding: 8}}>
                    <Text>{item.name}</Text>
                    <LocalityIndicators item={item}/>
                    <SubText>{dateDisplay(item.birth)}</SubText>
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
            prettyAttrs={(composerEditorAttrs)}
            playlists={[]}
            setNewComposer={setNewComposer}
            newComposer={newComposer}
          />
        }
      </Stack.Screen>

  </Stack.Navigator>
  );
}

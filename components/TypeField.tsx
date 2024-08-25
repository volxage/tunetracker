//Copyright 2024 Jonathan Hilliard
import {
  TextInput,
  DeleteButton,
  ButtonText,
  Button,
  Title,
  Text,
  SubText,
  SMarginView
} from '../Style.tsx'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, {useEffect, useState} from 'react';
import Slider from '@react-native-community/slider';
import RNPickerSelect from 'react-native-picker-select';
import {
  FlatList,
  Switch,
  View,
} from 'react-native';
import { playlist, tune } from '../types.tsx';
import Playlists from '../Playlists.tsx';
import OnlineDB from '../OnlineDB.tsx';
const tuneDefaults = {
  "title": "New song",
  "alternative_title": "",
  "composers": [],
  "form": [],
  "notable_recordings": [],
  "keys": [],
  "styles": [],
  "tempi": [],
  "contrafacts": [], 
  "has_lyrics": false,
  "playthroughs": 0,
  "form_confidence": 0,
  "melody_confidence": 0,
  "solo_confidence": 0,
  "lyrics_confidence": 0,
  "played_at": [], 
  "id": "THIS SHOULD NOT BE HERE" // If the user sees this text at any point, there's an error in the program
}

function AddPlaylistField({
  newPlaylist,
  tunePlaylists,
  playlists,
  setTunePlaylists
}: {
  newPlaylist:boolean,
  tunePlaylists: playlist[],
  setTunePlaylists: Function,
  playlists: Playlists
}){
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("")
  if(newPlaylist){
    return(
      <View style={{padding: 8, flexDirection: "row"}}>
        <View style={{flex: 3}}>
          <TextInput
            placeholder='Enter New Playlist Name'
            placeholderTextColor={"grey"}
            onChangeText={setNewPlaylistTitle}
          />
        </View>
        <View style={{alignContent: 'flex-end', flex: 1}}>
          <Button onPress={() => {
            if(newPlaylistTitle.trim().length != 0){
              const tmpPlaylist = playlists.addPlaylist(newPlaylistTitle);
              if(typeof tmpPlaylist !== "undefined"){
                setTunePlaylists(tunePlaylists.concat(tmpPlaylist));
              }
            }
          }}>
            <ButtonText><Icon name="plus" size={30}/></ButtonText>
          </Button>
        </View>
      </View>
    );
  }else{
    let availablePlaylists = playlists.getPlaylists()
      .filter(playlist => !(tunePlaylists.includes(playlist)));
    return (
      <RNPickerSelect
        onValueChange={
          // When the component rerenders, onValueChange is called with a value of "".
          (value) => {value !== "" && setTunePlaylists(tunePlaylists.concat(value))}
        }
        items={
          availablePlaylists
            .map((playlist) => {return {label:playlist.title, value: playlist}})
        }
        useNativeAndroidPickerStyle={false}
        placeholder={{label: "Select a playlist to insert tune into", value: ""}}
        style={{inputAndroid:
          {backgroundColor: 'transparent', color: 'white', fontSize: 18, fontWeight: "300"}
        }}
      />
    );
  }
}

//TODO: Refactor, there should not be this many props
function TypeField({
  attr,
  attrKey,
  attrName,
  handleSetCurrentTune,
  playlists,
  tunePlaylists,
  setTunePlaylists,
  navigation
}: {
  attr: unknown,
  attrKey: keyof tune,
  attrName: string,
  handleSetCurrentTune: Function,
  playlists: Playlists,
  tunePlaylists: playlist[],
  setTunePlaylists: Function,
  navigation: any
}){
  if(attr == null){
    attr = tuneDefaults[attrKey];
  }
  if (attrKey === "db_id" as keyof tune){
    const [connectTuneExpanded, setConnectTuneExpanded] = useState(false);
    let stand = null;
    if(typeof attr !== "undefined" && attr !== 0){
      stand = OnlineDB.getStandardById(attr as number);
    }
    return(
      <View>
        <Title>DATABASE CONNECTION</Title>
        <Button
          onPress={() => {setConnectTuneExpanded(!connectTuneExpanded)}}
          style={{backgroundColor: "#222"}}
        >
          <ButtonText>
          <Icon
            name={connectTuneExpanded ? "earth-minus" : "earth-plus"}
            size={30}
          />
          </ButtonText>
        </Button>
      {
        connectTuneExpanded &&
        <View>
          {
            (stand === null || typeof stand === "undefined") ?
            <View>
              <SMarginView>
                <SubText>You haven't connected this tune to the database yet! Connecting a tune allows you to request changes to the online copy of the tune, meaning other users can use your updated tune information, and new users can import more accurate information! It also gives you the ability to import changes from the database uploaded from other users.</SubText>
              </SMarginView>
              <Button
                onPress={() => {navigation.navigate("ImportID")}}
              >
                <ButtonText>Connect to a tune</ButtonText>
              </Button>
            </View>
            :
            <View>
              <SubText>Connected!</SubText>
              <SubText>Title: {stand.title}</SubText>
              <SubText>Bio: {stand.bio}</SubText>
              <SubText>Year: {stand.year}</SubText>
              <Button onPress={() => {navigation.navigate("Compare")}}>
                <ButtonText>Compare and Change</ButtonText>
              </Button>
            </View>
          }
        </View>
      }
      </View>
    )
  }
  else if (attrKey === "playlists" as keyof tune){ //Playlists are NOT an attribute of a tune
    const [newPlaylistOpen, setNewPlaylistOpen] = useState(false)
    //TODO:
    // Delete Button
    return(
      <View style={{padding: 8}}>
        <View style={{paddingBottom:20}}>
          <Title>PLAYLISTS</Title>
        </View>
        <FlatList
          data={tunePlaylists}
          renderItem={({item}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:4}}>
                <SubText>{item.title}</SubText>
              </View>
              <View style={{flex:1}}>
                <DeleteButton onPress={
                  () => {setTunePlaylists(tunePlaylists
                                         .filter(playlist => playlist !== item))}
                }>
                  <ButtonText><Icon name="close" size={30}/></ButtonText>
                </DeleteButton>
              </View>
            </View>
          )}
        />
        <View style={{flexDirection:"row", alignSelf: "center"}}>
          <Text>Existing playlist</Text>
          <Switch value={newPlaylistOpen} onValueChange={setNewPlaylistOpen}/>
          <Text>New playlist</Text>
        </View>
        <AddPlaylistField
          tunePlaylists={tunePlaylists}
          playlists={playlists}
          newPlaylist={newPlaylistOpen}
          setTunePlaylists={setTunePlaylists}
        />
      </View>
    );
  }
  else if (typeof attr === "string"){
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <TextInput defaultValue={attr} placeholderTextColor={"grey"}
          onChangeText={(text) => handleSetCurrentTune(attrKey, text)}
        />
      </View>
    );
  }else if (typeof attr == "number"){
    const [icon, setIcon] = useState();

    useEffect(() => {
      Icon.getImageSource('circle', 26, 'white')
        .then(setIcon);
    }, []);
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={attr as number}
          onSlidingComplete={(value) => {handleSetCurrentTune(attrKey, value)}}
          thumbImage={icon}
          style={{marginVertical: 20}}
          minimumTrackTintColor='cadetblue'
          maximumTrackTintColor='gray'
        />
      </View>
    );
  }
  else if (typeof attr === "boolean") {
    const [bool, setBool] = useState(attr)
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <View style={{flexDirection: "row"}}>
          <Switch
            onValueChange={(value) => {setBool(value); handleSetCurrentTune(attrKey, value)}}
            value={bool}
          />
        </View>
      </View>
    );
  }
  else if (Array.isArray(attr)){
//    const [arrAttr, setarrAttr] = useState(attr);

    function handleReplace(value: string, index: number){
      const newArrAttr = (attr as string[]).map((c, i) => {
        return i === index ? value : c;
      });
      handleSetCurrentTune(attrKey, newArrAttr);
      //setarrAttr(newArrAttr); handeSetCurrentTune causes a rerender, indirectly updating arrAttr.
    }
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 3}}>
            <Title>{attrName.toUpperCase()}</Title>
          </View>
          <View style={{alignContent: 'flex-end', flex: 1}}>
            <Button onPress={() => handleSetCurrentTune(attrKey, (attr as string[]).concat(["New item"]))}>
              <ButtonText><Icon name="plus" size={30}/></ButtonText>
            </Button>
          </View>
        </View>
        <FlatList
          data={attr}
          renderItem={({item, index, separators}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 3}}>
                <TextInput
                  placeholder={"Type new value here"}
                  placeholderTextColor={"grey"}
                  defaultValue={item}
                  onChangeText={(text) => handleReplace(text, index)}/>
              </View>
              <View style={{flex:1, alignContent: 'flex-end'}}>
                <DeleteButton onPress={
                    () => handleSetCurrentTune(attrKey, (attr as string[]).filter((a, i) => i !== index))
                }>
                  <ButtonText><Icon name="close" size={30}/></ButtonText>
                </DeleteButton>
              </View>
            </View>
          )}
        />
      </View>
    )
  }
}

export default TypeField;

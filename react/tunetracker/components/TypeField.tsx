import {
  TextInput,
  DeleteButton,
  ButtonText,
  Button,
  Title,
  Text,
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
  "playthroughs": 0,
  "form_confidence": 0,
  "melody_confidence": 0,
  "solo_confidence": 0,
  "lyrics_confidence": 0,
  "played_at": [], 
  "id": "THIS SHOULD NOT BE HERE" // If the user sees this text at any point, there's an error in the program
}

function AddPlaylistField({newPlaylist, tunePlaylists, playlists, setTunePlaylists}:
                          {newPlaylist:boolean, tunePlaylists: playlist[], setTunePlaylists: Function, playlists: Playlists}){
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
            const tmpPlaylist = playlists.addPlaylist(newPlaylistTitle);
            if(typeof tmpPlaylist !== "undefined"){
              setTunePlaylists(tunePlaylists.concat(tmpPlaylist))
              console.log(tunePlaylists)
            }
          }}>
            <ButtonText><Icon name="plus" size={30}/></ButtonText>
          </Button>
        </View>
      </View>
    );
  }else{
    let availablePlaylists = playlists.getPlaylists().filter((playlist) => {return !(tunePlaylists.includes(playlist))})
    console.log("Available playlists" + availablePlaylists)
    return (
      <RNPickerSelect
        onValueChange={
          // When the component rerenders, onValueChange is called with a value of "".
          (value) => {value !== "" && setTunePlaylists(tunePlaylists.concat(value))}
        }
        items={availablePlaylists.map((playlist) => {return {label:playlist.title, value: playlist}})}
        useNativeAndroidPickerStyle={false}
        placeholder={{label: "Select a playlist to insert tune into", value: ""}}
        style={{inputAndroid: {backgroundColor: 'transparent', color: 'white', fontSize: 18, fontWeight: "300"}}}
      />
    );
  }
}

function TypeField({id, attr, attrKey, attrName, handleSetCurrentTune, playlists}:
                   {id: string | undefined, attr: unknown, attrKey: keyof tune, attrName: string, handleSetCurrentTune: Function, playlists: Playlists}){
  if(attr == null){
    attr = tuneDefaults[attrKey];
  }
  if (attrKey === "playlists" as keyof tune){ //Playlists are NOT an attribute of a tune
    const [newPlaylistOpen, setNewPlaylistOpen] = useState(false)
    const [tunePlaylists, setTunePlaylists]: [playlist[], Function] = useState([])
    useEffect(() => {
      if (typeof id !== "undefined"){ //If there's no id, it's impossible that the tune has been assigned playlists already.
        setTunePlaylists(playlists.getTunePlaylists(id))
      }
    }, [])
    //TODO:
    // Delete Button
    // RNPicker onValueChange
    console.log("Rerender playlist field")
    console.log("Tune playlists:" + tunePlaylists)
    return(
      <View style={{padding: 8}}>
        <Title>PLAYLISTS</Title>
        <FlatList
          data={tunePlaylists}
          renderItem={({item, index, separators}) => (
            <View>
              <View style={{flexDirection: 'row'}}>
                <Text>{item.title}</Text>
                <DeleteButton>
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
  }else if (Array.isArray(attr)){
    const [arrAttr, setarrAttr] = useState(attr);

    function handleReplace(value: string, index: number){
      const newArrAttr = arrAttr.map((c, i) => {
        return i === index ? value : c;
      });
      setarrAttr(newArrAttr);
      handleSetCurrentTune(attrKey, arrAttr);
    }
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 3}}>
            <Title>{attrName.toUpperCase()}</Title>
          </View>
          <View style={{alignContent: 'flex-end', flex: 1}}>
            <Button onPress={() => setarrAttr((arrAttr as string[]).concat(["New item"]))}>
              <ButtonText><Icon name="plus" size={30}/></ButtonText>
            </Button>
          </View>
        </View>
        <FlatList
          data={arrAttr}
          renderItem={({item, index, separators}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 3}}>
                <TextInput placeholder={"Type new value here"} placeholderTextColor={"grey"} defaultValue={item} onChangeText={(text) => handleReplace(text, index)}/>
              </View>
              <View style={{flex:1, alignContent: 'flex-end'}}>
                <DeleteButton onPress={() => setarrAttr((arrAttr as string[]).filter((a) => {return a !== item})) } >
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

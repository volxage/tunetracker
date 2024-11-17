//Copyright 2024 Jonathan Hilliard
import {
  TextInput,
  DeleteButton,
  ButtonText,
  Button,
  Title,
  Text,
  SubText,
} from '../Style.tsx'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, {useEffect, useState} from 'react';
import Slider from '@react-native-community/slider';
import {
  FlatList,
  Switch,
  View,
} from 'react-native';
import { composer, playlist, tune_draft, tune_draft_extras } from '../types.ts';
import DbConnection from './TypeFields/DbConnection.tsx';
import ComposerField from './TypeFields/ComposerField.tsx';
import Composer from '../model/Composer.ts';
import Playlist from '../model/Playlist.ts';
import {useQuery, useRealm} from '@realm/react';
import {BSON, List} from 'realm';
import { Picker } from '@react-native-picker/picker';
import DateField from './TypeFields/DateField.tsx';

function AddPlaylistField({
  newPlaylist,
  tunePlaylists,
  handleSetCurrentItem
}: {
  newPlaylist:boolean,
  tunePlaylists: (playlist | Playlist)[],
  handleSetCurrentItem: Function
}){
  const realm = useRealm();
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const tunePlaylistIds = tunePlaylists.map(pl => pl.id);

  const playlistQuery = useQuery(Playlist);
  const availablePlaylists = playlistQuery
    .filtered("!(id in $0)", tunePlaylistIds);
  //let availablePlaylists = []
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
            //If playlist name isn't empty and doesn't already exist
            if(newPlaylistTitle.trim().length !== 0 && !playlistQuery.filtered("title == $0", newPlaylistTitle.trim()).length){
              realm.write(() => {
                const result = realm.create(Playlist, {title: newPlaylistTitle, id: new BSON.ObjectId()});
                if(tunePlaylists){
                  handleSetCurrentItem("playlists",tunePlaylists.concat(result));
                }else{
                  handleSetCurrentItem("playlists",[result]);
                }
              })
              setNewPlaylistTitle("")
            }
          }}>
            <ButtonText><Icon name="plus" size={30}/></ButtonText>
          </Button>
        </View>
      </View>
    );
  }else{
    return (
      <View style={{borderColor: "white", borderWidth: 1, margin: 28}}>
        <Picker
          onValueChange={
            // When the component rerenders, onValueChange is called with a value of "".
            (value: Playlist | "") => {value !== "" && handleSetCurrentItem("playlists", tunePlaylists.concat(value))}
          }
        >
          {
            availablePlaylists.map(
              (playlist) => 
              <Picker.Item label={playlist.title} value={playlist} key={playlist.id.toString()}
                style={{color: "white", backgroundColor:"black"}}
              />
              )
          }
        </Picker>
      </View>
    );
  }
}


//TODO: Refactor, there should not be this many props
function TypeField({
  attr,
  attrKey,
  attrName,
  handleSetCurrentItem,
  navigation,
  isComposer
}: {
  attr: unknown,
  attrKey: keyof (tune_draft & composer & tune_draft_extras),
  attrName: string,
  handleSetCurrentItem: Function,
  navigation: any,
  isComposer: boolean
}){
  const allPlaylists = useQuery(Playlist);
  const [icon, setIcon] = useState();
  const [bool, setBool] = useState(attr as boolean)
  const [newPlaylistOpen, setNewPlaylistOpen] = useState(false)
  useEffect(() => {
    Icon.getImageSource('circle', 26, 'white')
      .then(setIcon);
  }, []);
  type keyOfEitherDraft = keyof (tune_draft | composer)
  if (attrKey === "dbId" as keyOfEitherDraft){
    return(
      <DbConnection attr={attr} navigation={navigation} isComposer={isComposer} />
    );
  }
  else if (attrKey === "composers" as keyOfEitherDraft){
    return(
      <ComposerField attr={attr as (Composer | composer)[]} navigation={navigation} />
    );
  }
  else if (attr instanceof Date || attrKey === "birth" || attrKey === "death"){
    return(
      <DateField
        attr={attr as (Date | undefined)}
        attrKey={attrKey}
        handleSetCurrentItem={handleSetCurrentItem}
        navigation={navigation}/>
    );
  }
  else if (attrKey === "playlists" as keyOfEitherDraft && attr){ //Playlists are NOT an attribute of a tune
    const ids = (attr as (Playlist | playlist)[]).map(pl => pl.id);
    //TODO:
    // Delete Button
    return(
      <View style={{padding: 8}}>
        <View style={{paddingBottom:20}}>
          <Title>PLAYLISTS</Title>
        </View>
        <FlatList
          data={attr as (playlist | Playlist)[]}
          renderItem={({item}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:4}}>
                <SubText>{item.title}</SubText>
              </View>
              <View style={{flex:1}}>
                <DeleteButton onPress={
                    () => {
                      ids.splice(ids.findIndex(id => id.equals(item.id)))
                      handleSetCurrentItem("playlists",
                        allPlaylists.filtered("id IN $0", ids)
                      );
                    }}>
                  <ButtonText><Icon name="close" size={30}/></ButtonText>
                </DeleteButton>
              </View>
            </View>
          )}
        />
        <View style={{flexDirection:"row", alignSelf: "center"}}>
          <Text style={{fontWeight: "300"}}>Existing playlist</Text>
          <Switch value={newPlaylistOpen} onValueChange={setNewPlaylistOpen}/>
          <Text style={{fontWeight: "300"}}>New playlist</Text>
        </View>
        <AddPlaylistField
          tunePlaylists={attr as (Playlist | playlist)[]}
          newPlaylist={newPlaylistOpen}
          handleSetCurrentItem={handleSetCurrentItem}
        />
      </View>
    );
  }
  else if (typeof attr === "string"){
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Title style={{textAlign: "center"}}>{attrName.toUpperCase()}</Title>
        <TextInput defaultValue={attr} placeholderTextColor={"grey"}
          onChangeText={(text) => handleSetCurrentItem(attrKey, text)}
          style={{textAlign: "center", fontWeight: "300"}}
        />
      </View>
    );
  }else if (typeof attr == "number"){
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={attr as number}
          onSlidingComplete={(value) => {handleSetCurrentItem(attrKey, value)}}
          thumbImage={icon}
          style={{marginVertical: 20, marginHorizontal: 16}}
          minimumTrackTintColor='cadetblue'
          maximumTrackTintColor='gray'
        />
      </View>
    );
  }
  else if (typeof attr === "boolean") {
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <View style={{flexDirection: "row", alignSelf: 'center'}}>
          <Switch
            onValueChange={(value) => {setBool(value); handleSetCurrentItem(attrKey, value)}}
            value={bool}
            trackColor={{false: "#444"}}
          />
        </View>
      </View>
    );
  }
  else if (Array.isArray(attr) || attr instanceof List){
//    const [arrAttr, setarrAttr] = useState(attr);
    function handleReplace(value: string, index: number){
      const newArrAttr = (attr as string[]).map((c, i) => {
        return i === index ? value : c;
      });
      handleSetCurrentItem(attrKey, newArrAttr);
      //setarrAttr(newArrAttr); handeSetCurrentTune causes a rerender, indirectly updating arrAttr.
    }
    return(
      <View style={{backgroundColor: 'black', padding: 8}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}></View>
          <View style={{flex: 2}}>
            <Title>{attrName.toUpperCase()}</Title>
          </View>
          <View style={{alignContent: 'flex-end', flex: 1}}>
            <Button onPress={() => handleSetCurrentItem(attrKey, (attr as string[]).concat(["New item"]))}>
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
                    () => handleSetCurrentItem(attrKey, (attr as string[]).filter((a, i) => i !== index))
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

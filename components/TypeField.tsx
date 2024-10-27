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
import {
  FlatList,
  Switch,
  View,
} from 'react-native';
import { composer, playlist, tune_draft } from '../types.tsx';
import DbConnection from './TypeFields/DbConnection.tsx';
import ComposerField from './TypeFields/ComposerField.tsx';
import DatePicker from 'react-native-date-picker';
import dateDisplay from '../dateDisplay.tsx';
import Composer from '../model/Composer.ts';
import Playlist from '../model/Playlist.ts';
import {useQuery, useRealm} from '@realm/react';
import {BSON, List, Results} from 'realm';
import { Picker } from '@react-native-picker/picker';

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

  const availablePlaylists = useQuery(Playlist)
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
            if(newPlaylistTitle.trim().length !== 0){
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
    //<RNPickerSelect
    //  items={
    //    availablePlaylists
    //      .map((playlist) => {return {label:playlist.title, value: playlist}})
    //  }
    //  useNativeAndroidPickerStyle={false}
    //  placeholder={{label: "Select a playlist to insert tune into", value: ""}}
    //  style={{inputAndroid:
    //    {backgroundColor: 'transparent', color: 'white', fontSize: 18, fontWeight: "300"}
    //  }}
    ///>
    return (
      <View style={{borderColor: "white", borderWidth: 1, margin: 28}}>
        <Picker
          onValueChange={
            // When the component rerenders, onValueChange is called with a value of "".
            (value) => {value !== "" && handleSetCurrentItem("playlists", tunePlaylists.concat(value))}
          }
        >
          {
            availablePlaylists.map(
              (playlist) => 
              <Picker.Item label={playlist.title} value={playlist} key={playlist.id}
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
  attrKey: keyof (tune_draft | composer),
  attrName: string,
  handleSetCurrentItem: Function,
  navigation: any,
  isComposer: boolean
}){
  const allPlaylists = useQuery(Playlist);
  const [icon, setIcon] = useState();
  const [bool, setBool] = useState(attr)
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
  else if (attr instanceof Date){
    const [dateCopy, setDateCopy] = useState(new Date(attr.valueOf()));
    const [dateOpen, setDateOpen] = useState(false);
    return(
      <View>
        <DatePicker
          modal
          mode="date"
          date={dateCopy}
          open={dateOpen}
          timeZoneOffsetInMinutes={0}
          onConfirm={(date) => {
            setDateOpen(false)
            setDateCopy(date);
            handleSetCurrentItem(attrKey, date);
          }}
          onCancel={() => {
            setDateOpen(false);
          }}
        />
        <Title>{(attrKey as string).toUpperCase()}</Title>
        <View style={{flexDirection: "row"}}>
          <View style={{flex: 1, alignItems: "left", alignSelf: "center"}}>
            <View style={{borderColor: "grey", borderWidth: 1, padding: 8}}>
              <SubText>{dateDisplay(attr)}</SubText>
            </View>
          </View>
          <Button style={{flex:1}} onPress={() => setDateOpen(true)}>
            <ButtonText>Set date</ButtonText>
          </Button>
        </View>
      </View>
    );
  }
  else if (attrKey === "playlists" as keyOfEitherDraft){ //Playlists are NOT an attribute of a tune
    const [newPlaylistOpen, setNewPlaylistOpen] = useState(false)
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
          <Text>Existing playlist</Text>
          <Switch value={newPlaylistOpen} onValueChange={setNewPlaylistOpen}/>
          <Text>New playlist</Text>
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
        <Title>{attrName.toUpperCase()}</Title>
        <TextInput defaultValue={attr} placeholderTextColor={"grey"}
          onChangeText={(text) => handleSetCurrentItem(attrKey, text)}
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
          style={{marginVertical: 20}}
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
        <View style={{flexDirection: "row"}}>
          <Switch
            onValueChange={(value) => {setBool(value); handleSetCurrentItem(attrKey, value)}}
            value={bool}
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
          <View style={{flex: 3}}>
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

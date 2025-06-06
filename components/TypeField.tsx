//Copyright 2024 Jonathan Hilliard
import {
  TextInput,
  DeleteButton,
  ButtonText,
  Title,
  Text,
  SubText,
  BgView,
  SMarginView
} from '../Style.tsx'
import { Button } from '../simple_components/Button.tsx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React, {useEffect, useState} from 'react';
import Slider from '@react-native-community/slider';
import {
  FlatList,
  Switch,
  View,
} from 'react-native';
import { composer, playlist, prettyKeyMap, tune_draft, tune_draft_extras } from '../types.ts';
import DbConnection from './TypeFields/DbConnection.tsx';
import ComposerField from './TypeFields/ComposerField.tsx';
import Composer from '../model/Composer.ts';
import Playlist from '../model/Playlist.ts';
import {useQuery, useRealm} from '@realm/react';
import {BSON, List} from 'realm';
import { Picker } from '@react-native-picker/picker';
import DateField from './TypeFields/DateField.tsx';
import {useNavigation} from '@react-navigation/native';
import DbDrafts from './TypeFields/DbDrafts.tsx';
import {useTheme} from 'styled-components';

function AddPlaylistField({
  newPlaylist,
  tunePlaylists,
  handleSetCurrentItem
}: {
  newPlaylist:boolean,
  tunePlaylists: (playlist | Playlist)[],
  handleSetCurrentItem: Function
}){
  const theme = useTheme();
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
            accessibilityLabel='Enter new playlist name'
          />
        </View>
        <View style={{alignContent: 'flex-end', flex: 1}}>
          <Button
            onPress={() => {
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
            }}
            iconName='plus'
          />
        </View>
      </View>
    );
  }else{
    return (
      <View>
        <SMarginView>
          <SubText style={{textAlign: "center", marginTop: 8}}>Select an existing playlist below, if there are any left. If not, press above to create a new playlist.</SubText>
        </SMarginView>
        <View style={{borderColor: theme.text, borderWidth: 1, margin: 28}}>
          {
            availablePlaylists.length > 0 ?
          <Picker
            onValueChange={
              // When the component rerenders, onValueChange is called with a value of "".
              (value: Playlist | "") => {value !== "" && handleSetCurrentItem("playlists", tunePlaylists.concat(value))}
            }
            accessibilityLabel='Select existing playlist'
            placeholder='Select an existing playlist'
            itemStyle={{color: theme.text}}
          >
            {
              availablePlaylists.map(
                (playlist) => 
                <Picker.Item label={playlist.title} value={playlist} key={playlist.id.toString()}
                  style={{color: theme.text, backgroundColor:theme.bg}}
                />
                )
            }
          </Picker>
            :
            <SubText style={{margin: 8}}>No playlists remaining to add to tune! Click "Switch to creating new Playlist" above to make a new playlist to use.</SubText>
          }
        </View>
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
  isComposer
}: {
  attr: unknown,
  attrKey: keyof (tune_draft & composer & tune_draft_extras),
  attrName: string,
  handleSetCurrentItem: Function,
  isComposer: boolean
}){
  const theme = useTheme();
  const allPlaylists = useQuery(Playlist);
  const [icon, setIcon] = useState();
  const [bool, setBool] = useState(attr as boolean)
  const [newPlaylistOpen, setNewPlaylistOpen] = useState(false)
  const navigation = useNavigation();
  useEffect(() => {
    Icon.getImageSource('circle', 26, 'white')
      .then(setIcon);
  }, []);
  type keyOfEitherDraft = keyof (tune_draft | composer)
  if (attrKey === "dbId" as keyOfEitherDraft){
    return(
      <DbConnection attr={attr} navigation={navigation} isComposer={isComposer} handleSetCurrentItem={handleSetCurrentItem}/>
    );
  }
  else if (attrKey === "dbDraftId" as keyOfEitherDraft){
    return(
      <DbDrafts attr={attr} navigation={navigation} isComposer={isComposer} handleSetCurrentItem={handleSetCurrentItem}/>
    )

  }
  else if (attrKey === "composers" as keyOfEitherDraft){
    return(
      <ComposerField attr={attr as (Composer | composer)[]} navigation={navigation} />
    );
  }
  else if (attr instanceof Date || attrKey === "birth" || attrKey === "death" || attrKey === "playedAt"){
    return(
      <DateField
        attr={attr as (Date | undefined)}
        attrKey={attrKey}
        attrName={attrName}
        handleSetCurrentItem={handleSetCurrentItem}
        navigation={navigation}/>
    );
  }
  else if (attrKey === "mainTempo" || attrKey === "playthroughs"){
    return(
      <BgView style={{padding: 8}}>
        <Title style={{textAlign: "center"}}>{attrName.toUpperCase()}</Title>
        <TextInput defaultValue={String(attr as number)} placeholderTextColor={"grey"}
          keyboardType="numeric"
          value={String(attr)}
          onChangeText={(text) => {
            text = text.replace(/\D/g,'');
            if(Number.isNaN(Number(text))){
              text = "0"
              console.error("Cannot parse number, perhaps non-numeric character snuck through?");
            }
            handleSetCurrentItem(attrKey, Number(text))
          }}
          accessibilityLabel={"Enter main tempo"}
          style={{textAlign: "center", fontWeight: "300", borderColor: "grey", borderWidth: 1, marginHorizontal: 32}}
        />
      </BgView>
    );
  }
  else if (attrKey === "playlists" as keyOfEitherDraft && attr){
    const ids = (attr as (Playlist | playlist)[]).map(pl => pl.id);
    return(
      <SMarginView style={{padding: 8}}>
        <View style={{paddingBottom:20}}>
          <Title>PLAYLISTS</Title>
        </View>
        <FlatList
          data={attr as (playlist | Playlist)[]}
          renderItem={({item}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex:4, alignSelf: "center"}}>
                <Text style={{textAlign: "center", fontWeight: 300}}>{item.title}</Text>
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
          <Button onPress={() => {setNewPlaylistOpen(!newPlaylistOpen)}}
            text={newPlaylistOpen ? "Switch to adding existing Playlists" : "Switch to creating new Playlist"}
            style={{flex:1}}
          />
        </View>
        <AddPlaylistField
          tunePlaylists={attr as (Playlist | playlist)[]}
          newPlaylist={newPlaylistOpen}
          handleSetCurrentItem={handleSetCurrentItem}
        />
      </SMarginView>
    );
  }
  else if (attrKey === "tempi"){
    function handleReplace(value: number, index: number){
      const newArrAttr = (attr as number[]).map((c, i) => {
        return i === index ? value : c;
      });
      handleSetCurrentItem(attrKey, newArrAttr);
      //setarrAttr(newArrAttr); handeSetCurrentTune causes a rerender, indirectly updating arrAttr.
    }
    return(
      <View style={{padding: 8}}>
        <View style={{flexDirection: 'row', paddingLeft: 32}}>
          <View style={{flex: 3, alignSelf: "center"}}>
            <Title>{attrName.toUpperCase()}</Title>
          </View>
          <View style={{flex: 1}}>
            <Button
              onPress={() => handleSetCurrentItem(attrKey, (attr as number[]).concat([0]))}
              iconName="plus"
            />
          </View>
        </View>
        <FlatList
          data={attr as number[]}
          renderItem={({item, index, separators}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 3, alignSelf: "center"}}>
                <TextInput defaultValue={String(attr as number)} placeholderTextColor={"grey"}
                  keyboardType="numeric"
                  accessibilityLabel='Enter a tempo'
                  value={String((attr as number[])[index])}
                  onChangeText={(text) => {
                    text = text.replace(/\D/g,'');
                    if(Number.isNaN(Number(text))){
                      text = "0"
                      console.error("Cannot parse number, perhaps non-numeric character snuck through?");
                    }
                    handleReplace(Number(text), index)
                  }}
                  style={{textAlign: "center", fontWeight: "300", borderWidth: 1, borderColor: "grey", marginLeft: 32}}
                />
              </View>
              <View style={{flex:1, alignContent: 'flex-end'}}>
                <DeleteButton onPress={
                    () => handleSetCurrentItem(attrKey, (attr as number[]).filter((a, i) => i !== index))
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
  else if (attrKey === "keyCenters"){
    const [keyEditing, setKeyEditing] = useState(-1);
    //Should either be a 12-item array of integers, or undefined.
    let arr = attr as (number[] | undefined)
    if(!arr || arr.length !== 12){
      arr = [0,0,0,0,0,0,0,0,0,0,0,0];
    }
    const arr1 = arr.slice(0,4);
    const arr2 = arr.slice(4,8);
    const arr3 = arr.slice(8,12);
    const colorConfMap = new Map([
      [0, theme.detailText],
      [1, theme.off],
      [2, theme.pending],
      [3, theme.soloConf],
      [4, theme.on],
    ]);
    const items1 = arr1.map((conf, i) => {return(
      <Button key={i} text={prettyKeyMap.get(i)} style={{borderColor: colorConfMap.get(conf), flex: 1}} onPress={() => {
        setKeyEditing(i);
      }}/>
    )});
    const items2 = arr2.map((conf, i) => {return(
      <Button key={i + 4} text={prettyKeyMap.get(i + 4)} style={{borderColor: colorConfMap.get(conf), flex: 1}} onPress={() => {
        //+ 6 to offset the array slice from earlier
        setKeyEditing(i + 4);
      }}/>
    )})
    const items3 = arr3.map((conf, i) => {return(
      <Button key={i + 8} text={prettyKeyMap.get(i + 8)} style={{borderColor: colorConfMap.get(conf), flex: 1}} onPress={() => {
        //+ 6 to offset the array slice from earlier
        setKeyEditing(i + 8);
      }}/>
    )})
    if(keyEditing < 0 || keyEditing > 11){
      return(
        <View style={{marginHorizontal: 32}}>
          <Title>KEYS</Title>
          <View style={{flexDirection: "row"}}>
            {items1}
          </View>
          <View style={{flexDirection: "row"}}>
            {items2}
          </View>
          <View style={{flexDirection: "row"}}>
            {items3}
          </View>
      </View>
      )
    }else{
      return(
        <View>
          <Title>KEYS</Title>
          <View style={{flexDirection: "row"}}>
          {
            Array.from(colorConfMap.entries()).map(([i, color]) => 
              <Button key={i} text={prettyKeyMap.get(keyEditing)} style={{borderColor: color, flex:1}} onPress={() => {
                //Replace array with new array where currently editing key is replaced by the selected confidence
                handleSetCurrentItem(attrKey, arr.map((val, arrIndex) => arrIndex === keyEditing ? i : val));
                setKeyEditing(-1);
              }}/>
            )
          }
          </View>
        </View>
    )
    }
  }
  else if (typeof attr === "string"){
    return(
      <View style={{padding: 8}}>
        <Title style={{textAlign: "center"}}>{attrName.toUpperCase()}</Title>
        <TextInput defaultValue={attr} placeholderTextColor={"grey"}
          onChangeText={(text) => handleSetCurrentItem(attrKey, text)}
          style={{textAlign: "center", fontWeight: "300", borderColor: "grey", borderWidth: 1, marginHorizontal: 32}}
          accessibilityLabel={"Enter " + attrName}
        />
      </View>
    );
  }else if (typeof attr == "number"){
    return(
      <View style={{padding: 8}}>
        <Title>{attrName.toUpperCase()}</Title>
        <Slider
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={attr as number}
          onSlidingComplete={(value) => {handleSetCurrentItem(attrKey, value)}}
          thumbImage={icon}
          style={{marginVertical: 20, marginHorizontal: 16, backgroundColor: "black"}}
          minimumTrackTintColor='cadetblue'
          maximumTrackTintColor='gray'
          thumbTintColor={theme.text || "gray"}
        />
      </View>
    );
  }
  else if (typeof attr === "boolean") {
    return(
      <View style={{padding: 8}}>
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
      <View style={{padding: 8}}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 3, alignSelf: "center", marginLeft: 32}}>
            <Title>{attrName.toUpperCase()}</Title>
          </View>
          <View style={{flex:1}}>
            <Button
              onPress={() => handleSetCurrentItem(attrKey, (attr as string[]).concat(["New item"]))}
              accessibilityLabel={"Create new entry for the " + attrName}
              iconName='plus'
            />
          </View>
        </View>
        <FlatList
          data={attr}
          renderItem={({item, index, separators}) => (
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 3, alignSelf: "center", marginLeft: 32}}>
                <TextInput
                  placeholder={"Type new value here"}
                  placeholderTextColor={"grey"}
                  defaultValue={item}
                  accessibilityLabel={"Enter entry " + index + " for this item's " + attrName}
                  style={{borderColor: "grey", borderWidth: 1, textAlign: "center"}}
                  onChangeText={(text) => handleReplace(text, index)}/>
              </View>
              <View style={{flex:1, alignContent: 'flex-end'}}>
                <DeleteButton
                  onPress={
                    () => handleSetCurrentItem(attrKey, (attr as string[]).filter((a, i) => i !== index))
                  }
                  accessibilityLabel={"Delete " + attrName + " entry " + index + " which says: " + item}
                >
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

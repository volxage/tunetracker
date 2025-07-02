import {FlatList, TextInput, View} from "react-native";
import {SMarginView, Title, Text, DeleteButton, ButtonText, SubText} from "../../Style";
import Playlist from "../../model/Playlist";
import {playlist} from "../../types";
import { Button } from "../../simple_components/Button";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useTheme} from "styled-components";
import {useQuery, useRealm} from "@realm/react";
import {useContext, useState} from "react";
import {BSON} from "realm";
import {Picker} from "@react-native-picker/picker";
import TuneDraftContext from "../../contexts/TuneDraftContext";

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
            placeholderTextColor={theme.detailText}
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

export default function PlaylistField({
  attr
}:{
  attr: (Playlist | playlist)[]
}){
  const ids = attr.map(pl => pl.id);
  const [newPlaylistOpen, setNewPlaylistOpen] = useState(false)
  const allPlaylists = useQuery(Playlist);
  const tdc = useContext(TuneDraftContext);
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
            tdc.updateTd("playlists",
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
      handleSetCurrentItem={tdc.updateTd}
    />
    </SMarginView>
);
}

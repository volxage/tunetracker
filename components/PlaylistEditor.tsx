import {View} from "react-native";
import {Title, TextInput, Button, ButtonText, DeleteButton, SubText} from "../Style";
import {useQuery, useRealm} from "@realm/react";
import Playlist from "../model/Playlist";
import {useState} from "react";
import TuneListDisplay from "./TuneListDisplay";
import Tune from "../model/Tune";
import {List} from "realm";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import buff from "buffer";
import {useNavigation} from "@react-navigation/native";
const tmpPlaylistPath = RNFS.TemporaryDirectoryPath + "/tmp_playlist.json";




export default function PlaylistEditor(
  {
    playlist,
    setTuneToEdit
  }:
  {
    playlist: Playlist,
    setTuneToEdit: Function
  }){
  const [newTitle, setNewTitle] = useState(playlist.title);
  const [newDescription, setNewDescription] = useState(playlist.description);
  const [plSelectedTunes, setPlSelectedTunes]: [(List<Tune>), Function] = useState(playlist.tunes);
  const realm = useRealm();
  const allTunes = useQuery(Tune)
  const navigation = useNavigation();
  const [playlistUploaded, setPlaylistUploaded] = useState(false);
  const [playlistPublic, setPlaylistPublic] = useState(false);
  return(
    <View style={{backgroundColor: "black"}}>
      <View style={{flexDirection: "row"}}>
        <Button style={{flex:1}} onPress={() => {
          realm.write(() => {
            const idsToRemove = []
            for(const tuneToRemove of playlist.tunes){
              if(!plSelectedTunes.some(plSelected => plSelected.id.equals(tuneToRemove.id))){
                if(tuneToRemove.playlists){
                  tuneToRemove.playlists.remove(tuneToRemove.playlists.findIndex(pl => pl.id.equals(playlist.id)));
                }
              }
            }
            for(const tuneToAdd of plSelectedTunes){
              if(!playlist.tunes.some(plSelected => plSelected.id.equals(tuneToAdd.id))){
                if(tuneToAdd.playlists){
                  tuneToAdd.playlists.push(playlist);
                  console.log(tuneToAdd.playlists);
                }else{
                  tuneToAdd["playlists"] = new Realm.List<Playlist>;
                  tuneToAdd["playlists"].push(playlist);
                  console.log(tuneToAdd.playlists);
                }
              }
            }
            playlist.title = newTitle;
            playlist.description = newDescription;
          });
          navigation.goBack();
        }}>
          <ButtonText>
            Save
          </ButtonText>
        </Button>
        <DeleteButton style={{flex:1}} onPress={() => {navigation.goBack()}}>
          <ButtonText>
            Cancel
          </ButtonText>
        </DeleteButton>
      </View>
      <View style={{flexDirection: "row"}}>
        {
          false &&
          <View>
            {
              !playlistUploaded ?
              <View style={{flexDirection: "row", flex:1}}>
                <Button style={{flex: 1, backgroundColor: "#111"}} onPress={() => {
                }}>
                  <ButtonText style={{color: "#777"}}>
                    Delete From TT
                  </ButtonText>
                </Button>
                {
                  playlistPublic ?
                  <Button style={{flex:1}}>
                    <ButtonText>
                      Make private
                    </ButtonText>
                  </Button>
                  :
                  <Button style={{flex:1}}>
                    <ButtonText>
                      Make public
                    </ButtonText>
                  </Button>
                }
              </View>
              :
              <View style={{flex:1}}>
                <DeleteButton style={{backgroundColor: "#111"}} onPress={() => {
                }}>
                  <ButtonText style={{color: "#777"}}>
                    Upload
                  </ButtonText>
                </DeleteButton>
              </View>
            }
          </View>
        }
      </View>
      <DeleteButton onLongPress={() => {
        navigation.goBack();
        realm.write(() => {
          realm.delete(playlist);
        })
      }}>
        <ButtonText>Delete From Phone</ButtonText>
      </DeleteButton>
      <SubText style={{textAlign: "center", color: "grey", marginBottom: 20}}>
        Press and hold if sure!
      </SubText>
      <Title>TITLE</Title>
      <TextInput
        value={newTitle}
        onChangeText={text => {setNewTitle(text)}}
      />
      <Title>DESCRIPTION</Title>
      <TextInput
        value={newDescription}
        onChangeText={text => {setNewDescription(text)}}
      />
      <Title>TUNES</Title>
      <TuneListDisplay
        setSelectedTune={setTuneToEdit}
        setNewTune={() => {}}
        allowNewTune={false}
        selectMode={true}
        selectedTunes={plSelectedTunes.map(tune => tune)}
        setSelectedTunes={setPlSelectedTunes}
      />
  </View>
  );
}

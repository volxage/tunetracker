import {FlatList, View} from "react-native";
import {Title, Text, SubText, TextInput, Button, ButtonText, DeleteButton} from "../Style";
import {useQuery, useRealm} from "@realm/react";
import Playlist from "../model/Playlist";
import {useState} from "react";
import TuneListDisplay from "./TuneListDisplay";
import Tune from "../model/Tune";
import {List, Results} from "realm";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import buff from "buffer";
const tmpPlaylistPath = RNFS.TemporaryDirectoryPath + "/tmp_playlist.json";




export default function PlaylistEditor(
  {
    playlist,
    navigation,
    setTuneToEdit
  }:
  {
    playlist: Playlist,
    navigation: any,
    setTuneToEdit: Function
  }){
  const [newTitle, setNewTitle] = useState(playlist.title);
  const [newDescription, setNewDescription] = useState(playlist.description);
  const [plSelectedTunes, setPlSelectedTunes]: [(List<Tune>), Function] = useState(playlist.tunes);
  const realm = useRealm();
  const allTunes = useQuery(Tune)
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
        <Button style={{flex: 1}} onPress={() => {
          const json = plSelectedTunes.map(tune => {
            return {
              "dbId": tune.dbId,
              "title": tune.title,
              "alternativeTitle": tune.alternativeTitle,
              "composers": tune.composers?.map(comp => {return {"name": comp.name, "dbId": comp.dbId}}),
              "form": tune.form,
              "year": tune.year,
              "hasLyrics": tune.hasLyrics,
              "mainKey": tune.mainKey,
              "keys": tune.keyCenters, 
              "mainTempo": tune.mainTempo,
              "tempi": tune.tempi,
            }
          });
          const base64 = new buff.Buffer(JSON.stringify(json)).toString("base64");
          Share.open({url: `data:application/json;base64,${base64}`}).catch(err => {
          });
          RNFS.writeFile(tmpPlaylistPath, JSON.stringify(json), "base64")
            .then(() => {
              RNFS.readFile(tmpPlaylistPath, "base64").then(result => {
                
            });
            });
        }}>
          <ButtonText>
            Share (Coming soon!)
          </ButtonText>
        </Button>
      </View>
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
        navigation={navigation}
        setSelectedTune={setTuneToEdit}
        setNewTune={() => {}}
        allowNewTune={false}
        selectMode={true}
        selectedTunes={plSelectedTunes}
        setSelectedTunes={setPlSelectedTunes}
      />
  </View>
  );
}

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
import RNDP, {DocumentPickerResponse} from "react-native-document-picker";
import buff from "buffer";
import {tune_draft} from "../types";
import {useNavigation} from "@react-navigation/native";
const tmpPlaylistPath = RNFS.TemporaryDirectoryPath + "/tmp_playlist.json";


export default function PlaylistImporter({}: {}){
  const [importedPlaylist, setImportedPlaylist]: [tune_draft[], Function] = useState([]);
  const [commonSongs, setCommonSongs]: [Tune[], Function] = useState([]);
  const [unlearnedSongs, setUnlearnedSongs]: [tune_draft[], Function] = useState([]);
  const navigation = useNavigation();
  return (
    <View>
      <Text>Common Songs</Text>
      {
        commonSongs.map(song => 
          <SubText>{song.title} by {song.composers?.map(comp => comp.name).join(", ")}</SubText>
        )
      }
      <Text>Songs you don't know</Text>
      {
        unlearnedSongs.map(tn => {
          return(<SubText>{tn.title}</SubText>);
        })
      }
      <Button
        onPress={async () => {
          RNDP.pick({
            mode: 'open',
          }).catch(err => {
            console.error(err);
          }).then(result => {
            if(result && result.length > 0){
              RNFS.readFile(result[0].uri, "base64").then(res => {
                //TODO:
                // Find all local songs with dbIds that exist in this list.
                // Place thenm in commonSongs
                //
                // Take other songs and put them in unlearnedSongs, consider a type that uses composer_draft[] instead of Composer[]
                setUnlearnedSongs(JSON.parse(new buff.Buffer(res, 'base64').toString('utf8')));
              });
            }
            console.log(result);
          })
        }}
      >
        <ButtonText>Try opening</ButtonText>
      </Button>
      <DeleteButton onPress={() => navigation.goBack()}>
        <ButtonText>Go back</ButtonText>
      </DeleteButton>
    </View>
  );
}


function ImportedPlaylistViewer(
  {
    playlist,
    setTuneToEdit
  }:
  {
    playlist: Playlist,
    setTuneToEdit: Function
  }){
}

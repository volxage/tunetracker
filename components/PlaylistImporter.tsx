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
import RNDP from "react-native-document-picker";
import buff from "buffer";
const tmpPlaylistPath = RNFS.TemporaryDirectoryPath + "/tmp_playlist.json";


export default function PlaylistImporter({navigation}: {navigation: any}){
  const [importedPlaylist, setImportedPlaylist] = useState([]);
  return (
    <View>
      <Text>{JSON.stringify(importedPlaylist)}</Text>
      <Button
        onPress={async () => {
          RNDP.pick({
            mode: 'open',
          }).catch(err => {
            console.error(err);
          }).then(result => {
            console.log(result);
          }
          )
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
    navigation,
    setTuneToEdit
  }:
  {
    playlist: Playlist,
    navigation: any,
    setTuneToEdit: Function
  }){
}

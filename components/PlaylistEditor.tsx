import {View} from "react-native";
import {Title, TextInput, ButtonText, DeleteButton, SubText, BgView} from "../Style";
import {Button} from "../simple_components/Button"
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
import {tune_draft} from "../types";
import OnlineDB from "../OnlineDB";
const tmpPlaylistPath = RNFS.TemporaryDirectoryPath + "/tmp_playlist.json";


type playlist_submission = {
  //Tunes by dbId
  onlineTunes: number[],
  //Drafts that haven't been accepted (or submitted)
  userTunes: tune_draft[]
}


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
    <BgView>
      <View style={{flexDirection: "row"}}>
        <Button style={{flex:1}} onPress={() => {
          realm.write(() => {
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
        }}
        text="Save"
      />
        <DeleteButton style={{flex:1}} onPress={() => {navigation.goBack()}}>
          <ButtonText>
            Cancel
          </ButtonText>
        </DeleteButton>
      </View>
      <View style={{flexDirection: "row"}}>
        {
          true &&
          <>
            {
              playlistUploaded ?
              <View style={{flexDirection: "row", flex:1}}>
                <Button style={{flex: 1, backgroundColor: "#111"}} onPress={() => {
                }} text="Delete from TT" textStyle={{color: "#777"}}/>
                {
                  playlistPublic ?
                  <Button style={{flex:1}} text="Make private"/>
                  :
                  <Button style={{flex:1}} text="Make public" onPress={() => {

                  }}/>
                }
              </View>
              :
              <View style={{flex:1}}>
                <Button text='Upload' style={{backgroundColor: "#111"}} onPress={() => {
                  const newSubmission = {onlineTunes: [], userTunes: []} as playlist_submission;
                  for(let tn of plSelectedTunes){
                    if(tn.dbId && tn.dbId !== 0){
                      newSubmission.onlineTunes.push(tn.dbId);
                    }else{
                      newSubmission.userTunes.push(
                        {
                          title: tn.title,
                          alternative_title: tn.alternativeTitle,
                          id: tn.id,
                          form: tn.form,
                          //bio: tn.bio,
                          composers: !tn.composers ? undefined : tn.composers.map(comp => {
                            if("dbId" in comp){
                              return comp["dbId"]
                            }
                            return comp.id;
                          })
                        } as tune_draft
                      )
                    }
                  }
                  console.log(newSubmission);
                }}/>
              </View>
            }
          </>
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
        accessibilityLabel="Enter title"
        onChangeText={text => {setNewTitle(text)}}
      />
      <Title>DESCRIPTION</Title>
      <TextInput
        value={newDescription}
        accessibilityLabel="Enter description"
        onChangeText={text => {setNewDescription(text)}}
      />
      <TuneListDisplay
        setSelectedTune={setTuneToEdit}
        setNewTune={() => {}}
        allowNewTune={false}
        selectMode={true}
        selectedTunes={plSelectedTunes.map(tune => tune)}
        setSelectedTunes={setPlSelectedTunes}
      />
  </BgView>
  );
}

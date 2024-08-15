/**
 * Tunetracker
 * https://github.com/volxage/tunetracker
 *
 * @format
 */

import React, {isValidElement, useEffect, useState} from 'react';
import {
  Button,
  DeleteButton,
  ButtonText,
  SubText,
} from '../Style.tsx'
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableHighlight,
} from 'react-native';

type viewingPair = {
  viewing: number;
  setViewing: Function;
}
import TypeField from './TypeField.tsx';
import SongsList from '../SongsList.tsx';
import Playlists from '../Playlists.tsx';
import { tune, playlist } from '../types.tsx';

function Editor({
  prettyAttrs, 
  viewingPair,
  selectedTune,
  songsList,
  playlists,
  newTune,
  setNewTune
}: {
  prettyAttrs: Array<[string, string]>,
  viewingPair: viewingPair,
  selectedTune: tune,
  songsList: SongsList,
  playlists: Playlists,
  newTune: boolean,
  setNewTune: Function
}): React.JSX.Element {
  //Intentional copy to allow cancelling of edits
  const [currentTune, setCurrentTune] = useState(JSON.parse(JSON.stringify(selectedTune)) as tune)
  const [tunePlaylists, setTunePlaylists]: [playlist[], Function] = useState([])
  const [originalPlaylistsSet, setOriginalPlaylistsSet]: [Set<playlist>, Function] = useState(new Set())
  useEffect(() => {
    //If there's no id, it's impossible that the tune has been assigned playlists already.
    if (typeof selectedTune.id !== "undefined"){ 
      const tmpTunesPlaylist = playlists.getTunePlaylists(selectedTune.id);
      setTunePlaylists(tmpTunesPlaylist);
      setOriginalPlaylistsSet(new Set(tmpTunesPlaylist));
    }
  }, [])
  function handleSetCurrentTune(attr_key: keyof tune, value: undefined){
    //Inefficient solution, but there are no Map functions such as "filter" in mapped types
    const cpy = JSON.parse(JSON.stringify(currentTune)) as tune;
    cpy[attr_key] = value;
    setCurrentTune(cpy);
  }
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: "black"}}>
      <FlatList
        data={prettyAttrs}
        renderItem={({item, index, separators}) => (
          <View>
            { (item[0] != "lyrics_confidence" || currentTune.has_lyrics) &&
              <TouchableHighlight
                key={item[0]}
                onShowUnderlay={separators.highlight}
                onHideUnderlay={separators.unhighlight}
              >
                <TypeField
                  attr={currentTune[item[0] as keyof tune]}
                  attrKey={item[0] as keyof tune}
                  attrName={item[1]}
                  handleSetCurrentTune={handleSetCurrentTune}
                  playlists={playlists}
                  tunePlaylists={tunePlaylists}
                  setTunePlaylists={setTunePlaylists}
                />
              </TouchableHighlight>
            }
          </View>
      )}
      ListFooterComponent={
        <View>
          <SubText style={{fontSize: 16, color:'grey', alignSelf: 'center'}}>
            Press and hold if you're sure
          </SubText>
          {
            !newTune && 
            <DeleteButton
              onLongPress={() => {
                songsList.deleteTune(selectedTune);
                viewingPair.setViewing(0);
              }}>
              <ButtonText>DELETE TUNE (CAN'T UNDO!)</ButtonText>
            </DeleteButton>
          }
          <View style={{flexDirection: "row", backgroundColor: "black"}}>
            <View style={{flex: 1}}>
              
              {
              }
        {
          // newTune ? save new tune : update existing tune
          !newTune &&
          <Button
            onPress={() => {
              //TODO: ABSTRACT
              //Save to existing tune
              const tune_id = songsList.replaceSelectedTune(selectedTune, currentTune);
              const newPlaylistSet = new Set(tunePlaylists);
              const removedPlaylists = [...originalPlaylistsSet]
                .filter(oldPlaylist => !newPlaylistSet.has(oldPlaylist));
              const updatedPlaylists = [...newPlaylistSet]
                .filter(newPlaylist => !originalPlaylistsSet.has(newPlaylist));
              for(var playlist of updatedPlaylists){
                console.log("Adding tune to " + playlist.title)
                playlists.addTune(tune_id, playlist.id)
              }
              for(var playlist of removedPlaylists){
                console.log("Removing tune from " + playlist.title)
                playlists.removeTune(tune_id, playlist.id)
              }
              viewingPair.setViewing(!viewingPair.viewing);
            }}
          ><ButtonText>Save</ButtonText>
          </Button>
        }
        {
          newTune &&
            <Button
              onPress={() => {
                //Save to new tune
                const tune_id = songsList.addNewTune(currentTune);
                const newPlaylistSet = new Set(tunePlaylists);
                const addedPlaylists = [...newPlaylistSet]
                  .filter(newPlaylist => !originalPlaylistsSet.has(newPlaylist));
                for(var playlist of addedPlaylists){
                  console.log("Adding tune to " + playlist.title)
                  playlists.addTune(tune_id, playlist.id)
                }
                viewingPair.setViewing(!viewingPair.viewing);
                setNewTune(false);
              }}
            ><ButtonText>Save</ButtonText>
          </Button>
        }
            
            </View>
          <View style={{flex: 1}}>
              <DeleteButton
                onPress={() => {viewingPair.setViewing(!viewingPair.viewing); setNewTune(false);}}
              ><ButtonText>Cancel Edit</ButtonText></DeleteButton>
          </View>
        </View>
      </View>
      }
    />
  </SafeAreaView>
  );
}
export default Editor;

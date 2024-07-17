/**
 * Tunetracker
 * https://github.com/volxage/tunetracker
 *
 * @format
 */

import React, {isValidElement, useEffect, useState} from 'react';
import {
  styles,
  Button,
  DeleteButton,
  ButtonText,
  Text,
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

function Editor({prettyAttrs, viewingPair, selectedTune, songsList, playlists}:
{prettyAttrs: Array<[string, string]>, viewingPair: viewingPair, selectedTune: tune, songsList: SongsList, playlists: Playlists}): React.JSX.Element {
  const [currentTune, setCurrentTune] = useState(JSON.parse(JSON.stringify(selectedTune)) as tune) //Intentional copy to allow cancelling of edits
  const [tunePlaylists, setTunePlaylists]: [playlist[], Function] = useState([])
  useEffect(() => {
    if (typeof selectedTune.id !== "undefined"){ //If there's no id, it's impossible that the tune has been assigned playlists already.
      setTunePlaylists(playlists.getTunePlaylists(selectedTune.id))
    }
    console.log("Tune playlists:")
    console.log(tunePlaylists)
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
            <TouchableHighlight
              key={item[0]}
              onShowUnderlay={separators.highlight}
              style={styles.bordered}
              onHideUnderlay={separators.unhighlight}
            >
              <TypeField
                id={selectedTune.id}
                attr={currentTune[item[0] as keyof tune]}
                attrKey={item[0] as keyof tune}
                attrName={item[1]}
                handleSetCurrentTune={handleSetCurrentTune}
                playlists={playlists}
                tunePlaylists={tunePlaylists}
                setTunePlaylists={setTunePlaylists}
              />
            </TouchableHighlight>
          </View>
      )}
      ListFooterComponent={
        <View>
          <DeleteButton
            onLongPress={() => {songsList.deleteTune(selectedTune); viewingPair.setViewing(0);}} >
            <ButtonText>DELETE TUNE (CAN'T UNDO! Press and hold)</ButtonText>
          </DeleteButton>
          <View style={{flexDirection: "row", backgroundColor: "black"}}>
            <View style={{flex: 1}}>
              <Button
                onPress={() => {
                  const tune_id = songsList.replaceSelectedTune(selectedTune, currentTune);
                  console.log("Added tune_id:")
                  console.log(tune_id)
                  for(var playlist of tunePlaylists){
                    playlists.addTune(tune_id, playlist.id)
                  }
                  viewingPair.setViewing(!viewingPair.viewing);
                }}
              ><ButtonText>Save</ButtonText>
              </Button>
            </View>
          <View style={{flex: 1}}>
            <DeleteButton
              onPress={() => {viewingPair.setViewing(!viewingPair.viewing)}}
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

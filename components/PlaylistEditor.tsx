import {FlatList, View} from "react-native";
import {Title, Text, SubText, TextInput} from "../Style";
import {useQuery} from "@realm/react";
import Playlist from "../model/Playlist";
import {useState} from "react";

export default function PlaylistEditor(
  {
    playlist,
    navigation
  }:
  {
    playlist: Playlist,
    navigation: any
  }){
  const [newTitle, setNewTitle] = useState(playlist.title)
  const [newDescription, setNewDescription] = useState(playlist.description)
  return(
    <View style={{backgroundColor: "black"}}>
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
      <FlatList 
        data={playlist.tunes}
        renderItem={({item}) => 
        <View>
          <Text>{item.title}</Text>
        </View>
      }
    />
  </View>
  );
}
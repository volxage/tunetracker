import {FlatList, SafeAreaView, TouchableHighlight, View} from "react-native";
import {Title, Text, SubText, DeleteButton, ButtonText} from "../Style";
import {useQuery} from "@realm/react";
import Playlist from "../model/Playlist";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import PlaylistEditor from "./PlaylistEditor";
import {useState} from "react";
import {editorAttrs} from "../types";
import Tune from "../model/Tune";
import Editor from "./Editor";

export default function PlaylistViewer(
  {
    navigation
  }:
  {
    navigation: any
  }){
  const allPlaylists = useQuery(Playlist);
  const Stack = createNativeStackNavigator();
  let selectedPlaylist = allPlaylists.length > 0 ? allPlaylists[0] : undefined
  const [tuneToEdit, setTuneToEdit] = useState();
  return(
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={"PlaylistViewerUnwrapped"} >
        {props => <SafeAreaView style={{backgroundColor: "black", flex:1}}>
          <Title>Playlists</Title>
          <DeleteButton
            onPress={() => {navigation.goBack()}}>
            <ButtonText>Go back</ButtonText>
          </DeleteButton>
          <FlatList 
            data={allPlaylists}
            renderItem={({item}) => 
            <TouchableHighlight
              onPress={() => {
                // Preconditions:
                // selectedPlaylist needs to be defined, otherwise we shouldn't load the menu.
                console.assert(typeof selectedPlaylist !== "undefined",
                  "Selected playlist in PlaylistViewer is undefined");
                selectedPlaylist = item;
                navigation.navigate("PlaylistEditor");
              }}>
              <View>
                <Text>{item.title}</Text>
                <SubText>{item.description ? item.description : "(No description provided)"}</SubText>
                <SubText>{(item.tunes && item.tunes.length > 0) ? item.tunes.map(tune => tune.title).join(", ") : "(No tunes yet)"}</SubText>
              </View>
            </TouchableHighlight>}
        />
      </SafeAreaView>
        }
      </Stack.Screen>
      <Stack.Screen name={"PlaylistEditor"}>
        {props => <SafeAreaView style={{backgroundColor: "black", flex: 1}}>
          <PlaylistEditor navigation={props.navigation} playlist={selectedPlaylist as Playlist} setTuneToEdit={setTuneToEdit}/>
      </SafeAreaView>}
    </Stack.Screen>
 <Stack.Screen name="Editor">
   {(props) => <Editor
     prettyAttrs={editorAttrs}
     selectedTune={tuneToEdit as unknown as Tune}
     newTune={false}
     setNewTune={() => {}}
     navigation={props.navigation}
   />}
    </Stack.Screen>
  </Stack.Navigator>
);
}

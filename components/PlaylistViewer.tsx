import {FlatList, SafeAreaView, TouchableHighlight, View} from "react-native";
import {Title, Text, SubText, DeleteButton, ButtonText, SafeBgView} from "../Style";
import {useQuery} from "@realm/react";
import Playlist from "../model/Playlist";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import PlaylistEditor from "./PlaylistEditor";
import {useState} from "react";
import {editorAttrs} from "../types";
import Tune from "../model/Tune";
import Editor from "./Editor";
import {useNavigation} from "@react-navigation/native";

export default function PlaylistViewer(
  {
  }:
  {
  }){
  const allPlaylists = useQuery(Playlist);
  const Stack = createNativeStackNavigator();
  let selectedPlaylist = allPlaylists.length > 0 ? allPlaylists[0] : undefined
  const [tuneToEdit, setTuneToEdit] = useState();
  const navigation = useNavigation() as any;
  return(
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={"PlaylistViewerUnwrapped"} >
        {props => <SafeBgView>
          <Title>Playlists</Title>
          <DeleteButton
            onPress={() => {navigation.goBack()}}>
            <ButtonText>Go back</ButtonText>
          </DeleteButton>
          <FlatList 
            data={allPlaylists}
            ListEmptyComponent={
              <View>
                <SubText>No playlists saved on this device!</SubText>
              </View>
            }
            renderItem={({item}) => 
            <TouchableHighlight
              accessibilityLabel={"Playlist named " + item.title}
              onPress={() => {
                // Preconditions:
                // selectedPlaylist needs to be defined, otherwise we shouldn't load the menu.
                console.assert(typeof selectedPlaylist !== "undefined",
                  "Selected playlist in PlaylistViewer is undefined");
                selectedPlaylist = item;
                navigation.navigate("PlaylistEditor");
              }}
            >
              <View>
                <Text>{item.title}</Text>
                <SubText>{item.description ? item.description : "(No description provided)"}</SubText>
                <SubText>{(item.tunes && item.tunes.length > 0) ? item.tunes.map(tune => tune.title).join(", ") : "(No tunes yet)"}</SubText>
              </View>
            </TouchableHighlight>}
        />
      </SafeBgView>
        }
      </Stack.Screen>
      <Stack.Screen name={"PlaylistEditor"}>
        {props => <SafeBgView style={{flex: 1}}>
          <PlaylistEditor playlist={selectedPlaylist as Playlist} setTuneToEdit={setTuneToEdit}/>
      </SafeBgView>}
    </Stack.Screen>
 <Stack.Screen name="Editor">
   {(props) => <Editor
     prettyAttrs={editorAttrs}
     selectedTune={tuneToEdit as unknown as Tune}
     newTune={false}
     setNewTune={() => {}}
   />}
    </Stack.Screen>
  </Stack.Navigator>
);
}

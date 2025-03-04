// Copyright 2024 Jonathan Hilliard

import TuneListDisplay from "../TuneListDisplay";
import {ButtonText, DeleteButton, RowView, SafeBgView, SubBoldText, SubText, Text} from "../../Style";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {Button} from "../../simple_components/Button";
import {useNavigation} from "@react-navigation/native";
import {ScrollView} from "react-native";

export default function TempTutorial({
}:{
}){
  const navigation = useNavigation();
  return(
    <SafeBgView>
      <ScrollView>
        <Text>TUTORIAL:</Text>
        <SubText>Note: We are working on an interactive tutorial for a more useful demonstration.</SubText>
        <Text>Tune List / Main Menu</Text>
        <SubText>Below is the first thing you see when you open the app.</SubText>
        <SubText>You can search by title or composer in the search bar, and select a playlist to show what songs belong to it.</SubText>
        <SubText>You can sort tunes by either pressing the dropdown initially labeled "Title" in the middle-left.</SubText>
        <SubText><Icon size={30} name="music"/>: Sort by melody confidence</SubText>
        <SubText><Icon size={30} name="file-music-outline"/>: Sort by form confidence</SubText>
        <SubText><Icon size={30} name="alpha-s-circle-outline"/>: Sort by solo confidence </SubText>
        <SubText><Icon size={30} name="script-text"/>: Sort by lyrics confidence</SubText>
        <SubText><Icon size={30} name="segment"/>: Toggle showing confidence bars for each tune.</SubText>
        <SubText><Icon size={30} name="menu-swap"/>: Reverse sort order</SubText>
        <SubText><Icon size={30} name="dots-horizontal"/>: Extras mneu - Menu of extra tools, including this tutorial, a profile menu to show your uploaded submissions, a playlist viewer, and a toggle for light mode vs dark mode.</SubText>
        <SubText>Tapping a tune will show most of it's details.</SubText>
        <SubText>Tapping and holding a tune will take you to the editor.</SubText>
        <Text>Editor</Text>
        <SubText><Icon size={30} name="earth-plus"/>: Shows your tune connection to the database. Allows you to connect to a tune, or detach from a currently connected one.</SubText>
        <SubText>A tune connection represents the correlation between your version of the song/composer and the database's. A connection means you can receive updates on an item's information from other users, or upload your own version. It also means when you are importing a new item, your connected item won't appear so you can't accidentally import it twice. When you import an item, it is automatically connected.</SubText>
        <SubBoldText>Playlists</SubBoldText>
        <SubText>Playlists allow you to organize like tunes together, or create set lists. You can select a playlist you already created, or you can switch modes and create a new playlist.</SubText>
        <SubBoldText>Form</SubBoldText>
        <SubText>The form of a tune represents the harmonic and melodic structure. It's typicall a few leters, such as "AABA", where each letter represents a section. In "AABA", this means "A" occurs twice, then "B", then finally "A" one more time before the form repeats. This sort of representation is kind of specific to jazz and the American Songbook.</SubText>
        <SubBoldText>Style</SubBoldText>
        <SubText>Style is NOT genre, it is instead the way in which you play the song. For instance, in some songs you can "swing" it or you can choose to play it in one of the Latin styles. Beacuse there are some different choices, you should set the "Main Style" to the most common style to play a song in, and the other styles can be other common ways of playing it.</SubText>
        <Text>Compare</Text>
        <SubText>Dealing with differences in your tune/composer and the database's differences can be confusing. This menu seeks to simplify the process as much as possible. You can pick and choose which parts of the database you agree with and which parts you're sure you got right. More information can be found within the menu itself in the <Icon size={30} name="information"/> button.</SubText>


        <RowView>
          <DeleteButton onPress={() => {navigation.goBack();}} style={{flex:1}}><ButtonText>Exit Tutorial</ButtonText></DeleteButton>
        </RowView>
      </ScrollView>
    </SafeBgView>
  )
}

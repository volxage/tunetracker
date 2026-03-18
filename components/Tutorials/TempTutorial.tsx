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
        <Text>Tune List / Main Menu</Text>
        <SubText>This is the first thing you see when you open the app.</SubText>
        <SubText>You can search by title or composer in the search bar, and select a playlist to show what songs belong to it.</SubText>
        <SubText>You can sort tunes by either pressing the dropdown initially labeled "Title" in the middle-left.</SubText>
        <SubText><Icon size={30} name="segment"/>: Toggle showing confidence bars for each tune.</SubText>
        <SubText>Tapping a tune will show most of it's details.</SubText>
        <SubText>Tapping and holding a tune will take you to the editor.</SubText>
        <Text>Editor</Text>
        <SubBoldText>Playlists</SubBoldText>
        <SubText>Playlists allow you to organize like tunes together, or create set lists. You can select a playlist you already created, or you can switch modes and create a new playlist.</SubText>
        <SubBoldText>Form</SubBoldText>
        <SubText>The form of a tune represents the harmonic and melodic structure. It's typicall a few leters, such as "AABA", where each letter represents a section. In "AABA", this means "A" occurs twice, then "B", then finally "A" one more time before the form repeats. This sort of representation is kind of specific to jazz and the American Songbook.</SubText>
        <SubBoldText>Style</SubBoldText>
        <SubText>Style is NOT genre, it is instead the way in which you play the song. For instance, in some songs you can "swing" it or you can choose to play it in one of the Latin styles. Beacuse there are some different choices, you should set the "Main Style" to the most common style to play a song in, and the other styles can be other common ways of playing it.</SubText>
        <Text>Draft Status</Text>
        <SubText> A dropdown menu appears when you click the  <Icon size={30} name="cloud"/> button. This will help you if your info is outdated or if you need new </SubText>


        <RowView>
          <DeleteButton onPress={() => {navigation.goBack();}} style={{flex:1}}><ButtonText>Exit Tutorial</ButtonText></DeleteButton>
        </RowView>
      </ScrollView>
    </SafeBgView>
  )
}

// Copyright 2024 Jonathan Hilliard

import TuneListDisplay from "../TuneListDisplay";
import {ButtonText, DeleteButton, RowView, SafeBgView, SubText, Text} from "../../Style";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {Button} from "../../simple_components/Button";
import {useNavigation} from "@react-navigation/native";

export default function TutTuneList({
}:{
}){
  const navigation = useNavigation();
  return(
    <SafeBgView>
      <Text>TUTORIAL:</Text>
      <Text>Tune List / Main Menu</Text>
      <SubText>Below is the first thing you see when you open the app.</SubText>
      <SubText>You can search by title or composer in the search bar, and select a playlist to show what songs belong to it.</SubText>
      <SubText>You can sort tunes by either pressing the dropdown initially labeled "Title" in the middle-left.</SubText>
      <SubText><Icon size={30} name="music"/>: Sort by melody confidence</SubText>
      <SubText><Icon size={30} name="file-music-outline"/>: Sort by form confidence</SubText>
      <SubText><Icon size={20} name="alpha-s-circle-outline"/>: Sort by solo confidence </SubText>
      <SubText><Icon size={30} name="script-text"/>: Sort by lyrics confidence</SubText>
      <SubText><Icon size={30} name="segment"/>: Toggle showing confidence bars for each tune.</SubText>
      <SubText><Icon size={30} name="menu-swap"/>: Reverse sort order</SubText>
      <SubText>Tapping a tune will show most of it's details.</SubText>
      <SubText>Tapping and holding a tune will take you to the editor.</SubText>
      <RowView>
        <DeleteButton onPress={() => {navigation.goBack();}} style={{flex:1}}><ButtonText>Exit Tutorial</ButtonText></DeleteButton>
        <Button style={{flex:1}} text="Continue tutorial"/>
      </RowView>
      <TuneListDisplay
        setSelectedTune={() => {}}
        setNewTune={() => {}}
        allowNewTune={false}
        selectedTunes={[]}
        setSelectedTunes={() => {}}
        selectMode={false}
      />
    </SafeBgView>
  )
}

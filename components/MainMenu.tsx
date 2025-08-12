import {useNavigation} from "@react-navigation/native";
import {RowView, SafeBgView, SMarginView, Title} from "../Style";
import {Pressable} from "react-native";
import {Button} from "../simple_components/Button";

function FancyButton({}:{}){

}
export default function MainMenu({ }:{ }){
  const navigation = useNavigation();
  type buttonStruct_t = {
    iconName: string,
    text: string,
    action: Function
  }
  const buttonStructs = [
    {
      iconName: "folder-music",
      text: "Tunes",
      action: () => {navigation.navigate("TuneListDisplay")}
    },
    //TODO: Let user browse composers without editing a tune!
    // 1. Make ComposerListDisplay screen in App
    // 2. Adapt it so there's no "Save selection" etc
  //{
  //  iconName: ,
  //  text: "Composers",
  //  action: () => {navigation.navigate("ComposerListDisplay")}
  //}
    {
      iconName: "playlist-music",
      text: "Playlist Viewer",
      action: () => {navigation.navigate("PlaylistViewer")}
    },
    {
      //TODO: Find better icon than "book-music"
      iconName: "book-music",
      text: "Setlist Builder",
      action: () => {navigation.navigate("SetlistBuilder")}
    },
    {
      iconName: "account",
      text: "Profile",
      action: () => {navigation.navigate("ProfileMenu")}
    },
    {
      iconName: "cog",
      text: "Settings",
      action: () => {navigation.navigate("Settings")}
    },
    //TODO: Make menu for Queue or Practice that automatically suggests a low-confidence tune (or even composer!)
    //{
    //  iconName: ,
    //  text: "Practice",
    //  action: () => {navigation.navigate("ProfileMenu")}
    //},
  //{
  //  iconName: ,
  //  text: "Settings",
  //  action: () => {navigation.navigate("ProfileMenu")}
  //},
  ] as buttonStruct_t[]
  const buttons = buttonStructs.map(btnStruct => 
    <Button text={btnStruct.text} key={btnStruct.text} iconName={btnStruct.iconName} onPress={btnStruct.action} style={{flex: 1, height: 100}}/>
  )
  const rows = [];
  for(let rowIndex = 0; rowIndex < buttons.length / 2; rowIndex++){
    rows.push(
      <RowView key={rowIndex}>
        {buttons.at(rowIndex * 2)}
        {buttons.at(rowIndex * 2 + 1)}
      </RowView>
    )
  }
  return(
    <SafeBgView>
      <SMarginView>
        <Title>Welcome to TuneTracker!</Title>
        {rows}
      </SMarginView>
    </SafeBgView>
  );
}

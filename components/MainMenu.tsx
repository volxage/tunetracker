import {useNavigation} from "@react-navigation/native";
import {SafeBgView} from "../Style";

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
      iconName: "account",
      text: "Profile",
      action: () => {navigation.navigate("ProfileMenu")}
    },
    //TODO: Make menu for Queue or Practice that automatically suggests a low-confidence tune (or even composer!)
    //{
    //  iconName: ,
    //  text: "Practice",
    //  action: () => {navigation.navigate("ProfileMenu")}
    //},
    //TODO: Rename ExtrasMenu and fix it
  //{
  //  iconName: ,
  //  text: "Settings",
  //  action: () => {navigation.navigate("ProfileMenu")}
  //},
    {
      //TODO: Find better icon than "book-music"
      iconName: "book-music",
      text: "Setlist Builder",
      action: () => {}
    }


  ] as buttonStruct_t[]
  return(
    <SafeBgView>
    </SafeBgView>
  );
}

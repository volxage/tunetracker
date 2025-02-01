import {View} from "react-native";
import {SubText} from "../../Style";

export default function DbDrafts({
  attr,
  navigation,
  isComposer,
  handleSetCurrentItem
}:{
  attr: unknown,
  navigation: any,
  isComposer: boolean,
  handleSetCurrentItem: Function
}){
  if(typeof attr === "undefined" || attr === 0){
    console.log("Draft undefined or 0");
    return(<></>);
  }
  return(
    <View>
      <SubText>
        Draft present
      </SubText>
    </View>
  )
}

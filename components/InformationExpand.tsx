import { FC, ReactNode, useState } from "react"
import {ButtonText, SMarginView} from "../Style"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {View} from "react-native";
import { Button } from "../simple_components/Button";
export default function InformationExpand({
  Content
}: {
  Content: FC
}){
  const [expanded, setExpanded] = useState(false);
  return(
    <View>
      <View style={{paddingHorizontal: 80}}>
        <Button onPress={() => {setExpanded(!expanded)}} style={{backgroundColor: "#222"}} iconName={expanded ? "information-off" : "information"}/>
      </View>
      {
        expanded &&
        <SMarginView style={{borderWidth: 1, borderColor:"#222"}}>
          <Content/>
        </SMarginView>
      }
    </View>
  );
}

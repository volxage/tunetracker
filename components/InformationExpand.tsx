import { FC, ReactNode, useState } from "react"
import {Button, ButtonText, SMarginView} from "../Style"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {View} from "react-native";
export default function InformationExpand({
  Content
}: {
  Content: FC
}){
  const [expanded, setExpanded] = useState(false);
  return(
    <View>
      <View style={{paddingHorizontal: 80}}>
        <Button onPress={() => {setExpanded(!expanded)}} style={{backgroundColor: "#222"}}>
          <ButtonText><Icon name={expanded ? "information-off" : "information"} size={30}/></ButtonText>
        </Button>
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

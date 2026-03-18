import { FC, ReactNode, useState } from "react"
import {ButtonText, SMarginView} from "../Style"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {View} from "react-native";
import { Button } from "../simple_components/Button";
import {useTheme} from "styled-components";
export default function InformationExpand({
  Content
}: {
  Content: FC
}){
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  return(
    <View>
      <View style={{paddingHorizontal: 80}}>
        <Button onPress={() => {setExpanded(!expanded)}} style={{backgroundColor: theme.panelBg}} iconName={expanded ? "information-off" : "information"}/>
      </View>
      {
        expanded &&
        <SMarginView style={{borderWidth: 1, borderColor:theme.panelBg}}>
          <Content/>
        </SMarginView>
      }
    </View>
  );
}

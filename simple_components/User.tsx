import {View} from "react-native";
import {RowView, SubText, Text} from "../Style";
import { user_t } from "../types"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useTheme} from "styled-components";


export default function User({
  user
}:{
  user: user_t
}){
  const theme = useTheme();
  return(
    <RowView style={{padding: 8, margin: 8, borderColor: theme.text, borderWidth: 1}}>
      <SubText><Icon name="account" size={24}/></SubText>
      <View>
        <Text>{user.nickname}</Text>
      </View>
    </RowView>
  );
}

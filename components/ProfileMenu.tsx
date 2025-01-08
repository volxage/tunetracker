import {Button, SafeAreaView, View} from "react-native";
import {ButtonText, DeleteButton, SMarginView, SubText, Text} from "../Style";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useNavigation} from "@react-navigation/native";

export default function ProfileMenu({}:{}){
  const navigation = useNavigation();
  return(
    <SafeAreaView style={{backgroundColor: "black", flex:1}}>
      <SMarginView style={{flexDirection: "row"}}>
        <View style={{flex:1}}>
          <Text style={{"textAlign": "center"}}><Icon name={"account-music"} size={64}/></Text>
        </View>
        <View style={{flex: 3}}>
          <Text>
            Nickname
          </Text>
          <SubText>Email</SubText>
        </View>
      </SMarginView>
      <DeleteButton onPress={navigation.goBack}><ButtonText>Go back</ButtonText></DeleteButton>
    </SafeAreaView>
  );
}

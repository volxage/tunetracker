import {View} from "react-native";
import {ButtonText, DeleteButton, SafeBgView, SubDimText, Title} from "../Style";
import ResponseHandler from "../services/ResponseHandler";
import {Button} from "../simple_components/Button";
import OnlineDB from "../OnlineDB";
import {useContext} from "react";
import {useNavigation} from "@react-navigation/native";

export default function Login({}:{}){
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);
  const navigation = useNavigation();
  return(
    <SafeBgView style={{justifyContent: "center"}}>
      <View>
        <Title>Please log in!</Title>
        <Button text="Log in" onPress={function (){
          OnlineDB.tryLogin(navigation, dbDispatch).then(function(){
            navigation.goBack();
          })
        }}/>
        <DeleteButton onPress={function(){navigation.goBack()}}>
          <ButtonText>
            Skip login
          </ButtonText>
        </DeleteButton>
        <SubDimText>Without logging in, you won't be able to share setlists and your tune edits!</SubDimText>
      </View>
    </SafeBgView>
  )
}

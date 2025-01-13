import {Button, SafeAreaView, View} from "react-native";
import {ButtonText, DeleteButton, SMarginView, SubText, Text} from "../Style";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useNavigation} from "@react-navigation/native";
import {useContext, useEffect, useState} from "react";
import http from "../http-to-server";
import {AxiosError, isAxiosError} from "axios";
import OnlineDB from "../OnlineDB";

type User = {
  email: string,
  nickname: string,
  approved_nickname: boolean,
  pending_review: boolean,
  paid: boolean
}
export default function ProfileMenu({}:{}){
  const navigation = useNavigation();
  const [user, setUser] = useState({} as User);
  const [fetchError, setFetchError] = useState({} as AxiosError);
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);

  function getUserInfo(){
    function catchFunc(e: AxiosError, first: boolean = true){
      if(!first){
        console.error("Sumission failed twice. Giving up");
        console.log("Second error:");
        console.log(e);
        setFetchError(e);
        return;
      }
      else{
        console.log("First submission error:");
        console.log(e);
      }
      if(isAxiosError(e)){
        switch(e.response?.status){
          case 401: {
            OnlineDB.tryLogin(navigation, dbDispatch).then(() => {
              getUserInfo();
            });
          }
          case 404:{
            console.log(e.response.data);
          }
        }
        if(e.message === "Network Error"){
          setFetchError(e);
          console.log("Network error");
        }
      }
    }
    http.get("/users/info").then(res => {
      setUser(res.data as User);
    }).catch(catchFunc)
  };

  useEffect(() => {
    getUserInfo();
  }, []);
  return(
    <SafeAreaView style={{backgroundColor: "black", flex:1}}>
      <SMarginView style={{flexDirection: "row"}}>
        <View style={{flex:1}}>
          <Text style={{"textAlign": "center"}}><Icon name={"account-music"} size={64}/></Text>
        </View>
        <View style={{flex: 3}}>
          <Text>
            {user.nickname ? user.nickname : "Loading nickname..."}
          </Text>
          <SubText>{user.email ? user.email : "Loading email..."}</SubText>
        </View>
      </SMarginView>
      <SMarginView><SubText style={{color: "#888", fontSize: 18}}>Only your username "{user.nickname}" is visible to other users. Your email is only known by you and the server.</SubText></SMarginView>
      <DeleteButton onPress={navigation.goBack}><ButtonText>Go back</ButtonText></DeleteButton>
    </SafeAreaView>
  );
}

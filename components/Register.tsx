import {Platform, SafeAreaView, View} from "react-native";
import {ButtonText, SubText, Text, TextInput} from "../Style";
import {useContext, useEffect, useState} from "react";
import OnlineDB from "../OnlineDB";
import httpToServer from "../http-to-server";
import {useNavigation} from "@react-navigation/native";
import {AxiosError} from "axios";
import {User} from "@react-native-google-signin/google-signin";
import { Button } from "../simple_components/Button";

function register(token: string, nickname: string, navigation: any, login: Function, counter: number = 0){
  if(counter > 10){
    console.error("Attempted registration 10 times");
    return;
  }
  console.log("Registration attempt " + counter);
  if(Platform.OS = "android"){
    //This only gets accepted if the token is valid, and the nickname should never be displayed anywhere unless it was approved.
    console.log("With google token:");
    console.log(token);
    httpToServer.post("/users/", {
      nickname: nickname,
      google_token: token
    }).then(() => {
      navigation.goBack();
    }).catch((err: AxiosError) => {
      const data = err.response?.data as any;
      if((data["message"] as string).startsWith("Google token error: Token used too late, ")){
        OnlineDB.googleSignOut();
        OnlineDB.getUser().then(user => {
          const newToken = (user as User).idToken as string;
          register(newToken, nickname, navigation, login, counter + 1)
        });
      }
      console.log(err.response?.data);
    });
  }
}

export default function Register({}: {}){
  const googleUser = useContext(OnlineDB.DbStateContext).googleUser;
  const DbDispatchContext = useContext(OnlineDB.DbDispatchContext);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("(no email provided)");
  const [nicknameField, setNicknameField] = useState("");
  const navigation = useNavigation();
  //const appleUser = useContext(OnlineDB.DbStateContext);
  useEffect(() => {
    if(typeof googleUser !== "undefined"){
      setEmail(googleUser.user.email);
      setToken(googleUser.idToken as string);
      console.log("token set to: " + token);
    }
  }, [])
  async function login(){return OnlineDB.login(DbDispatchContext)}

  return(
    <SafeAreaView style={{backgroundColor: "#000", flex: 1, padding: 8}}>
      <Text>Register New Account</Text>
      <SubText>We can't find the email {email} on TuneTracker yet. Pick an appropriate nickname if you'd like, and press submit to register your email to TuneTracker.</SubText>
      <Text>Nickname:</Text>
      <TextInput placeholder="Unnamed Tracker" placeholderTextColor="grey" style={{borderColor: "white", borderWidth: 1, margin: 8}}/>
      <Button onPress={() => {register(token, nicknameField, navigation, login)}} text="Submit"/>
    </SafeAreaView>
  )
}

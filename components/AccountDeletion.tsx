import {FlatList, TouchableHighlight, View} from "react-native";
import {ButtonText, DeleteButton, SMarginView, SafeBgView, SubText, Text, Title} from "../Style";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useNavigation} from "@react-navigation/native";
import {useContext, useEffect, useState} from "react";
import http from "../http-to-server";
import {AxiosError, isAxiosError} from "axios";
import OnlineDB from "../OnlineDB";
import {composer, submitted_composer_draft, submitted_tune_draft, tune_draft} from "../types";
import InformationExpand from "./InformationExpand";
import dateDisplay from "../textconverters/dateDisplay";
import {useTheme} from "styled-components";
import {Button} from "../simple_components/Button";
import { TextInput } from "../Style";
import httpToServer from "../http-to-server";
import ResponseBox from "./ResponseBox";

export default function AccountDeletion({}: {}){
  const [verificationInput, setVerificationInput] = useState("");
  const navigation = useNavigation();
  const [attemptResult, setAttemptResult] = useState("");
  const [resultIsError, setResultIsError] = useState(false);
  const [fetchError, setFetchError] = useState({} as AxiosError);
  const dbDispatch = useContext(OnlineDB.DbDispatchContext);
  const [loggedIn, setLoggedIn] = useState(false);

  let first = true;
  async function catchFunc(e: AxiosError){
    if(!first){
      console.error("Sumission failed twice. Giving up");
      console.log("Second error:");
      console.log(e);
      setFetchError(e);
      //Need to bubble up error in case the system tries to login a user all 3 times.
      throw e;
    }
    else{
      console.log("First submission error:");
      console.log(e);
    }
    first = false;
    if(isAxiosError(e)){
      switch(e.response?.status){
        case 401: {
          await OnlineDB.tryLogin(navigation, dbDispatch).then(() => {
            setLoggedIn(true);
          });
          break;
        }
        case 404:{
          console.log(e.response.data);
          break;
        }
      }
      if(e.message === "Network Error"){
        setFetchError(e);
        console.log("Network error");
      }
    }
  }
  useEffect(() => {
    //Just to ensure the user is logged in.
    http.get("/users/info").then(res => {
      setLoggedIn(true);
      //setUser(res.data as User);
    }).catch(catchFunc)
  }, []);

  if(loggedIn){
    return(
      <SafeBgView>
        <Text>DELETE ACCOUNT</Text>
        <SMarginView>
          <SubText>Type "delete my account forever" and press the button to permanently delete your TuneTracker account. You will lose your data forever. Or press "Cancel Account Deletion" if you change your mind.</SubText>
        </SMarginView>
        <TextInput style={{borderColor: "red", borderWidth: 2}} value={verificationInput} onChangeText={(text) => {setVerificationInput(text)}}/>
        <SMarginView>
          {
            verificationInput.trim() === "delete my account forever" ?
            <SubText>Account deletion ready</SubText>
            :
            <SubText>Text doesn't match, account deletion not ready</SubText>
          }
        </SMarginView>
        <ResponseBox
          result={attemptResult}
          isError={resultIsError}
        />
        {
          attemptResult !== "" ?
          <Button style={{borderColor: "grey"}}/>
          :
          <Button text="PERMANENTLY DELETE YOUR ACCOUNT" onPress={() => {
            setAttemptResult("Waiting for response...");
            httpToServer.delete('/users/').then(response => {
              setAttemptResult("Successfully deleted account");
              navigation.goBack();
            }).catch(err => {
              setAttemptResult("Error on deleting account.");
              console.error(JSON.stringify(err));
            });
          }}/>
        }
        <DeleteButton onPress={() => {navigation.goBack();}}><ButtonText>Cancel Account Deletion</ButtonText></DeleteButton>
      </SafeBgView>
    );
  }else{
    return(
      <SafeBgView>
        <Text>Can't delete account, not logged in.</Text>
        <DeleteButton onPress={() => {navigation.goBack();}}><ButtonText>Go back</ButtonText></DeleteButton>
      </SafeBgView>
    );
  }
}

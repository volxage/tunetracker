import {SafeAreaView, View} from "react-native";
import {Button, ButtonText, SubText, Text, TextInput} from "../Style";

export default function Register({}: {}){

  return(
    <SafeAreaView style={{backgroundColor: "#000", flex: 1, padding: 8}}>
      <Text>Register New Account</Text>
      <SubText>You've been automatically signed in, however we can't find the email {"EMAIL"} on TuneTracker yet. Pick an appropriate nickname if you'd like, and press submit to register your email to TuneTracker.</SubText>
      <Text>Nickname:</Text>
      <TextInput style={{borderColor: "white", borderWidth: 1, margin: 8}}/>
      <Button><ButtonText>Submit</ButtonText></Button>
    </SafeAreaView>
  )
}

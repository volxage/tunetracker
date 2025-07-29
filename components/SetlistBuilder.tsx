import {SafeAreaView, View} from "react-native";
import {BgView, ButtonText, DeleteButton, RowView, SubDimText, SubText, TextInput, Title} from "../Style";
import {createContext, useContext, useState} from "react";
import {Button} from "../simple_components/Button";

type user_t = {
  userId: number,
  nickname: string,
  nameShown: boolean
}
type session_t = {
  sessionId: number,
  users: user_t[]
}

enum Mode{
  START,
  HOST,
  WAITING,
  QUICK,
  DONE
}

const SessionContext = createContext({} as session_t)
//modes:
//1: Option to host, or enter host's code
//2: Host mode, where you pick users to be in session
//3: Quick session mode! Split view where top shows known tunes, bottom shows tune suggestions.
//  If everyone marks a tune, then it'll automatically appear at the top, unless/until disputed.
//  Options: "I'd rather not" "Let's play it" "I don't know this tune"
//  Host gets an option to "wrap it up" and the best candidates are displayed.
export default function SetlistBuilder({}:{}){
  const [mode, setMode] = useState(Mode.START);
  return(
    <SessionContext.Provider value={}>
      <BgView>
        <SafeAreaView>
          <ModeParse mode={mode}/>
          <DeleteButton>
            <ButtonText>Go Back</ButtonText>
          </DeleteButton>
        </SafeAreaView>
      </BgView>
    </SessionContext.Provider>
  )
}
function ModeParse({mode}:{mode: Mode}){
  switch(mode){
    case Mode.START: {
      return(<SessionStart/>);
    }
  }
}

function SessionStart({}:{}){
  return(
    <View>
      <Button text="Host new session"/>
      <SubDimText>or...</SubDimText>
      <RowView>
        <TextInput/>
        <Button text="Join by ID"/>
      </RowView>
    </View>
  )
}
function SessionHost({}:{}){
  const session = useContext(SessionContext);
  return(
    <View>
      <Title>Hosting session {session.sessionId}</Title>
      <SubText>Tell your friends to enter the session number {session.sessionId} and join! Start when everyone's ready.</SubText>
      <Button text="Close invite and begin session"/>
    </View>
  )
}

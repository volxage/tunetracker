import {SafeAreaView, View} from "react-native";
import {BgView, ButtonText, DeleteButton, RowView, SubDimText, SubText, TextInput, Title} from "../Style";
import {createContext, useContext, useEffect, useState} from "react";
import {Button} from "../simple_components/Button";
import httpToServer from "../http-to-server";

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
  NORMAL,
  NORMALFINALIZE,
  DONE
}

const SessionContext = createContext({state: {} as session_t, fn: (() => {}) as Function})
//modes:
//1: Option to host, or enter host's code
//2: Host mode, where you pick users to be in session
//3: Quick session mode! Split view where top shows known tunes, bottom shows tune suggestions.
//  If everyone marks a tune, then it'll automatically appear at the top, unless/until disputed.
//  Options: "I'd rather not" "Let's play it" "I don't know this tune"
//  Host gets an option to "wrap it up" and the best candidates are displayed.
export default function SetlistBuilder({}:{}){
  const [mode, setMode] = useState(Mode.START);
  const [session, setSession] = useState({} as session_t);
  useEffect(() => {
  }, [])
  return(
    <SessionContext.Provider value={{state: session, fn: setSession}}>
      <BgView>
        <SafeAreaView>
          <ModeParse mode={mode}/>
          <DeleteButton>
            <ButtonText>Exit</ButtonText>
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
    case Mode.HOST: {
      return(<SessionHost/>);
    }
    case Mode.WAITING: {
      return(<SessionWaiting/>);
    }
    case Mode.QUICK: {
      return(<SessionQuick/>);
    }
    case Mode.NORMAL: {
      return (<SessionNormal/>);
    }
    case Mode.NORMALFINALIZE: {
      return (<SessionNormalFinalize/>);
    }
    case Mode.DONE: {
      return(<SessionDone/>);
    }
  }
}

function SessionStart({}:{}){
  function submit(){
    httpToServer.post("/setlists", {
      name: "",
      description: "",
      open: "",
      active: ""
    })
  }
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
      <Title>Hosting session {session.state.sessionId}</Title>
      <SubText>Tell your friends to enter the session number {session.state.sessionId} and join! Start when all players are in the session.</SubText>
      <Button text="Close invite and begin session"/>
    </View>
  )
}
function SessionWaiting({}:{}){
  const session = useContext(SessionContext);
  return(
    <View>
      <Title>Waiting for session {session.state.sessionId} to start</Title>
      <SubText>Once all players are in the session, tell the host to start it!</SubText>
    </View>
  );
}
function SessionQuick({}:{}){
  const session = useContext(SessionContext);
  const [finalizing, setFinalizing] = useState(false);
  if(!finalizing){
    return(
      <View>
        <Title>Quick session mode</Title>
        <SubText>NOT IMPLEMENTED YET</SubText>
      </View>
    );
  }
  return(
    <View>
      <Title>Host finalizing session</Title>
      <SubText>Discuss with the other players to pick from the songs below. Because you're in quick mode, the host will need to finalize the session.</SubText>
    </View>
  );
}
function SessionNormal({}:{}){
  const session = useContext(SessionContext);
  return(
    <View>
      <Title>Session started</Title>
      <SubText>NOT IMPLEMENTED YET</SubText>
    </View>
  );
}
function SessionNormalFinalize({}:{}){
  //TODO: Add chat?
  const session = useContext(SessionContext);
  return(
    <View>
      <Title>Finalize Session</Title>
      <SubText>NOT IMPLEMENTED YET</SubText>
    </View>
  );
}
function SessionDone({}:{}){
  return(
    <View>
      <Title>Thanks for using TuneTracker!</Title>
      <SubText>Here are your tunes for the session:</SubText>
    </View>
  );
}

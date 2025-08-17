import {FlatList, SafeAreaView, TouchableHighlight, View} from "react-native";
import {ButtonText, DeleteButton, RowView, SafeBgView, SMarginView, SubBoldText, SubDimText, SubText, TextInput, Title} from "../Style";
import {createContext, useContext, useEffect, useState} from "react";
import {Button} from "../simple_components/Button";
import httpToServer from "../http-to-server";
import {useTheme} from "styled-components";
import {useNavigation} from "@react-navigation/native";
import {user_t} from "../types";
import User from "../simple_components/User";
import {isAxiosError} from "axios";
import OnlineDB from "../OnlineDB";

type session_t = {
  sessionId: number,
  mode: Mode,
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
  const [session, setSession] = useState(
    {
      mode: Mode.START,
      users: [{nickname: "User1"}, {nickname: "User2"}]
    } as session_t);
  function updateSession(changes: session_t){
    const newState = {} as session_t;
    //Copy previous session state
    let key: keyof session_t;
    for(key in session){
      newState[key] = session[key];
    }
    for(key in changes){
      newState[key] = changes[key];
    }
    setSession(newState);
  }
  const navigation = useNavigation();
  useEffect(() => {
  }, [])
  return(
    <SessionContext.Provider value={{state: session, fn: updateSession}}>
      <SafeBgView>
        <SafeAreaView>
          <Title>Setlist Builder</Title>
          <ModeParse mode={session.mode}/>
          <DeleteButton onPress={() => {navigation.goBack();}}>
            <ButtonText>Exit</ButtonText>
          </DeleteButton>
        </SafeAreaView>
      </SafeBgView>
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
  const theme = useTheme();
  const [inputId, setInputId] = useState(0);
  const session = useContext(SessionContext);
  const navigation = useNavigation();
  const dispatch = useContext(OnlineDB.DbDispatchContext);
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
      <Button text="Host new session" onPress={() => {
        // TOOD:Request server to create session and get it's id
        httpToServer.post('/setlists/', {
          open: true,
          active: false
        }).then(res => {
            console.log("Successful. Heres res:");
            console.log(res);
            //Extract session id from response
            session.fn({"mode": Mode.HOST, "sessionId": res.data.id})
        }).catch(err => {
            console.error(err);
            if(isAxiosError(err)){
              if(err.response?.data.message === "Not logged in, or invalid session"){
                //TODO: RESPONSE HANDLER!
                OnlineDB.tryLogin(navigation, dispatch, 0).then(() =>{
                  httpToServer.post('/setlists/', {
                    open: true,
                    active: false
                  }).then(res => {
                      //Extract session id from response
                      session.fn({"mode": Mode.HOST, "sessionId": res.data.id})
                    })
                  })
              }
            }
          })
      }}/>
      <SubDimText style={{textAlign: "center"}}>or...</SubDimText>
      <RowView>
        <TextInput style={{borderColor: theme.detailText, borderWidth: 1, flex:2}}
          keyboardType="numeric"
          value={String(inputId)}
          onChangeText={(text) => {
            text = text.replace(/\D/g,'');
            if(Number.isNaN(Number(text))){
              text = "0"
              console.error("Cannot parse number, perhaps non-numeric character snuck through?");
            }
            setInputId(Number(text));
          }}
        />
        <Button text="Join by ID" style={{flex: 1}} onPress={() => {

        }}/>
        <Title>Previous sessions:</Title>
      </RowView>
    </View>
  )
}
function SessionHost({}:{}){
  const session = useContext(SessionContext);
  return(
    <View>
      <Title>Hosting session {session.state.sessionId}</Title>
      <SMarginView>
        <SubText>Tell the other players to enter the session number:</SubText>
        <Title>{session.state.sessionId}</Title>
        <SubText>Start when all players are shown below in the session.</SubText>
      </SMarginView>
      <FlatList data={session.state.users} renderItem={({item}) => {
        return(
          <TouchableHighlight>
            <User user={item}/>
          </TouchableHighlight>
        );
      }}/>
      <Button text="Close invite and begin session" onPress={() => {
        httpToServer.post("/setlists", {
          open: false,
          active: true
        }).then(res =>{
            session.fn({"mode": Mode.QUICK})
          }).catch(err => {
            console.error("Failed to close and activate session");
          })
      }}/>
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
  useEffect(() => {
    httpToServer.get(`/setlists/gettunes/${session.state.sessionId}`);
    console.log(session.state.sessionId);

  },[session.state.sessionId]);
  if(!finalizing){
    return(
      <View>
        <Title>Quick session mode</Title>
      </View>
    );
  }
  return(
    <View>
      <Title>Host finalizing session</Title>
      <SubText>Discuss with the host to pick from the songs below. Because you're in quick mode, the host will need to finalize the session.</SubText>
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

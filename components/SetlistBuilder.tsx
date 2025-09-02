import {FlatList, Pressable, SafeAreaView, TouchableHighlight, View} from "react-native";
import {BgView, ButtonText, DeleteButton, RowView, SafeBgView, SMarginView, SubBoldText, SubDimText, SubText, Text, TextInput, Title} from "../Style";
import {createContext, useContext, useEffect, useState} from "react";
import {Button} from "../simple_components/Button";
import httpToServer from "../http-to-server";
import {useTheme} from "styled-components";
import {useNavigation} from "@react-navigation/native";
import {standard, user_t} from "../types";
import User from "../simple_components/User";
import {AxiosError, isAxiosError} from "axios";
import OnlineDB from "../OnlineDB";
import {useQuery} from "@realm/react";
import Tune from "../model/Tune";
import dateDisplay from "../textconverters/dateDisplay";
import Composer from "../model/Composer";
import {BSON, OrderedCollection} from "realm";

type session_t = {
  sessionId: number,
  mode: Mode,
  users: user_t[],
  tunes: standard[]
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
enum ServerMode{
  WAITING,
  DONE,
  QUICK,
  QUICKFINALIZE,
  NORMAL,
  NORMALFINALIZE,
}

//Mostly the same with some exceptions
const HostModeMap = new Map<ServerMode, Mode>([
  [ServerMode.WAITING, Mode.HOST],
  [ServerMode.DONE, Mode.DONE],
  [ServerMode.QUICK, Mode.QUICK],
  //TODO: Investigate
  [ServerMode.QUICKFINALIZE, Mode.QUICK],
  [ServerMode.NORMAL, Mode.NORMAL],
  [ServerMode.NORMALFINALIZE, Mode.NORMALFINALIZE]
]);

//Almost entirely the same
const PlayerModeMap = new Map<ServerMode, Mode>([
  [ServerMode.WAITING, Mode.WAITING],
  [ServerMode.DONE, Mode.DONE],
  [ServerMode.QUICK, Mode.QUICK],
  //TODO: Investigate
  [ServerMode.QUICKFINALIZE, Mode.QUICK],
  [ServerMode.NORMAL, Mode.NORMAL],
  [ServerMode.NORMALFINALIZE, Mode.NORMALFINALIZE]
]);
type online_session_t = {
  id: number,
  name: string,
  description: string
  open: boolean,
  active: boolean,
  mode: ServerMode
}
type prev_sessions_t = {
  joined: online_session_t[],
  hosted: online_session_t[]
}

const SessionContext = createContext({state: {tunes: [], users: [], mode: Mode.START, sessionId: 0} as session_t, fn: (() => {}) as Function})
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
      users: [{nickname: "User1", id: -1}, {nickname: "User2", id: -2}],
      tunes: [],
      sessionId: -1
    } as session_t);
  function updateSession(changes: session_t, toServer = false){
    const newState = {} as session_t;
    //Copy previous session state
    let key: keyof session_t;
    for(key in session){
      newState[key] = session[key];
    }
    for(key in changes){
      newState[key] = changes[key];
    }
    if(toServer){
      httpToServer.post("/setlists", {changes}).then(res => {
        setSession(newState);
      })
    }else{
      setSession(newState);
    }
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
  const [prevSessions, setPrevSessions] = useState({joined: [], hosted: []} as prev_sessions_t);
  const [owned, setOwned] = useState(true);
  useEffect(() => {
    httpToServer.get("/setlists/").then(res => {
      const data = res.data as prev_sessions_t;
      data.joined = data.joined.filter(st => !data.hosted.some(hst => hst.id === st.id))
      setPrevSessions(res.data);
    }).catch(err => {
      if(err instanceof AxiosError){
        console.log(err.response?.data)
        console.log(JSON.stringify(err));
      }
    })
  },[session.state.sessionId]);
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
          active: false,
          mode: ServerMode.WAITING
        }).then(res => {
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
      </RowView>
      <Title>Previous sessions:</Title>
      <SubBoldText>Showing {owned ? "owned" : "joined"} Setlists</SubBoldText>
      <Button text={`Show ${owned ? "Joined" : "Hosted"} setlists`} onPress={() => {setOwned(!owned)}}/>
      {
        owned ? 
          <FlatList data={prevSessions.hosted} renderItem={({item}) =>
            <Pressable onPress={() => {
              let mode = HostModeMap.get(item.mode);
              if(typeof mode === "undefined"){
                mode = Mode.HOST;
              }
              session.fn({
                sessionId: item.id,
                name: item.name,
                mode: mode
              })
            }}>
              <SMarginView>
                <Text>{item.name}</Text>
                <SubText>{item.description || "(No description)"}</SubText>
                <SubDimText>ID: {item.id}</SubDimText>
              </SMarginView>
            </Pressable>
          }/>
          :
          <FlatList data={prevSessions.joined} renderItem={({item}) =>
            <Pressable onPress={() => {
              let mode = PlayerModeMap.get(item.mode);
              if(typeof mode === "undefined"){
                mode = Mode.WAITING;
              }
              session.fn({
                sessionId: item.id,
                name: item.name,
                mode: mode
              })
            }}>
              <SMarginView>
                <Text>{item.name}</Text>
                <SubText>{item.description || "(No description)"}</SubText>
                <SubDimText>ID: {item.id}</SubDimText>
              </SMarginView>
            </Pressable>
          }
          ListEmptyComponent={() => 
            <View>
              <SubText>No setlists here. Tap above if you are looking for setlists that you <SubBoldText>hosted/created.</SubBoldText></SubText>
            </View>
          }
          />
      }
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
        httpToServer.post("/setlists/update", {
          open: false,
          active: true,
          setlistId: session.state.sessionId,
          mode: Mode.QUICK
        }).then(res =>{
            session.fn({"mode": Mode.QUICK})
        }).catch(err => {
          console.log(err);
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
    httpToServer.get(`/setlists/gettunes/${session.state.sessionId}`).then(res => {
      session.fn({"tunes": res.data})
    })
  },[session.state.sessionId]);
  if(!finalizing){
    return(
      <View>
        <Title>Quick session mode</Title>
        <View>
          <SubBoldText style={{textAlign: "center"}}>Setlist suggested tunes</SubBoldText>
          <SessionTuneList/>
          <SubBoldText style={{textAlign: "center"}}>Your tunes</SubBoldText>
          <LocalTuneList/>
        </View>
        <Button text="FINALIZE"/>
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

function prettyPrint(object: unknown): string{
  if (typeof object == "string") return object as string;
  if (typeof object == "number") return JSON.stringify(object);
  if (object instanceof Composer) return object.name;
  if (Array.isArray(object) || object instanceof OrderedCollection) return object.map(obj => {return prettyPrint(obj)}).join(", ");
  if (object instanceof Date){
    if(dateDisplay(object) === dateDisplay(new Date())) return dateDisplay(object) + " (TODAY)"
    return dateDisplay(object);
  }
  if (typeof object == "boolean") return object ? "Yes" : "No";
  return "(Empty)";
}
function TuneRender({
  tune,
  addIgnoredTune,
  addAddedTune
}:{
  tune: Tune,
    addIgnoredTune: Function,
    addAddedTune: Function
}){
  const [marked, setMarked] = useState(false);
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const sessionContext = useContext(SessionContext);
  const standards = useContext(OnlineDB.DbStateContext).standards;
  return(
    <TouchableHighlight onPress={() => {
      setIsExpanded(!isExpanded);
    }}>
      <BgView style={{backgroundColor: marked ? theme.panelBg : theme.bg, padding: 8}}>
        <RowView>
          <Text>{tune.title}</Text>
          <SubText style={{paddingLeft: 8, textAlignVertical: "center"}}>{tune.confidence}</SubText>
        </RowView>
        <SubText>{prettyPrint(tune["composers"])}</SubText>
      {
        isExpanded && 
          <View>
            <RowView>
                <Button text="Suggest tune" style={{flex:1}} onPress={() => {
                  if(tune.dbId){
                    //TODO: Handle errors for both functions
                    httpToServer.post('/setlists/addtune', {
                      setlistId: sessionContext.state.sessionId,
                      tuneId: tune.dbId,
                      score: 100,
                      index: sessionContext.state.tunes.length
                    }).then(res => {
                        console.log(res.data);
                        addAddedTune(tune);
                        sessionContext.fn({"tunes":
                          sessionContext.state.tunes.concat(OnlineDB.getStandardById(res.data.SetlistTuneTuneId))
                        })
                        //TODO: Use below function after getting pinged from server.
                    //httpToServer.get(`/setlists/gettunes/${sessionContext.state.sessionId}`).then(res => {
                    //  addAddedTune(tune);
                    //  sessionContext.fn({"tunes": res.data})
                    //});
                    }).catch(err => {
                        console.error(JSON.stringify(err));
                        console.log(sessionContext.state)
                      });
                  }else{
                    //TODO: Find way to upload tune as just title and composer for compatibility with unuploaded tunes
                  }
                }}/>
              <Button text="Ignore for now" style={{flex:1}} onPress={() => {addIgnoredTune(tune)}}/>
            </RowView>
          </View>
      }
      </BgView>
    </TouchableHighlight>
  );
}
function SessionTuneRender({
  tune
}:{
  tune: standard
}){
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  return(
    <TouchableHighlight onPress={() => {
      setIsExpanded(!isExpanded);
    }}>
      <BgView>
        <Text>{tune.title}</Text>
        <SubText>{tune.Composers?.map(cmp => cmp.name).join(", ")}</SubText>
      {
        isExpanded && 
          <View>
            <RowView>
              <Button text="I'd rather not." style={{flex:1, borderColor: theme.pending}}/>
              <Button text="Let's play it!" style={{flex:1}}/>
            </RowView>
            <Button text="I don't know this tune" style={{flex:1, borderColor: theme.delete}}/>
          </View>
      }
      </BgView>
    </TouchableHighlight>
  );
}
function SessionTuneList({}:{}){
  const sessionContext = useContext(SessionContext);
  const tunes = sessionContext.state.tunes
  return(
    <View>
      <FlatList data={tunes}
        ListEmptyComponent={() => 
          <SubDimText style={{textAlign: "center"}}>(Empty. Suggest a tune below!)</SubDimText>
        }
        renderItem={({index, item: tune}) => {
        return(<SessionTuneRender tune={tune}/>)
      }}/>
    </View>
  )
}
function LocalTuneList({}:{}){
  const allSongs = useQuery(Tune);
  const [ignoreList, setIgnoreList] = useState([] as BSON.ObjectID[])
  const [addedList, setAddedList] = useState([] as number[]) //standard ids
  const session = useContext(SessionContext);
  function addIgnoredTune(tune: Tune){
    if(!ignoreList.some(id => id.equals(tune.id))){
      setIgnoreList(ignoreList.concat(tune.id));
    }
  }
  function addAddedTune(tune: Tune){
    if(tune.dbId){
      if(!addedList.some(dbId => dbId === tune.dbId)){
        setAddedList(addedList.concat(tune.dbId));
      }
    }else{
      //TODO: handle non-uploaded suggested tunes to be hidden
    }
  }
  let displaySongs = allSongs.filtered("!(id IN $0)", ignoreList)
  .filtered("!(dbId IN $0)", addedList)
  .filtered("!(dbId IN $0)", session.state.tunes.map(tn => tn.id))
  .sorted("confidence", true);
  return(
    <View>
      {
        ignoreList.length > 0 && 
          <SubDimText style={{textAlign: "center"}} onPress={() => {setIgnoreList([])}}>{ignoreList.length} ignored tunes, tap to show all</SubDimText>
      }
      <FlatList data={displaySongs} renderItem={({index, item: tune}) => {
        return(<TuneRender tune={tune} addIgnoredTune={addIgnoredTune} addAddedTune={addAddedTune}/>)
      }}/>
    </View>
  );
}

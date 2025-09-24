import {ClientFunction, HostModeMap, Mode, PlayerModeMap, ServerFunction, ServerMode} from "../components/SetlistBuilder";
import {user_t} from "../types";



//Server needs to know these things:
//What mode the user THINKS is active (to ensure user doesn't accidentally send bad message)
//Function for the server to complete
//Payload (preferrably one data type or simple array?)
type socket_client_message_t = {
  sessionId: number,
  mode: ServerMode,
  type: ClientFunction,
  payload: any
}
//Resuse ServerFunctions for both inbound and outbound?

//User needs to know these things:
//What mode the server is on, in case the user has an outdated mode somehow
//What type of data the server is sending
//The payload
type socket_server_message_t = {
  sessionId: number,
  mode: ServerMode,
  type: ServerFunction,
  payload: any,
  error?: string
}
type status_t = {
  //TODO: Enforce types here.
  text: string,
  serverMode: ServerMode,
  mode: Mode,
  users: any[],
  tunes: any[],
  hostId: number,
  isHost: boolean
}
export default class SetlistSocket{
  ws: WebSocket | undefined = undefined
  navigation: any = undefined
  status: status_t = {text: "Disconnected", mode: ServerMode.WAITING, users: [], tunes: []}
  listeners: Function[] = []
  constructor(navigation: any){
    //Hopefully shouldn't be an issue as this service should only last within a component's focus
    this.navigation = navigation
    this.connect();
  }
  open(){
    this.ws = new WebSocket("wss://api.jhilla.org/tunetracker/setlists");
    this.ws.onopen = () => {
      console.log("Socket open");
      this.updateListeners({text: "Connected"});
    }
    this.ws.onmessage = (rs) =>{
      console.log("WS Message recieved");
      console.log(rs.data);
      const data = JSON.parse(rs.data) as socket_server_message_t;
      switch(data.type){
        case ServerFunction.loginRequest: {
          console.log("Login request recieved");
          this.navigation.navigate("Login")
          break;
        }
        case ServerFunction.userChange: {
          console.log("User change recieved");
          const users: user_t[] = data.payload;
          this.updateListeners({users});
          break;
        }
        case ServerFunction.allInfo: {
          this.updateListeners(data.payload);
        }
      }
    }
    this.ws.onerror = e => {
      // an error occurred
      console.log("A ws error occured...");
      console.log(e.message);
      if(this.ws){ this.ws.close(); }
    };
    this.ws.onclose = (e) => {
      if(e.code !== 100){
        console.log("Unexpected socket closure, reopening");
        this.updateListeners({text: "Reconnecting in 1 second"})
        setTimeout(() => {this.connect()}, 1000)
      }else{
        console.log("Code was 100, socket closure accepted");
      }
    }
  }
  connect(){
    this.updateListeners({text: "Connecting"})
    if(typeof this.ws === "undefined" || (this.ws && this.ws.readyState === 3)){
      console.log("socket closed or undefined");
      if(typeof this.ws === "undefined"){
        console.log("(undefined, not closed");
      }
      this.open()
    }else{
      console.log("Socket already working, not creating double");
    }
  }
  disconnect(){
    if(typeof this.ws !== "undefined"){this.ws.close(100); delete this.ws; console.log("Closed socket");}
  }
  setMode(mode: Mode){
    this.status.mode = mode;
    this.updateListeners(this.status);
  }
  addListener(listener: Function){
    this.listeners.push(listener)
  }
  clearListeners(){
    this.listeners = [];
  }
  //TODO: better typing for parameter
  updateListeners(st: status_t){
    let isHost = false;
    if("isHost" in st){
      isHost = st["isHost"];
    }else{
      isHost = this.status["isHost"];
    }
    for(const attr in st){
      if(attr === "serverMode"){
        if(isHost){
          let mode = HostModeMap.get(st[attr]);
          if( st.serverMode === null ){
            mode = Mode.HOST;
          }
          if(!mode){
            console.error("Invalid host mode conversion");
            mode = Mode.START;
          }
          this.status["mode"] = mode;
        }else{
          let mode = PlayerModeMap.get(st[attr]);
          if( st.serverMode === null ){
            mode = Mode.WAITING;
          }
          if(!mode){
            console.error("Invalid player mode conversion");
            mode = Mode.START;
          }
          this.status["mode"] = mode;
        }
      }else{
        this.status[attr] = st[attr];
      }
    }
    for(const list of this.listeners){
      list(this.status);
    }
  }
  joinSetlist(id: number){
    const msg: socket_client_message_t = {
      sessionId: id,
      type: ClientFunction.joinSession
    }
    if(this.ws){
      this.ws.send(JSON.stringify(msg));
      //Server will send response, maybe handle the successful join or error in the listener?
    }
  }
//modeChange(mode: ServerMode){

//}
}

import {ServerFunction, ServerMode} from "../components/SetlistBuilder";



//Server needs to know these things:
//What mode the user THINKS is active (to ensure user doesn't accidentally send bad message)
//Function for the server to complete
//Payload (preferrably one data type or simple array?)
type socket_client_message_t = {
  sessionId: number,
  mode: ServerMode,
  type: ServerFunction,
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
  payload: any
}
export default class SetlistSocket{
  ws: WebSocket | undefined = undefined
  navigation: any = undefined
  constructor(navigation: any){
    //Hopefully shouldn't be an issue as this service should only last within a component's focus
    this.navigation = navigation
    this.connect();
  }
  open(){
    this.ws = new WebSocket("wss://api.jhilla.org/tunetracker/setlists");
    this.ws.onopen = function(){
      console.log("Socket open");
    }
    this.ws.onmessage = (rs) =>{
      console.log("WS Message recieved");
      console.log(rs.data);
      const data = JSON.parse(rs.data) as socket_server_message_t;
      if(data.type === ServerFunction.loginRequest){
        console.log("Login request recieved");
        this.navigation.navigate("Login")
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
        console.log("Unexpected socket closure, reopening in a second");
        setTimeout(this.open, 1000)
      }else{
        console.log("Code was 100, socket closure accepted");
      }
    }
  }
  connect(){
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
}

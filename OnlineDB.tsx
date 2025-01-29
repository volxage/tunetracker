// Copyright 2024 Jonathan Hilliard
import {createContext} from "react";
import { composer, playlist, standard, standard_composer, standard_composer_draft, standard_draft, Status, tune_draft } from "./types";
import http from "./http-to-server.ts"
import {Platform} from "react-native";
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes, User} from '@react-native-google-signin/google-signin';
import {AxiosError, AxiosResponse, isAxiosError} from "axios";
let standards: standard[] = [];
let composers: standard_composer[] = [];
let status = Status.Waiting
let attemptNo = 0;
const statusListeners = new Set<Function>();

async function googleSignOut(): Promise<null>{
  return GoogleSignin.signOut();
}
async function firstTimeGoogleAuth(): Promise<string>{
  await GoogleSignin.hasPlayServices();
  return GoogleSignin.signIn().then(res => {
    if(res.type === "success" && res.data.idToken){
      return res.data.idToken;
    }else{
      throw new Error("Signin error");
    }
  });
  throw Error("User cancelled google auth")
}
async function getUserToken(): Promise<string>{
  if(Platform.OS === "ios"){
    throw("iOS login not supported yet")
  }else{
    if(GoogleSignin.hasPreviousSignIn()){
      console.log("Has previous signin");
      let currentUser = GoogleSignin.getCurrentUser();
      if(currentUser !== null && currentUser.idToken !== null){
        return currentUser.idToken;
      }
      console.log("No current User, or invalidated user idToken");
      await GoogleSignin.signInSilently().then(async res => {
        if(res.type === "success"){
          console.log("Successful silent signin");
          console.log(res.data.idToken);
          return res.data.idToken;
        }else{
          console.log("Unsuccessful silent signin");
          await GoogleSignin.signIn().then(res => {
            if(res.type === "success"){
              console.log("Successful first-time signin");
              console.log(res.data.idToken);
              return res.data.idToken;
            }else{
              throw new Error("Signin error");
            }
          });
        }
      });
    }else{
      return firstTimeGoogleAuth().then(result => {
        return result;
      });
    }
  }
  return "";
}
async function tryLogin(navigation: any, dispatch: Function, counter = 0){
  await login(dispatch).then(() => {
    console.log("Login function successfully completed");
    return;
  }).catch((err: AxiosError) => {
    console.log("Login error caught in tryLogin");
    console.log(err);
    switch(err.status){
      case 400: {
        console.log("Login attempted to use empty user token");
        throw(err);
      }
      case 404: {
        console.log("User token was processed and doesn't match any of TT's registered  users.");
        navigation.navigate("Register");
      }
    }
  })
}

//TODO:
//What are we returning? Anything? Or just making sure there's no rejections?
async function login(dispatch: Function, counter=0): Promise<string>{
  console.log("Login function begin");
  if(counter > 5){
    console.log("5th login attempt failed, giving up");
    throw Error("5 failed login attempts");
  }
  return getUserToken().then(async user => {
    if(Platform.OS === "ios"){
      throw Error("iOS login not implemented yet");
    }else{
      const googleUserToken = user as string;
      const result = await http.post("/users/login", {
        "google_token": googleUserToken
      });
      console.log("Server authenticated user, session created");
      dispatch({type: "setGoogleUser", value: googleUserToken});
      return googleUserToken;
    }
  }).catch(async err => {
    console.log("Login error");
    console.log(err);
    if(isAxiosError(err)){
      switch(err.response?.status){
        case 404:
        {
          throw Error("User not found in login function");
        }
        case 401:
        {
          const data = err.response?.data as any;
          if((data["message"] as string).startsWith("Google token error: Token used too late, ")){
            console.log("Token used too late");
            await googleSignOut()
            const user = await login(dispatch, counter + 1);
            return user;
          }
        }
        case 400:
        {
          const data = err.response?.data as any;
          console.log(data["message"]);
        }
      }
    }
    console.log("Login error not resolved, bubbling error up");
    throw (err);
  });
  throw new Error("getUserToken function call finished without returning a User")
}


function updateDispatch(dispatch: Function){
  console.log("Updating dispatch (Fetching standards and composers)");
  dispatch({type: "setStatus", value: Status.Waiting});
  fetchTunes().then(res => {
    //Janky workaround until we get a better idea of how promises work
    if(res){
      dispatch({type: "updateStandards", value: res});
    }else{

      console.log("Response from fetchTunes not valid");
      dispatch({type: "updateStandards", value: standards});
    }
    fetchComposers().then(res => {
      if(res){
        dispatch({type: "updateComposers", value: res});
        dispatch({type: "setStatus", value: Status.Complete});
      }else{
        console.log("Response from fetchComposers not valid");
        dispatch({type: "updateComposers", value: composers});
      }
    }).catch(err => {
      console.log(err);
      dispatch({type: "setStatus", value: Status.Failed});
      return err;
    })
  }).catch(err => {
    console.log(err);
    dispatch({type: "setStatus", value: Status.Failed});
    return err;
  })
}
function addListener(listener: Function){
  statusListeners.add(listener);
  listener(status);
}
function setStatus(newStatus: Status){
  for(const listener of statusListeners){
    listener(newStatus);
  }
  status = newStatus;
}
function fetchComposers(counter=0): Promise<standard_composer[]>{
  return new Promise( (resolve, reject) => {
    if(counter > 6){
      setStatus(Status.Failed);
      reject("Too many attempts");
    }
    fetch("https://api.jhilla.org/tunetracker/composers", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(
      (response) => {
        //console.log('response');
        if(response.ok){
          response.json().then(json => {
            composers = (json as standard_composer[]);
            setStatus(Status.Complete);
              resolve(composers);
          }).catch(reason => {
            //console.error("ERROR:");
            //console.error(reason);
            resolve(fetchComposers(counter + 1));
          });
        }else{
          resolve(fetchComposers(counter + 1));
        }
      }
    ).catch(reason => {
      //console.error("ERROR on sending http request");
      //console.error(reason);
      resolve(fetchComposers(counter + 1));
    });
  });
}
//TODO: Figure out why fetch might return a void here but not with composers?
async function fetchTunes(counter=0): Promise<standard[]>{
  attemptNo = counter;
  return new Promise<standard[]>( (resolve, reject) => {
    if(counter > 6){
      setStatus(Status.Failed);
      reject("Failed 6 times");
    }
    fetch("https://api.jhilla.org/tunetracker/tunes", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(
      (response) => {
        //console.log('response');
        if(response.ok){
          response.json().then(json => {
            standards = (json as standard[]);
            setStatus(Status.Complete);
            resolve(standards);
          }).catch(reason => {
            resolve(fetchTunes(counter + 1));
          });
        }else{
          resolve(fetchTunes(counter + 1));
        }
      }
    ).catch(reason => {
      resolve(fetchTunes(counter + 1));
    })
    }
  );
}

async function createTuneDraft(tuneDraft: tune_draft){
  return http.post("/tunes", tuneDraft).catch(r => {throw r});
}
async function createComposerDraft(composerDraft: composer){
  return http.post("/composers", composerDraft);
}
async function sendUpdateDraft(tuneDraft: standard_draft): Promise<AxiosResponse>{
  if(tuneDraft.id){
    return http.put(`/tunes/${tuneDraft.id}`, tuneDraft)
  }else{
    throw("dbId is invalid");
  }
}
async function sendComposerUpdateDraft(composerDraft: standard_composer_draft){
  if(composerDraft.id){
    return http.put(`/composers/${composerDraft.id}`, composerDraft).catch(r => {throw r});
  }else{
    throw("dbId is invalid");
  }
}

async function sendPlaylist(playlist: playlist){

}

type state_t = {
  composers: standard_composer[],
  standards: standard[],
  status: Status,
  googleUser?: User
}
type action_t = {
  type: string,
  value: any
}
export function reducer(state: state_t, action: action_t){
  switch(action.type){
    case "updateComposers": {
      return {composers: action.value, standards: state.standards, status: state.status}
    }
    case "updateStandards": {
      return {composers: state.composers, standards: action.value, status: state.status}
    }
    case "setStatus": {
      return {composers: state.composers, standards: state.standards, status: action.value}
    }
    case "setGoogleUser": {
      return {composers: state.composers, standards: state.standards, status: action.value, googleUser: action.value}
    }
    default: {
      return {composers: composers, standards: standards, status: status};
    }
  }
}

const DbDispatchContext = createContext((() => {}) as Function);
const DbStateContext = createContext({} as state_t)
export default {
  login,
  tryLogin,
  getUserToken,
  status,
  reducer,
  DbDispatchContext,
  DbStateContext,
  addListener,
  createTuneDraft,
  createComposerDraft,
  sendUpdateDraft,
  sendComposerUpdateDraft,
  getStandards() {
    return standards;
  },
  getComposers() {
    return composers;
  },
  getStandardById(id: number) {
    //TODO: Replace with API call
    if(!standards.length){return null}
    return standards.find((stand: standard) => stand.id === id);
  },
  getComposerById(id: number) {
    //TODO: Replace with API call
    if(!composers.length){return null}
    return composers.find((comp: standard_composer) => comp.id === id);
  },
  getAttemptNo(){return attemptNo},
  updateDispatch,
  googleSignOut
}

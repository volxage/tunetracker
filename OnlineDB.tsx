// Copyright 2024 Jonathan Hilliard
import {createContext} from "react";
import { composer, standard, standard_composer, standard_composer_draft, standard_draft, Status, tune_draft } from "./types";
import http from "./http-to-server.ts"
import {Platform} from "react-native";
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes, User} from '@react-native-google-signin/google-signin';
let standards: standard[] = [];
let composers: standard_composer[] = [];
let status = Status.Waiting
let attemptNo = 0;
const statusListeners = new Set<Function>();

async function googleSignOut(): Promise<void>{
  GoogleSignin.signOut();
}
async function firstTimeGoogleAuth(): Promise<string>{
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  if (isSuccessResponse(response)) {
    if(response.data.idToken){
      return response.data.idToken;
    }else{
      throw Error("Invalid response from google api");
    }
    //setState({ userInfo: response.data });
  } else {
    console.log("Cancelled");
    return "";
    // sign in was cancelled by user
  }
}
async function getUser(): Promise<User | string>{
  if(Platform.OS === "ios"){
    return "";
  }else{
    if(GoogleSignin.hasPreviousSignIn()){
      console.log("Has previous signin");
      let currentUser = GoogleSignin.getCurrentUser();
      if(currentUser !== null){
        return currentUser;
      }else{
        console.log("No current User");
        GoogleSignin.signInSilently().then(res => {
          if(res.type === "success"){
            console.log("Successful silent signin");
            console.log(res.data.idToken);
            return res.data;
          }else{
            console.log("Unsuccessful silent signin");
            GoogleSignin.signIn().then(res => {
              if(res.type === "success"){
                console.log("Successful first-time signin");
                console.log(res.data.idToken);
                return res.data;
              }else{
                throw new Error("Signin error");
              }
            });
          }
        });
      }
    }else{
      firstTimeGoogleAuth().then(result => {
        return result;
      });
    }
  }
  return "";
}

//TODO:
//What are we returning? Anything? Or just making sure there's no rejections?
async function login(dispatch: Function): Promise<User | void>{
  return getUser().then(user => {
    if(Platform.OS === "ios"){
      throw Error("iOS login not implemented yet");
    }else{
      const googleUser = user as User;
      dispatch({type: "setGoogleUser", value: googleUser});
      console.log("Attempting login");
      return http.post("/users/login", {
        "google_token": googleUser.idToken
      }).then(val => {
      })
    }
  });
}

function checkLoggedIn(state: state_t){
  if(Platform.OS === "android"){
    if(state.googleUser){return true};
    
  }
  return false;
}


function updateDispatch(dispatch: Function){
  console.log("Updating dispatch");
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
          //console.log("response ok!");
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
function fetchTunes(counter=0): Promise<standard[]>{
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
          console.log("response ok!");
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
  console.log("Send draft: " + JSON.stringify(tuneDraft));
  return http.post("/tunes", tuneDraft);
}
async function createComposerDraft(composerDraft: composer){
  console.log("Send draft: " + composerDraft);
  return http.post("/composers", composerDraft);
}
async function sendUpdateDraft(tuneDraft: standard_draft){
  if(tuneDraft.id){
    return http.put(`/tunes/${tuneDraft.id}`, tuneDraft).catch(r => {throw r})
  }else{
    console.log("dbId is invalid");
  }
}
async function sendComposerUpdateDraft(composerDraft: standard_composer_draft){
  if(composerDraft.id){
    return http.put(`/composers/${composerDraft.id}`, composerDraft).catch(r => {throw r})
  }else{
    console.log("dbId is invalid");
  }
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
  getUser,
  status,
  reducer,
  DbDispatchContext,
  DbStateContext,
  addListener,
  createTuneDraft,
  createComposerDraft,
  sendUpdateDraft,
  sendComposerUpdateDraft,
  checkLoggedIn,
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

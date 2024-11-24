// Copyright 2024 Jonathan Hilliard
import {createContext} from "react";
import { Platform } from "react-native";
import { composer, auth, standard, standard_composer, standard_composer_draft, standard_draft, Status, tune_draft } from "./types";
import http from "./http-to-server.ts"
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes} from '@react-native-google-signin/google-signin';
let status = Status.Waiting
let attemptNo = 0;
const statusListeners = new Set<Function>();


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
async function getAuth(): Promise<string>{
  if(Platform.OS === "ios"){
    return "";
  }else{
    if(GoogleSignin.hasPreviousSignIn()){
      let currentUser = GoogleSignin.getCurrentUser();
      if(currentUser !== null){
        console.log(currentUser);
        GoogleSignin.getTokens().then(toks => {return toks.idToken});
      }else{
        GoogleSignin.signInSilently().then(res => {
          if(res.type === "success"){
            return res.data.idToken;
          }else{
            GoogleSignin.signIn().then(res => {
              if(res.type === "success"){
                return res.data.idToken;
              }else{
                throw new Error("Signin error");
              }
            });
          }
        });
      }
    }
  }
  return "";
}
async function createTuneDraft(tuneDraft: tune_draft){
  const tdAndAuth = tuneDraft as tune_draft & auth;
  const isIos = Platform.OS === "ios";
  getAuth().then(res => {
    if(isIos){
      tdAndAuth["isIos"] = true;
      tdAndAuth["iosAuth"] = res;
    }else{
      tdAndAuth["isIos"] = false;
      tdAndAuth["googleIdAuth"] = res;
    }
    console.log("Send draft: " + JSON.stringify(tdAndAuth));
    return http.post("/tunes", tdAndAuth);
  })
}
async function createComposerDraft(composerDraft: composer){
  const cdAndAuth = composerDraft as tune_draft & auth;
  const isIos = Platform.OS === "ios";
  getAuth().then(res => {
    if(isIos){
      cdAndAuth["isIos"] = true;
      cdAndAuth["iosAuth"] = res;
    }else{
      cdAndAuth["isIos"] = false;
      cdAndAuth["googleIdAuth"] = res;
    }
    console.log("Send draft: " + cdAndAuth);
    return http.post("/composers", cdAndAuth);
  });
}
async function sendUpdateDraft(tuneDraft: standard_draft){
  const tdAndAuth = tuneDraft as tune_draft & auth;
  const isIos = Platform.OS === "ios";
  getAuth().then(res => {
    if(isIos){
      tdAndAuth["isIos"] = true;
      tdAndAuth["iosAuth"] = res;
    }else{
      tdAndAuth["isIos"] = false;
      tdAndAuth["googleIdAuth"] = res;
    }
    if(tdAndAuth.id){
      console.log(tdAndAuth);
      return http.put(`/tunes/${tdAndAuth.id}`, tdAndAuth).catch(r => {throw r})
    }else{
      console.log("dbId is invalid");
    }
  });
}
async function sendComposerUpdateDraft(composerDraft: standard_composer_draft){
  const cdAndAuth = composerDraft as tune_draft & auth;
  const isIos = Platform.OS === "ios";
  getAuth().then(res => {
    if(isIos){
      cdAndAuth["isIos"] = true;
      cdAndAuth["iosAuth"] = res;
    }else{
      cdAndAuth["isIos"] = false;
      cdAndAuth["googleIdAuth"] = res;
    }
    if(cdAndAuth.id){
      return http.put(`/composers/${cdAndAuth.id}`, cdAndAuth).catch(r => {throw r})
    }else{
      console.log("dbId is invalid");
    }
  });
}

type state_t = {
  composers: standard_composer[],
  standards: standard[],
  status: Status
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
    default: {
      return {composers: composers, standards: standards, status: status};
    }
  }
}

const DbDispatchContext = createContext((() => {}) as Function);
const DbStateContext = createContext({} as state_t)
export default {
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
  updateDispatch
}

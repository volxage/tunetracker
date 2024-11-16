// Copyright 2024 Jonathan Hilliard
import {createContext} from "react";
import { composer, standard, standard_composer, standard_composer_draft, standard_draft, Status, tune_draft } from "./types";
import http from "./http-to-server.ts"
let standards: standard[] = [];
let composers: standard_composer[] = [];
let status = Status.Waiting
let attemptNo = 0;
const statusListeners = new Set<Function>();


function updateDispatch(dispatch: Function){
  console.log("Updating dispatch");
  dispatch({type: "setStatus", value: Status.Waiting});
  fetchTunes().then(() => {
    //Janky workaround until we get a better idea of how promises work
    dispatch({type: "updateStandards", value: standards});
    fetchComposers().then(() => {
      dispatch({type: "updateComposers", value: composers});
    }).then(() => {
      dispatch({type: "setStatus", value: Status.Complete});
    }).catch(err => {
      dispatch({type: "setStatus", value: Status.Failed});
    })
  }).catch(err => {
    dispatch({type: "setStatus", value: Status.Failed});
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
async function fetchComposers(counter=0){
    if(counter > 6){
      setStatus(Status.Failed);
      throw new Error("Too many attempts");
    }
    setStatus(Status.Waiting)
    return fetch("https://api.jhilla.org/tunetracker/composers", {
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
            return composers;
          }).catch(reason => {
            //console.error("ERROR:");
            //console.error(reason);
            return fetchComposers(counter + 1);
          });
        }else{
          return fetchComposers(counter + 1);
        }
      }
    ).catch(reason => {
      //console.error("ERROR on sending http request");
      //console.error(reason);
      return fetchComposers(counter + 1);
    });
}
async function fetchTunes(counter=0){
  attemptNo = counter;
  if(counter > 6){
    setStatus(Status.Failed);
    throw new Error("Too many attempts");
  }
  setStatus(Status.Waiting);
  return fetch("https://api.jhilla.org/tunetracker/tunes", {
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
          //console.log("Standards:");
          //console.log(standards);
          return standards;
        }).catch(reason => {
          return fetchTunes(counter + 1);
        });
      }else{
        return fetchTunes(counter + 1);
      }
    }
  ).catch(reason => {
    fetchTunes(counter + 1);
  });
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

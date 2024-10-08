// Copyright 2024 Jonathan Hilliard
import {createContext} from "react";
import { composer, standard, Status } from "./types";
let standards: standard[] = [];
let composers: composer[] = [];
let status = Status.Waiting
const statusListeners = new Set<Function>();

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
      status = Status.Failed
      return [];
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
            composers = (json as composer[]);
            //console.log("Standards:");
            //console.log(standards);
            setStatus(Status.Complete);
          }).catch(reason => {
            //console.error("ERROR:");
            //console.error(reason);
            fetchComposers(counter + 1);
          });
        }else{
          console.error("response not ok");
          console.log(response.status);
          fetchComposers(counter + 1);
        }
      }
    ).catch(reason => {
      //console.error("ERROR on sending http request");
      //console.error(reason);
      fetchComposers(counter + 1);
    });
}
async function fetchTunes(counter=0){
    if(counter > 6){
      setStatus(Status.Failed);
      return [];
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
          //console.log("Standards:");
          //console.log(standards);
        }).catch(reason => {
          fetchTunes(counter + 1);
        });
      }else{
        fetchTunes(counter + 1);
      }
    }
  ).catch(reason => {
    fetchTunes(counter + 1);
  });
}

async function sendTuneDraft(){
}

const DbStatusContext = createContext(status)
export default {
  status,
  DbStatusContext,
  addListener,
  getStandards() {
    return standards;
  },
  getComposers() {
    return composers;
  },
  getStandardById(id: number) {
    //TODO: Replace with API call
    return standards.find((stand: standard) => stand.id === id);
  },
  getComposerById(id: number) {
    //TODO: Replace with API call
    return composers.find((comp: composer) => comp.id === id);
  },
  update() {
    fetchComposers();
    fetchTunes();
  }
}

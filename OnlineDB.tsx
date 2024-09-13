// Copyright 2024 Jonathan Hilliard
import { composer, standard} from "./types";
let standards: standard[] = [];
let composers: composer[] = [];
let status = "WAITING"

async function fetchComposers(counter=0){
    if(counter > 6){
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
          }).catch(reason => {
            console.error("ERROR:");
            console.error(reason);
            fetchComposers(counter + 1);
          });
        }else{
          console.log("response not ok");
          console.log(response.status);
          fetchComposers(counter + 1);
        }
      }
    ).catch(reason => {
      console.error("ERROR on sending http request");
      console.error(reason);
      fetchComposers(counter + 1);
    });
}
async function fetchTunes(counter=0){
    if(counter > 6){
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
          //console.log("Standards:");
          //console.log(standards);
        }).catch(reason => {
          console.error("ERROR:");
          console.error(reason);
          fetchTunes(counter + 1);
        });
      }else{
        console.log("response not ok");
        console.log(response.status);
        fetchTunes(counter + 1);
      }
    }
  ).catch(reason => {
    //TODO: Push error message to user! Or update some "server active" state.
    console.error("ERROR on sending http request");
    console.error(reason);
    fetchTunes(counter + 1);
  });
}

async function sendTuneDraft(){
}

export default {
  getStandards() {
    return standards;
  },
  getStandardById(id: number) {
    //TODO: Replace with API call
    return standards.find((stand: standard) => stand.id === id);
  },
  update() {
    fetchComposers();
    fetchTunes();
  }
}

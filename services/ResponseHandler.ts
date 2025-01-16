import {AxiosError, AxiosResponse, isAxiosError} from 'axios';
import {SubText} from '../Style';
import {View} from 'react-native';
import OnlineDB from '../OnlineDB';

type response_t = {
  "data": any
};
type error_data_t = {
  "message": string
}

export default async function ResponseHandler(
  promise: Promise<AxiosResponse>,
  successToString: (response: response_t) => string,
  retry: Function,
  isFirstAttempt: boolean,
  navigation: any,
  onlineDbDispatch: Function
): Promise<{result: string, isError: boolean}>{
  return promise.then(res => {
    console.log("Promise resolved");
    return({result: successToString(res.data), isError: false});
  }).catch(async (err: AxiosError) => {
    if(!isFirstAttempt){
      console.error("Sumission failed twice. Giving up");
      console.log("Second error:");
      console.log(err);
      switch(err.response?.status){
        case 401: {
          return({result: "We tried logging you in, but it didn't work. Did you cancel the login?", isError: true});
        }
      }
      console.log("Unknown error 2nd time");
      console.log(JSON.stringify(err));
      return({result: "Unknown error", isError: true});
    }

    if(!isAxiosError(err)){
      console.log("Unknown non-axios error");
      console.log(err);
      console.log(JSON.stringify(err));
      return({result: "Unknown error", isError: true});
    }
    switch(err.response?.status){
      case 401: {
        await OnlineDB.tryLogin(navigation, onlineDbDispatch).then(async () => {
          console.log("Authentication error caught, retrying in ResposeBox");
          await retry(false);
        });
      }
    }
    if(err.message === "Network Error"){
      return({result: "Network error! Check your wifi.", isError: true});
    }
    console.log("Unknown error");
    console.log(err.response?.data.message);
    //console.log(JSON.stringify(err));
    console.log(JSON.stringify(err.request));
    return({result: "Unknown error", isError: true});
  })
}

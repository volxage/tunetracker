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
  }).catch((err: AxiosError) => {
    if(!isFirstAttempt){
      console.error("Sumission failed twice. Giving up");
      console.log("Second error:");
      console.log(err);
      switch(err.response?.status){
        case 401: {
          return({result: "We tried logging you in, but it didn't work. Did you cancel the login?", isError: true});
        }
      }
    return({result: "Unknown error", isError: true});
    }

    if(!isAxiosError(err)){
      return({result: "Unknown error", isError: true});
    }
    switch(err.response?.status){
      case 401: {
        OnlineDB.tryLogin(navigation, onlineDbDispatch).then(() => {
          console.log("Authentication error caught, retrying in ResposeBox");
          retry(false);
        });
      }
    }
    if(err.message === "Network Error"){
      return({result: "Network error! Check your wifi.", isError: true});
    }
    return({result: "Unknown error", isError: true});
  })
}

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
  retry: (first: boolean) => unknown,
  isFirstAttempt: boolean,
  navigation: any,
  onlineDbDispatch: Function,
  axiosErrorMappings?: Map<number, string>
): Promise<{result: string, isError: boolean, data?: any}>{
  return promise.then(res => {
    console.log("Promise resolved");
    return({result: successToString(res.data), isError: false, data: res.data});
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
    //Intercept error message in case a translation was provided
    if(err.response?.status && axiosErrorMappings && (axiosErrorMappings.has(err.response.status))){
      return({result: axiosErrorMappings.get(err.response.status), isError:true})
    }
    switch(err.response?.status){
      case 401: {
        //TODO: Ensure this new promise doesn't falsely return an error for a split second.
        await OnlineDB.tryLogin(navigation, onlineDbDispatch);
        console.log("Authentication error caught, retrying in ResposeBox");
        await retry(false);
        break;
      }
      case 404: {
        return({result: "Item not found.", isError: true});
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

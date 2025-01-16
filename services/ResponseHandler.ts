import {AxiosError, AxiosResponse, isAxiosError} from 'axios';
import {useContext, useEffect, useState} from 'react';
import {SubText} from '../Style';
import {View} from 'react-native';
import OnlineDB from '../OnlineDB';
import {useNavigation} from '@react-navigation/native';

type response_t = {
  "message": string
};
type error_data_t = {
  "message": string
}

export default async function ResponseHandler({
  promise,
  successToString,
  retry,
  isFirstAttempt
}:{
  promise: Promise<AxiosResponse>
  successToString: (response: response_t) => string,
  retry: Function,
  isFirstAttempt: boolean
}): Promise<{result: string, isError: boolean}>{
  const onlineDbDispatch = useContext(OnlineDB.DbDispatchContext);
  const navigation = useNavigation();
  console.log("useEffect");
  return promise.then(res => {
    console.log("Promise resolved");
    return({result: successToString(res.data), isError: false});
  }).catch((err: AxiosError) => {
    const data = err.response?.data as error_data_t;
    if(!isFirstAttempt){
      console.error("Sumission failed twice. Giving up");
      console.log("Second error:");
      console.log(err);
      return({result: data.message, isError: true});
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
    if(data.message === "Network Error"){
      return({result: "Network error! Check your wifi.", isError: true});
    }
    return({result: "Unknown error", isError: true});
  })
}

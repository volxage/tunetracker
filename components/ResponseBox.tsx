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

export default function ResponseBox({
  promise,
  successToString,
  retry,
}:{
  promise: Promise<AxiosResponse> | null,
  successToString: (response: response_t) => string,
  retry: Function,
}){
  const [resultString, setResultString] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const onlineDbState = useContext(OnlineDB.DbStateContext);
  const onlineDbDispatch = useContext(OnlineDB.DbDispatchContext);
  const navigation = useNavigation();
  if(!promise){
    return(<></>);
  }
  if(isLoading){
    return(
      <SubText>Loading...</SubText>
    );
  }
  if(isError){
    return(
      <View>
        <SubText>Error!</SubText>
        <SubText>{resultString}</SubText>
        <SubText>ERROR: {resultString}</SubText>
      </View>
    );
  }
  return(
    <View>
        <SubText>Success!</SubText>
      <SubText>{resultString}</SubText>
    </View>
  );
}

import {AxiosError, AxiosResponse, isAxiosError} from 'axios';
import {useState} from 'react';
import {SubText} from '../Style';
import {View} from 'react-native';

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
  firstAttempt
}:{
  promise: Promise<AxiosResponse>,
  successToString: (response: response_t) => string,
  retry: Function,
  firstAttempt: boolean
}){
  const [resultString, setResultString] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  promise.then(res => {
    setResultString(successToString(res.data));
  }).catch((err: AxiosError) => {
    const data = err.response?.data as error_data_t;
    if(!firstAttempt){
      console.error("Sumission failed twice. Giving up");
      console.log("Second error:");
      console.log(err);
      setResultString(data.message)
    }
  })
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

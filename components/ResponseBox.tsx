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
  result,
  isError
}:{
  result: string
  isError: boolean
}){
  if(!result || result === ""){
    return(<></>);
  }
  if(isError){
    return(
      <View style={{borderWidth: 1, borderColor: "red", padding: 16, margin: 8}}>
        <SubText>{result}</SubText>
      </View>
    );
  }
  return(
    <View style={{borderWidth: 1, borderColor: "green", padding: 16, margin: 8}}>
      <SubText>{result}</SubText>
    </View>
  )
}

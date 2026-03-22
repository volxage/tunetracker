/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import webSigningCert from "./clientcerts";

AppRegistry.registerComponent(appName, () => App);

if(Platform.OS === "android"){
  GoogleSignin.configure({
    webClientId: webSigningCert,
  })
}


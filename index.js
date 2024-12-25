/**
 * @format
 */

import 'react-native-get-random-values'
import {AppRegistry, DevSettings, NativeModules} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes} from '@react-native-google-signin/google-signin';
import {devSigningCert, webSigningCert} from './clientcerts';
import OnlineDB from './OnlineDB';


GoogleSignin.configure({
  webClientId: webSigningCert,
})
AppRegistry.registerComponent(appName, () => App);

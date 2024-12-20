/**
 * @format
 */

import 'react-native-get-random-values'
import {AppRegistry, DevSettings, NativeModules} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes} from '@react-native-google-signin/google-signin';
import {devSigningCert, webSigningCert} from './clientcerts';


GoogleSignin.configure({
  webClientId: webSigningCert,
})

// Somewhere in your code
const signIn = async () => {
  try {
    console.log("trying");
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      console.log(response);
      //setState({ userInfo: response.data });
    } else {
      console.log("Cancelled");
      // sign in was cancelled by user
    }
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          console.log("In progress");
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // Android only, play services not available or outdated
          console.error("No google play!");
          break;
        default:
          console.log(error);
          console.log(error.message);
          console.log("Some google sign in error occured");
        // some other error happened
      }
    } else {
      console.log("Non google-signin error");
      console.log(error);
      // an error that's not related to google sign in occurred
    }
  }
}
signIn();
AppRegistry.registerComponent(appName, () => App);

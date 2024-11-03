/**
 * @format
 */

import 'react-native-get-random-values'
import {AppRegistry, DevSettings, NativeModules} from 'react-native';
import App from './App';
import {name as appName} from './app.json';


AppRegistry.registerComponent(appName, () => App);


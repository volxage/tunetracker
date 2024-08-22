if (__DEV__) {
  require("./ReactotronConfig")
}
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import { Database} from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from './model/schema'

const adapter = new SQLiteAdapter({
  schema,

  //UNCOMMENT ON DEPLOYMENT
  //migrations,

  //jsi
  onSetupError: error => {
    //TODO: Add error message screen to navigation stacks.
    console.error("Error on database load");
  }
})

AppRegistry.registerComponent(appName, () => App);


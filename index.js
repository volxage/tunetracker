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
import Tune from './model/Tune';
import Composer from './model/Composer';
import TuneComposer from './model/TuneComposer';
import Playlist from './model/Playlist';
import TunePlaylist from './model/TunePlaylist';

AppRegistry.registerComponent(appName, () => App);


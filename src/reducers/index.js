import {combineReducers} from 'redux';
import section from './section.js';
import schedule from './schedule';
import terminal from './terminal';
import server from './server';

export default combineReducers({
  section:section,
  schedule:schedule,
  terminal:terminal,
  server:server
});
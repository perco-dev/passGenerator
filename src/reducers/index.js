import {combineReducers} from 'redux';
import section from './section.js';
import schedule from './schedule';
import terminal from './terminal';

export default combineReducers({
  section:section,
  schedule:schedule,
  terminal:terminal
});
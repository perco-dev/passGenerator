import {combineReducers} from 'redux';
import section from './section.js';
import schedule from './schedule';

export default combineReducers({
  section:section,
  schedule:schedule
});
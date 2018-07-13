import {createStore} from 'redux';
import rootReducer from '../reducers'

const store = createStore(rootReducer)

//dev
window.store = store;
export default store;
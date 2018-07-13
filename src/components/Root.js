import React from 'react';
import PropTypes from 'prop-types';
import store from '../store';
import {Provider} from 'react-redux';
import MainPage from './MainPage';

export default function Root(props){
  return (
    <Provider store = {store}>
      <MainPage {...props}/>
    </Provider>
  )
};

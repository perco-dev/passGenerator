import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { findDOMNode } from 'react-dom';
import { changeScheduleValueSimple,changeScheduleValueComplex,addMsgToTerminal} from '../../AC';

class CustomGenerator extends Component {
  static PropTypes = {
    //from store
    schedule: PropTypes.object.isRequired,
    terminal: PropTypes.object.isRequired,
    //from MainPage
    server: PropTypes.string.isRequired
  }

  render(){
    let glRef;
    return(
      <div className = 'row flex-row justify-content-start'>
        <ul className = 'nav flex-column'>
          <li className = 'nav-item'>
            <a className = 'nav-link' href = '#'>Помещение</a>
          </li>
          <li className = 'nav-item'>
            <a className = 'nav-link' href = '#'>Контроллер</a>
          </li>
        </ul>
        <canvas id = 'webgl' ref = {this.setRef}></canvas>
        {console.log(this.glRef)}
      </div>
    ) 
  }

  webGl = ref => {
    console.log('---',ref);
  }
  setRef = ref =>{
    return this.glRef = findDOMNode(ref);
  }
}

export default connect(state=>({schedule:state.schedule,terminal:state.terminal}),{changeScheduleValueSimple, changeScheduleValueComplex,addMsgToTerminal})(CustomGenerator)
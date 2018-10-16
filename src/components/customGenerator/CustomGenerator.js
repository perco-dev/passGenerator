import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
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
    return(<p>'asdasd'</p>) 
  }
}

export default connect(state=>({schedule:state.schedule,terminal:state.terminal}),{changeScheduleValueSimple, changeScheduleValueComplex,addMsgToTerminal})(CustomGenerator)
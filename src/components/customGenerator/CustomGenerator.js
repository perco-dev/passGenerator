import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { changeScheduleValueSimple,changeScheduleValueComplex,addMsgToTerminal} from '../../AC';
import Rooms from './Rooms';
import { findDOMNode } from 'react-dom';

class CustomGenerator extends Component {
  static PropTypes = {
    //from store
    schedule:PropTypes.object.isRequired,
    terminal:PropTypes.object.isRequired,
    //from MainPage
    server:PropTypes.string.isRequired
  }

  state={
    open:false,
    active:'rooms'
  }
  
  render(){
    const {active} = this.state;
    return (
      <div className='container-fluid'>
      <ul class="nav nav-tabs">
        <li className="nav-item">
          <a className={`${active == 'rooms' ? 'nav-link active' : 'nav-link'}`} 
            id='rooms'href="#"
            onClick = {()=>{this.setState({active:'rooms'})}}
            >Помещения
          </a>
        </li>
        <li className="nav-item">
          <a className={`${active == 'schedule' ? 'nav-link active' : 'nav-link'}`} 
            id='schedule' href="#"
            onClick = {()=>{this.setState({active:'schedule'})}}
            >График
          </a>
        </li>
      </ul>
      <div>
        {this.showTool(active)}     
      </div>
      </div>
    )
  }

  showTool(tool){
    switch(tool){
      case 'rooms' : return <Rooms server={this.props.server}/>
      case 'schedule' : return 0
      default : return(<p>Kriminalunterassistent kümmert sich um dich</p>)
    }    
  }
}

export default connect(state=>({schedule:state.schedule,terminal:state.terminal}),{changeScheduleValueSimple, changeScheduleValueComplex,addMsgToTerminal})(CustomGenerator)
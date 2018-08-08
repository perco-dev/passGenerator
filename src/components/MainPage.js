import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { findDOMNode } from 'react-dom';
import {changeSectionType, changeServer} from '../AC';
import AutoGenerator from './AutoGenerator';

import "bootstrap/dist/css/bootstrap.css";

class MainPage extends PureComponent {
  static PropTypes = {
    //from store
    section: PropTypes.string,
    sectionTypeChanger:PropTypes.func,
    server:PropTypes.string,
    changeServer:PropTypes.func
  }

  state = {
    sState:0, //server state 0 - disconnect
    display:'none'
  }

  shouldComponentUpdate(nextProps,nextState){
    const {changeServer} = this.props
    if(nextState.display != this.state.display || nextState.sState != this.state.sState){
      if(nextProps.server != this.props.server)  changeServer(nextProps.server);
      return true;
    }
    return false;
  }

  render(){
    const {section} = this.props;
    const {server}  = this.props;
    let   {display} = this.state;
    return(
      <div className='container-fluid'>
        <ul className="nav" style= {{'background-color':'rgb(230, 230, 230)'}}>
          <li className="nav-item">
            <a className="nav-link" onClick = {()=>this.sectionChange('auto')} href="#">авто</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#" onClick = {()=>this.sectionChange('custom')}>настраиваемый</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#" onClick = {()=>this.sectionChange('add')}>добавить</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#" onClick = {()=>{this.sectionChange('delete')}}>удалить</a>
          </li>
          <li className="nav-item ml-auto">
            <a className="nav-link" id = 'status' onClick={this.showInput}>{server}{this.serverStateLighting()}</a>
          </li>
          <li>
            <form className='form-inline my-2 my-lg-0 ml-auto' style={{'display':display}} onSubmit={this.changeServerSubmit}>
              <input className="form-control mr-sm-2" onChange = {this.getServer}/>
              <button className="btn btn-outline-success my-2 my-sm-0" type="submit">></button>
            </form>
          </li>
        </ul>
        <div style = {{'margin-top':'20px'}}>
          {this.showSection(section)}
        </div>
      </div>
    )
  }

  setRef = ref =>{
    return findDOMNode(ref);
  }
  
  getServer = e =>{
    const {changeServer} = this.props;
    changeServer(e.target.value);
  }
  
  showInput = () =>{
    const {display} = this.state;
    this.setState({
      display: display == 'none' ? 'inline' : 'none'
    });
  }

  changeServerSubmit = e =>{
    const {server} = this.props
    const {changeServer} = this.props;
    changeServer(server);
    this.setState({
      sState:1
    });
    this.checkServerState();
    e.preventDefault();
  }


  async checkServerState(){
    const {server} = this.props;
    try{
      let response = await fetch(`http://${server}/sysserver/getServerState?token=master`,{method:'GET'});
      let responseBody  = await response.text();
      let sState =  typeof JSON.parse(responseBody).result === 'undefined' ? 1 : 0;
      this.setState({
        sState:sState,
        display:'none'
      });
    }
    catch(e){
      this.setState({
        sState:0,
        display:'none'
      });
    }

  }

  serverStateLighting(){
    const {sState} = this.state;
    let color = sState == 0 ? 'red' : 'green';
    return (
      <span style = {{'height':'10px','width':'10px','backgroundColor':color,'border-radius':'50%','display':'inline-block','margin-left':'5px'}}></span>
    )
  }

  showSection = section =>{
    switch (section){
      case 'auto' : return <AutoGenerator server = {this.props.server}/>
      default : return(<p>HILARITAS POPVLI ROMANI </p>);
    }
  }

  sectionChange = type =>{
    this.props.changeSectionType(type) 
  }

};
export default connect(state=>({section:state.section,server:state.server}),{changeSectionType,changeServer})(MainPage);
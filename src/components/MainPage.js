import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
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
    sState:0
  }

  componentDidMount(){
    const {server} = this.props;
    this.checkServerState(server);
  }

  render(){
    const {section} = this.props;
    const {sState} = this.state;
    const {server} = this.props;
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
            <a className="nav-link">{server}{this.serverStateLighting(sState)}</a>
          </li>
        </ul>
        <div style = {{'margin-top':'20px'}}>
          {this.showSection(section)}
        </div>
      </div>
    )
  }

  async checkServerState(host){
    let response = await fetch(`http://${host}:8080/sysserver/getServerState?token=master`,{method:'GET'});
    let responseBody  = await response.text();
    let sState =  typeof JSON.parse(responseBody).result === 'undefined' ? 1 : 0;
    this.setState({
      sState:sState
    })
  }

  serverStateLighting(sState){
    let color = sState == 0 ? 'red' : 'green';
    return (
      <span style = {{'height':'10px','width':'10px','backgroundColor':color,'border-radius':'50%','display':'inline-block','margin-left':'5px'}}></span>
    )
  }

  showSection = section =>{
    switch (section){
      case 'auto' : return <AutoGenerator/>
      default : return(<p>HILARITAS POPVLI ROMANI </p>);
    }
  }

  sectionChange = type =>{
    this.props.changeSectionType(type) 
  }

};
export default connect(state=>({section:state.section,server:state.server}),{changeSectionType,changeServer})(MainPage);
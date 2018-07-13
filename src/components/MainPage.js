import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {changeSectionType} from '../AC';
import AutoGenerator from './AutoGenerator';

import "bootstrap/dist/css/bootstrap.css";

class MainPage extends Component {
  static PropTypes = {
    section: PropTypes.string,
    sectionTypeChanger:PropTypes.func
  }

  render(){
    const {section} = this.props;
    return(
      <div className='container-fluid'>
        <ul class="nav" style= {{'background-color':'rgb(230, 230, 230)'}}>
          <li class="nav-item">
            <a class="nav-link" onClick = {()=>this.sectionChange('auto')} href="#">авто</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" onClick = {()=>this.sectionChange('custom')}>настраиваемый</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" onClick = {()=>this.sectionChange('add')}>добавить</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" onClick = {()=>{this.sectionChange('delete')}}>удалить</a>
          </li>
        </ul>
        <div style = {{'margin-top':'20px'}}>
          {this.showSection(section)}
        </div>
      </div>
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
export default connect(state=>({section:state.section}),{changeSectionType})(MainPage);
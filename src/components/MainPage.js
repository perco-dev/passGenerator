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
    console.log(this.props)
    const {section} = this.props;
    return(
      <div className='container-fluid'>
        <ul class="nav">
          <li class="nav-item">
            <a class="nav-link active" onClick = {()=>this.sectionChange('auto')} href="#">АВТО</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" onClick = {()=>this.sectionChange('custom')}>НАСТРАИВАЕМЫЙ</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" onClick = {()=>this.sectionChange('add')}>ДОБАВИТЬ</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" onClick = {()=>{this.sectionChange('delete')}}>УДАЛИТЬ</a>
          </li>
        </ul>
        <div>
          {this.showSection(section)}
        </div>
      </div>
    )
  }

  showSection = section =>{
    switch (section){
      case 'auto' : return <AutoGenerator/>
      default : return(<p>Ooops! No mashrooms hier!</p>);
    }
  }

  sectionChange = type =>{
    this.props.changeSectionType(type) 
  }

};
export default connect(state=>({section:state.section}),{changeSectionType})(MainPage);
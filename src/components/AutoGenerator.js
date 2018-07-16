import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { changeScheduleValue } from '../AC';
import { findDOMNode } from 'react-dom';
import IntervalChanger from './IntervalChanger';

class AutoGenerator extends Component {
  
  static PropTypes = {
    schedule:PropTypes.object.isRequired
  }

  render() {
    //console.log(this.props)
    return(
      <form>
        <div className = 'form-row'>
          <div className="form-group col-md-3">
            <label>Дата начала генерации</label>
            <input type='date' className='form-control' value = {this.props.schedule.beginDate} onChange={this.changeValue('beginDate')}/>
          </div>
          <div className="form-group col-md-3">
            <label>Дата конца генерации</label>
            <input type='date' className='form-control' value = {this.props.schedule.endDate} onChange = {this.changeValue('endDate')}/>
          </div>
          <div className="form-group col-md-3">
            <label>Тип графика</label>
            <select className='form-control' onChange = {this.changeValue('scheduleType')}>
              <option value='Недельный'>Недельный</option>
              <option value='Сменный'>Сменный</option>
              <option value='По присутствию'>По присутствию</option>
            </select>
          </div>
          <div>
            <label>Часов размазать</label>
            <input type='number' className='form-control' onChange = {this.changeValue('hours')} value = {this.props.schedule.hours}/>
          </div>
        </div>
        <hr style = {{'border': 'none','background-color':'rgb(230, 230, 230)','color': 'red','height': '2px'}}/>
        {this.showScheduleConfig()}
      </form>
    )
  }

  changeValue = field => e =>{
    let obj = {}
    obj[field] = e.target.value;
    const {changeScheduleValue} = this.props;
    changeScheduleValue(obj);
  }

  showScheduleConfig(){
    const type = this.props.schedule.scheduleType;
    switch(type){
      case 'Недельный' : {
        return <div style={{'margin-top':'10px'}}>
          <div className='form-row'>
            <div className='form-group col-md-3'>
              <label>Приходить позже</label>
              <input type='time' className = 'form-control' onChange = {this.changeValue('allow_coming_later')}/>
            </div>
            <div className='form-group col-md-3'>
              <label>Уходить раньше</label>
              <input type='time' className = 'form-control' onChange = {this.changeValue('allow_leaving_before')}/>
            </div>
            <div className='form-group col-md-3'>
              <label>Переработка</label>
              <input type='time' className = 'form-control' onChange = {this.changeValue('overtime')}/>
            </div>
            <div className='form-group col-md-3'>
              <label>Недоработка</label>
              <input type='time' className = 'form-control' onChange = {this.changeValue('undertime')}/>
            </div>
          </div>
          <div className='form-row'>
            <div className='form-group col-md-3'>
              <label>Название графика</label>
              <input type='text' className = 'form-control' onChange = {this.changeValue('name')}/>
            </div>
            <div className = 'col-3'>
                <label>Не выходной</label>
                <input type='checkbox' className='form-control col-1' onChange={this.changeValue('is_not_holiday')}/>
            </div>
            <div className = 'col-md-3'>
              <label >ПервоНах</label>
              <input type='checkbox' className='form-control col-1' onChange={this.changeValue('is_first_input_last_output')}/>
            </div>
            <div className = 'form-group col-md-8'> 
              <IntervalChanger/>
            </div>
          </div>

          <div className='form-row'>
  
          </div>
        </div>
      }
      case 'Сменный' :          return <p>сменный</p>
      case 'По присутствию' :   return <p>по присутствию</p>
      default: return <p>!!!</p>
    }
  }
  setRef = ref =>{
    return findDOMNode(ref)
  }

};

export default connect(state=>({schedule:state.schedule}),{changeScheduleValue})(AutoGenerator);

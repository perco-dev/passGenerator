import React, { Component } from 'react';
import MontlyIntervalChanger from './MontlyIntervalChanger';
import SchiftIntervalChanger from './ShiftIntervalChanger';
import * as scheduleTemplate from '../lib/schedules';
import PropTypes from 'prop-types';

class ScheduleConfig extends Component {

  static propTypes = {
    changeValue: PropTypes.func.IsRequire,
    type:PropTypes.string.IsRequire
  }

  state = {
    fromtemplate: null
  }

  render() {
    const {changeValue} = this.props;

    return (
      <div style={{'margin-top':'10px'}}>
        <div className='form-row'>

          <div className='form-group col-md-3'>
            <label>Приходить позже</label>
            <div className='row'>
              <div className = 'col-4'>
                <input type='number' min='0' max='24' className = 'form-control' onChange = {changeValue('allow_coming_later','h')}/>
              </div>
              <div className = 'col-4'>
                <input type='number' min='0' max='60' className = 'form-control' onChange = {changeValue('allow_coming_later','m')}/>
              </div>
            </div>
          </div>

          <div className='form-group col-md-3'>
            <label>Уходить раньше</label>
            <div className = 'row'> 
              <div className='col-4'>
                <input type='number' min='0' max='24' className = 'form-control' onChange = {changeValue('allow_leaving_before','h')}/>
              </div>
              <div className='col-4'>
                <input type='number' min='0' max='60' className = 'form-control' onChange = {changeValue('allow_leaving_before','m')}/>
              </div>
            </div>
          </div>

          <div className='form-group col-md-3'>
            <label>Переработка</label>
            <div className='row'>
              <div className='col-4'>
                <input type='number' min='0' max='24' className = 'form-control' onChange = {changeValue('overtime','h')}/>
              </div>
              <div className='col-4'>
                <input type='number' min='0' max='60' className = 'form-control' onChange = {changeValue('overtime','m')}/>
              </div>
            </div>
          </div>
          
          <div className='form-group col-md-3'>
            <label>Недоработка</label>
            <div className='row'>
              <div className='col-4'>
                <input type='number' min='0' max='24'  className = 'form-control' onChange = {changeValue('undertime','h')}/>
              </div>
              <div className='col-4'>
                <input type='number' min='0' max='60' className = 'form-control' onChange = {changeValue('undertime','m')}/>
              </div>
            </div>
          </div>

        </div>
        <div className='form-row'>
          <div className= "form-group col-md-3">
            <label>Шаблон</label>
            {this.showTemplates()}
          </div>
          <div className='form-group col-md-3'>
            <label>Название графика</label>
            <input type='text' className = 'form-control' onChange = {changeValue('name')}/>
          </div>

          <div className = 'col-3'>
            <label>Не выходной</label>
            <input type='checkbox' className='form-control col-1' onChange={changeValue('is_not_holiday')}/>
          </div>
          <div className = 'col-md-3'>
            <label >Первый вход - последний выход</label>
            <input type='checkbox' className='form-control col-1' onChange={changeValue('is_first_input_last_output')}/>
          </div>
          <div className = 'form-group col-md-8'> 
            {this.intervalSelector()}
          </div>
        </div>
      </div>
    )
  }

  intervalSelector(){
    const {type} = this.props;
    switch(type){
      case  'Недельный' : {
        return <MontlyIntervalChanger fromtemplate = {this.state.fromtemplate}/>
      }
      case  'Сменный' :{
        return <SchiftIntervalChanger fromtemplate = {this.state.fromtemplate}/>
      }
      default : return <p> !!! </p>
    }
  }

  //Отображение шаблонов из lib/schedules (заготовки интервалов)
  showTemplates(){
    const {type} = this.props;
    let template;
    if (type == 'Недельный'){
      template = scheduleTemplate.default['week']
    }
    else {
      return(
        <select className = 'custom-select'>
          <option>Ooops nothing be here !</option>
        </select>
      )
    }
    
    const optionList = Object.keys(template).map(item=><option key = {item.toString()}>{item.toString()}</option>)
    return (
      <select className="custom-select" onChange = {this.templateChange}>
        <option value={0}></option>
        {optionList}
      </select>
    )
  }

  templateChange = e =>{
    const {value} = e.target
    if(typeof value !== 'undefined'){
      this.setState({
        fromtemplate:value
      })
    }
  }

};

export default ScheduleConfig;
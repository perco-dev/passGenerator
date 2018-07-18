import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { changeScheduleValueSimple,changeScheduleValueComplex} from '../AC';
import { findDOMNode } from 'react-dom';
import MontlyIntervalChanger from './MontlyIntervalChanger';
import SchiftIntervalChanger from './ShiftIntervalChanger';

class AutoGenerator extends Component {
  
  static PropTypes = {
    schedule:PropTypes.object.isRequired
  }

  render() {
    console.log("!!!",this.props)
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
              <option value='Сменный' selected>Сменный</option>
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

  changeValue = (field,option) => e =>{
    let obj = {}
    const {changeScheduleValueSimple} = this.props;
    const {changeScheduleValueComplex} = this.props;
    if(typeof option === 'undefined'){
      obj[field] = e.target.value;
      changeScheduleValueSimple(obj);
    }
    else{
      obj[field] = { [`${option}`] : e.target.value};
      //obj['test'] = {test:'13343',tust:true,trust:{tr:'123'}}
      changeScheduleValueComplex(obj)
    }
  }

  showScheduleConfig(){
    const type = this.props.schedule.scheduleType;
    switch(type){
      case 'Недельный' : {
        return <div style={{'margin-top':'10px'}}>
          <div className='form-row'>

            <div className='form-group col-md-3'>
              <label>Приходить позже</label>
              <div className='row'>
                <div className = 'col-4'>
                  <input type='number' className = 'form-control' onChange = {this.changeValue('allow_coming_later','h')}/>
                </div>
                <div className = 'col-4'>
                  <input type='number' className = 'form-control' onChange = {this.changeValue('allow_coming_later','m')}/>
                </div>
              </div>
            </div>

            <div className='form-group col-md-3'>
              <label>Уходить раньше</label>
              <div className = 'row'> 
                <div className='col-4'>
                  <input type='number' className = 'form-control' onChange = {this.changeValue('allow_leaving_before','h')}/>
                </div>
                <div className='col-4'>
                  <input type='number' className = 'form-control' onChange = {this.changeValue('allow_leaving_before','m')}/>
                </div>
              </div>
            </div>

            <div className='form-group col-md-3'>
              <label>Переработка</label>
              <div className='row'>
                <div className='col-4'>
                  <input type='number' className = 'form-control' onChange = {this.changeValue('overtime','h')}/>
                </div>
                <div className='col-4'>
                  <input type='number' className = 'form-control' onChange = {this.changeValue('overtime','m')}/>
                </div>
              </div>
            </div>
            
            <div className='form-group col-md-3'>
              <label>Недоработка</label>
              <div className='row'>
                <div className='col-4'>
                  <input type='number' min='0' max='24'  className = 'form-control' onChange = {this.changeValue('undertime','h')}/>
                </div>:
                <div className='col-4'>
                  <input type='number' min='0' max='60' className = 'form-control' onChange = {this.changeValue('undertime','m')}/>
                </div>
              </div>
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
              <MontlyIntervalChanger/>
            </div>
          </div>
        </div>
      }
      case 'Сменный' : {
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
            <div className = 'col-md-3'>
              <label >ПервоНах</label>
              <input type='checkbox' className='form-control col-1' onChange={this.changeValue('is_first_input_last_output')}/>
            </div>
            <div className = 'form-group col-md-12'> 
              <SchiftIntervalChanger/>
            </div>
          </div>
        </div>
      }
      
      case 'По присутствию' :   return <p>по присутствию</p>
      default: return <p>!!!</p>
    }
  }
  setRef = ref =>{
    return findDOMNode(ref)
  }

};

export default connect(state=>({schedule:state.schedule}),{changeScheduleValueSimple,changeScheduleValueComplex})(AutoGenerator);

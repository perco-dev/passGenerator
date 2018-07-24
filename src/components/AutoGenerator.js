import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { changeScheduleValueSimple,changeScheduleValueComplex,addMsgToTerminal} from '../AC';
import { findDOMNode } from 'react-dom';

import ModalTerminal from './ModalTerminal';
import * as launcher  from '../lib/api/launcher';
import ScheduleConfig from './ScheduleConfig';

class AutoGenerator extends Component {
  
  static PropTypes = {
    schedule:PropTypes.object.isRequired,
    terminal:PropTypes.object.isRequired
  }

  state = {
    open:false
  }

  render() {
    console.log("AUTO",this.props);
    
    return(
      <form onSubmit = {this.onSubmit}>
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
            <select className='form-control' onChange = {this.changeValue('scheduleType')} value = {this.props.schedule.scheduleType}>
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
          <ScheduleConfig changeValue = {this.changeValue} type = {this.props.schedule.scheduleType}/>
          <button type='submit' className='btn btn-primary'>CLARITAS</button>
          <ModalTerminal terminal = {this.props.terminal} open = {this.state.open} closeModal = {this.closeModal}/>
      </form>
    )
  }

  closeModal = () =>{
    this.setState({
      open:false
    })
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
      changeScheduleValueComplex(obj)
    }
  }

  setRef = ref =>{
    return findDOMNode(ref)
  }

  onSubmit = async() => {
    const {schedule} = this.props;
    const {addMsgToTerminal} = this.props;
    let monthlyLauncher = launcher.monthlyLauncher(schedule);

    await monthlyLauncher.checkDates().then(result=>{
      addMsgToTerminal(result);
    }).catch(reason=>{
      addMsgToTerminal(reason)
    });


    await monthlyLauncher.checkAverageWeekHours().then(result=>{
      addMsgToTerminal(result);
    }).catch(reason=>{
      addMsgToTerminal(reason);
    });
    /*
    await monthlyLauncher.c .checkDates().then(result=>{
      addMsgToTerminal(result)
    }).catch(reason=>{
        addMsgToTerminal(reason);
    })
    */
    /*
    await Launcher.dependenciesListForming().then(result=>{
      addMsgToTerminal(result)
    }).catch(reason=>{
      addMsgToTerminal(reason);
    });

    await Launcher.addMethodsData().then(result=>{
      addMsgToTerminal(result);
    }).catch(reason=>{
      addMsgToTerminal(reason);
    });

    await Launcher.deleteDatafromDB().then(result=>{
      addMsgToTerminal(result)
    }).catch(reason=>{
      addMsgToTerminal(reason);
    });
    */
    this.setState({
      open:true
    })
  }
};

export default connect(state=>({schedule:state.schedule,terminal:state.terminal}),{changeScheduleValueSimple,changeScheduleValueComplex,addMsgToTerminal})(AutoGenerator);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import intervalChanger from '../decorators/IntervalChanger';
import { findDOMNode } from 'react-dom';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';


class SchiftIntervalChanger extends Component {
  static propTypes = {
    //from store
    schedule: PropTypes.object.isRequired,
    type:PropTypes.object.isRequired,
    changeScheduleValue:PropTypes.func.isRequired,
    //from IntervalChanger 
    setHours:PropTypes.func.isRequired,
    setRangeValue:PropTypes.func.isRequired
  }

  constructor(props){
    super(props)
    this.type = this.props.type;

    this.state = {
      interval:0,
      shift:{
        day1:{active:true,intervals:[]}
      }   
    }
  }

  render() {
    //console.log("!!!",this.state);
    return (
        <section className='rangeSlider'>
          <label>Дни</label>
          <div className='row' style={{'margin-bottom':'5px'}}>
            <div className='col-1'>
              <button className="btn btn-success btn-block" onClick={this.addDay}>+</button>
            </div>
            <div className='col-1'>
              <button className="btn btn-danger btn-block" onClick={this.deleteDay}>-</button>
            </div>
          </div>
          <div className='row'>
            {this.showDays()}
          </div>
          <div className='intervals row'>
            {this.showSlider()}
          </div>
          <div className='row'>
            {this.showInputs()}
          </div>
        </section>
    )
  }
  
  showDays(){
    let {shift} = this.state;
    const days = Object.keys(shift).map(day=><li className='nav-item col-2' >
        <a  className={shift[`${day}`]['active'] ? "nav-link active" : "nav-link"} 
            href="#" 
            key={day.toString()}
            id = {day.toString()}
            onClick = {this.setActive}
            ref = {this.setRef}
            style = {{'text-align':'center','border':'1px solid #3385ff'}}
        >
        {"день " + day.toString().substr(3)}
        </a>
      </li>);
    return <ul className='nav nav-pills col-12'>{days}</ul>
  }

  addDay = () => {
    let {shift} = this.state;
    let lastDay = Object.keys(shift)[Object.keys(shift).length - 1];
    let index = parseInt(lastDay.substr(3));
    let newDay = {...this.state,...shift[`${lastDay.substr(0,3) + (index+1)}`]={active:false,intervals:[]}}
    this.setState(newDay)
  }

  deleteDay = () =>{
    const {shift} = this.state;
    let lastIndex = Object.keys(shift).length;
    if(lastIndex > 1 && delete shift['day' + `${lastIndex}`]){
      for(let i = 1;i<lastIndex;++i){
        shift['day' + `${i}`]['active'] = false;
      } 
      shift['day' + `${lastIndex - 1}`]['active'] = true;
      this.setState({...this.state,...shift});
    }
  }

  setActive = ref =>{
    const id = ref.target.id;
    let {shift} = this.state;
    if((Object.keys(shift)).length != 1){
      for (let key of Object.keys(shift)){
        if (key == id){
          shift[`${id}`]['active'] = true
        }
        else {
          shift[`${key}`].active = false;
        }
      }
    }
    this.setState(shift);
  }

  showSlider(){
    return <div className="input-group col-8" style={{'margin-top':'15px'}}>
        <div clasNames="input-group-prepend">
          <button className="btn btn-outline" type="button" onClick = {this.addInput}>Добавить интервал</button>
        </div>
        <select className="custom-select col-4" onChange={e=>{this.setState({interval:e.target.value})}}>
          <option selected value="0">Начало смены</option>
          <option value="1">Конец смены</option>
          <option value="2">Полная смена</option>
          <option value="3">Промежуточный интервал</option>
        </select>
      </div>
  }

  showInputs(){
    let day = this.findActiveDay();
    if(typeof day !== 'undefined'){
      const {intervals} = this.state.shift[`${day}`];
      const {setRangeValue} = this.props;
      return intervals.map(item=>{
        return <div className='col-8' key = {item[Object.keys(item)[0]].id}>
          <div className='row'>
            <label className='col-4'>{this.type[Object.keys(item)[0]]}</label>
          </div>
          <div className='row'>
            <span class="badge badge-light col-1">{this.getCurientRangeValues(item[Object.keys(item)[0]].id)[0]}</span>
            <div className='col-8' style={{'margin-top':'7px'}}>
              <Range
                min = {setRangeValue(item[Object.keys(item)[0]])[0]}
                max = {setRangeValue(item[Object.keys(item)[0]])[1]}
                step= {1}
                onAfterChange = {this.onAfterChange(item[Object.keys(item)[0]].id)} 
              />
            </div>
            <span class="badge badge-light col-1">{this.getCurientRangeValues(item[Object.keys(item)[0]].id)[1]}</span>
            <button className='btn btn-danger btn-sm col-2' onClick={this.deleteInput(item[Object.keys(item)[0]].id)}>Удалить</button>
          </div>
        </div>
      })
    };
    return null;
  }

  getCurientRangeValues = index =>{
    let day = this.findActiveDay();
    let {setHours} = this.props;
    if(day != null){
      let {intervals} = this.state.shift[`${day}`]
      if(typeof intervals[index] !== 'undefined' && typeof intervals[index].begin != 'undefined'){

        let begin = setHours(intervals[index].begin);
        let end   = setHours(intervals[index].end);
        return [begin,end]
      }
      else{
        return ['00:00','24:00']
      }
    }
  }

  addInput = () => {
    let day = this.findActiveDay();

    if(typeof day !=='undefined'){
      let {intervals} = this.state['shift'][`${day}`];
      const type = this.state.interval

      //Валидация : нельзя добавить два одинаковых типа интервалов кроме промежуточного интервала
      if(type == 0 ) {
        for (let item of intervals){
          if (Object.keys(item)[0] == 0) {
            alert('Не возможно добавить два начальеых интервала');
            return null;
          }
        }
      }

      else{
        for (let item of intervals){
          if (Object.keys(item)[0] == 2 || Object.keys(item)[0] == 1) {
            alert('Не возможно добавить интервал после полной или конца смены');
            return null;
          }
        }
      }

      //Следующий ингтервал начинается с конца предыдущего
      let min = null;
      if(intervals.length > 0){
        for(let i=intervals.length-1;i>=0;i--){
          if(Object.keys(intervals[i])[0] !=1){
            min = intervals[i].end
            break;
          }
        }
      }
      let intervalObj = { [`${type}`] :{ begin: min == null ? 0 : min,end:288,id:parseInt(intervals.length,10) } };
      intervals.push(intervalObj);
      let shift = {...this.state.shift,...{[`${day}`] : {active:true,intervals:intervals}}}
      this.setState(shift);
    }
  }

  deleteInput = index => e => {
    let day = this.findActiveDay();
    if(day != null){
      let {intervals} = this.state['shift'][`${day}`];
      if (typeof intervals !== 'undefined'){
        let elementIndex = null;
        for (let key of Object.keys(intervals)){
          if(Object.values(intervals[key])[0].id == index){
            elementIndex = key;
          }
        }
        if(elementIndex!=null){
          intervals.splice(elementIndex,1);
          let shift = {...this.state.shift,...{ [`${day}`] : { active:true,intervals:intervals } } }
          this.setState(shift);
        }
      }
    }
  }

  findActiveDay(){
    const {shift} = this.state;
    for(let d of Object.keys(shift)){
      if(shift[`${d}`].active === true){
        return d;
      }
    }
    return null;
  }


  onAfterChange = index => value =>{
    let day = this.findActiveDay();
    if(day !=null){
      let {intervals} = this.state['shift'][`${day}`];
      intervals[index].begin = value[0];
      intervals[index].end = value[1];
      let shift = {...this.state.shift,...{ [`${day}`] : { active:true,intervals:intervals } } }
      this.setState(shift);
    }
  }
  
  setRef = ref =>{
    return findDOMNode(ref); 
  }
};

export default intervalChanger(SchiftIntervalChanger);
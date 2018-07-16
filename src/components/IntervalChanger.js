import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { changeScheduleValue } from '../AC';
import {connect} from 'react-redux';
import ReactDOM,{ findDOMNode } from 'react-dom';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

class IntervalChanger extends Component {
  constructor(props){
    super(props)
    
    this.type = {
      0:'Начало смены',
      1:'Конец смены',
      2:'Полная смена',
      3:'Интервал'
    }

    this.state = {
      interval:0,
      week:{
        monday:{active:true,intervals:[]},
        tuesday:{active:false,intervals:[]},
        wednesday:{active:false,intervals:[]},
        thursday:{active:false,intervals:[]},
        friday:{active:false,intervals:[]},
        saturday:{active:false,intervals:[]},
        sunday:{active:false,intervals:[]}
      }
    }
  }
  
  render() {
    return (
      <div>
        <label>Интервалы</label>
        <section className="rangeSlider">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <a className={this.state.week.monday.active ? "nav-link active":"nav-link"}href="#" id='monday' onClick={this.setActive} ref = {this.setRef}>пнд</a>
            </li>
            <li className="nav-item">
              <a className={this.state.week.tuesday.active ? "nav-link active":"nav-link"} href="#" id='tuesday' onClick={this.setActive} ref = {this.setRef}>втр</a>
            </li>
            <li className="nav-item">
              <a className={this.state.week.wednesday.active ? "nav-link active":"nav-link"} href="#" id='wednesday' onClick={this.setActive} ref = {this.setRef}>срд</a>
            </li>
            <li className="nav-item">
              <a className={this.state.week.thursday.active ? "nav-link active":"nav-link"} href="#" id='thursday' onClick={this.setActive} ref = {this.setRef} >чтв</a>
            </li>
            <li className="nav-item">
              <a className={this.state.week.friday.active ? "nav-link active":"nav-link"} href="#" id='friday' onClick={this.setActive} ref = {this.setRef} >птн</a>
            </li>
            <li className="nav-item">
              <a className={this.state.week.saturday.active ? "nav-link active":"nav-link"} href="#" id='saturday' onClick={this.setActive} ref = {this.setRef} >сбб</a>
            </li>
            <li className="nav-item">
              <a className={this.state.week.sunday.active ? "nav-link active":"nav-link"} href="#" id='sunday' onClick={this.setActive} ref = {this.setRef}>вск</a>
            </li>
          </ul>
          <div style = {{'margin-top':'20px'}}>
            {this.showSlider()}
          </div>
          <div id = 'inputs'>
            {this.showInputs()}
          </div>
        </section>
      </div>
    )
  }

  /**
   * Устанавливаем в state текущий объект напр мондай , остальныйе - фальс
   */
  setActive = ref =>{
    const id = ref.target.id;
    let obj = {...{},...this.state.week};
    let active = this.state['week'][`${id}`].active;
    for(let key of Object.keys(obj)){
      if(key == id){
        active ? obj[`${id}`]['active'] = false : obj[`${id}`]['active'] = true;
      }
      else{
        obj[`${key}`].active = false;
      }
    }
    let week = {} = obj;
    this.setState(week);
  }

  setRef = ref =>{
    return findDOMNode(ref);
  }

  showSlider(){
    return <div>
      <div className="input-group mb-3">
        <div clasNames="input-group-prepend">
          <button className="btn btn-outline" type="button" onClick = {this.addInput}>Добавить интервал</button>
        </div>
        <select className="custom-select" id="inputGroupSelect03" onChange={e=>{this.setState({interval:e.target.value})}}>
          <option selected value="0">Начало смены</option>
          <option value="1">Конец смены</option>
          <option value="2">Полная смена</option>
          <option value="3">Промежуточный интервал</option>
        </select>
      </div>
    </div>
  }

  showInputs(){
    for (let day of Object.keys(this.state.week)){
      if (this.state.week[`${day}`].active === true){
        const intervals = this.state.week[`${day}`].intervals;
        if(intervals.length){
          return intervals.map(item=>{
            return <div className='container' key = {item[Object.keys(item)[0]].id}>
              <div className='row'>
                <label className='col-4'>{this.type[Object.keys(item)[0]]}</label>
              </div>
              <div className='row'>
                <span class="badge badge-light col-1">{this.getCurientRangeValues(item[Object.keys(item)[0]].id)[0]}</span>
                <div className='col-8' style={{'margin-top':'7px'}}>
                  <Range
                    min = {this.setRangeVlue(item[Object.keys(item)[0]])[0]}
                    max = {this.setRangeVlue(item[Object.keys(item)[0]])[1]}
                    onAfterChange = {this.onAfterChange(item[Object.keys(item)[0]].id)} 
                  />
                </div>
                  <span class="badge badge-light col-1">{this.getCurientRangeValues(item[Object.keys(item)[0]].id)[1]}</span>
                <button className='btn btn-danger btn-sm col-2' onClick={this.deleteInput(item[Object.keys(item)[0]].id)}>Удалить</button>
              </div>
            </div>
          })
        }
      };
    }
    return null;
  }

  addInput = () => {
    let day;
    for(let d of Object.keys(this.state.week)){
      if(this.state['week'][`${d}`]['active'] === true) day = d;
    }
    if(typeof day !=='undefined'){
      let {intervals} = this.state['week'][`${day}`];

      //Валидация : нельзя добавить два одинаковых типа интервалов кроме промежуточного интервала
      if(this.state.interval == 0 ) {
        for (let item of intervals){
          if (Object.keys(item)[0] == 0) alert('Не возможно добавить два начальеых интервала')
          return null;
        }
      }
      else if(this.state.interval == 1 ){
        for (let item of intervals){
          if(Object.keys(item)[0]==1){
            alert("Не возможно добавить два конечных интервала"); 
            return null;
          }
        }
      }
      else if (this.state.interval == 2){
        for (let item of intervals){
          if (Object.keys(item)[0] == 2) alert('Не возможно добавить две полных смены');
          return null;
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
      let intervalObj = { [`${this.state.interval}`] :{ begin: min == null ? 6 : min,end:282,id:parseInt(intervals.length,10) } };
      intervals.push(intervalObj);
      let week = {...this.state.week,...{[`${day}`] : {active:true,intervals:intervals}}}
      this.setState(week);
    }
  }

  deleteInput = (index)=> e =>{
    for(let d of Object.keys(this.state.week)){
      if(this.state['week'][`${d}`]['active'] === true){
        let {intervals} = this.state['week'][`${d}`];
        if (typeof intervals !== 'undefined'){
          intervals.splice(index,1);
          let week = {...this.state.week,...{ [`${d}`] : { active:true,intervals:intervals } } }
          this.setState(week);
        }
      }
    }
  }

  setRangeVlue = intervalValue =>{
    if(typeof intervalValue !== 'undefined'){
      return [intervalValue.begin,intervalValue.end]
    }
  }

  //Устанавливает начальные значения для интервала
  getCurientRangeValues = index =>{
    let day = this.findActiveDay();
    if(day != null){
      let {intervals} = this.state.week[`${day}`]
      if(typeof intervals[index] !== 'undefined' && typeof intervals[index].begin != 'undefined'){
        let begin = this.setHours(intervals[index].begin);
        let end   = this.setHours(intervals[index].end);
        return [begin,end]
      }
      else{
        return ['00:30','23:30']
      }
    }
  }

  setHours(value){
    let h = (parseInt(value,10) *5) / 60 < 1 ? 0 : Math.floor((value*5)/60);
    let m = (parseInt(value,10) *5) % 60;
    return `${h}:${m}`
  }

  onAfterChange = index => value =>{
    let day = this.findActiveDay();
    if(day !=null){
      let {intervals} = this.state['week'][`${day}`];
      intervals[index].begin = value[0];
      intervals[index].end = value[1];
      let week = {...this.state.week,...{ [`${day}`] : { active:true,intervals:intervals } } }
      this.setState(week);
    }
  }

  findActiveDay(){
    let day;
    for(let d of Object.keys(this.state.week)){
      if(this.state['week'][`${d}`]['active'] === true) day = d;
      return d;
    }
    return null;
  }
};

export default connect(state=>({schedule:state.schedule}),{changeScheduleValue})(IntervalChanger);
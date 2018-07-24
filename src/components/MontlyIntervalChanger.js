import React, { Component } from 'react';
import PropTypes from 'prop-types';
//import { changeScheduleValue } from '../AC';
//import {connect} from 'react-redux';
import { findDOMNode } from 'react-dom';
import { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import intervalChanger from '../decorators/IntervalChanger'
import * as scheduleTemplate from '../lib/schedules';

class MontlyIntervalChanger extends Component {
  
  static propTypes = {
    //from store
    schedule: PropTypes.object.isRequired,
    type:PropTypes.object.isRequired,
    changeScheduleValueComplex:PropTypes.func.isRequired
  }

  constructor(props){
    super(props)
    
    this.type = this.props.type;

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

  shouldComponentUpdate(nextProps,nextSate){
    if(nextProps.fromtemplate != this.props.fromtemplate){
      const {fromtemplate} = nextProps;
      let  newSchedule = scheduleTemplate.default.week[`${fromtemplate}`];
      for (let day in newSchedule){
        for (let interval in newSchedule[`${day}`]['intervals']){
          const key = Object.keys(newSchedule [`${day}`] ['intervals'] [`${interval}`])[0];
          Object.assign(newSchedule [`${day}`] ['intervals'] [`${interval}`] [`${key}`],{id:interval} )
        }
      }
      this.setState({
        week:Object.assign(this.state.week,newSchedule)
      })
      return true;
    }
    else if (nextSate != this.state){
      return true;
    }
    return false;
  }

  render() {
    console.log("WeekInterval",this.state);
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
    const {id} = ref.target;
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
        <select className="custom-select col-4" onChange={e=>{this.setState({interval:e.target.value})}}>
          <option selected value="0">Начало смены</option>
          <option value="1">Конец смены</option>
          <option value="2">Полная смена</option>
          <option value="3">Промежуточный интервал</option>
        </select>
        <button type='button' className = 'btn btn-success'  style={{'margin-left':'50px'}}onClick={this.sentSchedule}>записать интервалы</button>
      </div>
    </div>
  }

  showInputs(){
    const {week} = this.state;
    const {setHours} = this.props;
    let day = this.findActiveDay();

    if(day != null){
      const {intervals} = week[`${day}`];
      return intervals.map(item=>{
        return <div className='container' key = {item[Object.keys(item)[0]].id}>
          <div className='row'>
            <label className='col-4'>{this.type[Object.keys(item)[0]]}</label>
          </div>
          <div className='row'>
            <span class="badge badge-light col-1">{setHours(this.getCurientRangeValues(item[Object.keys(item)[0]].id)[0])}</span>
            <div className='col-8' style={{'margin-top':'7px'}}>
              <Range
                min = {6}
                max = {288}
                value = {this.getCurientRangeValues(item[Object.keys(item)[0]].id)}
                onChange = {this.onRangeChange(item[Object.keys(item)[0]].id)}
              />
            </div>
            <span class="badge badge-light col-1">{setHours(this.getCurientRangeValues(item[Object.keys(item)[0]].id)[1])}</span>
            <button className='btn btn-danger btn-sm col-2' onClick={this.deleteInput(item[Object.keys(item)[0]].id)}>Удалить</button>
          </div>
        </div>
      })
    }
    return null;
  }

  addInput = () => {
    let day = this.findActiveDay();
    if(typeof day !=='undefined' || day!=null){
      let {intervals} = this.state['week'][`${day}`];
      //Валидация : нельзя добавить два одинаковых типа интервалов кроме промежуточного интервала
      const intervalType = this.state.interval;

      //Начальный интервал
      if(intervalType == 0){
        if(intervals.length != 0){
          alert('Начало смены не может начиинаться после интервала');
          return null;
        }
      }
      //Конечный интервал
      else if(intervalType == 1) {
        let begin = false;
        for (let item of intervals){
          let type = Object.keys(item)[0];
          //Если существует конечный или полный
          if(type == 1 || type == 2){
            alert("Конец интервала не может быть добавлен после полной смены или продублирован"); 
            return null;
          }
          if(type == 0){
            begin = true
          }
        }
        //Если нет конечного
        if(!begin){
          alert('Концу смены должен предшествовать интервал начала смены');
          return null;
        }
      }
      
      //Полная смена
      else if(intervalType == 2){
        if(intervals.length != 0){
          alert('Полная смена не может начинаться после интервала');
          return null;
        }
      }
      
      else if(intervalType == 3){
        for(let item of intervals){
          let type = Object.keys(item)[0];
          if(type == 1 || type == 2){
            alert('Не возможно добавить интервал после конца схемы'); return null;
          }
        }
      }

      //Следующий ингтервал начинается с конца предыдущего
      let min = null;
      if(intervals.length > 0){
        for(let i=intervals.length-1;i>=0;i--){
          let key = Object.keys(intervals[i])[0]
          if(key!=1){
            min = intervals[i][key].end
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

  deleteInput = index => e => {
    let day = this.findActiveDay();
    if(day != null){
      let {intervals} = this.state['week'][`${day}`];
      if (typeof intervals !== 'undefined'){
        let elementIndex = null;
        for (let key of Object.keys(intervals)){
          if(Object.values(intervals[key])[0].id == index){
            elementIndex = key;
          }
        }
        if(elementIndex!=null){
          intervals.splice(elementIndex,1);
          let week = {...this.state.week,...{ [`${day}`] : { active:true,intervals:intervals } } }
          this.setState(week);
        }
      }
    }
  }
  
  /**
   * intervalValue - object {bigin,end}
   * return array
   */
  setRangeValue = intervalValue =>{
    if(typeof intervalValue !== 'undefined'){
      return [intervalValue.begin,intervalValue.end]
    }
  }

  //Устанавливает начальные значения для интервала
  getCurientRangeValues = index =>{
    let day = this.findActiveDay();
    let {setHours} = this.props;
    if(day != null){
      let {intervals} = this.state.week[`${day}`];
      if(typeof intervals[index] !== 'undefined'){
        const interval = intervals [index] [Object.keys(intervals[index])[0]];
        let begin = typeof interval['begin'] === 'undefined' ? 6 : interval['begin'];
        let end = typeof interval['end']  === 'undefined' ? 288 : interval['end'];
        console.log(begin,end);
        return [begin,end]
      }

      else{
        return [6,288]
      }
    }
  }

  onRangeChange = index => value =>{
    let day = this.findActiveDay();
    if(day !=null){
      let {intervals} = this.state['week'][`${day}`];
      let key = Object.keys(intervals[index])[0];
      let interval = intervals[index][key];

      interval.begin = value [0];
      interval.end = value [1];
      
      Object.assign(intervals[index][key],interval);
      
      let week = {...this.state.week,...{ [`${day}`] : { active:true,intervals:intervals } } }
      this.setState(week);
    }
  }

  findActiveDay(){
    let {week} = this.state;
    for(let d of Object.keys(week)){
      if(week[`${d}`].active === true)
      return d;
    }
    return null;
  }

  sentSchedule = () =>{
    const {changeScheduleValueComplex} = this.props;
    const intervals = {intervals:this.state.week};
    changeScheduleValueComplex(intervals);
  }
  
  
};

export default intervalChanger(MontlyIntervalChanger);
//export default connect(state=>({schedule:state.schedule}),{changeScheduleValue})(MontlyIntervalChanger);
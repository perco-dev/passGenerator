import React,{Component} from 'react';
import ReactDom from "react-dom";
import Schedules from "./schedules";
import "bootstrap/dist/css/bootstrap.css";
import * as Launcher from '../lib/api/launcher';

class AutoGenerator extends Component{
  constructor(props){
    super(props);
    this.date = new Date();
    this.today = `${this.date.getFullYear()}-${this.date.getMonth() < 9 ? '0'+ (this.date.getMonth() + 1): (this.date.getMonth()+1)}-${this.date.getDate() < 10 ? '0' + this.date.getDate(): this.date.getDate()}`;
    this.state = {
      beginDate : ""/*this.today*/,
      endDate : this.today,
      schedule : Schedules.schedules[0].name,
      hours : 1
    }
  }
  render(){
    const schedulesList = Schedules.schedules.map((sch)=><option key = {sch.name}>{sch.name}</option>)
    return(
      <form onSubmit={this.onSubmit}>
          <div className="row">
            <div className = "col">
              <label>Начало периода</label> <input type ="date" className="form-control"  max = {`${this.today}`} value = {this.state.beginDate} onChange = {this.changeBegin}/>
            </div>
            <div className = "col">
              <label>Конец периода</label>  <input type ="date" className="form-control"  max = {`${this.today}`} value = {this.state.endDate} onChange = {this.changeEnd}/>
            </div>
            <div className="col">
              <label>График работы</label>
              <select className="form-control form-control-md"  value = {this.state.schedule} onChange ={this.changeSchedule}>
                {schedulesList}
              </select>
            </div>
            <div className="col">
              <label>Часов размазать</label> <input type ="number" className="form-control" min = {1} value = {this.state.hours} onChange = {this.changeHour}/>
            </div>
          </div>
            <button type="submit" className="btn btn-primary" style={{'marginTop':'20px'}}>Загенерировать</button>
      </form>
    )
  };

  changeBegin = (e)=>{
    this.setState({
      beginDate : e.target.value
    })
  }
  changeEnd = (e)=>{
    this.setState({
      endDate : e.target.value
    })
  }
  changeSchedule = (e)=>{
    this.setState({
      schedule : e.target.value
    })
  }
  changeHour = (e) =>{
    this.setState({
      hours : e.target.value
    })
  }

  onSubmit = ()=>{
    new Launcher.autoGenerator(this.state.beginDate,this.state.endDate,this.state.schedule,this.state.hours);
    event.preventDefault();
  }
}
export default AutoGenerator
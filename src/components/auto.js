import React,{Component} from 'react';
import ReactDom from "react-dom";
import Schedules from "./schedules";
import "bootstrap/dist/css/bootstrap.css";

class AutoGenerator extends Component{
  state = {
    beginDate : "",
    endDate: "",
    curDate : ()=>{
      if (typeof date === 'undefined'){} 
      let date = new Date();
      return `${date.getFullYear()}-${date.getMonth().length !=2 ? '0'+ (date.getMonth() + 1): (date.getMonth()+1)}-${date.getDate().length != 2 ? '0' + date.getDate(): date.getDay()}`;
    },
    schedule: "",
    hours : 0
  }

  render(){
    const schedulesList = Schedules.schedules.map((sch)=><option key = {sch.name}>{sch.name}</option>)
    return(
      <form onSubmit={this.onSubmit}>
          <div className="row">
            <div className = "col">
              <label>Начало периода</label> <input type ="date" className="form-control"   value = {this.state.beginDate} onChange = {this.changeBegin}/>
            </div>
            <div className = "col">
              <label>Конец периода</label>  <input type ="date" className="form-control"  max = {`${this.state.curDate()}`} value = {this.state.endDate.length == 0 ? this.state.curDate() : this.state.endDate} onChange = {this.changeEnd}/>
            </div>
            <div className="col">
              <label>График работы</label>
              <select className="form-control form-control-md"  value = {this.state.schedule} onChange ={this.changeSchedule}>
                {schedulesList}
              </select>
            </div>
            <div className="col">
              <label>Часов размазать</label> <input type ="number" className="form-control" value = {this.state.hours} onChange = {this.changeHour}/>
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
    alert(`generator run for period ${this.state.beginDate} - ${this.state.endDate} \n... please input your cvc code`);
    event.preventDefault();
  }
}
export default AutoGenerator
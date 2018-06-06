import React, {Component} from "react";
import ReactDom from "react-dom";
import MainSection from './mainSection'; 
import "bootstrap/dist/css/bootstrap.css";

class MainPage extends Component{
  state = {
    activeSection: "auto"
  }

  render(){
    return(
      <div className="container-fluid">
        <div className="row">
          <ul className = "nav nav-tabs">
            <li className = "nav item">
              <a className="nav-link active"onClick = {()=>this.setActiveSection("auto")} href="#">Авто генератор</a>
            </li>
            <li className = "nav item">
              <a className="nav-link active"onClick = {()=>this.setActiveSection("custom")} href="#">Настраиваемый генератор</a>
            </li>
            <li className = "nav item">
              <a className="nav-link active"onClick = {()=>this.setActiveSection("add")} href="#">Добавление проходов</a>
            </li>
            <li className = "nav item">
              <a className="nav-link active"onClick = {()=>this.setActiveSection("remove")} href="#">Удаление проходов</a>
            </li>
          </ul>
        </div>
        <div className="row">
          <div className="col-12" id="content">
            <MainSection section = {this.state.activeSection}/>
          </div>
        </div>
      </div>
    );
  }

  setActiveSection(section){
    if(section === "auto"){
      this.setState({activeSection:"auto"});
    }
    else if(section === "custom"){
      this.setState({activeSection:"custom"});
    }
    else if(section === "add"){
      this.setState({activeSection:"add"});
    }
    else if(section === "remove"){
      this.setState({activeSection:"remove"});
    }
  }
}

export default MainPage
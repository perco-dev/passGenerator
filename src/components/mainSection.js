import React,{Component} from 'react';
import ReaceDom from 'react-dom';
import propTypes from 'prop-types' ; // ES6
import AutoGenerator from './auto';
import "bootstrap/dist/css/bootstrap.css";

class MainSection extends Component{
  static propTypes = {
    section: propTypes.string.isRequired,
    updateMsg: propTypes.func.isRequired
  }

  render(){
    return(
      <div style={{'marginTop':'50px'}}>
        {this.showSection()}
      </div>
    )
  }

  showSection(){
    const {section,updateMsg} = this.props;
    if(section == "auto"){
      return <AutoGenerator updateMsg = {updateMsg}/>
    }
    else{
      return <p>"Ooops no component!!!"</p>
    }
  }

}

export default MainSection
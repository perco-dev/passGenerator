import React,{Component} from 'react';
import ReaceDom from 'react-dom';
import propTypes from 'prop-types' ; // ES6
import AutoGenerator from './auto';
import "bootstrap/dist/css/bootstrap.css";

class MainSection extends Component{

  render(){
    return(
      <div style={{'marginTop':'50px'}}>
        {this.showSection()}
      </div>
    )
  }

  showSection(){
    const section = this.props.section;
    if(section == "auto"){
      return <AutoGenerator/>
    }
    else{
      return <p>"Ooops no component!!!"</p>
    }
  }

}

MainSection.propTypes = {
  section : propTypes.string.isRequired
}

export default MainSection
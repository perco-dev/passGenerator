import React,{Component} from 'react';
import ReaceDom from 'react-dom';
import propTypes from 'prop-types' ; // ES6
import "bootstrap/dist/css/bootstrap.css";

class Terminal extends Component{

  render(){
    return(
      <output className="col-12" style = {{'backgroundColor':'#F0F0F0','height':`${window.innerHeight/4 - 50}px`,'border':'3px inset #E8E8E8'}}>
      </output>
    )
  }
}
export default Terminal
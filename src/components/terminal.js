import React, {Component} from 'react';
import propTypes from 'prop-types' ; // ES6
import "bootstrap/dist/css/bootstrap.css";

class Terminal extends Component{

  static propTypes = {
    text: propTypes.array.isRequired
  }

  render(){
    console.log("FFF",this.props);
    const {text} = this.props;
    return(
      <output className="col-12" style = {{
        'backgroundColor':'#F0F0F0',
        'height':`${window.innerHeight/4 - 50}px`,
        'border':'3px inset #E8E8E8',
        'overflow':'scroll'
        }}>
        {text.map(item=><p style = {{'font-family':'monospace','margin':'0px','color':'green'}}>{item}</p>)}
      </output>
    )
  }
}

export default Terminal
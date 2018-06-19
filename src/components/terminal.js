import React,{Component,PureComponent} from 'react';
import propTypes from 'prop-types' ; // ES6
import "bootstrap/dist/css/bootstrap.css";

class Terminal extends PureComponent{
  state = {
    text : '',
    list : []
  }

  componentWillUpdate(){
    console.log(this.state.text);
    this.state.list.push(this.state.text);
  }

  render(){
    
    return(
      <output className="col-12" style = {{
        'backgroundColor':'#F0F0F0',
        'height':`${window.innerHeight/4 - 50}px`,
        'border':'3px inset #E8E8E8',
        'overflow':'scroll'
        }}>
        {this.state.list.map(item=><p style = {{'font-family':'monospace','margin':'0px','color':'green'}}>{item}</p>)}
      </output>
    )
  }
}

export default Terminal
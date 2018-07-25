import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-responsive-modal';
import '../css/modalTerminal.css';

class ModalTerminal extends Component {

  static PropTypes = {
    //from some Generator
    closeModal : PropTypes.func.isRequired,
    open : PropTypes.bool.isRequired,
    //from connect
    terminal : PropTypes.object.isRequired
  }

  render() {
    const {open} = this.props;
    const {closeModal} = this.props;
    const {terminal} = this.props; 
    //console.log("****",terminal);
    const terminalList = terminal.map(item=>{
      let color;
      if(Object.keys(item)[0] == 'msg'){ color = 'green'}
      else if(Object.keys(item)[0] == 'warning') {color = 'orange'}
      else if(Object.keys(item)[0] == 'error') {color = 'red'}
      return <p style = {{'font-family':'monospace','margin':'0px','color':color } }>{item[`${Object.keys(item)[0]}`]}</p>
    })
    return (
      <Modal open={open} onClose = {closeModal} classNames={{ overlay:'custom-overlay', modal:'custom-modal' }}>
        <h6>AEGYPTO CAPTA</h6>
          <output className="col-12" 
            style = {{
              'backgroundColor':'#F0F0F0',
              'height':`${window.innerHeight/2 - 50}px`,
              'border':'3px inset #E8E8E8',
              'overflow':'scroll'
            }}>
            {terminalList}
          </output>
      </Modal>
    )
  }
};

export default ModalTerminal;
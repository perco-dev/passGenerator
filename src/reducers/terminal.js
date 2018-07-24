const initialterminalState = [
  { msg:'Чем ближе к пушкам противника, тем меньше от них вреда'}
]

export default (terminal = initialterminalState,action) => {
  const {type} = action;
  switch(type){
    case 'MESSAGE' : {
      terminal.push(action.payload);
      return terminal;
    };

    default : return terminal;
  }
}
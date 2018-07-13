export default (section = 'auto',action) => {
  const {type} = action;
  
  switch(type){
    case 'SECTION' : {
      return section = action.payload
    };
    default : return section;
  }
}
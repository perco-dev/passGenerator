export default (server = 'localhost',action) => {
  const {type} = action;
  
  switch(type){
    case 'SERVER' : {
      return server = action.payload
    };
    default : return server;
  }
}
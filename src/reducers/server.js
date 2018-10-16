export default (server = { host: 'localhost:8080', ssl: false}, action) => {
  const {type} = action;
  switch(type){
    case 'SERVER' : {
      return server = action.payload
    };
    default : return server;
  }
}
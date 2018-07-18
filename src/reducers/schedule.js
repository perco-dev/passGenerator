let date = new Date();
let now = `${date.getFullYear()}-${date.getMonth() < 9 ? '0'+ (date.getMonth() + 1): (date.getMonth()+1)}-${date.getDate() < 10 ? '0' + date.getDate(): date.getDate()}`;

const initialScheduleState = {
  beginDate: `${now}`,
  endDate:`${now}`,
  scheduleType:'Недельный',
  hours:1,
  name:null,
  allow_coming_later:{h:0,m:0},
  allow_leaving_before:{h:0,m:0},
  overtime:{h:0,m:0},
  undertime:{h:0,m:0},
  is_not_holiday:null,
  is_first_input_last_output:null,
  access_zones:[],
  no_access_zones:[],
  intervals:[]
}

export default (schedule = initialScheduleState,action)=>{
  const {type} = action
  switch(type){
    case 'SCHEDULE_CHANGE_SIMPLE_PROPERTY' : {
      return {...schedule,...action.payload}
    }
    case 'SCHEDULE_CHANGE_COMPLEX_PROPERTY' : {
      const {payload} = action;
      for(let key in payload){
        if(Object.prototype.hasOwnProperty.call(payload,key) && typeof schedule[key] !== 'undefined'){
          Object.assign(schedule[key],payload[key]);
        }
      }
      return schedule;
    }
    default : return initialScheduleState
  }
}
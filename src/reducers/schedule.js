let date = new Date();
let now = `${date.getFullYear()}-${date.getMonth() < 9 ? '0'+ (date.getMonth() + 1): (date.getMonth()+1)}-${date.getDate() < 10 ? '0' + date.getDate(): date.getDate()}`;

const initialScheduleState = {
  beginDate: `${now}`,
  endDate:`${now}`,
  scheduleType:'Сменный',
  hours:1,
  name:null,
  allow_coming_later:null,
  allow_leaving_before:null,
  overtime:null,
  undertime:null,
  is_not_holiday:null,
  is_first_input_last_output:null,
  access_zones:[],
  no_access_zones:[],
  intervals:[]
}

export default (schedule = initialScheduleState,action)=>{
  const {type} = action
  switch(type){
    case 'SCHEDULE_CHANGE' : {
      return {...initialScheduleState,...action.payload}
    }
    default : return initialScheduleState
  }
}
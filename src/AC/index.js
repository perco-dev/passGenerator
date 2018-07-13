export function changeSectionType(type){
  return {
    type:`SECTION`,
    payload:type
  }
}

export function changeScheduleValue(value){
  return{
    type:'SCHEDULE_CHANGE',
    payload:value
  }
}
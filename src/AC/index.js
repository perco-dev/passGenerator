export function changeSectionType(type){
  return {
    type:`SECTION`,
    payload:type
  }
}

export function changeScheduleValueSimple(value){
  return{
    type:'SCHEDULE_CHANGE_SIMPLE_PROPERTY',
    payload:value
  }
}
export function changeScheduleValueComplex(value){
  return{
    type: 'SCHEDULE_CHANGE_COMPLEX_PROPERTY',
    payload:value
  }
}

export function addMsgToTerminal(value){
  return {
    type: 'MESSAGE',
    payload: value
  }
}

export function changeServer(value){
  return {
    type: 'SERVER',
    payload: value
  }
}
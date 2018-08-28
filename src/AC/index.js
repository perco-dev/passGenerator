//Смена раздела меню
export function changeSectionType(type){
  return {
    type:`SECTION`,
    payload:type
  }
}

//Изменение графика
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

//Настраивемый генератор добавление помещения
export function addRoom(value){
  return {
    type: 'ADD_ROOM',
    payload:value
  }
}

//Добавление сообщения в модальное окно
export function addMsgToTerminal(value){
  return {
    type: 'MESSAGE',
    payload: value
  }
}

//Смена сервера
export function changeServer(value){
  return {
    type: 'SERVER',
    payload: value
  }
}
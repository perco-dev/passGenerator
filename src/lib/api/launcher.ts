import 'unfetch/polyfill';
import * as depend from './dependencies';
import * as prepare from './boots'
const headers = {'Content-Type':'application/json','Accept': 'application/json'};
const host = 'http://localhost:8080/api'; 
let dayCount:any = {
  0:checkFebruar(0),
  1:checkFebruar(1),
  2:checkFebruar(2),
  3:checkFebruar(3), 
  4:checkFebruar(4),
  5:checkFebruar(5),
  6:checkFebruar(6),
  7:checkFebruar(7),
  8:checkFebruar(8),
  9:checkFebruar(9),
  10:checkFebruar(10),
  11:checkFebruar(11),
};

class Launcher{
  begin: any;
  end: any;

  idsMap:any = new Map();
  dependencies: any = depend.default;

  protected willReplacedByIdsDep:any

  constructor(store:any){

    this.begin = store.beginDate;
    this.end = store.endDate;
  }
  
  //Валидация начала и конца генерации
  async checkDates():Promise<any>{
    if(this.begin.split('-').length != 3 || this.end.split('-').length !=3){
      return Promise.reject({error:'Не указана дата начала или конца генерации'})
    }
    else{
      return Promise.resolve({msg:"Дата начала и конца иетрвала - корректна"});
    }
  }
  
  //Формирование списка зависимых методов для метода
  async dependenciesListForming():Promise<any>{
    try{
      this.willReplacedByIdsDep = new Map(prepare.bootstrap("sysserver/addDeviceEvent").buildDepMap());
    }
    catch(e){
      return Promise.reject({error:`Не удалось сформировать зависимые методы : ${e}`});
    }
  return Promise.resolve({msg:'сформированы зависимые методы'});
  }

  //Добавление данных для зависимых методов
  async addMethodsData():Promise<any>{
    //Список зависимых методов
    let methodsComplete:any = [];
    try{
      //Данные для идентификатора
      this.willReplacedByIdsDep.get('users/staff')[0].body.hiring_date = this.begin;
      this.willReplacedByIdsDep.get('users/staff')[0].body.identifier[0].begin_datetime = this.begin;
      this.willReplacedByIdsDep.get('users/staff')[0].body.identifier[0].end_datetime = this.end;
      this.willReplacedByIdsDep.get('users/staff')[0].body.begin_datetime = this.begin;
      //перебираем методы
      for(let item of this.willReplacedByIdsDep.keys()){
        if (item === "sysserver/addDeviceEvent") continue;
    
        //для подстановки id в название метода например POST /devices/{id}/activate
        let methodString:any = Array.from(item.split("/"));
        if(methodString.length>1){
          if(typeof this.idsMap.get(methodString[0]) !== 'undefined' ){
            methodString[1] = this.idsMap.get(methodString[0]);
            methodString = methodString.join("/")
          }
          else{
            methodString = null;
          }
        }
        else{
          methodString = null;
        }
    
        //Добавляем ключ - название метода в map для хранения айдишников
        this.idsMap.set(item,[]);
    
        //массив значений fields из значений данных метода 
        let fds:any = this.willReplacedByIdsDep.get(item);
        //перебираем данные для метода
        for(let fd = 0;fd < fds.length;fd++){
          //формируем тело запроса
          let bodyData = typeof fds[fd].body === 'undefined' ? {} : fds[fd].body;
          //параметры запроса
          let query = typeof fds[fd].query === 'undefined' ? "" : "&" + queryParse(fds[fd].query);
          //Метод POST || PUT
          let method  = typeof this.dependencies[`${item}`].method === 'undefined' ? "PUT" : this.dependencies[`${item}`].method;
          //выполняем запрос
          var id = await asyncFetch(item,query,bodyData,methodString,method);
          methodsComplete.push(item);
        }
        //если в респонсе есть айди добавляем его в idsMap и вставляем значение в зависимости
        if(typeof id != 'undefined' && id != 0){
          this.idsMap.get(item).push(id);
          prepare.bootstrap(item).idSearcher(this.idsMap,this.willReplacedByIdsDep);
        }
      }
    }
    catch(e){
      return Promise.reject({error:`${e}`})
    }
    return Promise.resolve({msg:`методы ${methodsComplete} завершены успешно`});
  }

  //Удаляем данные из БД + детачим контроллер
  async deleteDatafromDB():Promise<any>{
    let methodsComplete:any = [];
    try{
      await asyncFetch(`devices/${this.idsMap.get('devices')[0]}/detach`,"",null,null,"POST")
      methodsComplete = await deleteDependencies(this.idsMap);
    }
    catch(e){
      return Promise.reject({error:`Не удалось удалить данные : ${e}`});
    }
    return Promise.resolve({msg:`методы ${methodsComplete} завершены успешно, удалите юзера и подразделение самостоятельно !!!`});
  }
}



class MonthlyLauncher extends Launcher{
  begin:any;
  end:any;
  allow_coming_later:any;
  allow_living_before:any;
  hours:any;
  intervals:any;
  is_first_input_last_output:any;
  is_not_holiday:any;
  name:any;
  overtime:any;
  undertime:any;
  aceess_zones:any = [];
  schedule_id:any;
  
  //Общее кол-во часов за промежуток по графику
  totalWorkTime:any = 0;
  //Кол-во рабочих дней
  workDayCount:any = 0;
  //Среднее кол-во часов врабочем дне по графику

  weekIndex:any = {0:'sunday',1:'monday',2:'tuesday',3:'wednesday',4:'thursday',5:'friday',6:'saturday'};
  
  willReplacedByIdsDep:any
  
  constructor(store:any){
    super(store);
    this.willReplacedByIdsDep = super.willReplacedByIdsDep;
    this.begin = store.beginDate;
    this.end = store.endDate
    this.allow_coming_later = store.allow_coming_later;
    this.allow_living_before = store.allow_living_before;
    this.hours = store.hours;
    this.intervals = store.intervals;
    this.is_first_input_last_output = store.is_first_input_last_output;
    this.is_not_holiday = store.is_first_input_last_output;
    this.is_not_holiday = store.is_not_holiday;
    this.name = store.name;
    this.overtime = store.overtime;
    this.undertime = store.undertime
  }
  
  async checkDates():Promise<any>{
    return await super.checkDates();
  }
  
  //ФОРМИРОВАНИЕ СПИСКА ЗАВИСИМЫХ МЕТОДОВ
  async dependenciesListForming():Promise<any>{
    return await super.dependenciesListForming();
  }

  //ДОБАВЛЕНИЕ АЙДИШНИКОВ В МЕТОДЫ (ВМЕСТО [METHOD]_ID_0||2 В dependencies)
  async addMethodsData():Promise<any>{
    //Добавляем айди графика к сотруднику
    try{
      this.willReplacedByIdsDep.get('users/staff')[0]['body']['work_schedule'] = this.schedule_id;
    }
    catch(e){
      return Promise.reject({error:`Не возможно добавить график пользователю : ${e}`});
    }
    return await super.addMethodsData();
  }

  //Удаление данных из бд
  async deleteDatafromDB():Promise<any>{
    try{  
      await asyncFetch(`taSchedule/${this.schedule_id}`,"",null,null,"DELETE");
    }
    catch(e){
      return Promise.reject({error:`Не возможно удалить график : ${e}`});
    }
    return await super.deleteDatafromDB();
  }
  
  //Прверка колличтва генерируемых часов
  async checkAverageWeekHours():Promise<any>{
    if(Object.keys(this.intervals).length == 0) return Promise.reject({error:"Не заданы интервалы"});

    if(typeof this.hours === 'undefined') return Promise.reject({error:"Не указано колличество часов"});
    
    try{
      await dayInterator(this.begin,this.end, async (year:any,month:any,day:any)=>{
        let date = new Date(parseInt(year),parseInt(month ) - 1,parseInt(day));
        let intervalArray = this.intervals[this.weekIndex[date.getDay()]]['intervals'];
        if(intervalArray.length != 0) {this.workDayCount++}
  
        for(let item in intervalArray){
          let key:any = Object.keys(intervalArray[item]);
          //minutes
          let intervalHours:number =  (parseInt(intervalArray[item][key]['end']) - parseInt(intervalArray[item][key]['begin'] )) * 5;
          this.totalWorkTime += intervalHours;
        }
      });
    }
    catch(e){
      return Promise.reject({error:`Ошибка подсчета рабочего времени`});
    }

    //minutes
   if (this.hours * 60 > this.totalWorkTime && this.hours < this.workDayCount * 24 * 60) {
      return Promise.resolve({warning:'Колличество часов для генерации ,больше чем часов в рабочих промежутках'});
    }
    //minutes
    else if (this.hours * 60 > this.workDayCount * 24 * 60){
      return Promise.reject({error:'Не возможно сгенерировать больше чем 24 часа в сутки или генерация производится в нерабочие дни'});
    }
    else{
      return Promise.resolve({msg:"График позволяет сгенерировать рабочее время без переработки"});
    }
  }
  
  //Добавление графика
  async addSchedule(){
    let scheduleIntervals:any = [];
    for(let day of Object.keys(this.intervals)){
      let dayObj:any = {desk:`${day}`,'intervals':[]}
      for(let interval in this.intervals[day]['intervals']){
        let key:string = Object.keys(this.intervals[day]['intervals'][interval])[0];
        dayObj['intervals'].push({
          type: parseInt(key),
          begin:this.intervals [ day ] [ 'intervals' ] [interval] [ key ] [ 'begin' ] * 5 * 60 ,
          end: this.intervals [ day ] [ 'intervals' ] [interval] [ key ] [ 'end' ] * 5 * 60 ,
        });
      }
      scheduleIntervals.push(dayObj);
    }

    //Достаем зону доступа
    let access_zone:any = [this.willReplacedByIdsDep.get('devices/{id}/attach')[0]['body']['accessZoneId']];
    //формируем боди для добавления графика
    let body = {
      name:this.name,
      work_schedule_type_id:2,
      allow_coming_later: `${await toSeconds(this.allow_coming_later)}`,
      allow_leaving_before: `${await toSeconds(this.allow_living_before)}` ,
      overtime:`${await toSeconds(this.overtime)}`,
      undertime:`${await toSeconds(this.undertime)}`,
      is_not_holiday: this.is_not_holiday != null ? this.is_not_holiday : false ,
      is_first_input_last_output: this.is_first_input_last_output != null ? this.is_first_input_last_output : false,
      begin_date:this.begin,
      intervals:scheduleIntervals,
      access_zones:access_zone
    }
    
    console.log("body",body);

    //Добавление графика в бд и редактирование сотрудника
    try{
      this.schedule_id = await asyncFetch('taSchedule',"",body,null,'PUT');
      if (typeof this.schedule_id !== 'undefined') {
        //добавляем график для в карту с данными
        this.willReplacedByIdsDep.get('users/staff')[0]['body']['work_schedule'] = this.schedule_id;
        //Достаем айдишник сотрудника для ПОСТ метода
        const userId = this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query']['userId'];
        if (typeof userId !=='undefined' ){
          await asyncFetch(`users/staff/${userId}`,'',this.willReplacedByIdsDep.get('users/staff')[0]['body'],null,'POST')
        }
        else{
          return Promise.reject({error:'Не возможно добавить график для сотрудника'})
        }
      }
    }
    catch(e){
      return Promise.reject({error:`Ошибка выполнения метода добавления графика : ${e}`});
    }
    return Promise.resolve({msg:'График работы успешно добавлен'});
  }

  //Генерация событий прохода
  async addEvent(){
    try{
      //Итерация по календарному , заданому интервалe
      await dayInterator(this.begin,this.end, async (year:number,month:number,day:number)=>{
        
        let date = new Date(year,month -1,day);
        let intervalArray = this.intervals[this.weekIndex[date.getDay()]]['intervals'];
        
        //Если есть интервалы в графике
        if(intervalArray.length != 0){
          //итерируемся по интервалам внутри дня графика
          for(let item in intervalArray){
            let key:any = Object.keys(intervalArray[item]);
            //рабочего времени в интервале  minutes
            let intervalMinutes:number =  (parseInt(intervalArray[item][key]['end']) - parseInt(intervalArray[item][key]['begin'] )) * 5;
            //Часть генерируемого времени для интервала (в % соотношении  время интервала /общее рабочее время ) seconds
            let generatedCurientIntervalSeconds:number = calculateGeneratedInterval(this.totalWorkTime,this.hours,intervalMinutes);
            //ORV не считает секунды поэтому выходим с ошибкой
            if (generatedCurientIntervalSeconds < 60 ){
              throw new Error('Генерируемый интервал меньше минуты, уменьшите интервал генерации');
            }
            //Достаем данные для события устройства
            let body = this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query'];
            //Сгенерирование время для интервала меньше чем интервал
            if (generatedCurientIntervalSeconds < intervalMinutes * 60){
              //время входа              
              let entryTime:any = parseInt(intervalArray[item][key]['begin']) * 5 * 60;
              //время выхода
              let outTime:any = entryTime + generatedCurientIntervalSeconds;
              //Устанавливаем время
              body['date'] = `${year}-${month}-${day}:${timeFormatingFromSeconds(entryTime)}`;
              //тип ресурса - вход
              body['resource'] = 1;
              await asyncFetch('sysserver/addDeviceEvent',`&${queryParse(body)}`,null,null,'PUT');
              
              //Устанавливаем время
              body['date'] = `${year}-${month}-${day}:${timeFormatingFromSeconds(outTime)}`;
              //тип ресурса - выход
              body['resource'] = 2;
              await asyncFetch('sysserver/addDeviceEvent',`&${queryParse(body)}`,null,null,'PUT');
            }
            else if(generatedCurientIntervalSeconds > intervalMinutes * 60){
              throw new Error('упс, этого я еще не предумал');
            }
          }
        }
      });
    }
    catch(e){
      return Promise.reject({error:`Ошибка генерирования прохода : ${e}`});
    }
    return Promise.resolve({msg:'Проходы сгенерированы'});
  }
  
  //ORV
  async timeTracking(){
    let query = `&dateBegin=${this.begin}&dateEnd=${this.end}`;
    try{
      var timeTrackingResult = await asyncFetch('taReports/timetracking',query,null,null,"GET");
    }
    catch(e){
      return Promise.reject({error:`${e}`});
    }
    let userId:number = typeof this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query']['userId'] === 'undefined' ? null : this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query']['userId'];
    if (userId === null) {return Promise.reject({error:'Не возможно подсчитать орв для пользователя'})};
    let result = JSON.parse(timeTrackingResult)['rows'];
    let orvtotalTime:any = 0;
    if (result.length !=0){
      for(let key of Object.keys(result)){
        if(result[key]['id'] == userId){
          let wT = result[key]['work_time'].split(":");
          orvtotalTime += await toSeconds({h:`${parseInt(wT[0])}`,m:`${parseInt(wT[1])}`});
        }
      }
    }
    else{
      return Promise.reject({error:'Нет орв данных'})
    }
    console.log('orv:',timeTrackingResult);
    return Promise.resolve({warning:`сгенерировано часов : ${this.hours} результат ОРВ:${timeFormatingFromSeconds(orvtotalTime)}`});
  }

}

/**
 * @param ids массив типа метод - id
 * возвращает void
 */
async function deleteDependencies(ids:any){
  let methodsComplete = [];
  for (let item of ids.keys()){
    if(item !== 'divisions' && item !=='users/staff' && item!=='devices/{id}/attach'){
      for(let key in ids.get(item)){
        await asyncFetch(item,"",null,`${item}/${ids.get(item)[key]}`,"DELETE");
      }
      methodsComplete.push(item);
    }
  }
  return methodsComplete;
}

async function asyncFetch(item:string,query:string,bodyData:any,methodString:any,method:string){
  let response:any;
  try {
    if(method != 'GET'){
      response = await fetch(`${host}/${methodString == null ? item : methodString}?token=master${methodString == null ? query : ""}`,{
        mode:'cors',
        headers : headers,
        method:method,
        body:`${bodyData != null ? JSON.stringify(bodyData) : ""}`
      });
    }
    else {
      response = await fetch(`${host}/${methodString == null ? item : methodString}?token=master${methodString == null ? query : ""}`,{
        mode:'cors',
        headers : headers,
        method:method,
      });
    }
    

    let responseBody  = await response.text();
    // Если айдишник 1
    if(typeof JSON.parse(responseBody).id !== 'undefined'){
      return JSON.parse(responseBody).id;
    }
    //Если массив
    else if(typeof JSON.parse(responseBody).ids !== "undefined"){
      return JSON.parse(responseBody).ids[0];
    }
    //Если Ок
    else if(typeof JSON.parse(responseBody).result !== 'undefined'){
      return 0;
    }
    else if(method == 'GET'){
      return responseBody;
    }
    else if(typeof JSON.parse(responseBody).error !== 'undefined'){
      throw new Error('метод вернул error');
    }
  }
  catch(error){
    throw new Error(error);
  }
}

/**
 * 
 * @param queryTail формирует строку запроса в соответствии с стандартом 
 */
function queryParse(queryTail:any){
  let params:any = [];
  Object.keys(queryTail).forEach(el=>{
    params.push(`${el}=${queryTail[el]}`);
  });
  let str = params.join("&");
  return str;
}

//Возвращает кол-во дней в месяце
function checkFebruar(monthNumber:number){
  return (year:number) => {
    if(monthNumber == 1){
      if(year % 400 == 0 && year % 100 == 0){
        return 28
      }
      else if(year % 4 != 0){
        return 28
      }
      return 31;
    }
    else if (monthNumber == 0)  return 31;
    else if (monthNumber == 2)  return 31;
    else if (monthNumber == 3)  return 30;
    else if (monthNumber == 4)  return 31;
    else if (monthNumber == 5)  return 30;
    else if (monthNumber == 6)  return 31;
    else if (monthNumber == 7)  return 31;
    else if (monthNumber == 8)  return 30;
    else if (monthNumber == 9)  return 31;
    else if (monthNumber == 10) return 30;
    else if (monthNumber == 11) return 31;
  }
}

function getRandomInt(max:number) {
  const r = Math.floor(Math.random() * Math.floor(max));
  return r == 0 ? 1 : r;
}

async function toSeconds(time:any){
  return typeof time == 'undefined' ? 0 : time.h*3600 + time.m * 60;
}

/**
 * 
 * @param time время в секундах 
 * возвращает строку вида чч:мм:сс
 */
function timeFormatingFromSeconds(time:number){
  if (time == 0) return '00:00:00';
  let h:any = Math.floor(time/3600);
  let m:any = Math.floor((time - h*3600)/60);
  let s:any = time - (h *3600) - (m*60);

  h = h < 10 ? '0' + `${h}` : `${h}`;
  m = m < 10 ? '0' + `${m}` : `${m}`;
  s = s < 10 ? '0' + `${s}` : `${s}`;

  return `${h}:${m}:${s}`
}

//Итератор по календарному интервалу
async function dayInterator(begin:any,end:any,func:any){
  begin = begin.split('-');
  end = end.split('-');
  
  begin[1] = parseInt(begin[1]) - 1;
  end[1] = parseInt(end[1]) - 1;
  

  let start:any  = new Date(begin[0],begin[1],begin[2])//begin.split('-');
  let finish:any = new Date(end[0],end[1],end[2]);//end.split('-');
  for (start;start<=finish;start.setDate(start.getDate() + 1)){
    let month:any = parseInt(start.getMonth()) + 1;
    month = month < 10 ? '0' + `${month}` : `${month}`; 
    await func(start.getFullYear(),month,start.getDate());
  }
}

function calculateGeneratedInterval(totalWorkTime:number,generatedTotalTime:number,intervalTotalMinutes:number){
  return Math.round((generatedTotalTime * 36) * ((intervalTotalMinutes * 60) / (totalWorkTime * 60 / 100)));
}

export function monthlyLauncher(schedule:any){
  return new MonthlyLauncher(schedule);
};
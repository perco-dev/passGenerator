import 'unfetch/polyfill';
import * as depend from './dependencies';
import * as prepare from './boots'
const headers = {'Content-Type':'application/json','Accept': 'application/json'};
const host = 'http://localhost:8080/api'; 

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
      return Promise.resolve({msg:"все хорошо"});
    }
  }
  
  //Формирование списка зависимых методов для метода
  async dependenciesListForming():Promise<any>{
    try{
      this.willReplacedByIdsDep = new Map(prepare.bootstrap("sysserver/addDeviceEvent").buildDepMap());
    }
    catch(e){
      return Promise.reject({error:`${e}`});
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
      return Promise.reject({error:`${e}`});
    }
    return Promise.resolve({msg:`методы ${methodsComplete} завершены успешно , \nудалите юзера и подразделение самостоятельно !!!`});
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
  schedule_id:any
  
  //Общее кол-во часов за промежуток по графику
  totalWorkTime:any = 0;
  //Кол-во рабочих дней
  workDayCount:any = 0;
  //Среднее кол-во часов врабочем дне по графику
  workDayHoursAverage:any = 0;

  weekIndex:any = {0:'sunday',1:'monday',2:'tuesday',3:'wednesday',4:'thursday',5:'friday',6:'saturday'};
  dayCount:any  = {
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

  async dependenciesListForming():Promise<any>{
    return await super.dependenciesListForming()
  }

  async addMethodsData():Promise<any>{
    return await super.addMethodsData()
  }

  async deleteDatafromDB():Promise<any>{
    return await super.deleteDatafromDB()
  }

  async checkAverageWeekHours():Promise<any>{
    let start = this.begin.split('-');
    let finish = this.end.split('-');
    if(Object.keys(this.intervals).length == 0) return Promise.reject({error:"Не заданы интервалы"});
    if(typeof this.hours === 'undefined') return Promise.reject({error:"Не указано колличество часов"});

    //Подсчет рабочеггоо времени за интервал

    try{
      year: 
        for (let year:any = parseInt(start[0]); year <= parseInt(finish[0]); year++){
        let month = year > parseInt(start[0]) ? 0 : parseInt(start[1]) - 1;
        for(month; month < 12; month++){
          let day;
          if (month != parseInt(start[1]) && year != parseInt(start[0])){
            day = 0;
          }
          else{
            day = parseInt(start[2]);
          }
          for(day; day <= this.dayCount[month](year); ++day){
            if(day > parseInt(finish[2]) && month >= (parseInt(finish[1])-1) && year >= parseInt(finish[0])) {
              break year;
            }
            else{
              let date = new Date(year,month,day);
              //Интервалы текущего дня
              let intervalArray = this.intervals[this.weekIndex[date.getDay()]]['intervals'];
              //console.log(`${ this.weekIndex [date.getDay()]}`,intervalArray);
              if(intervalArray.length != 0) {
                this.workDayCount++
              }          
              for(let item in intervalArray){
                let key:any = Object.keys(intervalArray[item]);
                //console.log( intervalArray[item][key])
                let intervalHours:number =  parseInt(intervalArray[item][key]['end']) - parseInt(intervalArray[item][key]['begin']);
                this.totalWorkTime += intervalHours * 5;
              }
            }
          }
        }
      }
      this.workDayHoursAverage = (this.totalWorkTime) / this.workDayCount
    }
    catch(e){
      return Promise.reject({error:`${e}`});
    }
    if (Math.floor((parseInt(this.totalWorkTime) * 5)/60) > this.hours) {
      return Promise.resolve({msg:'Колличество часов не больше колличества рабочего времени'});
    }
    else{
      return Promise.reject({error:"Колличество часов превышает колличество рабочего времени за указанный промежуток"});
    }
  }
  
  //Добавление графика
  async addSchedule(){
    let scheduleIntervals:any = [];
    for(let day of Object.keys(this.intervals)){
      let dayObj:any = {/*desk:`${day}`,*/'intervals':[]}
      for(let interval in this.intervals[day]['intervals']){
        let key:string = Object.keys(this.intervals[day]['intervals'][interval])[0];
        let curientInterval:any = {
          type: parseInt(key),
          begin:this.intervals [ day ] [ 'intervals' ] [interval] [ key ] [ 'begin' ] * 5 * 60 ,
          end: this.intervals [ day ] [ 'intervals' ] [interval] [ key ] [ 'end' ] * 5 * 60 ,
        }
        dayObj['intervals'].push(curientInterval)
      }
    scheduleIntervals.push(dayObj);
    }

    //Достаем зону доступа
    let access_zone:any = [this.willReplacedByIdsDep.get('devices/{id}/attach')[0]['body']['accessZoneId']];
    //формируем боди для добавления графика
    let body = {
      name:this.name,
      type:2,
      allow_coming_later: `${await toSeconds(this.allow_coming_later)}`,
      allow_leaving_before: `${await toSeconds(this.allow_living_before)}`,
      overtime: `${await toSeconds(this.overtime)}`,
      undertime: `${await toSeconds(this.undertime)}`,
      is_not_holiday: this.is_not_holiday != null ? this.is_not_holiday : false ,
      is_first_input_last_output: this.is_first_input_last_output != null ? this.is_first_input_last_output : false,
      begin_date:this.begin,
      intervals:scheduleIntervals,
      access_zones:access_zone
    }

    try{
      var scheduleId = await asyncFetch('taSchedule',"",body,null,'PUT');
      if (typeof scheduleId !== 'undefined') this.schedule_id = scheduleId;
    }
    catch(e){
      return Promise.reject({error:`Ошибка выполнения метода добавления графика : ${e}`});
    }
    return Promise.resolve({msg:'График работы успешно добавлен'});
  }

  //Генерация событий прохода
  async addEvent(){
    let start = this.begin.split('-');
    let finish = this.end.split('-');

    console.log("!!!",this.willReplacedByIdsDep);
    try{
      year: 
        for (let year:any = parseInt(start[0]); year <= parseInt(finish[0]); year++){
        let month = year > parseInt(start[0]) ? 0 : parseInt(start[1]) - 1;
        for(month; month < 12; month++){
          let day;
          if (month != parseInt(start[1]) && year != parseInt(start[0])){
            day = 0;
          }
          else{
            day = parseInt(start[2]);
          }
          for(day; day <= this.dayCount[month](year); ++day){
            if(day > parseInt(finish[2]) && month >= (parseInt(finish[1])-1) && year >= parseInt(finish[0])) {
              break year;
            }
            else{
              let date = new Date(year,month,day);
              //Интервалы текущего дня
              let intervalArray = this.intervals[this.weekIndex[date.getDay()]]['intervals'];
              
              //массив длительностей интервалов текущего дня         
              let curientDayHours:any = [];
              //Общеее число часов в интервалах
              let totalDayHours:any = 0;

              for(let item in intervalArray){
                let key:any = Object.keys(intervalArray[item]);
                //console.log( intervalArray[item][key])
                let intervalHours:number =  parseInt(intervalArray[item][key]['end']) - parseInt(intervalArray[item][key]['begin']);
                totalDayHours += intervalHours * 5;
                //Добавляем интервал
                curientDayHours.push(intervalHours * 5);
              }
              let generatedAverageHours:number = (this.hours * 60) / this.workDayCount

              //если среднее кол-во часов для генерации меньше среднего кол-ва рабочих часов
              if ( generatedAverageHours < this.workDayHoursAverage){
                for(let item in intervalArray){
                  let key:any = Object.keys(intervalArray[item]);
                  //Отношение текущего интервала ко всему временному промежутку в ПРОЦЕНТАХ %
                  let intervalRatioForDay:number = Math.floor(curientDayHours[item] / (this.workDayHoursAverage/100));
                  //вычисляем часть размазаного интревала для данного интервала
                  /**
                   * TODO точное время размазывания
                   */
                  let generatedRatioMinutesforInterval:number = Math.floor((generatedAverageHours/100) * intervalRatioForDay);
                  //"Нерабочие" простои в интервале
                  let emptyIntervalSpace = curientDayHours[item] - generatedRatioMinutesforInterval;
                  //Колличество входов - выходо за интервал
                  let RandomEnterExit = getRandomInt(3);
                  let nextEnter = curientDayHours[item] / RandomEnterExit;
                  let h:any = Math.floor(intervalArray[item][key]['begin'] * 5 / 60) < 10 ? '0' + `${Math.floor(intervalArray[item][key]['begin'] * 5 / 60)}` : `${Math.floor(intervalArray[item][key]['begin'] * 5 / 60)}`;
                  let m:any = Math.floor(intervalArray[item][key]['begin'] * 5 ) - (h * 60) < 10 ? '0' + `${Math.floor(intervalArray[item][key]['begin'] * 5 ) - (h * 60)}` : Math.floor(intervalArray[item][key]['begin'] * 5 ) - (h * 60);
                  
                  let dateMonth:string = month < 10 ? '0' + `${month}` : `${month}`; 
                  let dateDay = day < 10 ? '0' + `${day}` : day;

                  let entryDate:string =`${year}:${dateMonth}:${dateDay}:${h}:${m}`;
                  this.willReplacedByIdsDep.set('sysserver/addDeviceEvent',[ { ['query'] :  {...this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query'],...{'date': entryDate } } } ] );
                  let eventPlcData:any = this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query'];
                  
                  let query = '&' + queryParse(eventPlcData);
                  //выполняем запрос
                  try{
                    await asyncFetch('sysserver/addDeviceEvent',query,null,null,"PUT");
                  }
                  catch(e){
                    return Promise.reject({error:`${e}`});
                  }
                  /*
                  for (let i = 0;i<RandomEnterExit;i++){
                    
                  }
                  */
                  //console.log('----',curientDayHours[item],generatedRatioMinutesforInterval,emptyIntervalSpace,this.willReplacedByIdsDep);
                }  
              }
            }
          }
        }
      }
      this.workDayHoursAverage = (this.totalWorkTime * 5) / this.workDayCount
    }
    catch(e){
      return Promise.reject({error:`${e}`});
    }
    return Promise.resolve({msg:'It was willReplacedByIdsDep'});
  }
  
  //ORV
  async timeTracking(){
    console.log('start timetracking');
    let query = `&dateBegin=${this.begin}&dateEnd=${this.end}`;
    try{
      var timeTrackingResult = await asyncFetch('taReports/timetracking',query,null,null,"GET");
    }
    catch(e){
      return Promise.reject({error:`${e}`});
    }
    console.log("result:",timeTrackingResult);
    
    return Promise.resolve({msg:'time done'});
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
  return Math.floor(Math.random() * Math.floor(max));
}

async function toSeconds(time:any){
  return typeof time == 'undefined' ? 0 : time.h*3600 + time.m * 60;
}

export function monthlyLauncher(schedule:any){
  return new MonthlyLauncher(schedule);
};
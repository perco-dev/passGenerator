"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("unfetch/polyfill");
const depend = require("./dependencies");
const prepare = require("./boots");
const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
const host = 'http://localhost:8080/api';
let dayCount = {
    0: checkFebruar(0),
    1: checkFebruar(1),
    2: checkFebruar(2),
    3: checkFebruar(3),
    4: checkFebruar(4),
    5: checkFebruar(5),
    6: checkFebruar(6),
    7: checkFebruar(7),
    8: checkFebruar(8),
    9: checkFebruar(9),
    10: checkFebruar(10),
    11: checkFebruar(11),
};
class Launcher {
    constructor(store) {
        this.idsMap = new Map();
        this.dependencies = depend.default;
        this.begin = store.beginDate;
        this.end = store.endDate;
    }
    //Валидация начала и конца генерации
    checkDates() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.begin.split('-').length != 3 || this.end.split('-').length != 3) {
                return Promise.reject({ error: 'Не указана дата начала или конца генерации' });
            }
            else {
                return Promise.resolve({ msg: "все хорошо" });
            }
        });
    }
    //Формирование списка зависимых методов для метода
    dependenciesListForming() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.willReplacedByIdsDep = new Map(prepare.bootstrap("sysserver/addDeviceEvent").buildDepMap());
            }
            catch (e) {
                return Promise.reject({ error: `Не удалось сформировать зависимые методы : ${e}` });
            }
            return Promise.resolve({ msg: 'сформированы зависимые методы' });
        });
    }
    //Добавление данных для зависимых методов
    addMethodsData() {
        return __awaiter(this, void 0, void 0, function* () {
            //Список зависимых методов
            let methodsComplete = [];
            try {
                //Данные для идентификатора
                this.willReplacedByIdsDep.get('users/staff')[0].body.hiring_date = this.begin;
                this.willReplacedByIdsDep.get('users/staff')[0].body.identifier[0].begin_datetime = this.begin;
                this.willReplacedByIdsDep.get('users/staff')[0].body.identifier[0].end_datetime = this.end;
                //перебираем методы
                for (let item of this.willReplacedByIdsDep.keys()) {
                    if (item === "sysserver/addDeviceEvent")
                        continue;
                    //для подстановки id в название метода например POST /devices/{id}/activate
                    let methodString = Array.from(item.split("/"));
                    if (methodString.length > 1) {
                        if (typeof this.idsMap.get(methodString[0]) !== 'undefined') {
                            methodString[1] = this.idsMap.get(methodString[0]);
                            methodString = methodString.join("/");
                        }
                        else {
                            methodString = null;
                        }
                    }
                    else {
                        methodString = null;
                    }
                    //Добавляем ключ - название метода в map для хранения айдишников
                    this.idsMap.set(item, []);
                    //массив значений fields из значений данных метода 
                    let fds = this.willReplacedByIdsDep.get(item);
                    //перебираем данные для метода
                    for (let fd = 0; fd < fds.length; fd++) {
                        //формируем тело запроса
                        let bodyData = typeof fds[fd].body === 'undefined' ? {} : fds[fd].body;
                        //параметры запроса
                        let query = typeof fds[fd].query === 'undefined' ? "" : "&" + queryParse(fds[fd].query);
                        //Метод POST || PUT
                        let method = typeof this.dependencies[`${item}`].method === 'undefined' ? "PUT" : this.dependencies[`${item}`].method;
                        //выполняем запрос
                        var id = yield asyncFetch(item, query, bodyData, methodString, method);
                        methodsComplete.push(item);
                    }
                    //если в респонсе есть айди добавляем его в idsMap и вставляем значение в зависимости
                    if (typeof id != 'undefined' && id != 0) {
                        this.idsMap.get(item).push(id);
                        prepare.bootstrap(item).idSearcher(this.idsMap, this.willReplacedByIdsDep);
                    }
                }
            }
            catch (e) {
                return Promise.reject({ error: `${e}` });
            }
            return Promise.resolve({ msg: `методы ${methodsComplete} завершены успешно` });
        });
    }
    //Удаляем данные из БД + детачим контроллер
    deleteDatafromDB() {
        return __awaiter(this, void 0, void 0, function* () {
            let methodsComplete = [];
            try {
                yield asyncFetch(`devices/${this.idsMap.get('devices')[0]}/detach`, "", null, null, "POST");
                methodsComplete = yield deleteDependencies(this.idsMap);
            }
            catch (e) {
                return Promise.reject({ error: `Не удалось удалить данные : ${e}` });
            }
            return Promise.resolve({ msg: `методы ${methodsComplete} завершены успешно, удалите юзера и подразделение самостоятельно !!!` });
        });
    }
}
class MonthlyLauncher extends Launcher {
    constructor(store) {
        super(store);
        this.aceess_zones = [];
        this.workEra = {};
        //Общее кол-во часов за промежуток по графику
        this.totalWorkTime = 0;
        //Кол-во рабочих дней
        this.workDayCount = 0;
        //Среднее кол-во часов врабочем дне по графику
        this.weekIndex = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
        this.willReplacedByIdsDep = super.willReplacedByIdsDep;
        this.begin = store.beginDate;
        this.end = store.endDate;
        this.allow_coming_later = store.allow_coming_later;
        this.allow_living_before = store.allow_living_before;
        this.hours = store.hours;
        this.intervals = store.intervals;
        this.is_first_input_last_output = store.is_first_input_last_output;
        this.is_not_holiday = store.is_first_input_last_output;
        this.is_not_holiday = store.is_not_holiday;
        this.name = store.name;
        this.overtime = store.overtime;
        this.undertime = store.undertime;
    }
    checkDates() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super("checkDates").call(this);
        });
    }
    //ФОРМИРОВАНИЕ СПИСКА ЗАВИСИМЫХ МЕТОДОВ
    dependenciesListForming() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super("dependenciesListForming").call(this);
        });
    }
    //ДОБАВЛЕНИЕ АЙДИШНИКОВ В МЕТОДЫ (ВМЕСТО [METHOD]_ID_0||2 В dependencies)
    addMethodsData() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            //Добавляем айди графика к сотруднику
            try {
                this.willReplacedByIdsDep.get('users/staff')[0]['body']['work_schedule'] = this.schedule_id;
            }
            catch (e) {
                return Promise.reject({ error: `Не возможно добавить график пользователю : ${e}` });
            }
            return yield _super("addMethodsData").call(this);
        });
    }
    deleteDatafromDB() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield asyncFetch(`taSchedule/${this.schedule_id}`, "", null, null, "DELETE");
            }
            catch (e) {
                return Promise.reject({ error: `Не возможно удалить график : ${e}` });
            }
            return yield _super("deleteDatafromDB").call(this);
        });
    }
    checkAverageWeekHours() {
        return __awaiter(this, void 0, void 0, function* () {
            //let start = this.begin.split('-');
            //let finish = this.end.split('-');
            if (Object.keys(this.intervals).length == 0)
                return Promise.reject({ error: "Не заданы интервалы" });
            if (typeof this.hours === 'undefined')
                return Promise.reject({ error: "Не указано колличество часов" });
            try {
                yield dayInterator(this.begin, this.end, (year, month, day) => __awaiter(this, void 0, void 0, function* () {
                    let date = new Date(year, month, day);
                    let intervalArray = this.intervals[this.weekIndex[date.getDay()]]['intervals'];
                    if (intervalArray.length != 0) {
                        this.workDayCount++;
                    }
                    for (let item in intervalArray) {
                        let key = Object.keys(intervalArray[item]);
                        //minutes
                        let intervalHours = (parseInt(intervalArray[item][key]['end']) - parseInt(intervalArray[item][key]['begin'])) * 5;
                        this.totalWorkTime += intervalHours;
                    }
                }));
            }
            catch (e) {
                return Promise.reject({ error: `Ошибка подсчета рабочего времени` });
            }
            //minutes
            if (this.hours * 60 > this.totalWorkTime && this.hours < this.workDayCount * 24 * 60) {
                return Promise.resolve({ warning: 'Колличество часов для генерации ,больше чем часов в рабочих промежутках' });
            }
            //minutes
            else if (this.hours * 60 > this.workDayCount * 24 * 60) {
                return Promise.reject({ error: 'Не возможно сгенерировать больше чем 24 часа в сутки' });
            }
            else {
                return Promise.resolve({ msg: "График позволяет сгенерировать рабочее время без переработки" });
            }
        });
    }
    //Добавление графика
    addSchedule() {
        return __awaiter(this, void 0, void 0, function* () {
            let scheduleIntervals = [];
            for (let day of Object.keys(this.intervals)) {
                let dayObj = { desk: `${day}`, 'intervals': [] };
                for (let interval in this.intervals[day]['intervals']) {
                    let key = Object.keys(this.intervals[day]['intervals'][interval])[0];
                    dayObj['intervals'].push({
                        type: parseInt(key),
                        begin: this.intervals[day]['intervals'][interval][key]['begin'] * 5 * 60,
                        end: this.intervals[day]['intervals'][interval][key]['end'] * 5 * 60,
                    });
                }
                scheduleIntervals.push(dayObj);
            }
            //Достаем зону доступа
            let access_zone = [this.willReplacedByIdsDep.get('devices/{id}/attach')[0]['body']['accessZoneId']];
            //формируем боди для добавления графика
            let body = {
                name: this.name,
                type: 2,
                allow_coming_later: `${yield toSeconds(this.allow_coming_later)}`,
                allow_leaving_before: `${yield toSeconds(this.allow_living_before)}`,
                overtime: `${yield toSeconds(this.overtime)}`,
                undertime: `${yield toSeconds(this.undertime)}`,
                is_not_holiday: this.is_not_holiday != null ? this.is_not_holiday : false,
                is_first_input_last_output: this.is_first_input_last_output != null ? this.is_first_input_last_output : false,
                begin_date: this.begin,
                intervals: scheduleIntervals,
                access_zones: access_zone
            };
            //Добавление графика в бд и редактирование сотрудника
            try {
                this.schedule_id = yield asyncFetch('taSchedule', "", body, null, 'PUT');
                if (typeof this.schedule_id !== 'undefined') {
                    //добавляем график для в карту с данными
                    this.willReplacedByIdsDep.get('users/staff')[0]['body']['work_schedule'] = this.schedule_id;
                    //Достаем айдишник сотрудника для ПОСТ метода
                    const userId = this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query']['userId'];
                    if (typeof userId !== 'undefined') {
                        yield asyncFetch(`users/staff/${userId}`, '', this.willReplacedByIdsDep.get('users/staff')[0]['body'], null, 'POST');
                    }
                    else {
                        return Promise.reject({ error: 'Не возможно добавить график для сотрудника' });
                    }
                }
            }
            catch (e) {
                return Promise.reject({ error: `Ошибка выполнения метода добавления графика : ${e}` });
            }
            return Promise.resolve({ msg: 'График работы успешно добавлен' });
        });
    }
    //Генерация событий прохода
    addEvent() {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            let start = this.begin.split('-');
            let finish = this.end.split('-');
            
            //Итерируемся по временному промежутку
            try{
              year:
              for (let year:any = parseInt(start[0]); year <= parseInt(finish[0]); year++){
                //Если начался новый год  %) - начинаем с нуля , а не с начала интервала
                let month = year > parseInt(start[0]) ? 0 : parseInt(start[1]) - 1;
                for(month; month < 12; month++){
                  let day = parseInt(start[2]);
                  //если месяц и год не равны концу интервала итерируемся с первого дня
                  if (month != parseInt(start[1]) && year != parseInt(start[0])) { day = 0; }
        
                  for(day; day <= this.dayCount[month](year); ++day){
                    //Выходим из цикла если достигли конца интервала
                    if(day > parseInt(finish[2]) && month >= (parseInt(finish[1])-1) && year >= parseInt(finish[0])) {break year;}
        
                    let date = new Date(year,month,day);
                    //Интервалы текущего дня
                    let intervalArray = this.intervals[this.weekIndex[date.getDay()]]['intervals'];
                    //массив длительностей интервалов текущего дня
                    let curientDayHours:any = [];
                    //Общеее число часов в интервалах за день
                    let totalDayHours:any = 0;
                    //Итерируемся по интервалам текущего дня
                    for(let item in intervalArray){
                      let key:any = Object.keys(intervalArray[item]);
                      let intervalHours  :number =  (parseInt(intervalArray[item][key]['end']) - parseInt(intervalArray[item][key]['begin'])) * 5 *60 ;
                      totalDayHours += intervalHours;
                    //Добавляем интервал
                      curientDayHours.push(intervalHours);
                    }
                    let generatedAverageHours:number = Math.floor((this.hours * 3600) / this.workDayCount);
                    
                    //если среднее кол-во часов для генерации меньше среднего кол-ва рабочих часов
                    if ( generatedAverageHours > this.workDayHoursAverage * 60) { return Promise.reject({error:'Не удается сенерировать указаное колличество часов, превышает дневную норму'});}
                    for(let item in intervalArray){
                      //тип интервала etc конец, начало итд
                      let key:any = Object.keys(intervalArray[item]);
                      //Отношение текущего интервала ко всему временному промежутку в ПРОЦЕНТАХ %
                      let intervalRatioForDay:number = Math.floor(curientDayHours[item] / (this.workDayHoursAverage/100));
                      //вычисляем часть размазаного интревала для данного интервала
                       * TODO точное время размазывания
                      let generatedRatioSecondsforInterval:number = Math.floor((generatedAverageHours/100) * intervalRatioForDay);
                      //Колличество входов - выходо за интервал
                      let RandomEnterExit = getRandomInt(3);
                      let nextEnter = Math.floor(curientDayHours[item] / RandomEnterExit);
                      let nextExit = Math.floor(generatedRatioSecondsforInterval / RandomEnterExit);
        
                      console.log("nextEnter,nextExit",nextEnter,nextExit);
                      //Подсчет даты в формате hh:mm
                      let h:any = timeFormating(intervalArray[item][key]['begin']);
                      
                      let dateMonth:string = month < 10 ? '0' + `${month}` : `${month}`;
                      let dateDay = day < 10 ? '0' + `${day}` : day;
                      //Время первого входа за интервал
                      let entryDate:string =`${year}:${dateMonth}:${dateDay}:${h}`;
                      //Добавляем дату к событию
                      this.willReplacedByIdsDep.set('sysserver/addDeviceEvent',[ { ['query'] :  {...this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query'],...{'date': entryDate } } } ] );
                      //Длбавляем ресурс "ВХОД"
                      this.willReplacedByIdsDep.set('sysserver/addDeviceEvent',[ { ['query'] :  {...this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query'],...{'resource': 1 } } } ] );
                      let eventPlcData:any = this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query'];
                        
                      //выполняем запрос добавления входа
                      try{
                        await asyncFetch('sysserver/addDeviceEvent',`&${queryParse(eventPlcData)}`,null,null,"PUT");
                      }
                      catch(e){
                        return Promise.reject({error:`${e}`});
                      }
                        
                      //остальные входы - входы - за интервал
                      for (let i = 0;i<RandomEnterExit;i++){
                        eventPlcData['resource'] = 2;
                        await asyncFetch('sysserver/addDeviceEvent',`&${queryParse(eventPlcData)}`,null,null,"PUT");
                        eventPlcData['resource'] = 1;
                        if (i !== RandomEnterExit - 1) {await asyncFetch('sysserver/addDeviceEvent',`&${queryParse(eventPlcData)}`,null,null,"PUT");}
                      }
                    }
                  }
                }
              }
              this.workDayHoursAverage = (this.totalWorkTime * 5) / this.workDayCount
            }
            catch(e){
              return Promise.reject({error:`Не удалось сгенерировать события прохода : ${e}`});
            }
            return Promise.resolve({msg:'События прохода сгенерированы'});
            */
        });
    }
    //ORV
    timeTracking() {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `&dateBegin=${this.begin}&dateEnd=${this.end}`;
            try {
                var timeTrackingResult = yield asyncFetch('taReports/timetracking', query, null, null, "GET");
            }
            catch (e) {
                return Promise.reject({ error: `${e}` });
            }
            console.log("result:", timeTrackingResult);
            return Promise.resolve({ msg: 'time done' });
        });
    }
}
/**
 * @param ids массив типа метод - id
 * возвращает void
 */
function deleteDependencies(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        let methodsComplete = [];
        for (let item of ids.keys()) {
            if (item !== 'divisions' && item !== 'users/staff' && item !== 'devices/{id}/attach') {
                for (let key in ids.get(item)) {
                    yield asyncFetch(item, "", null, `${item}/${ids.get(item)[key]}`, "DELETE");
                }
                methodsComplete.push(item);
            }
        }
        return methodsComplete;
    });
}
function asyncFetch(item, query, bodyData, methodString, method) {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            if (method != 'GET') {
                response = yield fetch(`${host}/${methodString == null ? item : methodString}?token=master${methodString == null ? query : ""}`, {
                    mode: 'cors',
                    headers: headers,
                    method: method,
                    body: `${bodyData != null ? JSON.stringify(bodyData) : ""}`
                });
            }
            else {
                response = yield fetch(`${host}/${methodString == null ? item : methodString}?token=master${methodString == null ? query : ""}`, {
                    mode: 'cors',
                    headers: headers,
                    method: method,
                });
            }
            let responseBody = yield response.text();
            // Если айдишник 1
            if (typeof JSON.parse(responseBody).id !== 'undefined') {
                return JSON.parse(responseBody).id;
            }
            //Если массив
            else if (typeof JSON.parse(responseBody).ids !== "undefined") {
                return JSON.parse(responseBody).ids[0];
            }
            //Если Ок
            else if (typeof JSON.parse(responseBody).result !== 'undefined') {
                return 0;
            }
            else if (method == 'GET') {
                return responseBody;
            }
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
/**
 *
 * @param queryTail формирует строку запроса в соответствии с стандартом
 */
function queryParse(queryTail) {
    let params = [];
    Object.keys(queryTail).forEach(el => {
        params.push(`${el}=${queryTail[el]}`);
    });
    let str = params.join("&");
    return str;
}
//Возвращает кол-во дней в месяце
function checkFebruar(monthNumber) {
    return (year) => {
        if (monthNumber == 1) {
            if (year % 400 == 0 && year % 100 == 0) {
                return 28;
            }
            else if (year % 4 != 0) {
                return 28;
            }
            return 31;
        }
        else if (monthNumber == 0)
            return 31;
        else if (monthNumber == 2)
            return 31;
        else if (monthNumber == 3)
            return 30;
        else if (monthNumber == 4)
            return 31;
        else if (monthNumber == 5)
            return 30;
        else if (monthNumber == 6)
            return 31;
        else if (monthNumber == 7)
            return 31;
        else if (monthNumber == 8)
            return 30;
        else if (monthNumber == 9)
            return 31;
        else if (monthNumber == 10)
            return 30;
        else if (monthNumber == 11)
            return 31;
    };
}
function getRandomInt(max) {
    const r = Math.floor(Math.random() * Math.floor(max));
    return r == 0 ? 1 : r;
}
function toSeconds(time) {
    return __awaiter(this, void 0, void 0, function* () {
        return typeof time == 'undefined' ? 0 : time.h * 3600 + time.m * 60;
    });
}
function timeFormating(time) {
    let h = Math.floor(time * 5 / 60) < 10 ? '0' + `${time * 5 / 60}` : `${time * 5 / 60}`;
    let m = Math.floor(time * 5) - (h * 60) < 10 ? '0' + `${time * 5 - (h * 60)}` : Math.floor(time * 5) - (h * 60);
    return `${h}:${m}`;
}
function dayInterator(begin, end, func) {
    return __awaiter(this, void 0, void 0, function* () {
        let start = begin.split('-');
        let finish = end.split('-');
        year: for (let year = parseInt(start[0]); year <= parseInt(finish[0]); year++) {
            //Если следующий год - месяц с нуля
            let month = year > parseInt(start[0]) ? 0 : parseInt(start[1]) - 1;
            for (month; month < 12; month++) {
                let day = parseInt(start[2]);
                //Если не стартовый год и месяц день с нуля
                if (month != parseInt(start[1]) && year != parseInt(start[0])) {
                    day = 0;
                }
                for (day; day <= dayCount[month](year); ++day) {
                    if (day > parseInt(finish[2]) && month >= (parseInt(finish[1]) - 1) && year >= parseInt(finish[0])) {
                        break year;
                    }
                    yield func(year, month, day);
                }
            }
        }
    });
}
function monthlyLauncher(schedule) {
    return new MonthlyLauncher(schedule);
}
exports.monthlyLauncher = monthlyLauncher;
;

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
        this.dependencies = depend.default;
        this.idsMap = new Map();
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
                return Promise.resolve({ msg: "Дата начала и конца иетрвала - корректна" });
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
                this.willReplacedByIdsDep.get('users/staff')[0].body.begin_datetime = this.begin;
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
    getIds() {
        return this.idsMap;
    }
}
class MonthlyLauncher extends Launcher {
    constructor(store) {
        super(store);
        this.aceess_zones = [];
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
        this.removeDataAfterComplete = store.removeDataAfterComplete;
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
    getIds() {
        this.idsMap.set('taSchedule', [this.schedule_id]);
        return super.getIds();
    }
    //Прверка колличества генерируемых часов
    checkAverageWeekHours() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Object.keys(this.intervals).length == 0)
                return Promise.reject({ error: "Не заданы интервалы" });
            if (typeof this.hours === 'undefined')
                return Promise.reject({ error: "Не указано колличество часов" });
            try {
                //итерируемся по календарному интервалу
                yield dayInterator(this.begin, this.end, (year, month, day) => __awaiter(this, void 0, void 0, function* () {
                    let date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
                return Promise.resolve({ warning: 'Колличество часов для генерации ,больше часов в рабочих интервалах' });
            }
            //minutes
            else if (this.hours * 60 > this.workDayCount * 24 * 60) {
                return Promise.reject({ error: 'Не возможно сгенерировать больше чем 24 часа в сутки или генерация производится в нерабочие дни' });
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
                work_schedule_type_id: 2,
                allow_coming_later: `${yield timeFormatingFromSeconds(toSeconds(this.allow_coming_later))}`,
                allow_leaving_before: `${yield timeFormatingFromSeconds(toSeconds(this.allow_living_before))}`,
                overtime: `${yield toSeconds(this.overtime)}`,
                undertime: `${yield toSeconds(this.undertime)}`,
                is_not_holiday: this.is_not_holiday != null ? this.is_not_holiday : false,
                is_first_input_last_output: this.is_first_input_last_output != null ? this.is_first_input_last_output : false,
                begin_date: this.begin,
                intervals: scheduleIntervals,
                access_zones: access_zone
            };
            //console.log("body",body);
            //Добавление графика в бд и редактирование сотрудника
            try {
                this.schedule_id = yield asyncFetch('taSchedule', "", body, null, 'PUT');
                if (typeof this.schedule_id !== 'undefined') {
                    //добавляем график для в карту с данными
                    this.willReplacedByIdsDep.get('users/staff')[0]['body']['work_schedule'] = this.schedule_id;
                    //Достаем айдишник сотрудника для ПОСТ метода
                    const userId = this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query']['userId'];
                    if (typeof userId === 'undefined') {
                        return Promise.reject({ error: 'Не возможно добавить график для сотрудника userId не найден' });
                    }
                    yield asyncFetch(`users/staff/${userId}`, '', this.willReplacedByIdsDep.get('users/staff')[0]['body'], null, 'POST');
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
            // глпбальная переменная для хранения секунд прохода
            let seconds = 0;
            try {
                //Итерация по календарному , заданому интервалe
                yield dayInterator(this.begin, this.end, (year, month, day) => __awaiter(this, void 0, void 0, function* () {
                    //Получаем день недели для графика на конкт\третный день        
                    let date = new Date(year, month - 1, day);
                    let intervalArray = this.intervals[this.weekIndex[date.getDay()]]['intervals'];
                    //Если есть интервалы в графике
                    if (intervalArray.length != 0) {
                        let dayIntervalTotal = intervalForDayCount(intervalArray);
                        let generatedCurientIntervalRest = 0;
                        //итерируемся по интервалам внутри дня графика
                        for (let item in intervalArray) {
                            let key = Object.keys(intervalArray[item]);
                            //рабочего времени в интервале  minutes
                            let intervalMinutes = (parseInt(intervalArray[item][key]['end']) - parseInt(intervalArray[item][key]['begin'])) * 5;
                            //Часть генерируемого времени для интервала (в % соотношении  время интервала /общее рабочее время ) seconds
                            let generatedCurientIntervalSeconds = calculateGeneratedInterval(this.totalWorkTime, this.hours, intervalMinutes) + generatedCurientIntervalRest;
                            //Если генерируемый интервал больше рабочего
                            if (intervalMinutes * 60 < generatedCurientIntervalSeconds && key[0] != 2 && key[0] != 3) {
                                generatedCurientIntervalRest += generatedCurientIntervalSeconds - intervalMinutes * 60;
                                generatedCurientIntervalSeconds = intervalMinutes * 60;
                            }
                            let allow_coming_later = toSeconds(this.allow_coming_later);
                            //время входа
                            let entryTime = parseInt(intervalArray[item][key]['begin']) * 5 * 60;
                            //время выхода
                            let generatedCurientInterval = timeFormatingFromSeconds(generatedCurientIntervalSeconds + entryTime);
                            //Если есть allow_coming_later
                            if (key[0] == 1 || key[0] == 3 && allow_coming_later != 0 && (allow_coming_later + generatedCurientIntervalSeconds) < intervalMinutes * 60) {
                                let factComingLater = Math.floor(getRandomInt(allow_coming_later) / 60);
                                entryTime = entryTime + factComingLater * 60;
                            }
                            seconds += parseInt(generatedCurientInterval.split(':')[2]);
                            generatedCurientInterval = generatedCurientInterval.split(':');
                            // добавляем накопившиеся секунды если там есть минута
                            if (Math.floor(seconds / 60) > 0) {
                                //Если из-за добавленной минуты добавился час
                                if (parseInt(generatedCurientInterval[1]) + Math.floor(seconds / 60) >= 60) {
                                    generatedCurientInterval[0] = parseInt(generatedCurientInterval[0]) + 1;
                                    generatedCurientInterval[1] = parseInt(generatedCurientInterval[1]) + Math.floor(seconds / 60) % 60;
                                }
                                else {
                                    generatedCurientInterval[1] = parseInt(generatedCurientInterval[1]) + Math.floor(seconds / 60);
                                }
                                generatedCurientInterval[2] = '00';
                                seconds -= Math.floor(seconds / 60) * 60;
                            }
                            else {
                                generatedCurientInterval[2] = '00';
                            }
                            //время для создания event
                            generatedCurientInterval = generatedCurientInterval.join(':');
                            entryTime = timeFormatingFromSeconds(entryTime);
                            //ORV не считает секунды поэтому выходим с ошибкой
                            if (generatedCurientIntervalSeconds < 60) {
                                throw new Error('Генерируемый интервал меньше минуты, уменьшите интервал генерации');
                            }
                            //Достаем данные для события устройства
                            let body = this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query'];
                            //Сгенерированое время для интервала меньше чем интервал
                            yield generateMinorInterval(body, entryTime, generatedCurientInterval, year, month, day);
                        }
                    }
                }));
            }
            catch (e) {
                return Promise.reject({ error: `Ошибка генерирования прохода : ${e}` });
            }
            return Promise.resolve({ msg: 'Проходы сгенерированы' });
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
            let userId = typeof this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query']['userId'] === 'undefined' ? null : this.willReplacedByIdsDep.get('sysserver/addDeviceEvent')[0]['query']['userId'];
            if (userId === null) {
                return Promise.reject({ error: 'Не возможно подсчитать орв для пользователя' });
            }
            ;
            let result = JSON.parse(timeTrackingResult)['rows'];
            let orvtotalTime = 0;
            let orvpresenceTime = 0;
            if (result.length != 0 && result[0]['id'] == userId) {
                let pT = result[0]['presence_time'].split(":");
                let wT = result[0]['work_time'].split(":");
                orvtotalTime = yield toSeconds({ h: `${parseInt(wT[0])}`, m: `${parseInt(wT[1])}` });
                orvpresenceTime = yield toSeconds({ h: `${parseInt(pT[0])}`, m: `${parseInt(pT[1])}` });
                return Promise.resolve({
                    warning: `сгенерировано часов : ${this.hours} результат ОРВ work_time:${timeFormatingFromSeconds(orvtotalTime)} , presence_time: ${timeFormatingFromSeconds(orvpresenceTime)}`
                });
            }
            return Promise.reject({ error: 'Нет орв данных' });
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
            else if (typeof JSON.parse(responseBody).error !== 'undefined') {
                throw new Error(`метод ${item == null ? query : item} вернул ${JSON.parse(responseBody).error}`);
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
    return r; //== 0 ? 1 : r;
}
function toSeconds(time) {
    return typeof time == 'undefined' ? 0 : time.h * 3600 + time.m * 60;
}
/**
 *
 * @param time время в секундах
 * возвращает строку вида чч:мм:сс
 */
function timeFormatingFromSeconds(time) {
    if (time == 0)
        return '00:00:00';
    let h = Math.floor(time / 3600);
    let m = Math.floor((time - h * 3600) / 60);
    let s = Math.round(time - (h * 3600) - (m * 60));
    h = h < 10 ? '0' + `${h}` : `${h}`;
    m = m < 10 ? '0' + `${m}` : `${m}`;
    s = s < 10 ? '0' + `${s}` : `${s}`;
    return `${h}:${m}:${s}`;
}
function dayInterator(begin, end, func) {
    return __awaiter(this, void 0, void 0, function* () {
        begin = begin.split('-');
        end = end.split('-');
        begin[1] = parseInt(begin[1]) - 1;
        end[1] = parseInt(end[1]) - 1;
        let start = new Date(begin[0], begin[1], begin[2]); //begin.split('-');
        let finish = new Date(end[0], end[1], end[2]); //end.split('-');
        for (start; start <= finish; start.setDate(start.getDate() + 1)) {
            let month = parseInt(start.getMonth()) + 1;
            month = month < 10 ? '0' + `${month}` : `${month}`;
            yield func(start.getFullYear(), month, start.getDate());
        }
    });
}
function calculateGeneratedInterval(totalWorkTime, generatedTotalTime, intervalTotalMinutes) {
    return (generatedTotalTime * 36) * ((intervalTotalMinutes * 60) / (totalWorkTime * 60 / 100));
}
function intervalForDayCount(intervalArray) {
    let totalTime = 0;
    for (let i in intervalArray) {
        let key = Object.keys(intervalArray[i]);
        totalTime += (intervalArray[i][key]['end'] - intervalArray[i][key]['begin']) * 5 * 60;
    }
    return totalTime;
}
function generateMinorInterval(body, entryTime, generatedCurientInterval, year, month, day) {
    return __awaiter(this, void 0, void 0, function* () {
        //Устанавливаем время
        body['date'] = `${year}-${month}-${day}:${entryTime}`;
        //тип ресурса - вход
        body['resource'] = 1;
        try {
            yield asyncFetch('sysserver/addDeviceEvent', `&${queryParse(body)}`, null, null, 'PUT');
        }
        catch (e) {
            throw new Error(`Не возможно сгенерировать проход: ${e}`);
        }
        //Устанавливаем время
        body['date'] = `${year}-${month}-${day}:${generatedCurientInterval}`;
        //тип ресурса - выход
        body['resource'] = 2;
        try {
            yield asyncFetch('sysserver/addDeviceEvent', `&${queryParse(body)}`, null, null, 'PUT');
        }
        catch (e) {
            throw new Error(`Не возможно сгенерировать проход: ${e}`);
        }
    });
}
function deleteDataAfterComplete(idsMap) {
    return __awaiter(this, void 0, void 0, function* () {
        if (idsMap.size == 0) {
            return Promise.reject({ error: "Отсутствуют данные для удаления" });
        }
        console.log(idsMap);
        try {
            yield asyncFetch(`devices/${idsMap.get('devices')[0]}/detach`, "", null, null, "POST");
            yield deleteDependencies(idsMap);
        }
        catch (e) {
            return Promise.reject({ error: `Не удалось удалить данные ${e}` });
        }
        return Promise.resolve({ msg: 'Данные удалены,удалите пользователя и подразделения в ручную' });
    });
}
exports.deleteDataAfterComplete = deleteDataAfterComplete;
function workTimeCounter(intervals, beginDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const weekIndex = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
        let wH = 0;
        let iIntervals = { intervals: [] };
        for (let day of Object.keys(intervals)) {
            console.log(day);
            let dayObj = { desk: `${day}`, 'intervals': [] };
            for (let interval in intervals[day]['intervals']) {
                let key = Object.keys(intervals[day]['intervals'][interval])[0];
                dayObj['intervals'].push({
                    type: parseInt(key),
                    begin: intervals[day]['intervals'][interval][key]['begin'] * 5 * 60,
                    end: intervals[day]['intervals'][interval][key]['end'] * 5 * 60,
                });
            }
            iIntervals['intervals'].push(dayObj);
        }
        dayInterator(beginDate, endDate, (year, month, day, iIntervals) => {
            let date = new Date(year, month - 1, day);
            console.log(iIntervals);
            let intervalArray = iIntervals[weekIndex[date.getDay()]]['intervals'];
            console.log(intervalArray);
            //Если есть интервалы в графике
            if (intervalArray.length != 0) {
                wH += intervalForDayCount(intervalArray);
            }
        });
        return wH;
    });
}
exports.workTimeCounter = workTimeCounter;
function monthlyLauncher(schedule) {
    return new MonthlyLauncher(schedule);
}
exports.monthlyLauncher = monthlyLauncher;
;

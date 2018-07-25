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
                return Promise.reject({ error: `${e}` });
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
                console.log("delete", methodsComplete);
            }
            catch (e) {
                return Promise.reject({ error: `${e}` });
            }
            return Promise.resolve({ msg: `методы ${methodsComplete} завершены успешно , \nудалите юзера и подразделение самостоятельно !!!` });
        });
    }
}
class MonthlyLauncher extends Launcher {
    constructor(store) {
        super(store);
        this.totalWorkTime = 0;
        this.workDayCount = 0;
        this.workDayHoursAverage = 0;
        this.weekIndex = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
        this.dayCount = {
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
    dependenciesListForming() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super("dependenciesListForming").call(this);
        });
    }
    addMethodsData() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super("addMethodsData").call(this);
        });
    }
    deleteDatafromDB() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return yield _super("deleteDatafromDB").call(this);
        });
    }
    checkAverageWeekHours() {
        return __awaiter(this, void 0, void 0, function* () {
            let start = this.begin.split('-');
            let finish = this.end.split('-');
            if (Object.keys(this.intervals).length == 0)
                return Promise.reject({ error: "Не заданы интервалы" });
            if (typeof this.hours === 'undefined')
                return Promise.reject({ error: "Не указано колличество часов" });
            //Подсчет рабочеггоо времени за интервал
            try {
                year: for (let year = parseInt(start[0]); year <= parseInt(finish[0]); year++) {
                    let month = year > parseInt(start[0]) ? 0 : parseInt(start[1]) - 1;
                    for (month; month < 12; month++) {
                        let day;
                        if (month != parseInt(start[1]) && year != parseInt(start[0])) {
                            day = 0;
                        }
                        else {
                            day = parseInt(start[2]);
                        }
                        for (day; day <= this.dayCount[month](year); ++day) {
                            if (day > parseInt(finish[2]) && month >= (parseInt(finish[1]) - 1) && year >= parseInt(finish[0])) {
                                break year;
                            }
                            else {
                                let date = new Date(year, month, day);
                                //Интервалы текущего дня
                                let intervalArray = this.intervals[this.weekIndex[date.getDay()]]['intervals'];
                                //console.log(`${ this.weekIndex [date.getDay()]}`,intervalArray);
                                if (intervalArray.length != 0) {
                                    this.workDayCount++;
                                }
                                for (let item in intervalArray) {
                                    let key = Object.keys(intervalArray[item]);
                                    //console.log( intervalArray[item][key])
                                    let intervalHours = parseInt(intervalArray[item][key]['end']) - parseInt(intervalArray[item][key]['begin']);
                                    this.totalWorkTime += intervalHours;
                                }
                            }
                        }
                    }
                }
                this.workDayHoursAverage = (this.totalWorkTime * 5) / this.workDayCount;
            }
            catch (e) {
                return Promise.reject({ error: `${e}` });
            }
            if (Math.floor((parseInt(this.totalWorkTime) * 5) / 60) > this.hours) {
                return Promise.resolve({ msg: 'Колличество часов не больше колличества рабочего времени' });
            }
            else {
                return Promise.reject({ error: "Колличество часов превышает колличество рабочего времени за указанный промежуток" });
            }
        });
    }
    //Генерация событий прохода
    addEvent() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            console.log("!!!", _super("willReplacedByIdsDep"));
            return Promise.resolve({ msg: 'It was willReplacedByIdsDep' });
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
        try {
            let response = yield fetch(`${host}/${methodString == null ? item : methodString}?token=master${methodString == null ? query : ""}`, {
                mode: 'cors',
                headers: headers,
                method: method,
                body: `${bodyData != null ? JSON.stringify(bodyData) : ""}`
            });
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
function monthlyLauncher(schedule) {
    return new MonthlyLauncher(schedule);
}
exports.monthlyLauncher = monthlyLauncher;
;

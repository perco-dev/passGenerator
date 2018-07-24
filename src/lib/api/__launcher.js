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
const depend = require("../../lib/api/dependencies");
const prepare = require("./boots");
const React = require("react");
const ReactDom = require("react-dom");
const Terminal_1 = require("../../components/Terminal");
const host = 'http://localhost:8080/api';
let headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
let depencies = depend.default;
/** Авто генератор проходов
 *
 * @param begin
 * @param end
 * @param shift
 * @param hours
 */
/**функция отображения сообщений в компоненте
 * props(string) сообщение
 * arr(array) массив сообщений
 */
function renderComp(props, arr) {
    return __awaiter(this, void 0, void 0, function* () {
        arr.push(props);
        ReactDom.render(React.createElement(Terminal_1.default, { text: arr }), document.getElementById('terminal'));
    });
}
function autoGenerator(begin, end, shift, hours) {
    return __awaiter(this, void 0, void 0, function* () {
        //массив сообщений
        let arr = [];
        //Проверка дат
        if (begin.split('-').length != 3 || end.split('-').length != 3) {
            return Promise.reject("Не указана дата начала или дата конца генерации");
        }
        //айдишники возвращенные API методом
        let idsMap = new Map();
        //Ищем зависимые методы
        try {
            // формируем мап всех зависимых методов вида метод => данные
            var willReplacedByIdsDep = new Map(prepare.bootstrap("sysserver/addDeviceEvent").buildDepMap());
            yield renderComp("сформированы зависимые методы", arr);
        }
        catch (e) {
            return Promise.reject(`${e}`);
        }
        /**
         * ДОБАВЛЕНИЕ ДАННЫХ ИЗ lib/api/dependecies
         */
        //Добавляем начальные и конечные даты для users/staff
        willReplacedByIdsDep.get('users/staff')[0].body.hiring_date = begin;
        willReplacedByIdsDep.get('users/staff')[0].body.identifier[0].begin_datetime = begin;
        willReplacedByIdsDep.get('users/staff')[0].body.identifier[0].end_datetime = end;
        //перебираем каждый метод в зависимости
        for (let item of willReplacedByIdsDep.keys()) {
            if (item === "sysserver/addDeviceEvent")
                continue;
            //для подстановки id в название метода например POST /devices/{id}/activate
            let methodString = Array.from(item.split("/"));
            if (methodString.length > 1) {
                if (typeof idsMap.get(methodString[0]) !== 'undefined') {
                    methodString[1] = idsMap.get(methodString[0]);
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
            idsMap.set(item, []);
            //массив значений fields из 
            let fds = willReplacedByIdsDep.get(item);
            //перебираем данные для метода
            for (let fd = 0; fd < fds.length; fd++) {
                //формируем тело запроса
                let bodyData = typeof fds[fd].body === 'undefined' ? {} : fds[fd].body;
                //параметры запроса
                let query = typeof fds[fd].query === 'undefined' ? "" : "&" + queryParse(fds[fd].query);
                //Метод POST || PUT
                let method = typeof depencies[`${item}`].method === 'undefined' ? "PUT" : depencies[`${item}`].method;
                //выполняем запрос
                try {
                    var id = yield asyncFetch(item, query, bodyData, methodString, method);
                    renderComp(`метод ${item} завершен успешно`, arr);
                }
                catch (e) {
                    return Promise.reject(`${e}`);
                }
                //если в респонсе есть айди добавляем его в idsMap и вставляем значение в зависимости
                if (typeof id != 'undefined' && id != 0) {
                    idsMap.get(item).push(id);
                    prepare.bootstrap(item).idSearcher(idsMap, willReplacedByIdsDep);
                }
            }
        }
        /**
         * УДАЛЕНИЕ ДАННЫХ ИЗ БАЗЫ ПОСЛЕ ГЕНЕРАЦИИ
         */
        //Детачим контроллер
        yield asyncFetch(`devices/${idsMap.get('devices')[0]}/detach`, "", null, null, "POST").catch((error) => __awaiter(this, void 0, void 0, function* () {
            yield renderComp(error, arr);
        }));
        yield renderComp("Контроллер отвязан от помещения", arr);
        yield deleteDependencies(idsMap, arr);
    });
}
exports.autoGenerator = autoGenerator;
/**
 *
 * @param ids массив типа метод - id
 * возвращает void
 */
function deleteDependencies(ids, arr) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let item of ids.keys()) {
            if (item == 'divisions' || 'users/staff') {
                yield renderComp('удалите юзера и подразделение самостоятельно !!!', arr);
                continue;
            }
            for (let key in ids.get(item)) {
                let res = yield asyncFetch(item, "", null, `${item}/${ids.get(item)[key]}`, "DELETE").catch((error) => __awaiter(this, void 0, void 0, function* () {
                    yield renderComp(error, arr);
                }));
                yield renderComp(`метод ${item} завершен успешно`, arr);
            }
        }
    });
}
/**
 *
 * @param item метод
 * @param query параметры запроса
 * @param bodyData тело запроса
 * @param methodString метод , если в пути  присутствует id
 * @param method тип запроса
 * Возвращает id если PГЕ и 0 если POST
 */
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
            //console.log(item,bodyData,responseBody);
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

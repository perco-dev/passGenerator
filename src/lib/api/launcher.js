"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("unfetch/polyfill");
const prepare = __importStar(require("./boots.js"));
let host = 'http://localhost:8080/api';
let headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
/** Авто генератор проходов
 *
 * @param begin
 * @param end
 * @param shift
 * @param hours
 */
function autoGenerator(begin, end, shift, hours) {
    //айдишники возвращенные методом
    let idsMap = new Map();
    //Ищем зависимые методы
    let tempMap = new Map(prepare.bootstrap("sysserver/addDeviceEvent").buildDepMap());
    //перебираем каждый метод в зависимости
    for (let item of tempMap.keys()) {
        idsMap.set(item, []);
        let fds = tempMap.get(item);
        //перебираем данные для метода
        for (let fd in fds) {
            //формируем тело запроса
            let bodyData = typeof fds[fd].body === 'undefined' ? {} : fds[fd].body;
            //запрос
            let query = typeof fds[fd].query === 'undefined' ? null : queryParse(fds[fd].query);
            if (query == null) {
                let text = request(item, bodyData, query);
            }
            else {
                let text = request(item, bodyData, query);
            }
        }
    }
    console.log(idsMap);
}
exports.autoGenerator = autoGenerator;
function customGenerator() {
}
exports.customGenerator = customGenerator;
function addPass() {
}
exports.addPass = addPass;
function delpass() {
}
exports.delpass = delpass;
function queryParse(queryTail) {
    let params = [];
    Object.keys(queryTail).forEach(el => {
        params.push(`${el}=${queryTail[el]}`);
    });
    let str = params.join("&");
    return str;
}
function request(item, body, query) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield fetch(`${host}/${item}?token=master`, { headers: headers, method: 'PUT', body: JSON.stringify(body) });
        return response;
    });
}
//# sourceMappingURL=launcher.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const depend = require("./dependencies");
let mustBeArray = {
    "taSchedule": [
        "access_zones"
    ],
    "roles": [
        "accessRights"
    ]
};
class Prepare {
    constructor(test) {
        this.test = test;
        this.depend = depend.default;
    }
    buildDepMap() {
        let depMap = new Map();
        let testFields = typeof this.depend[this.test] === "undefined" ? null : this.depend[this.test];
        if (testFields == null)
            throw new Error(`##Нет данных для теста ${this.test}##`);
        if (testFields.dependedTest.length != 0) {
            try {
                var depMapArr = buildDependencies(this.test, this.depend[this.test].dependedTest, []);
            }
            catch (e) {
                throw new Error("Не возможно построить список зависимых данных! Проверьте dependencies.json для этого теста");
            }
            for (let dep in depMapArr) {
                depMap.set(depMapArr[dep], this.depend[depMapArr[dep]].fields);
            }
            depMap.set(this.test, this.depend[this.test].fields);
            return depMap;
        }
        else {
            return depMap.set(this.test, this.depend[this.test].fields);
        }
    }
    /**
     * метод заменяет в depMap данные на айди
     * return depMap где значения вида [testname]_id_[index] заменяются на айди
     * @param ids Map key - имя теста values - массив айдишников
     * @param depMap  - Map куда необходимо записать айдишники вместо якорей
     */
    idSearcher(idsMap, depMap) {
        // Перебираем все зависимые тесты у которых есть зависимости 
        for (let depItem of depMap.keys()) {
            //Если у теста есть зависимости и он сожержит в зависимостях выполняемый тест - надо вставить айди
            if (this.depend[depItem].dependedTest.length != 0 && this.depend[depItem].dependedTest.includes(this.test)) {
                //Перебираем массив айдишников для выполняемого теста 
                for (let index in idsMap.get(this.test)) {
                    //Перебираем все поля теста для BODY
                    if (typeof depMap.get(depItem)[index]["body"] != "undefined") {
                        //ищем ключ , значение которого соответствует this.test_id_index
                        replaceId(depMap, idsMap, depItem, this.test, index, "body");
                    }
                    if (typeof depMap.get(depItem)[index]["query"] != "undefined") {
                        replaceId(depMap, idsMap, depItem, this.test, index, "query");
                    }
                }
            }
        }
        return depMap;
    }
}
function replaceId(depMap, idsMap, depItem, test, index, section) {
    for (let key of Object.keys(depMap.get(depItem)[index][`${section}`])) {
        //если значение строка - все просто!
        if (typeof depMap.get(depItem)[index][`${section}`][key] != "object" && depMap.get(depItem)[index][`${section}`][key] == `${test}_id_${index}`) {
            if (typeof mustBeArray[depItem] != "undefined" && mustBeArray[depItem].includes(key)) {
                depMap.get(depItem)[index][`${section}`][key] = [idsMap.get(test)[index]];
            }
            else {
                depMap.get(depItem)[index][`${section}`][key] = idsMap.get(test)[index];
            }
        }
        // если объект или массив  
        else if (typeof depMap.get(depItem)[index][`${section}`][key] == "object") {
            if (typeof mustBeArray[depItem] != "undefined" && mustBeArray[depItem].includes(key)) {
                let rp = JSON.stringify(depMap.get(depItem)[index][`${section}`][key]).replace(new RegExp(`\"${test}_id_${index}\"`), "[" + idsMap.get(test)[index] + "]");
                depMap.get(depItem)[index][`${section}`][key] = JSON.parse(rp);
            }
            else {
                let rp = JSON.stringify(depMap.get(depItem)[index][`${section}`][key]).replace(new RegExp(`${test}_id_${index}`), idsMap.get(test)[index]);
                depMap.get(depItem)[index][`${section}`][key] = JSON.parse(rp);
            }
        }
    }
}
/**
 * you should drink vodka before try to understand this
 * @param dp_tables массив зависимых тестов для текущего теста
 * @param arr       массив со всеми зависимостями
 * возвращает массив со списком всех зависимых тестов
 */
function buildDependencies(test, dp_tests, arr) {
    let dependencies = depend.default;
    // Счетчик тестов без зависимостей
    let dpCounter = 0;
    //Массив для вложенных зависимостей текущего элемента из массива dp_tests,
    //котрый будет передан в рекурсивном вызове
    let args = [];
    for (let curientDependence in dp_tests) {
        //если у текущей зависимости есть вложенные зависимости
        if (dependencies[dp_tests[curientDependence]].dependedTest.length != 0) {
            //Добавляем вложенные зависимости для текущего теста
            args = args.concat(dependencies[dp_tests[curientDependence]].dependedTest);
            //Добавляем в общий список , куда аккумулируются все зависимости
            arr.push(dp_tests[curientDependence]);
        }
        //если у текущей зависимости нет вложенных зависимостей и кол-во текущих з-ей не равно кол-ву "концевых" з-ей
        else if (dependencies[dp_tests[curientDependence]].dependedTest.length == 0 && dpCounter != dp_tests.length - 1) {
            // Добавляем текущую "концевую" зависимость в общий список
            arr.push(dp_tests[curientDependence]);
            arr = uniqueFilter(arr);
            dpCounter++;
        }
        // Если все зависимости концевые (не имеют вложенных зависимостей)
        else {
            arr = arr.concat(dp_tests);
            arr = uniqueFilter(arr);
            return arr.reverse();
        }
    }
    arr = arr.concat(dp_tests);
    arr = uniqueFilter(arr);
    return buildDependencies(test, args, arr);
}
function uniqueFilter(arr) {
    let uArr = [];
    for (let key in arr) {
        if (uArr.indexOf(arr[key]) == -1) {
            uArr.push(arr[key]);
        }
    }
    return uArr;
}
function bootstrap(test) {
    return new Prepare(test);
}
exports.bootstrap = bootstrap;
//# sourceMappingURL=boots.js.map
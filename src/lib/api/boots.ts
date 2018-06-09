//let depend = JSON.parse(JSON.stringify(require('./dependencies.json')));
import * as depend from './dependencies';

let mustBeArray:any = {
  "taSchedule":[
    "access_zones"
  ],
  "roles":[
    "accessRights"
  ]
}


class Prepare{
  
  test:string;
  depend:any;

  constructor(test:string){
    this.test = test;
    this.depend = depend.default;
  }
  
  buildDepMap(){
    let dMap = new Map();
    let testFields = typeof this.depend[this.test] === "undefined" ? null : this.depend[this.test];
    if (testFields == null) throw new Error (`##Нет данных для теста ${this.test}##`);

    if(testFields.dependedTest.length != 0){
      try{
        var depMapArr = buildDependencies(this.test,this.depend[this.test].dependedTest,[]);
      }
      catch(e){
        throw new Error("##Не возможно построить список зависимых данных! Проверьте dependencies.json для этого теста##");
      }
      for(let dep in depMapArr){
        dMap.set(depMapArr[dep],this.depend[depMapArr[dep]].fields);
      }
      dMap.set(this.test,this.depend[this.test].fields);
      return dMap;
    }
    else{
      return dMap.set(this.test,this.depend[this.test].fields); 
    }
  }

  /**
   * метод заменяет в dMap данные на айди 
   * return dMap где значения вида [testname]_id_[index] заменяются на айди 
   * @param ids Map key - имя теста values - массив айдишников
   * @param dMap  - Map куда необходимо записать айдишники вместо якорей
   */
  idSearcher(ids:any,dMap:any){
    console.log("ids",ids);
    
    // Перебираем все зависимые тесты у которых есть зависимости 
    for (let depTest of dMap.keys()){
      //Если у теста есть зависимости и он сожержит в зависимостях выполняемый тест - надо вставить айди
      if(this.depend[depTest].dependedTest.length!=0 && this.depend[depTest].dependedTest.includes(this.test)){
        //Перебираем массив айдишников для выполняемого теста 
        for(let index in ids.get(this.test)){
          console.log(ids.get(this.test)[index]);
          //Перебираем все поля теста для BODY
          if(typeof dMap.get(depTest)[index]["body"] != "undefined"){
            //ищем ключ , значение которого соответствует this.test_id_index
            for(let key of Object.keys(dMap.get(depTest)[index]["body"])){
              //если значение строка - все просто!
              if(typeof dMap.get(depTest)[index]["body"][key] != "object" && dMap.get(depTest)[index]["body"][key] == `${this.test}_id_${index}`){
                if(typeof mustBeArray[depTest] != "undefined" && mustBeArray[depTest].includes(key)){
                  dMap.get(depTest)[index]["body"][key] = [ids.get(this.test)[index]];
                }
                else{
                  dMap.get(depTest)[index]["body"][key] = ids.get(this.test)[index];
                }
              }
              // если объект или массив  
              else if (typeof dMap.get(depTest)[index]["body"][key] == "object"){
                if(typeof mustBeArray[depTest] != "undefined" && mustBeArray[depTest].includes(key)){
                  let rp = JSON.stringify(dMap.get(depTest)[index]["body"][key]).replace(new RegExp(`\"${this.test}_id_${index}\"`),"["+ids.get(this.test)[index]+"]");
                  dMap.get(depTest)[index]["body"][key] = JSON.parse(rp);
                }
                else{
                  let rp = JSON.stringify(dMap.get(depTest)[index]["body"][key]).replace(new RegExp(`${this.test}_id_${index}`),ids.get(this.test)[index]);
                  dMap.get(depTest)[index]["body"][key] = JSON.parse(rp);
                }
              }
            }
          }

          //TODO : для QUERY

        }
      }
    }
    return dMap;
  }
}

/**
 * you should drink vodka before try to understand this 
 * @param dp_tables массив зависимых тестов для текущего теста
 * @param arr       массив со всеми зависимостями
 * возвращает массив со списком всех зависимых тестов
 */
function buildDependencies(test:string,dp_tests:Array<string>,arr:Array<string>):any{
  let dependencies:any = depend.default;
  // Счетчик тестов без зависимостей
  let dpCounter = 0;
  //Массив для вложенных зависимостей текущего элемента из массива dp_tests,
  //котрый будет передан в рекурсивном вызове
  let args:any = [];

  for(let curientDependence in dp_tests){
    //если у текущей зависимости есть вложенные зависимости
    if(dependencies[dp_tests[curientDependence]].dependedTest.length !=0){
      //Добавляем вложенные зависимости для текущего теста
      args = args.concat(dependencies[dp_tests[curientDependence]].dependedTest);
      //Добавляем в общий список , куда аккумулируются все зависимости
      arr.push(dp_tests[curientDependence]);
    }
    //если у текущей зависимости нет вложенных зависимостей и кол-во текущих з-ей не равно кол-ву "концевых" з-ей
    else if(dependencies[dp_tests[curientDependence]].dependedTest.length == 0 && dpCounter != dp_tests.length - 1){
      // Добавляем текущую "концевую" зависимость в общий список
      arr.push(dp_tests[curientDependence]);
      arr = uniqueFilter(arr);
      dpCounter++;
    }
    // Если все зависимости концевые (не имеют вложенных зависимостей)
    else{
      arr = arr.concat(dp_tests);
      arr = uniqueFilter(arr);
      return arr.reverse();
    }
  }  
  arr = arr.concat(dp_tests);
  arr = uniqueFilter(arr);
  return buildDependencies(test,args,arr);
}

function uniqueFilter(arr:Array<string>){
  let uArr = [];
  for(let key in arr){
    if(uArr.indexOf(arr[key])==-1){
      uArr.push(arr[key]);
    }
  }
  return uArr;
}

export function bootstrap(test?:any):any{
  return new Prepare(test);
}

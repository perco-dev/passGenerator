import 'unfetch/polyfill';
import * as depend from './dependencies';
import * as prepare from './boots'
const headers = {'Content-Type':'application/json','Accept': 'application/json'};
const host = 'http://localhost:8080/api'; 

class Launcher{
  begin: any;
  end: any;
  
  willReplacedByIdsDep:any;
  idsMap:any = new Map();
  dependencies: any = depend.default;

  constructor(store:any){
    this.begin = store.beginDate;
    this.end = store.endDate;
  }
  
  //Валидация начала и конца генерации
  async checkDates(){
    if(this.begin.split('-').length != 3 || this.end.split('-').length !=3){
      return Promise.reject({error:'Не указана дата начала или конца генерации'})
    }
    else{
      return Promise.resolve({msg:"все хорошо"});
    }
  }
  
  //Формирование списка зависимых методов для метода
  async dependenciesListForming(){
    try{
      this.willReplacedByIdsDep = new Map(prepare.bootstrap("sysserver/addDeviceEvent").buildDepMap());
    }
    catch(e){
      return Promise.reject({error:`${e}`});
    }
  return Promise.resolve({msg:'сформированы зависимые методы'});
  }

  //Добавление данных для зависимых методов
  async addMethodsData(){
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
          methodsComplete.push(item);
        }
      }
    }
    catch(e){
      return Promise.reject({error:`${e}`})
    }
    return Promise.resolve({msg:`методы ${methodsComplete} завершены успешно`});
  }

  //Удаляем данные из БД + детачим контроллер
  async deleteDatafromDB(){
    let methodsComplete:any = [];
    try{
      await asyncFetch(`devices/${this.idsMap.get('devices')[0]}/detach`,"",null,null,"POST")
      methodsComplete = await deleteDependencies(this.idsMap);
      console.log("delete",methodsComplete);
    }
    catch(e){
      return Promise.reject({error:`${e}`});
    }
    return Promise.resolve({msg:`методы ${methodsComplete} завершены успешно , \nудалите юзера и подразделение самостоятельно !!!`});
  }
}

/**
 * @param ids массив типа метод - id
 * возвращает void
 */
async function deleteDependencies(ids:any){
  let methodsComplete = [];
  console.log('---',ids);
  for (let item of ids.keys()){
    console.log('----',item);
    if(item !== 'divisions' && item !=='users/staff' && item!=='devices/{id}/attach'){
      console.log(ids.get(item));
      for(let key in ids.get(item)){
        console.log('------',key);
        await asyncFetch(item,"",null,`${item}/${ids.get(item)[key]}`,"DELETE");
      }
      methodsComplete.push(item);
    }
  }
  return methodsComplete;
}

async function asyncFetch(item:string,query:string,bodyData:any,methodString:any,method:string){
  try {
    let response = await fetch(`${host}/${methodString == null ? item : methodString}?token=master${methodString == null ? query : ""}`,{
      mode:'cors',
      headers : headers,
      method:method,
      body:`${bodyData != null ? JSON.stringify(bodyData) : ""}`
    });

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

export default function(schedule:any){
  return new Launcher(schedule);
};
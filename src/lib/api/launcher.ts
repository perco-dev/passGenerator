import 'unfetch/polyfill';
import * as depend from '../../lib/api/dependencies'
import * as prepare from './boots';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import Terminal from '../../components/terminal.js';

const host:string = 'http://localhost:8080/api'; 
let headers:any     = {'Content-Type':'application/json','Accept': 'application/json'};
let depencies:any = depend.default;


/** Авто генератор проходов
 * 
 * @param begin 
 * @param end 
 * @param shift 
 * @param hours 
 */

async function renderComp(props:string,arr:any){
  arr.push(props);
  ReactDom.render(React.createElement(Terminal,{text:arr}),document.getElementById('terminal'))  
}

export async function autoGenerator(begin:any,end:any,shift:string,hours:number){
  //массив сообщений
  let arr:any = [];
  //Проверка дат
  if(begin.split('-').length != 3 || end.split('-').length != 3) {
    return Promise.reject("Не указана дата начала или дата конца генерации");
  }
  //айдишники возвращенные API методом
  let idsMap:any = new Map();
  //Ищем зависимые методы
  let willReplacedByIdsDep:any = new Map(prepare.bootstrap("sysserver/addDeviceEvent").buildDepMap());
  await renderComp("сформированы зависимые методы",arr);
  /**
   * ДОБАВЛЕНИЕ ДАННЫХ ИЗ lib/api/dependecies
   */
  //перебираем каждый метод в зависимости
  for(let item of willReplacedByIdsDep.keys()){
    if (item === "sysserver/addDeviceEvent") continue;

    //для подстановки id в название метода
    let methodString:any = Array.from(item.split("/"));
    
    if(methodString.length>1){
      if(typeof idsMap.get(methodString[0]) !== 'undefined' ){
        methodString[1] = idsMap.get(methodString[0]);
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
    idsMap.set(item,[]);

    //массив значений fields из 
    let fds:any = willReplacedByIdsDep.get(item);
    //перебираем данные для метода
    for(let fd = 0;fd < fds.length;fd++){
      //формируем тело запроса
      let bodyData = typeof fds[fd].body === 'undefined' ? {} : fds[fd].body;
      //параметры запроса
      let query = typeof fds[fd].query === 'undefined' ? "" : "&" + queryParse(fds[fd].query);
      //Метод POST || PUT
      let method  = typeof depencies[`${item}`].method === 'undefined' ? "PUT" : depencies[`${item}`].method;
      //выполняем запрос
      let id = await asyncFetch(item,query,bodyData,methodString,method).catch(async error=>{
        await renderComp(error,arr);
      });
      //await textArea.setState({text:`метод ${item} завершен успешно`});
      renderComp(`метод ${item} завершен успешно`,arr);
      //если в респонсе есть айди добавляем его в idsMap и вставляем значение в зависимости
      if(typeof id != 'undefined' && id != 0){
        idsMap.get(item).push(id);
        prepare.bootstrap(item).idSearcher(idsMap,willReplacedByIdsDep);
      }             
    }
  }
  /**
   * УДАЛЕНИЕ ДАННЫХ ИЗ БАЗЫ ПОСЛЕ ГЕНЕРАЦИИ
   */
  //Детачим контроллер
  await asyncFetch(`devices/${idsMap.get('devices')[0]}/detach`,"",null,null,"POST").catch(async error=>{
    await renderComp(error,arr);
  });
  await renderComp("Контроллер отвязан от помещения",arr);
  await deleteDependencies(idsMap,arr);
}

/**
 * 
 * @param ids массив типа метод - id
 * возвращает void
 */
async function deleteDependencies(ids:any,arr:any){
  for (let item of ids.keys()){
    for(let key in ids.get(item)){
      let res = await asyncFetch(item,"",null,`${item}/${ids.get(item)[key]}`,"DELETE").catch(async error=>{
        await renderComp(error,arr);
      });
      await renderComp(`метод ${item} завершен успешно`,arr);
    }
  }
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
async function asyncFetch(item:string,query:string,bodyData:any,methodString:any,method:string){
  try {
    let response = await fetch(`${host}/${methodString == null ? item : methodString}?token=master${methodString == null ? query : ""}`,{
      mode:'cors',
      headers : headers,
      method:method,
      body:`${bodyData != null ? JSON.stringify(bodyData) : ""}`
    });

    let responseBody  = await response.text();

    //console.log(item,bodyData,responseBody);
    
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

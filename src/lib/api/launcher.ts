import 'unfetch/polyfill';
import * as prepare from './boots.js';

let host:string = 'http://localhost:8080/api'; 
let headers = {'Content-Type':'application/json','Accept': 'application/json'};

/** Авто генератор проходов
 * 
 * @param begin 
 * @param end 
 * @param shift 
 * @param hours 
 */

export function autoGenerator(begin:any,end:any,shift:string,hours:number){
  //айдишники возвращенные методом
  let idsMap:any = new Map();
  //Ищем зависимые методы
  let tempMap:any = new Map(prepare.bootstrap("sysserver/addDeviceEvent").buildDepMap());
  //перебираем каждый метод в зависимости
  for(let item of tempMap.keys()){
    idsMap.set(item,[]);
    let fds:any = tempMap.get(item);
    //перебираем данные для метода
    for(let fd in fds){
      //формируем тело запроса
      let bodyData = typeof fds[fd].body === 'undefined' ? {} : fds[fd].body;
      //запрос
      let query = typeof fds[fd].query === 'undefined' ? null : queryParse(fds[fd].query);
      
      if(query == null){
        let text:any = request(item,bodyData,query);
      }
      else{
        let text:any = request(item,bodyData,query);
      }
    }
  }
  console.log(idsMap);
}

export function customGenerator(){

}

export function addPass(){

}

export function delpass(){

}


function queryParse(queryTail:any){
   let params:any = [];
   Object.keys(queryTail).forEach(el=>{
     params.push(`${el}=${queryTail[el]}`);
   });
   let str = params.join("&");
   return str;
}

async function request(item:string,body:any,query:any){
    let response = await fetch(`${host}/${item}?token=master`,{headers : headers,method:'PUT',body:JSON.stringify(body)});
    return response;
}
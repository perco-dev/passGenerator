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

export async function autoGenerator(begin:any,end:any,shift:string,hours:number){
  //айдишники возвращенные API методом
  let idsMap:any = new Map();
  //Ищем зависимые методы
  let willReplacedByIdsDep:any = new Map(prepare.bootstrap("sysserver/addDeviceEvent").buildDepMap());
  //перебираем каждый метод в зависимости
  for(let item of willReplacedByIdsDep.keys()){
    idsMap.set(item,[]);
    let fds:any = willReplacedByIdsDep.get(item);
    //перебираем данные для метода
    for(let fd = 0;fd < fds.length;fd++){
      //формируем тело запроса
      let bodyData = typeof fds[fd].body === 'undefined' ? {} : fds[fd].body;
      //запрос
      let query = typeof fds[fd].query === 'undefined' ? "" : queryParse(fds[fd].query);
      let id = await asyncFetch(item,query,bodyData);
      if(id !instanceof Error){
        idsMap.get(item).push(id);
        prepare.bootstrap(item).idSearcher(idsMap,willReplacedByIdsDep);
      }             
    }
  }
}

async function asyncFetch(item:string,query:string,bodyData:any){
  try {
    let response = await fetch(`${host}/${item}?token=master&${query}`,{headers : headers,method:'PUT',body:JSON.stringify(bodyData)});
    let responseBody  = await response.json();
    if(typeof JSON.parse(responseBody).id !== 'undefined'){
      return JSON.parse(responseBody).id;
    }
    else if(typeof JSON.parse(responseBody).ids !== "undefined"){
      return JSON.parse(responseBody).ids[0];
    }
    else {
      throw new Error ('#Can\'t finfd id in response#');
    }
  }
  catch(error){
    console.log(error);
  }
}

function queryParse(queryTail:any){
   let params:any = [];
   Object.keys(queryTail).forEach(el=>{
     params.push(`${el}=${queryTail[el]}`);
   });
   let str = params.join("&");
   return str;
}

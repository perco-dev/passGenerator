 let depend = {
  "sysserver/addDeviceEvent":{
    "fields":[
      {
        "query":{
          "deviceId": 'devices_id_0',
          "type":'17',
          "userId":'users/staff_id_0',
          "resource":0,G
          "resourceType":0,
          "data":0,
          "identifier":0,
          "operatorId":'users/staff_id_0'
        }
      }
    ],
    "dependedTest":["devices/{id}/attach","devices","users/staff"]
  },
  
  "devices":{
    "fields":[
      {
        "body":[
          {
            "device_type":17,
            "ip_addr": "95.173.136.70",
            "net_mask": "160.82.119.185",
            "ip_router":"13.131.15.45",
            "mac_addr":"08:62:66:7b:d7:50" //uniq
          }
        ]
      }
    ],
    "dependedTest":[]
  },

  "devices/{id}/attach":{
    "fields":[
      {
        "body":{
          "accessZoneId":"rooms_id_0"
        },
        "query":{
          "id":"devices_id_0"
        }
      }
    ],
    "dependedTest":['rooms',"devices"],
    "method":"POST"
  },

  "users/staff":{
    "fields":[
      {
        "body":{
        "last_name" : "генератор11", //uniq
        "first_name" : "генераторович11", //uniq
        "middle_name" : "генераторов", // uniq
        "division" : "divisions_id_0", 
          "hiring_date": "begin_datetime_id_0",
          "work_schedule":"Добавиться после добавления графика в генераторе",
          "identifier": [
            {
              "begin_datetime": "begin_datetime_id_0",
              "end_datetime": "end_datetime_id_0",
              "identifier": "1111140" // uniq
            }
          ]
        }
      },
    ],
    "dependedTest" : ["divisions"]
  },
  
  "divisions":{
    "fields":[
      {
        "body":{
          "parent_id": 0,
          "name": "test7", //uniq
        }
      }
    ],
    "dependedTest": []
  },

  "rooms":{
    "fields": [
      {
        "body":{
        "name" : "office10", //uniq
          "parentId" : 1
        }
      }
    ],
    "dependedTest" : []
  }
}
export default depend;

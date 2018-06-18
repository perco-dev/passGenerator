 let depend = {
  "sysserver/addDeviceEvent":{
    "fields":[
      {
        "query":{
          "deviceId": 'devices_id_0',
          "date":"###",
          "type":'###',
          "resource":'###',
          "resourceType":'###',
          "identifier":'###',
          "data":'###',
          "operatorId":'###',
          "userId":'###'
        }
      }
    ],
    "dependedTest":["devices/{id}/attach","devices",/*"users/staff"*/]
  },
  
  "devices":{
    "fields":[
      {
        "body":[
          {
            "deviceType":17,
            "ipAddr": "95.173.136.70",
            "netMask": "160.82.119.185",
            "ipRouter":"13.131.15.45",
            "macAddr":"08:62:66:7b:d7:42"
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
          "last_name" : "генератор",
          "first_name" : "генераторович",
          "identifier": [
            {
              "begin_datetime": "begin_datetime_id_0",
              "end_datetime": "end_datetime_id_0",
              "identifier": "111111"
            }
          ]
        }
      },
    ],
    "dependedTest" : []
  },

  "rooms":{
    "fields": [
      {
        "body":{
          "name" : "office",
          "parentId" : 1
        }
      }
    ],
    "dependedTest" : []
  }
}
export default depend;
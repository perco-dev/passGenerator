"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let depend = {
    "sysserver/addDeviceEvent": {
        "fields": [
            {
                "query": {
                    "deviceId": 'devices_id_0',
                    "date": "###",
                    "type": '###',
                    "resource": '###',
                    "resourceType": '###',
                    "identifier": '###',
                    "data": '###',
                    "operatorId": '###',
                    "userId": '###'
                }
            }
        ],
        "dependedTest": ["devices/{id}/attach", "devices" /*"users/operator","users/staff"*/]
    },
    "devices": {
        "fields": [
            {
                "body": {
                    "deviceType": 2,
                    "ipAddr": "95.173.136.70",
                    "netMask": "160.82.119.185",
                    "ipRouter": "13.131.15.45",
                    "macAddr": "08:62:66:7b:d7:42"
                }
            }
        ],
        "dependedTest": []
    },
    "devices/{id}/attach": {
        "fields": [
            {
                "body": {
                    "accessZoneId": "rooms_id_0"
                },
                "query": {
                    "id": "devices_id_0"
                }
            }
        ],
        "dependedTest": ['rooms', "devices"]
    },
    "users/staff": {
        "fields": [
            {
                "body": {
                    "last_name": "unque",
                    "first_name": "unique",
                    "hiring_date": "2008-12-12",
                    "division": "divisions_id_0"
                }
            },
            {
                "body": {
                    "last_name": "chaiName2",
                    "first_name": "chaiName2",
                    "hiring_date": "2008-12-12",
                    "division": "divisions_id_1"
                }
            }
        ],
        "dependedTest": ["divisions", "positions", "accessTemplates", "taSchedule"]
    },
    "rooms": {
        "fields": [
            {
                "body": {
                    "name": "office",
                    "parentId": 1
                }
            }
        ],
        "dependedTest": []
    }
};
exports.default = depend;
//# sourceMappingURL=dependencies.js.map
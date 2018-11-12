"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let depend = {
    "sysserver/addDeviceEvent": {
        "fields": [
            {
                "query": {
                    "deviceId": 'devices_id_0',
                    "type": '17',
                    "userId": 'users/staff_id_0',
                    "resource": 0,
                    "resourceType": 0,
                    "data": 0,
                    "identifier": 0,
                    "operatorId": 'users/staff_id_0'
                }
            }
        ],
        "dependedTest": ["devices/{id}/attach", "devices", "users/staff"]
    },
    "devices": {
        "fields": [
            {
                "body": [
                    {
                        "device_type": 17,
                        "ip_addr": "95.173.136.70",
                        "net_mask": "160.82.119.185",
                        "ip_router": "13.131.15.45",
                        "mac_addr": "08:62:66:7b:d7:48"
                    }
                ]
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
        "dependedTest": ['rooms', "devices"],
        "method": "POST"
    },
    "users/staff": {
        "fields": [
            {
                "body": {
                    "last_name": "генератор6",
                    "first_name": "генераторович6",
                    "division": "divisions_id_0",
                    "hiring_date": "begin_datetime_id_0",
                    "work_schedule": "Добавиться после добавления графика в генераторе",
                    "identifier": [
                        {
                            "begin_datetime": "begin_datetime_id_0",
                            "end_datetime": "end_datetime_id_0",
                            "identifier": "1111120"
                        }
                    ]
                }
            },
        ],
        "dependedTest": ["divisions"]
    },
    "divisions": {
        "fields": [
            {
                "body": {
                    "parent_id": 0,
                    "name": "test4",
                }
            }
        ],
        "dependedTest": []
    },
    "rooms": {
        "fields": [
            {
                "body": {
                    "name": "office8",
                    "parentId": 1
                }
            }
        ],
        "dependedTest": []
    }
};
exports.default = depend;
//# sourceMappingURL=dependencies.js.map
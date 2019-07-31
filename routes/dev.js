var express = require('express');
var router = express.Router();
var network = require('network')
var redisClient = require('../config/redis');
var models = require('../models');
var validationService = require('../services/validation-service')
var handleLockService = require('../services/handleLock-service')
var mqttService = require('../services/mqtt-service')

//허브 하위에 연결된 장비 목록 조회
router.get('/', [validationService.registerValidation,(req, res, next) => {
    try {
        models.dev.findAll({ attributes: ['dev_mac', 'dev_type'] }).then(devInfo => {
            res.json({
                status: true,
                devInfo: devInfo
            })
        });
    }
    catch (e) {
        res.json({
            status: false,
        })
    }
}]);

//허브 하위 디바이스로 명령
router.post('/:channel', (req, res, next) => {

    const dev_channel = req.params.channel;

    const requester_id = req.requester_id;

    const json_data = req.body;

    console.log(json_data)

    models.dev.findAll({ 
        attributes: ['dev_mac', 'dev_type'] 
    },{
        where: {
            dev_mac: dev_channel
        }
    }).then(devInfo => {

        if(devInfo.length!==0){
            //test id 정보 저장
            redisClient.set(dev_channel, JSON.stringify({
                requester_id: requester_id,
                devType: devInfo[0].dev_type,
            }));

            mqttService.publish(dev_channel, json_data.cmdList, res);
        }
        else{
            res.json({
                status: false,
                devInfo: null
            })
        }
    });
});

module.exports = router;
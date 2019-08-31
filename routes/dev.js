var express = require('express');
var router = express.Router();
var network = require('network')
var models = require('../models');
var validationService = require('../services/validation-service')
var handleLockService = require('../services/handleLock-service')
var modelService = require('../services/model-service')
var mqttService = require('../services/mqtt-service')

//허브 하위에 연결된 장비 목록 조회
router.get('/',(req, res, next) => {
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
});

router.get('/detail',(req, res, next) => {
    models.dev.findAll({ attributes: ['dev_mac', 'dev_type'] }).then(devInfo => {
        res.json({
            status: 200,
            devices: devInfo.map(item=>{
                return {
                    address: item.dev_mac,
                    devType: item.dev_type,
                    name: null
                }
            })
        })
    })
})

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

        if(devInfo.length!==0){ //명령을 수행해야 하는 target디바이스가 존재한다면

            mqttService.publish(dev_channel, json_data.cmdList, res, requester_id, devInfo[0].dev_type);
        }
        else{
            res.json({
                status: false,
                devInfo: null
            })
        }
    });
});

//디바이스의 상태 값 조회
router.post('/:channel/state', async (req, res, next) => {
    const dev_channel = req.params.channel;

    const json_data = req.body;

    let keySet = [];

    for(let i=0; i< json_data.keySet.length; i++){
        keySet.push({
            key: json_data.keySet[i],
            value: String(await modelService.getDataModel(json_data.keySet[i],dev_channel))
        })
        console.log(keySet[i])
    }

    res.json({
        keySet: keySet,
    })
})

//judgement 수행
router.post('/:channel/judge', (req, res, next) => {

    const dev_channel = req.params.channel;

    const statement = req.body.statement;

    let result = 500

    console.log(statement);

    try{
        const trimStatement = statement.trim();

    
        const match = trimStatement.match('#{[a-zA-Z]+}')
        let key = null; 
        if(match)
            key = match[0].replace('#{', '').replace('}','')
            
        modelService.getDataModel(key, dev_channel).then(data=>{
            const execStatement = trimStatement.replace('#{'+key+'}',data)
            const evalRes = eval(execStatement)
            //console.log(execStatement)
            //console.log(evalRes)
            result =  evalRes ? 200 : 500

            console.log(result);

            res.json({
                status: result
            })
        })
    }
    catch(e){
        res.json({
            status: 500
        })
    }

});

module.exports = router;
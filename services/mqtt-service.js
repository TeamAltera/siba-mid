var models = require('../models');
var redisClient = require('../config/redis');
var mqtt = require('mqtt');
var client = mqtt.connect({
    host: 'localhost',
    port: 1883
});

//관리되는 topic들
const DEV_REGISTER = 'dev/register';
const DEV_CONTROL = 'dev/control';
const DEV_CONTROL_END = 'dev/control/end';

const mqtt_connect = () => {
    client.subscribe(DEV_REGISTER, (err) => {
        if(err) console.log(err);
    })
    client.subscribe(DEV_CONTROL_END, (err) => {
        if(err) console.log(err);
    })
}

const mqtt_receive = () => {
    client.on('message', (topic, message) => {
        let subData = JSON.parse(message.toString());
        console.log(subData)

        switch (topic) {
            //하위 장비가 연결되고 등록 정보를 전송했을 때,
            case DEV_REGISTER:
                devRegisterOrUpdate(subData);
                break;
            case DEV_CONTROL_END:
                sendResultToSkill(subData);
                break;
            default:
        }
    })
}

//모듈의 동작 결과를 스킬 서버에게 전송
const sendResultToSkill = (subData) => {
    console.log('some action is finish');
}

const devRegisterOrUpdate = subData => {

    loggerFactory.info('try device regist or updata');

    models.dev.findAll({
        attributes: ['dev_mac', 'dev_type', 'cur_ip'],
        where: {
            dev_mac: subData.dev_mac
        }
    }).then(devInfo => {
        // 이전에 장비가 등록되었었다면,
        if (devInfo.length === 1) {
            //기존에 연결된 장비의 세부 정보가 변경되었다면 업데이트
            if (devInfo[0].cur_ip !== subData.cur_ip || devInfo[0].dev_type !== subData.dev_type) {
                models.dev.update({
                    cur_ip: subData.cur_ip,
                    dev_type: subData.dev_type
                }, {
                        where: {
                            dev_mac: devInfo[0].dev_mac
                        }
                    })
                    loggerFactory.info('update device state latest');
            }
            else{
                loggerFactory.info('device state is up to date');
            }
        }

        //등록된 장비가 아니라면
        else {
            redisClient.get("mac", (err, reply) => {
                models.dev.create({
                    dev_mac: subData.dev_mac,
                    cur_ip: subData.cur_ip,
                    dev_type: subData.dev_type,
                    mac: reply
                });
                loggerFactory.info('regist new device');
            });
        }

        //publishToDev(subData.dev_mac, {code:0}); //regist or update 결과 모듈에게 전송
    });
}

//하위 장비에게 제어 명령 전송
const publishToDev = (dev_channel, data) => {
    //redis로 부터 명령을 전송하고자 하는 장비의 mac address 가져옴
    loggerFactory.info(`device control: ${dev_channel}`);
    const buf = JSON.stringify(data);
    //let dev_mac = await getAsync(dev_mac);
    //lock이 걸리지 않은 경우
    //if (dev_mac === 'N') {
        client.publish(DEV_CONTROL + `/${dev_channel}`, buf);
    //}
}

module.exports = {

    //제어 모듈 control 시에 사용
    publish: publishToDev,

    //MQTT 초기화
    init: () => {
        mqtt_connect(); //subscribe 등록
        mqtt_receive();
    }
}
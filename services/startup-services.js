var network = require('default-gateway');
var internetAvailable = require('internet-available');
//var ip = require('ip');
var ledService = require('./led-services');
var upnpService = require('./upnp-services');
var apService = require('./ap-services');
var nrf24Service = require('./nrf24-services');
var requestService = require('./request-service');
var models = require('../models');
var redisClient = require('../config/redis');

const hubSetup = () => {

    const connectionObj = setInterval(() => {
        internetAvailable({
            domainName: 'www.google.com',
            timeout: 4000,
            host: '8.8.8.8'
        }).then(() => {
            //internet 연결이 되어 있다면 초기화 시작
            //전체 수행 단계에서 예외 발생 시 role back해야
            clearInterval(connectionObj); //Interval 중지
            loggerFactory.info('internet available');

            //upnp 수행
            upnpService.init();
            //NAT에 허브가 여러대 연결 된 경우?
            //허브가 원선에 바로 물려있다면 예외 발생시켜야

            //nrf24 초기화
            nrf24Service.init();
            redisClient.set('aplock','unlock');

            models.hub.findAll().then(hubInfo => {
                console.log(hubInfo);

                if (hubInfo.length != 1) {
                    require('getmac').getMac({ iface: 'eth0' }, (err, macAddress) => {
                        if (err) {
                            ledService.error();
                            loggerFactory.error('cannot search mac address');
                            throw err;
                        }

                        models.hub.create({ mac: macAddress, is_reg: 0 });
                    });
                }

                if (hubInfo.length === 1 && hubInfo[0].is_reg === 1) { //registration 된 경우

                    var natIPv4 = network.v4.sync();
                    console.log(localIPv4)
                    var isUpdate = hubInfo[0].cur_ip != natIPv4; //이전 IP랑 현재 IP랑 같은지 비교
                    var hubInfo = ipUpdate ? { //다르다면 스킬 서버에 변경된 정보 전송할 수 있게
                        mac: hubInfo[0].mac,
                        curIp: natIPv4,
                        prevIp: hubInfo[0].cur_ip,
                        upnpPort: hubInfo[0].upnp_port
                    } : null;

                    var sendData = {
                        ipUpdate: isUpdate,
                        hubInfo: hubInfo
                    };

                    //skill server에 갱신된 정보 전송
                    requestService.req('', sendData, 'UPDATE', ()=>{
                        //skill server에 갱신된 정보 전송 후 local DB에 변경사항 삽입
                        if (isUpdate) {
                            models.hub.update({
                                cur_ip: natIPv4,
                                prev_ip: hubInfo[0].cur_ip,
                                //upnp_port: hubInfo[0].upnp_port
                            }, {
                                where: {
                                    mac: hubInfo[0].mac
                                }
                            });
                        }
                    });

                    apService.disable().then(()=>{
                        apService.enable(); //ap 기동
                    })
                    loggerFactory.info('hub setup success');
                }
                else { //registration이 안되었다면
                    ledService.process();
                    loggerFactory.info('hub is not register');
                }
            });
        }).catch(() => {
            //internet연결이 되어 있지 않다면, error led 점등
            ledService.error();
            console.log('No internet connected');
        })
    }, 5000);
}

module.exports = {
    start: () => {
        hubSetup();
    }
}
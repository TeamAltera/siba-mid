var network = require('network')
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
            redisClient.set('aplock', 'unlock');

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
                        redisClient.set('isreg', 'N');
                    });
                }

                if (hubInfo.length === 1 && hubInfo[0].is_reg === 1) { //registration 된 경우
                    redisClient.set('isreg', 'Y');

                    network.get_public_ip((err, external_ip) => {

                        if (err) {
                            ledService.error();
                            loggerFactory.error('cannot search public ip address');
                            throw err;
                        }

                        var isUpdate = hubInfo[0].cur_ip != external_ip; //이전 IP랑 현재 IP랑 같은지 비교
                        var hubInfo = ipUpdate ? { //다르다면 스킬 서버에 변경된 정보 전송할 수 있게
                            mac_addr: hubInfo[0].mac,
                            external_ip: external_ip,
                            before_ip: hubInfo[0].cur_ip,
                            external_port: hubInfo[0].upnp_port
                        } : null;

                        var sendData = {
                            ip_update: isUpdate,
                            hub_info: hubInfo
                        };

                        //skill server에 갱신된 정보 전송
                        requestService.req('', sendData, 'UPDATE', () => {
                            //skill server에 갱신된 정보 전송 후 local DB에 변경사항 삽입
                            if (isUpdate) {
                                models.hub.update({
                                    cur_ip: external_ip,
                                    prev_ip: hubInfo[0].cur_ip,
                                    //upnp_port: hubInfo[0].upnp_port
                                }, {
                                        where: {
                                            mac: hubInfo[0].mac
                                        }
                                    });
                            }
                        });

                        apService.disable().then(() => {
                            apService.enable(); //ap 기동
                        })
                        loggerFactory.info('hub setup success');
                    });
                }
                else { //registration이 안되었다면
                    redisClient.set('isreg', 'N');
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
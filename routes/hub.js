var express = require('express');
var router = express.Router();
var network = require('network')
var upnpService = require('../services/upnp-services');
var bluetoothService = require('../services/bluetooth-service');
var reservationService = require('../services/reservation-service');
var redisClient = require('../config/redis');
var models = require('../models');
var getMac = require('getmac');

//허브 기본 정보 조회 (NAT ip, mac address, etc...)
router.get('/', (req, res, next) => {

    //허브가 등록여부 조회
    redisClient.get("isreg", (err, reply) => {
        //등록이 되었거나 에러가 발생한다면
        if (err) {
            if (err) {
                loggerFactory.error('redis client get error');
            }
            else if (reply === 'Y')
                loggerFactory.error('hub already regist');
            res.json({
                status: false,
                external_ip: '',
                mac_addr: ''
            })
        }

        //허브가 등록이 안되어 있다면
        else {
            network.get_public_ip((err, ip) => {

                //public ip를 받아올 수 없으면 에러 throw
                if (err) {
                    loggerFactory.error('cannot search public ip address');
                    throw err;
                }

                models.hub.findAll().then(hubInfo => {
                    getMac.getMac('eth0', (err, macAddress) => {

                        if (err) {
                            loggerFactory.error('cannot search MAC address');
                            throw err;
                        }

                        const upnp_options = upnpService.getUpnpOptions();

                        //허브 기본 정보 react측으로 응답
                        res.json({
                            status: true,
                            external_ip: ip,
                            mac_addr: macAddress,
                            external_port: upnp_options.out,
                            before_ip: null,
                        })
                    });
                });
            })
        }
    });
})

//허브 등록
router.post('/', (req, res, next) => {

    //허브 등록 여부 조회
    redisClient.get("isreg", (err, reply) => {

        //등록이 되었거나 에러가 발생한다면
        if (err || reply === 'Y') {
            if (err) {
                loggerFactory.error('redis client get error');
            }
            else if (reply === 'Y')
                loggerFactory.error('hub already regist');
            res.json({
                status: false
            })
        }
        //등록이 안되었다면
        else {

            network.get_public_ip((err, external_ip) => {

                //public ip를 받아올 수 없으면 에러 throw
                if (err) {
                    loggerFactory.error('cannot search public ip address');
                    throw err;
                }

                //mac address 조회
                require('getmac').getMac({ iface: 'eth0' }, (err, macAddress) => {
                    const upnp_options = upnpService.getUpnpOptions();

                    //mac 주소를 받아올 수 없다면
                    if (err) {
                        loggerFactory.error('cannot search mac address');
                        throw err;
                    }

                    models.hub.create({
                        hub_mac: macAddress,
                        reg_state: 1
                    })

                    res.json({
                        status: true,
                    })
                });
            });
        }
    });
});

router.get('/:channel/reservation', (req, res, next) => {
    const dev_channel = req.params.channel;

    models.reserve.findAll({
        attributes: ['res_id', 'ev_code', 'act_at'],

    }, {
            where: {
                mac: dev_channel
            }
        }).then(set => {
            res.json({
                reserveList: set.map((item)=>{
                    return {
                        reservationId: item.res_id,
                        eventCode: item.ev_code,
                        actionAt: item.act_at
                    }
                }),
            })
        })
})

router.post('/reservation/:res_id', (req, res, next) => {
    //const dev_channel = req.params.channel;
    const res_id = req.params.res_id;

    //예약 취소 수행
    models.reserve.findAll({
        attributes: ['res_id'],
    }, {
            where: {
                res_id: res_id
            }
        }).then(set => {
            if (set.length !== 0) {
                reservationService.reserveCancel(res_id)
                res.json({
                    status: 200,
                    msg: '예약 명령 삭제가 성공적으로 수행되었습니다.'
                })
            }
            else {
                res.json({
                    status: 200,
                    msg: '삭제하고자 하는 예약 명령이 존재하지 않습니다.'
                })
            }
        })
})

router.get('/scan', (req, res, next) => {

    bluetoothService.globalScan(res);
})

router.post('/connect/:address', (req, res, next) => {

    const address = req.params.address;

    bluetoothService.connectAndInject(address, res);
})

module.exports = router;

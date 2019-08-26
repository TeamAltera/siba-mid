var internetAvailable = require('internet-available');
var upnpService = require('./upnp-services');
var apService = require('./ap-services');
var bluetoothService = require('./bluetooth-service');
var mqttService = require('./mqtt-service');
var amqpService = require('./amqp-service');
var models = require('../models');
var redisClient = require('../config/redis');
var natUpnp = require('nat-upnp');
var getMac = require('getmac');
var client = natUpnp.createClient();
var redisClient = require('../config/redis');
const {promisify} = require('util');
const getAsync = promisify(redisClient.get).bind(redisClient);

const mac_interface = {
    iface: 'eth0'
}

const defaultBootSetting = async () => {

    return new Promise((resolve, reject) => {
        models.hub.findAll({
            attributes: ['hub_mac', 'reg_state'],
        }).then(hubInfo => {
            if(hubInfo.length!==0 && hubInfo[0].reg_state){
                
                getMac.getMac(mac_interface, (err, macAddress) => {

                    if (err) {
                        loggerFactory.error('cannot search MAC address');
                        throw err;
                    }

                    //시스템 정보 redis로
                    redisClient.set('isreg', hubInfo[0].reg_state ? 'Y' : 'N');
                    redisClient.set('mac', macAddress);

                    resolve(true)
                });
            }
            else{
                //loggerFactory.info('hub registration is not yet');
                //console.log('hub registration is not yet')
                resolve(false)
            }
        })
    })
}

module.exports = {
    start: async () => {

        redisClient.set('isreg', 'N');

        // 1 step. internet status check
        const connectionObj = setInterval(() => {
            
            internetAvailable({
                domainName: 'www.google.com',
                timeout: 4000,
                host: '8.8.8.8'
            }).then(async () => {
                // internet check finish, default setting
                //-----------------------------------
                loggerFactory.info('internet check OK');
                clearInterval(connectionObj); //Interval 중지

                // UPNP
                //-----------------------------------
                if(await upnpService.init()){
                    loggerFactory.info('UPNP setting is finished');
                }

                // bluetooth
                //-----------------------------------
                bluetoothService.init();

                const regCheckInterval = setInterval(async () => {
                    if(await defaultBootSetting()){
                        clearInterval(regCheckInterval); //Interval 중지

                        client.externalIp(async (err,external_ip) => {

                            if (err) {
                                loggerFactory.error('cannot search public ip address');
                                throw err;
                            }
    
                            // Access Point
                            //-----------------------------------
                            apService.init('IoT-hub','raspberry');
                            apService.disable().then(()=>{
                                apService.enable().then(async (res)=>{
                                    if(res){
                                        redisClient.set('isreg', 'Y');

                                        // MQTT
                                        //-----------------------------------
                                        mqttService.init();

                                        //establish, keep-alive 설정
                                        const upnpConfiguration = upnpService.getUpnpOptions();
                                        const mac = await getAsync('mac');
                                        amqpService.init(mac, external_ip, upnpConfiguration.out);
                                    }
                                })
                            })
                        })
                    }
                }, 4000)

            })
            .catch((e)=>{
                console.log(e)
                loggerFactory.info('no internet available');
            })
        }, 5000)
    }
}
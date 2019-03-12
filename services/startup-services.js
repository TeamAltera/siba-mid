var network = require('default-gateway');
var ledService = require('./led-services');
var upnpService = require('./upnp-services');
var apService = require('./ap-services');
var nrf24Service = require('./nrf24-services');

const isConnect = () => {
    try {
        const nat = network.v4.sync();
        loggerFactory.info(`NAT router connected: ${nat}`);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

module.exports = {
    start: () => {
        if (isConnect()) {
            loggerFactory.info('start establish upnp');

            //upnp 수행
            upnpService.init(); 

            //ap모드 실행
            apService.disable();
            apService.enable();

            //nrf24 초기화
            nrf24Service.init();
        }
        else{
            ledService.error();
            loggerFactory.info('NAT router disconnected');
        }
    }
}
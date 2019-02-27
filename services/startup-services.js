var network = require('default-gateway');
var ledService = require('./led-services');
var upnpService = require('./upnp-services');
var apService = require('./ap-services');

const isConnect = () => {
    try {
        const nat = defaultGateway.v4.sync();
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
        }
        else{
            ledService.error();
            loggerFactory.info('NAT router disconnected');
        }
    }
}
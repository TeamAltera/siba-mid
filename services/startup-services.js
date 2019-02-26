var network = require('network');
var ledServices = require('./led-services');

const is_connect = () => {
    network.get_public_ip((err, ip)=>{
        if(ip){
            ledServices.process();
            loggerFactory.info('IoT Hub and NAT router connected');
            return true;
        }
        else {
            ledServices.error();
            loggerFactory.info('IoT Hub and NAT router disconnected');
            return false;
        }
    });
}

module.exports = {
    start:()=>{
       while(!is_connect()){} 
       loggerFactory.info('establish upnp settings');
    }
}
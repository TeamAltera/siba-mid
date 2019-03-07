var apServices = require('./ap-services')
var nrf24=require("nRF24");
var rf24= new nrf24.RF24(6,10);

const rf_options = {
    PALevel: nrf24.RF24_PA_LOW,
    DateRate: nrf24.RF24_1MBPS,
    Channel: 115
}

const hostapd_options = apServices.exportHostapdSettings();

const sendDataset = {
    ssid: hostapd_options.ssid,
    psw: hostapd_options.wpa_passphrase //wpa_passphrase는 암호화 시켜야
}

module.exports = {

    init: ()=>{
        rf24.begin();
        rf24.config(rf_options);
        rf24.powerDown();
    },

    broadcast: ()=>{
        rf24.begin();
        var data = Buffer.from(sendDataset);
        rf24.useWritePipe("0x72646f4e31");
        apServices.write(data);
        rf24.powerDown();
    }
}
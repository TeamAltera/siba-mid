var hostapd = require('wireless-tools/hostapd');
var udhcpd = require('wireless-tools/udhcpd');
var ifconfig = require('wireless-tools/ifconfig');
var async = require('async');
var ledServices = require('../services/led-services');

var udhcpd_options = {
    interface: 'wlan0',
    start: '192.168.2.10',
    end: '192.168.2.254',
    option: {
        router: '192.168.2.1',
        subnet: '255.255.255.0',
        dns: ['8.8.4.4', '8.8.8.8']
    }
};

var hostapd_options = {
    channel: 6,
    driver: 'nl80211',
    hw_mode: 'g',
    interface: 'wlan0',
    ssid: 'IoT-Hub', //ssid
    wpa: 2,
    wpa_passphrase: 'raspberry' //비밀번호
};

var ifconfig_options = {
    interface: 'wlan0',
    ipv4_address: '192.168.2.1',
    ipv4_broadcast: '192.168.2.255',
    ipv4_subnet_mask: '255.255.255.0'
}

var disable_tasks = [
    (callback)=>{
        hostapd.disable(hostapd_options.interface, (err) => {
            callback(null, err);
        });
    },
    (callback)=>{
        udhcpd.disable(udhcpd_options.interface, (err) => {
            callback(null, err);
        });
    },
]

var enable_tasks = [
    (callback)=>{
        hostapd.enable(hostapd_options, (err) => {
            callback(null, err);
        });
    },
    (callback)=>{
        udhcpd.enable(udhcpd_options, (err) => {
            callback(null, err);
        });
    },
    (callback)=>{
        ifconfig.up(ifconfig_options, (err) => {
            callback(null, err);
        });
    },
]

module.exports = {

    disable: () => {
        async.series(disable_tasks, (err, results)=>{
            ledServices.process();
            console.log(results);
        });
    },

    enable: () => {
        async.series(enable_tasks, (err, results)=>{
            ledServices.enable();
            console.log(results);
        });
    },
}
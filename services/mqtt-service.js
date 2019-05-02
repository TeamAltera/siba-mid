var mqtt = require('mqtt');
var client = mqtt.connect({
    host: 'mosquitto',
    port: 1883
});

module.exports = {

    //제어 모듈 control 시에 사용
    publishData: () => {
        client.on('connect', () => {
            // Inform controllers that garage is connected
            client.publish('ctrl/connected', 'true')
        })
    }
}
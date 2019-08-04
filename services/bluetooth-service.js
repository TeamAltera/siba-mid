var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var shell = require('shelljs')
var apService = require('./ap-services');

let bleScan = false;

let bleConnect = false;

let bleDevices = [];

module.exports = {

    init: () => {
        loggerFactory.info('bluetooth module init');
        btSerial.on('found', (address, name) => {
            bleDevices.push({
                address: address,
                name: name
            })
        })
    },

    globalScan: (res) => {
        if (!bleScan) {
            bleScan = true;
            bleDevices = [];
            btSerial.inquireSync();
            bleScan = false;
            res.json({
                status: 200,
                devices: bleDevices,
                msg: '디바이스 스캔이 완료되었습니다.'
            })
        }
        else {
            res.json({
                status: 500,
                devices: [],
                msg: '이미 디바이스 스캔 중입니다.'
            })
        }
    },

    connectAndInject: (address, res) => {

        let result = {
            status: 500,
            msg: '디바이스 연결이 실패하였습니다.'
        }

        if (!btSerial.isOpen()) {
            const hostapd_options = apService.exportHostapdSettings();

            const ssid = hostapd_options.ssid;
            const wpa_passphrase = hostapd_options.wpa_passphrase;

            shell.exec(`expect ./sh-scripts/bluetooth-conn.sh ${address}`, (code, stdout, stderr) => {

                console.log('code:' + code)
                console.log(stdout)
                console.log(stderr)


                btSerial.connect(address, 1, () => {

                    loggerFactory.info('connect with hc-06 is success');

                    btSerial.write(new Buffer(JSON.stringify({
                        ssid: ssid,
                        pwd: wpa_passphrase
                    }), 'utf-8'), (err, bytesWritten) => {
                        loggerFactory.info('ssid, password inject to device');
                        if (err) {
                            loggerFactory.console.error(`error is occured: ${err}`);
                            res.json(result)
                        }
                        else {

                            res.json({
                                status: 200,
                                msg: '디바이스 연결이 성공하였습니다.'
                            })
                        }

                        // close the connection when you're ready
                        btSerial.close();
                    });
                }, () => {
                    loggerFactory.info('cannot connect hc-06 module');
                    res.json(result)
                });
            })
        }
        else {
            loggerFactory.info('already connection open');
            res.json(result)
        }
    }
}
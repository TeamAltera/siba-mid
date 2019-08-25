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
            if (name.indexOf('$siba_') !== -1) {
                bleDevices.push({
                    address: address,
                    name: name.split('_', 2)[1]
                })
            }
        })
        btSerial.on('finished', (address, name) => {

        })
        btSerial.on('closed', () => {
            /*shell.exec(`expect ./sh-scripts/bluetooth-disconn.sh`, (code, stdout, stderr) => {
                loggerFactory.info('bluetooth connection closed');
            })*/
        })
    },

    globalScan: (res) => {
        if (!bleScan) {
            bleScan = true;
            bleDevices = [];

            btSerial.inquireSync();
            //shell.exec(`expect ./sh-scripts/bluetooth-scan.sh`, (code, stdout, stderr) => {


            bleScan = false;
            res.json({
                status: 200,
                devices: bleDevices,
                msg: '디바이스 스캔이 완료되었습니다.'
            })
            //})
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

        res.status(500);

        let result = {
            status: 500,
            msg: '디바이스 연결이 실패하였습니다.'
        }

        if (!btSerial.isOpen()) {
            const hostapd_options = apService.exportHostapdSettings();

            const ssid = hostapd_options.ssid;
            const wpa_passphrase = hostapd_options.wpa_passphrase;

            shell.exec(`expect ./sh-scripts/bluetooth-conn.sh ${address}`, (code, stdout, stderr) => {

                if (code === 0) {
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
                                res.status(200);
                                res.json({
                                    status: 200,
                                    msg: '디바이스 연결이 성공하였습니다.'
                                })
                            }
                        });
                    }, (e) => {
                        console.log(e)
                        loggerFactory.info('cannot connect hc-06 module');
                        res.json(result)
                    });
                }
                else {
                    loggerFactory.info('shell execute is failed');
                    res.json(result)
                }
            })
        }
        else {
            loggerFactory.info('already connection open');
            res.json(result)
        }
    }
}
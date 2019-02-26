var radio = require('nrf');

const nrf24_options = {
    channel: 0x73,
    dataRate: '1Mbps',
    crcBytes: 2,
    cePin: 25,
    irqPin: 24,
    pipes: [0xF0F0F0F0E1, 0xF0F0F0F0D2],
    spiDev: '/dev/spidev0.0'
}

var nrf=radio.connect(nrf24_options.spiDev, nrf24_options.spiDev.cePin, nrf24_options.irqPin);

module.exports = {

    init: ()=>{
        nrf.channel(nrf24_options.channel) //라디오 주파수 채널 설정
            .dataRate(nrf24_options.dataRate) //채널 데이터 전송률 설정
            .crcBytes(nrf24_options.crcBytes) //패킷 체크섬 크기 설정
            //.autoRetransmit({count:15, delay:4000})
            .begin(()=>{

            })
    },

    broadcast: ()=>{
        nrf.begin(()=>{
            console.log('broadcast start');
            var tx = nrf.openPipe(nrf24_options.pipes[0]);
            var rx = nrf.openPipe(nrf24_options.pipes[1]);
        })
    }
}
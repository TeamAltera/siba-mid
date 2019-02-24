const Gpio = require('onoff').Gpio;
const blueLed = new Gpio(17,'out');
const redLed = new Gpio(27,'out');
const greenLed = new Gpio(22,'out');

function rgb_control(r,g,b){
    redLed.writeSync(r);
    greenLed.writeSync(g);
    blueLed.writeSync(b);
}

module.exports = {
    process:()=>{
        //blue led
        rgb_control(0,0,1);
    },
    error:()=>{
        //red led
        rgb_control(1,0,0);
    },
    enable:()=>{
        //green led
        rgb_control(0,1,0);
    }
}
var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var address = require('address');
var ap = require('../services/ap-services');
var nrf24Service = require('../services/nrf24-services');
var upnpService = require('../services/upnp-services');

router.post('/', (req, res, next) => {
  //허브 등록
  const { headers } = req;
  let authorization = headers['authorization'];
  authorization.replace('Bearer ','');

  console.log(`token: ${authorization}`)

  const upnp_options = upnpService.getUpnpOptions();

  const data = {
    exIp: req.body['natAddress'],
    exPort: upnp_options.out,
    inIp: address.ip(),
    inPort: upnp_options.in,
  }

  //post redirect 수행
  res.redirect( 307, 'http://localhost:8083/hub?'+querystring.stringify(data));

});

router.get('/rf', function (req, res, next) {
  //명령이 수행 중에는 lock을 걸어야
  nrf24Service.broadcast();
  res.json({status:'ok'});
});

module.exports = router;

var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var address = require('address');
var ap = require('../services/ap-services');
var nrf24Service = require('../services/nrf24-services');
var upnpService = require('../services/upnp-services');
var AsyncLock = require('async-lock');
var lock = new AsyncLock();

router.post('/hub', (req, res, next) => {
  //res.render('index', { title: 'Express' });

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

router.get('/ap/on', function (req, res, next) {
  //lock 걸어야 on 수행중이면 off도 lock
  if (lock.isBusy()) res.json({ status: 'already working' });
  else {
    lock.acquire('ap-change', (done) => {
    ap.enable();
    done();
    },()=>{
      res.json({ status: 'ok' });
    })
  }
});

router.get('/ap/off', function (req, res, next) {
  //lock 걸어야 off 수행중이면 on도 lock
  if (lock.isBusy()) res.json({ status: 'already working' });
  else {
    lock.acquire('ap-change', (done) => {
      ap.disable();
      done();
    },()=>{
      res.json({ status: 'ok' });
    })
  }
});

router.get('/rf', function (req, res, next) {
  //명령이 수행 중에는 lock을 걸어야
  nrf24Service.broadcast();
  res.json({status:'ok'});
});

module.exports = router;

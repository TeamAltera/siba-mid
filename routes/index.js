var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var address = require('address');
var ap = require('../services/ap-services');
var AsyncLock = require('async-lock');
var lock = new AsyncLock();

router.post('/hub', (req, res, next) => {
  //res.render('index', { title: 'Express' });

  const { headers } = req;
  let authorization = headers['authorization'];
  authorization.replace('Bearer ','');

  console.log(`token: ${authorization}`)

  const data = {
    exIp: req.body['natAddress'],
    exPort: 12345,
    inIp: address.ip(),
    inPort: 3000,
  }

  //post redirect 수행
  res.redirect( 307, 'http://localhost:8083/hub?'+querystring.stringify(data));

});

router.get('/ap/on', function (req, res, next) {
  //lock 걸어야 on 수행중이면 off도 lock
  if (lock.isBusy('ap-change')) res.json({ status: 'already working' });
  else {
    lock.acquire('ap-change', (done) => {
      setTimeout(() => {
        ap.enable();
        done();
      }, 2000);
    },()=>{
      res.json({ status: 'ok' });
    })
  }
});

router.get('/ap/off', function (req, res, next) {
  //lock 걸어야 off 수행중이면 on도 lock
  if (lock.isBusy('ap-change')) res.json({ status: 'already working' });
  else {
    lock.acquire('ap-change', (done) => {
      ap.disable();
      done();
    },()=>{
      res.json({ status: 'ok' });
    })
  }
});

module.exports = router;

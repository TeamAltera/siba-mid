var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var models = require('../models');

router.get('/register', function (req, res, next) {
    models.hub.create({owner_id: 123, id:123})
    .then(result => {
        console.log('insert ok');
    })
  res.json({ status: 'ok' });
});

router.get('/register/test', function (req, res, next) {
    models.hub.findAll().then(res=>{
      console.log(res);
    })
    res.json({ status: 'ok' });
  });

module.exports = router;

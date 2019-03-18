var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var models = require('../models');

router.get('/register', function (req, res, next) {
  models.hub.findAll().then(res=>{
    console.log(res);
  })
  res.json({ status: 'ok' });
});

module.exports = router;

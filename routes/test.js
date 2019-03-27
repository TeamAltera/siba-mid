var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var models = require('../models');

router.get('/register', function (req, res, next) {
  res.json({ status: 'ok' });
});

router.get('/register/test', function (req, res, next) {
    res.json({ status: 'ok' });
  });

module.exports = router;

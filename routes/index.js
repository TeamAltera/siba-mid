var express = require('express');
var passport = require('passport');
var router = express.Router();


/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
  

  /*res.writeHead(302,{
    'Location': 'http://localhost:8081'
  });
  res.end();*/
});

module.exports = router;

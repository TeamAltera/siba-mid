var express = require('express');
var querystring = require('querystring');
var router = express.Router();
var address = require('address');


/* GET home page. */
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
    inPort: 3001,
  }

  //post redirect 수행
  res.redirect( 307, 'http://localhost:8083/hub?'+querystring.stringify(data));


  /*res.writeHead(307,{
    'Location': 'http://localhost:8083/t',
    'Content-Type': 'application/json'
  });
  res.write(data);
  res.end();*/
});

module.exports = router;

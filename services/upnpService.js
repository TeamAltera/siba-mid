var natUpnp = require('nat-upnp');
var client = natUpnp.createClient();
var axios = require('axios');
var ip = require('ip');

module.exports = {
  portFoward: () => {

    /*client.getMappings(function(err, results) {
      console.log(results);
    });*/

    /*client.portUnmapping({
      public: 12345
    });*/

    client.getMappings({ local: true }, (err, results) => {
      let externalPort = 12345;
      let internalPort = 3000;

      console.log(ip.address())

      //upnp가 적용된 포트가 있는지 식별
      if ((results => results.filter(element => element.public.port === externalPort)) === null) {
        console.log('empty,... new forwarding')
        //NAT router에 forwarding
        client.portMapping({
          public: externalPort, //external
          private: internalPort, //internal
          ttl: 10
        }, (err) => {
          // Will be called once finished
          console.log('finished')
        });
      }
      else
        console.log('forwarding already done')
      client.externalIp((err, ip) => {
        console.log(ip);
        axios.post('http://localhost:8081/test',{
          ip: ip,
          port: externalPort
        })
          .then(response => {
            //console.log(response.data.explanation);
            console.log('send finished');
          })
          .catch(error => {
            console.log(error);
          });
      });
    });
  }
}
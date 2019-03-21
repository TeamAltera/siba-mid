var natUpnp = require('nat-upnp');
var client = natUpnp.createClient();
var async = require('async');

const upnp_options = {
  in: 3000,
  out: 65000,
  ttl: 10
}

var upnp_tasks = [
  (callback) => {
    client.portUnmapping({ public: upnp_options.out }, (err) => {
      //하나의 NAT에 복수대의 hub가 연결되는 것 또한 고려해야, 추후 이부분 수정필요
      if(err)
        loggerFactory.info('upnp port unmapping failed');
      else
        callback(null, err);
    });
  },
  (callback) => {
    client.portMapping({
      public: upnp_options.out, //external
      private: upnp_options.in, //internal
      ttl: upnp_options.ttl
    }, (err) => {
      if(!err)
        loggerFactory.info(`upnp establish success, [in: ${upnp_options.in} -> out: ${upnp_options.out}]`);
      else
        loggerFactory.info('upnp port mapping failed');
      callback(null, err);
    });
  },
]

module.exports = {
  init: () => {
    async.series(upnp_tasks, (err, results) => {
      //err ? ledServices.error() : ledServices.process();
      console.log(results);
    });
  },

  getUpnpOptions: () => {
    return upnp_options;
  }
}
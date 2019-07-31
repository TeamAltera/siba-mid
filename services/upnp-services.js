var natUpnp = require('nat-upnp');
var client = natUpnp.createClient();

const upnp_options = {
    in: 3000,
    out: 54326,
    ttl: 0
}

module.exports = {
    init: async () => {
        return new Promise((resolve, reject) => {
            //let result = false;

            client.getMappings((err, results) => {
                console.log(results)
            })

            client.portMapping({
                public: upnp_options.out, //external
                private: upnp_options.in, //internal
                ttl: upnp_options.ttl
            }, (err) => {
                console.log(err)
                if (!err){
                    loggerFactory.info(`upnp established, [in: ${upnp_options.in} <-- out: ${upnp_options.out}]`);
                }
                else{
                    loggerFactory.info('upnp port mapping failed');
                    result = false;
                }
                resolve(true)
            });
        })        
    },

    getUpnpOptions: () => {
        return upnp_options;
    }
}
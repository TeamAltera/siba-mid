const request = require('request');

const SKILL_SERVER_URL = 'http://110.13.78.125:8083/model/'

module.exports = {

    request: async (devType) => {
        return new Promise((resolve, reject)=>{
            request.get({
                uri: SKILL_SERVER_URL+devType,
                json: true
            }, (error, response, body) => {
                resolve(body)
            });
        })
    }
}
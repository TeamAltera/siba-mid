var express = require('express');
var router = express.Router();
var apService = require('../services/ap-services');
var redisClient = require('../config/redis');
var lock = require("redis-lock")(redisClient);

const handleHostapd = async (func, res) => {
    const unlock = await lock('apLock');
    console.log(unlock);
    try{
        loggerFactory.info('ap lock is acquired')
        res.json({ status: false });
    }catch(err){
        res.status(409).json({ 
            status: false,
            error: err.message
        });
    }finally{
        unlock();
        loggerFactory.info('Lock has been released, and is available for others to use')
    }
}

router.get('/on', (req, res, next) => {
    handleHostapd(apService.enable, res);
});

router.get('/off', (req, res, next) => {
    handleHostapd(apService.disable, res);
});

module.exports = router;

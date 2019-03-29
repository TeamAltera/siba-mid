var express = require('express');
var router = express.Router();
var apService = require('../services/ap-services');
var AsyncLock = require('async-lock');
var lock = new AsyncLock();
var redisClient = require('../config/redis');
var lock = require("redis-lock")(redisClient);

router.get('/on', (req, res, next) => {
    
    const unlock = await lock('apLock');
    console.log(unlock);
    try{
        res.json({ status: false });
    }catch(err){
        res.status(409).json({ 
            status: false,
            error: err.message
        });
    }finally{
        unlock();
    }

    /*lock('apLock', (done) => {
        loggerFactory.info('ap lock is acquired')

        ap.enable();
        done(() => {
            loggerFactory.info('Lock has been released, and is available for others to use')
        });
        res.json({ status: true });
    });*/

});

router.get('/off', (req, res, next) => {
    //lock 걸어야 off 수행중이면 on도 lock

    lock('apLock', (done) => {
        loggerFactory.info('ap lock is acquired')

        ap.disable();
        done(() => {
            loggerFactory.info('Lock has been released, and is available for others to use')
        });
        res.json({ status: true });
    });

    res.json({ status: false });

});

module.exports = router;

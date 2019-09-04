var redisClient = require('../config/redis');
const { promisify } = require('util');
const getAsync = promisify(redisClient.get).bind(redisClient);

const registerValidation = (req, res, next) => {
    isRegister(res,next);
}

const isRegister = async (res, next) => {
    let state = await getAsync('isreg');
    if (state === 'Y') {
        next();
    }
    else {
        res.json({
            status: false,
            error: '허브 등록이 되어 있지 않습니다. 허브 등록을 먼저해주세요.'
        });
    }
}

module.exports = {
    registerValidation: registerValidation
}
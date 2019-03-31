var redisClient = require('../config/redis');

const handleWithLock = async (lockId, fn, res) => {
    let lockState;
    try {
      lockState = await lock(lockId);
      if (lockState === 'locked') throw new Error('Resource is locked.');
      const result = await fn();
      if (result) {
        return res.status(200).json(result);
      }
      res.status(204).end();
    } catch (err) {
      res.status(409).json({
        status: false,
        error: err.message,
      });
    } finally {
      if (lockState === 'acquired') {
        await unlock(lockId);
      }
    }
  }
  
  const timestamp = () => {
    return new Date().toUTCString();
  }

  /* : 'locked' | 'acquired' */
  const lock = async (lockId) => {
    if (!redisClient.get(lockId)) {
      redisClient.setbit(lockId, 1);
      console.log(timestamp(), 'lock acquired');
      return 'acquired';
    } else {
      console.log(
        timestamp(),
        'failed to lock the request: request is already locked'
      );
      return 'locked';
    }
  }
  
  const unlock = async (lockId) => {
    console.log(timestamp(), `request is unlocked`);
    redisClient.setbit(lockId, 0);
  }

  module.exports = {
    handleWithLock: handleWithLock
  }
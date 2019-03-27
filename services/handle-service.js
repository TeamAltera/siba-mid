const handleWithLock = async (fn, res) => {
    try {
        const lockState = await lock(context, lockId); // per paymentId
        if (lockState === 'locked') throw new Error('Resource is locked.');
        const result = await fn();
        if (result) return res.status(200).json({
            status: result
        });
        res.status(204).end();
    } catch (err) {
        res.status(409).json({
            error: err.message,
            status: false
        });
    } finally {
        await unlock(context, lockId);
    }
}

const lock = async (context, lockId) => {
    if (!_locks[lockId]) {
        _locks[lockId] = context;
        console.log(timestamp(), context, 'lock acquired');
        return 'acquired';
    } else {
        console.log(
            timestamp(),
            context,
            `failed to lock the payment: payment is already locked by ${
            _locks[lockId]
            }`
        );
        return 'locked';
    }
}

const unlock = async (context, lockId) => {
    console.log(timestamp(), context, `payment is unlocked`);
    delete _locks[lockId];
}

timestamp = () => {
    return new Date().toUTCString();
}

module.exports = {
    handleWithLock: handleWithLock
}
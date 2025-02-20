const router = require('express').Router();

router.use('/equipments', require('./api/equipments'));

router.use('/reports', require('./api/reports'));

router.use('/users', require('./api/users'));

module.exports = router;
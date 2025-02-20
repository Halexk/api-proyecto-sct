const router = require('express').Router();

router.use('/dailyEaters', require('./api/dailyEaters'));

router.use('/users', require('./api/users'));

module.exports = router;
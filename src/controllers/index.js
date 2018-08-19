/**
 * IMPORT EXTERNAL
 */
const express = require('express');
const route = express.Router();
const contractService = require('../../helps/index.js')(require('config').get('provider'));

/**
 * IMPORT INTERNAL
 */
const DATA_DEFAULT = require('../../../config/default.json');


route.get('/', (req, res) => {
    res.json({
        error: false,
        message: 'test_route_successed'
    });
})

module.exports = route;
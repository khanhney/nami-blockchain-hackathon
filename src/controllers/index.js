/**
 * IMPORT EXTERNAL
 */
const express = require('express');
const route = express.Router();
const contractService = require('../helps/index.js')(require('config').get('provider'));
const session = require('express-session');

/**
 * IMPORT INTERNAL
 */



route.get('/', (req, res) => {
    res.render('login');
})


module.exports = route;
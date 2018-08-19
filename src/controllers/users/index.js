/**
 * IMPORT EXTERNAL
 */
const express = require('express');
const route = express.Router();
const contractService = require('../../helps/index.js')(require('config').get('provider'));

/**
 * IMPORT INTERNAL
 */
const User = require('../../models/user');

const DATA_DEFAULT = require('../../../config/default.json');


route.get('/', (req, res) => {
    res.json({
        error: false,
        message: 'test_route_successed'
    });
})

route.get('/info-account/:userID', async(req, res) => {
    const { userID } = req.params;
    let userInfo = await User.findById(userID);
    if (!userInfo) return res.json({
        error: true,
        message: 'user_not_existence'
    });

    contractService.getContractInstance(DATA_DEFAULT.contract.name, DATA_DEFAULT.contract.address, (err, instance) => {
        
        if (err) {
            return res.status(500).json({ "error": err });
        } else {
            var result = instance.getInfoAccount(userInfo.idAddress);
            console.log(result);
            return res.send(result);
        }
    });
})

route.post('/add-account',  async(req, res) => {
    const { idAddress, name, phone, role } = req.body;
    /**
     * SAVE DB
     */
    var resultSave;
    try {
       let saveTemp = new User({
           idAddress, role
       });
       resultSave = await saveTemp.save();
       if (!resultSave) return res.json({
           error: true,
           message: 'cannot_insert_account'
       });
    } catch (error) {
        return res.json({
            error: true,
            message: error.message
        })
    }

    contractService.addNewAccount(
    {
        idAddress, name, phone, role
    }, {
        address: DATA_DEFAULT.contract.owner.address,
        private: DATA_DEFAULT.contract.owner.private
    }, DATA_DEFAULT.contract.address, 'addAccount', function (err, hash) {
        if (err) {
            return res.status(500).json({ "error": err });
        } else {
            return res.status(200).json({
                hash: hash,
                data: resultSave
            });
        }
    });
})

route.post('/add-balance',async (req, res) => {
    const { userID, balance } = req.body;
    let userInfo = await User.findById(userID);
    if (!userInfo) return res.json({
        error: true,
        message: 'user_not_exist'
    });
    let addBalance = await User.findByIdAndUpdate(userID, {
        coin: balance
    }, { new: true });
    if(!addBalance) return res.json({
        error: true,
        message: 'cannot_update_balance'
    });
    
    contractService.addBalance(
        {
            idAddress: userInfo.idAddress,
            balance  : balance
        }, {
            address: DATA_DEFAULT.contract.owner.address,
            private: DATA_DEFAULT.contract.owner.private
        }, DATA_DEFAULT.contract.address, 'addBalance', function (err, hash) {
            // call function addProduct in xdayteam.sol file
            if (err) {
                return res.status(500).json({ "error": err });
            } else {
                return res.status(200).json({
                    hash,
                    data: addBalance
                });
            }
        }
    );
})

route.get('/info-balance/:userID', async (req, res) => {
    const { userID } = req.params;
    let userInfo = await User.findById(userID);
    if (!userInfo) return res.json({
        error: true,
        message: 'user_not_existence'
    });
    
    contractService.getContractInstance(DATA_DEFAULT.contract.name, DATA_DEFAULT.contract.address, (err, instance) => {
        
        if (err) {
            return res.status(500).json({ "error": err });
        } else {
            var result = instance.getBalance(userInfo.idAddress);
            return res.send({
                balance: result
            });
        }
    });
})

module.exports = route;
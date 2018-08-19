/**
 * IMPORT EXTERNAL
 */
const express = require('express');
const route = express.Router();
const contractService = require('../../helps/index.js')(require('config').get('provider'));
const moment = require('moment');

const PREFIX_ROUTE = '/api/v.1/account';
/**
 * IMPORT INTERNAL
 */
const User = require('../../models/user');
const Product = require('../../models/product');

const DATA_DEFAULT = require('../../../config/default.json');



route.get('/login', (req, res) => {
    res.render('login');
});

route.post('/login', async (req, res) => {
    const { idAddress } = req.body;
    try {
        let checkExistence = await User.findOne({
            idAddress: idAddress
        });
        if (!checkExistence) return res.redirect(`${PREFIX_ROUTER}/login`);

        req.session.idAddress = idAddress;
        res.redirect(`${PREFIX_ROUTE}/dashboard`);
    } catch (error) {
        return res.redirect(`${PREFIX_ROUTE}/login`);
    }
});

route.get('/dashboard', async (req, res) => {
    const { idAddress } = req.session;
    try {
        let listPartner = await User.find({
            role: 0
        });
        let infoDetailAddress = await User.findOne({
            idAddress: idAddress
        });
        if (!listPartner || !infoDetailAddress) res.redirect(`${PREFIX_ROUTE}/login`);
        contractService.getContractInstance(DATA_DEFAULT.contract.name, DATA_DEFAULT.contract.address,async (err, instance) => {
            if (err) {
                return res.status(500).json({ "error": err });
            } else {
                var account = instance.getInfoAccount(infoDetailAddress.idAddress);
                // /**
                //  * LIST SHIPPER
                //  */
                var listPartnerInfo = [];
                listPartner.forEach(account => {
                    var result = instance.getInfoAccount(account.idAddress);
                    listPartnerInfo.push(result);
                })

                var infoLatestProduct = await Product.find({}).sort({createAt: -1}).populate('user');
                
                res.render('dashboard', {
                    account, listPartnerInfo, infoDetail: infoDetailAddress, product: infoLatestProduct[0], idAddresBoss: idAddress,
                    moment
                })
            }
        });
        // TODO RENDER
        // res.render('dashboard');
    } catch (error) {
        return res.redirect(`${PREFIX_ROUTE}/login`);
    }
    
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
    }, DATA_DEFAULT.contract.address, 'addAccount', async (err, hash) => {
        if (err) {
            return res.status(500).json({ "error": err });
        } else {
            let updateLink = await User.findByIdAndUpdate(resultSave._id, {
                link: hash
            })
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
/**
 * IMPORT EXTERNAL
 */
const express = require('express');
const route = express.Router();
const contractService = require('../../helps/index.js')(require('config').get('provider'));
/**
 * IMPORT INTERNAL
 */
const Transaction = require('../../models/transaction');
const User = require('../../models/user');

const DATA_DEFAULT = require('../../../config/default.json');


route.get('/', (req, res) => {
    res.json({
        error: false,
        message: 'test_route_successed'
    });
})

route.get('/info-transaction/:transactionID', async(req, res) => {
    const { transactionID } = req.params;
    let transactionInfo = await Transaction.findById(transactionID);
    if (!transactionInfo) return res.json({
        error: true,
        message: 'user_not_existence'
    });

    contractService.getContractInstance(DATA_DEFAULT.contract.name, DATA_DEFAULT.contract.address, (err, instance) => {
        
        if (err) {
            return res.status(500).json({ "error": err });
        } else {
            var result = instance.getTransactionByID(`0x${transactionInfo._id}`);
            console.log(result);
            return res.send(result);
        }
    });
})

route.post('/add-transaction',  async(req, res) => {
    /**
     * addressCustomer: DIA CHI NHAN HANG
     */
    console.log({
        demo: req.body,
    })
    const { accountA, accountB, product, addressCustomer, priceShip } = req.body;
    /**
     * SAVE DB
     */
    var transactionSave ='', idProductConvert='', idTransactionConvert='', infoTransaction;
    try {
       infoTransaction = await User.find({
           $or: [
               { idAddress: accountA },
               { idAddress: accountB }
           ]
       });
       if (!infoTransaction) return res.json({
           error: true,
           message: 'cannot_get_info_user'
       });
       let saveTemp = new Transaction({ accountA:infoTransaction[0]._id, accountB:infoTransaction[1]._id, product });
       transactionSave = await saveTemp.save();
       if (!transactionSave) return res.json({
           error: true,
           message: 'cannot_insert_account'
       });
       idProductConvert = `0x${product}`;
       idTransactionConvert = `0x${transactionSave._id}`;
       contractService.addTransaction(
        {
            accountA: infoTransaction[0].idAddress, accountB: infoTransaction[1].idAddress,
            idProduct: idProductConvert,
            transaction: idTransactionConvert,
            priceShip, addressCustomer
        }, {
            address: DATA_DEFAULT.contract.owner.address,
            private: DATA_DEFAULT.contract.owner.private
        }, DATA_DEFAULT.contract.address, 'addTransaction', function (err, hash) {
            // call function addProduct in xdayteam.sol file
            if (err) {
                return res.status(500).json({ "error": err });
            } else {
                return res.status(200).json({
                    hash,
                    data: transactionSave
                });
            }
        });

    } catch (error) {
        return res.json({
            error: true,
            message: error.message
        })
    }
    
})

/**
 * HIEN TAI CHO CA 2 UPDATE STATUS CHUNG 1 TRANSACTION
 */
route.get('/update-status/:status/:transactionID', async(req, res) => {
    const { status, transactionID } = req.params;
    let updateStatus = await Transaction.findByIdAndUpdate(transactionID);
    if (!updateStatus) return res.json({
        erorr: true,
        message: 'cannot_update_status'
    });
    return res.json({
        error: false,
        message : 'update_status_success'
    })
})

route.get('/list-transaction-of-user/:userID/:status', async (req, res) => {
    const { userID, status } = req.params;
    let transactionInfo = await Transaction.find({
        $or: [
            { accountA: userID },
            { accountB: userID }
        ],
        status: status
    });
    if (!transactionInfo) return res.json({
        error: true,
        message: 'cannot_get_list_transaction_user'
    });
    contractService.getContractInstance(DATA_DEFAULT.contract.name, DATA_DEFAULT.contract.address, async (err, instance) => {
        
        if (err) {
            return res.status(500).json({ "error": err });
        } else {
            var arrayInfoPullChain = [];
            transactionInfo.forEach(transaction => {
                var result = instance.getTransactionByID(`0x${transaction._id}`);
                console.log(result);
                arrayInfoPullChain.push(result);
            })
            return await res.send(arrayInfoPullChain);
        }
    });
})

module.exports = route;
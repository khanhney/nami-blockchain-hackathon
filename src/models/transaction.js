const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const TransactionSchema = new Schema({
    /**
     * ID PRODUCT
     */
    product: {
        type: Schema.Types.ObjectId,
        ref : 'product'
    },
    /**
     * STORE_MANAGER OR SHIPPER
     */
    accountA        : {
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
    accountB        : {
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
    /**
     * -1. not seen
     *  0. confirm and not deliver
     *  1. delivered
     */
    status  : {
        type: Number,
        default : -1
    },
    /**
     * 0. STORE MANAGER - SHIPPER
     * 1. SHIPPER - SHIPPER
     */
    checkDeliver : {
        type: Number,
        default: 0
    },
    createAt : {
        type: Date,
        default: Date.now
    },
    /**
     * update after resp from save blockchain
     */
    link     : {
        type: String
    }
});

const TransactionModel = mongoose.model('transaction', TransactionSchema);

class Transaction extends TransactionModel {
    static addTransaction (product, accountA, accountB, checkDeliver) {
        return new Promise(async resolve => {
            try {
                let transactionTemp = new Transaction({
                    product  : product,
                    accountA : accountA,
                    accountB : accountB,
                    checkDeliver: checkDeliver
                });
                let saveTransaction = await transactionTemp.save();
                if (!saveTransaction) return resolve({
                    error: true,
                    message: 'cannot_save_transaction'
                });
                return resolve({
                    error: false,
                    data: saveTransaction
                });
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message
                });
            }
        })
    }

    static updateStatusResponse (transactionID, status) {
        return new Promise(async resolve => {
            try {
                let updateTransaction = await Transaction.findByIdAndUpdate(transactionID, {
                    status: status
                }, { new: true });
                if (!updateTransaction) return resolve({
                    error: true,
                    message: 'cannot_update_transaction'
                });
                return resolve({
                    error: false,
                    data: updateTransaction
                });
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message
                })
            }
        })
    }

    static updateLinkAfterSaveBlockChain (transactionID, link) {
        return new Promise(async resolve => {
            try {
                let updateTransaction = await Transaction.findByIdAndUpdate(transactionID, {
                    link: link
                }, { new: true });
                if (!updateTransaction) return resolve({
                    error: true,
                    message: 'cannot_update_transaction'
                });
                return resolve({
                    error: false,
                    data: updateTransaction
                });
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message
                })
            }
        })
    }
}

module.exports = Transaction;
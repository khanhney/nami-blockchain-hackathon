const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    idAddress:  {
        type  : String,
        trim  : true,
        unique: true
    },
    /**
     * 0. Shipper
     * 1. Store Manager
     */
    role     : {
        type     : Number,
        default  : 0
    },
    /**
     * LIST idAddress OF SHIPPER OR STORE MANAGER
     */
    partners  : [
        {
            type: Schema.Types.ObjectId,
            ref : 'user'
        }
    ],
    /**
     * update after resp from save blockchain
     */
    link     : {
        type: String,
        default: ''
    },
    /**
     * total coin of user
     */
    coin    : {
        type : Number,
        default: 0
    }
});

const UserModel = mongoose.model('user', UserSchema);

class User extends UserModel {
    static addUser(idAddress, role) {
        console.log({
            idAddress, role
        })
        return new Promise(async resolve => {
           try {
            const userSave = new User({
                idAddress: idAddress, 
                role: role
            });
            let resultSaveresultSave = await userSave.save();
            console.log({
                resultSaveresultSave
            })
            if (!resultSave) return resolve({
                error: true,
                message: 'cannot_insert_user'
            });
            return resolve({
                error: false,
                data: resultSave
            });
           } catch (error) {
               return resolve({
                   error: false, 
                   message: error.message
               });
           }
        })
    }

    /**
     * 
     * @param {*} partner
     * @param {*} userID USERID OF MONGODB
     * @description partner IS idAddress OF BLOCKCHAIN
     */
    static addPartner (userID, partner) {
        return new Promise(async resolve => {
            try {
                let updatePartner = await User.findByIdAndUpdate(userID, {
                    $addToSet:  {
                        partners: partner
                    }
                }, { new: true });
                if (!updatePartner) return resolve({
                    error: true,
                    message: 'cannot_add_partner'
                });
                return resolve({
                    error: false,
                    data: updatePartner
                });
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message
                });
            }
        })
    }

    static updateLinkAfterSaveBlockChain (userID, link) {
        return new Promise(async resolve => {
            try {
                let updataUser = await User.findByIdAndUpdate(userID, {
                    link: link
                }, { new: true });
                if (!updataUser) return resolve({
                    error: true,
                    message: 'cannot_update_transaction'
                });
                return resolve({
                    error: false,
                    data: updataUser
                });
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message
                })
            }
        })
    }

    static updateCoin (userID, coin) {
        return new Promise(async resolve => {
            try {
                let updateCoin = await User.findByIdAndUpdate(userID, {
                    coin: coin
                }, { new: true });
                if (!updateCoin) return resolve({
                    error: false,
                    message: 'cannot_update_coin'
                });
                return resolve({
                    error: false,
                    data: updateCoin
                });
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message
                });
            }
        })
    }
}

module.exports = User;
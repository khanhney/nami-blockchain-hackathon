const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ProductSchema = new Schema({
    createAt: {
        type: Date,
        default: Date.now
    },
    /**
     * INFO USER || ADDRESS_ID
     */
    user    : {
        type: Schema.Types.ObjectId,
        ref : 'user'
    },
    /**
     * update after resp from save blockchain
     */
    link     : {
        type: String,
        trim: true,
    }
});

const ProductModel = mongoose.model('product', ProductSchema);

class Product extends ProductModel {
    static addProduct(userID) {
        return new Promise(async resolve => {
            try {
                const userSave = new Product({
                    user: userID
                });
                const resultSave = await userSave.save();
                if (!resultSave) return resolve({
                    error : true,
                    message : 'cannot_save_user'
                });
                return resolve({
                    error: false,
                    data: resultSave
                })
            } catch (error) {
                return resolve({
                    error: true,
                    message: error.message
                });
            } 
        })
    }

    static updateLinkAfterSaveBlockChain (ProductID, link) {
        return new Promise(async resolve => {
            try {
                let updateProduct = await Product.findByIdAndUpdate(ProductID, {
                    link: link
                }, { new: true });
                if (!updateProduct) return resolve({
                    error: true,
                    message: 'cannot_update_transaction'
                });
                return resolve({
                    error: false,
                    data: updateProduct
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

module.exports = Product;
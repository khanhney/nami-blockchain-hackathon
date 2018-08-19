/**
 * IMPORT EXTERNAL
 */
const express = require('express');
const route = express.Router();
const contractService = require('../../helps/index.js')(require('config').get('provider'));

/**
 * IMPORT INTERNAL
 */
const Product = require('../../models/product.js');
const User = require('../../models/user.js');
const DATA_DEFAULT = require('../../../config/default.json');


route.get('/', (req, res) => {
    res.json({
        error: false,
        message: 'test_route_successed'
    });
})

route.get('/info-product/:idProduct', (req, res) => {
    let { idProduct } = req.params;

    contractService.getContractInstance(DATA_DEFAULT.contract.name, DATA_DEFAULT.contract.address, (err, instance) => {
        let demo = `0x${idProduct}`;
        if (err) {
            return res.status(500).json({ "error": err });
        } else {
            var result = instance.getInfoProduct(demo);
            console.log(result);
            return res.send(result);
        }
    });
})

route.post('/add-product',  async(req, res) => {
    /**
     * userID is _id of user mongodb
     */
    const { name, price, userID } = req.body;
    var idProduct = '', idAddress = '', resultSave;
    /**
     * SAVE DB
     */
    try {
       let saveTemp = new Product({
            user: userID
       });
       resultSave = await saveTemp.save();
       if (!resultSave) return res.json({
           error: true,
           message: 'cannot_insert_product'
       });
       idProduct = resultSave._id;
       let infoUser = await User.findById(userID);
       idAddress = infoUser.idAddress;
       let idProductConvert = `0x${idProduct}`;
       console.log({
           idProduct, idAddress, idProductConvert
       })
       contractService.addNewProduct(
        {
            idAddress, idProduct: idProductConvert, name, price
        }, {
            address: DATA_DEFAULT.contract.owner.address,
            private: DATA_DEFAULT.contract.owner.private
        }, DATA_DEFAULT.contract.address, 'addProduct', async (err, hash)  => {
            // call function addProduct in xdayteam.sol file
            if (err) {
                return res.status(500).json({ "error": err });
            } else {
                let updateProduct = await Product.findByIdAndUpdate(resultSave._id, {
                    link: hash
                });
                return res.status(200).json({
                    hash,
                    data: resultSave
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

module.exports = route;
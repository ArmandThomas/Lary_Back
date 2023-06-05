const express = require('express');
const router = express.Router();

const {requiredUserPrivileges} = require("../middlewares");

const Product = require('../../db/models/Product');
const Home = require('../../db/models/Home');

router.get('/', requiredUserPrivileges, async (req, res) => {

    const home = await Home.findOne({users: res.locals.user._id});

    if (!home) {
        const products = await Product.find({idUser: res.locals.user._id}).sort({ _id : -1});
        return res.status(200).json(products);
    } else {
        const products = await Product.find({idUser: home.users}).sort({ _id : -1});
        return res.status(200).json(products);
    }




});

router.delete('/:id', requiredUserPrivileges, async (req, res) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(400).json({message: "Unable to find product"});
    }

    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({message: "Product deleted"});


});

router.put('/:id', requiredUserPrivileges, async (req, res) => {

    const product = await Product.findById(req.params.id);
    const {quantity, expirationDate} = req.body;

    if (!product) {
        return res.status(400).json({message: "Unable to find product"});
    }

    if (quantity && quantity < 0) {
        return res.status(400).json({message: "Quantity must be positive"});
    }

    await Product.findByIdAndUpdate(req.params.id, {
        quantity : quantity || product.quantity,
        expirationDate : expirationDate || product.expirationDate,
    });

    return res.status(200).json({message: "Product updated"});



});

module.exports = router;
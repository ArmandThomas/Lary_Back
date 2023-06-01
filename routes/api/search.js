const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const {requiredUserPrivileges} = require("../middlewares");

const Product = require('../../db/models/Product');

const Url = "https://world.openfoodfacts.org/api/v2/search";

router.post('/', requiredUserPrivileges, async (req, res) => {

    const {barcode, quantity} = req.body;

    if (!barcode) {
        return res.status(400).json({message: "Unable to find barcode"});
    }

    try {

        const productWithSame = await Product.findOne({idUser: res.locals.user._id, barcode: barcode});
        if (productWithSame) {
            productWithSame.quantity += quantity || 1;
            await productWithSame.save();
            return res.status(200).json({message: "Product updated"});
        }

        const url = `${Url}?code=${barcode}&page_size=1&json=true`;
        const response = await fetch(url);
        const data = await response.json();
        const product = data.products[0];

        if (!product) {
            return res.status(400).json({message: "Unable to find barcode in openfoodfacts"});
        }

        const productData = {
            name: product.abbreviated_product_name_fr,
            brand: product.brands,
            description : product.categories,
            image: product.image_url,
            openFoodFactsId : product.id,
            quantity : quantity || 1,
            idUser : res.locals.user._id,
            barcode
        };

        await Product.create(productData);
        return res.status(200).json({message: "Product created"});

    } catch (e) {
        return res.status(400).json({message: "Unable to find barcode in openfoodfacts"});
    }


});

module.exports = router;
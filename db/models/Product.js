const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    _idUser: String,
    name : String,
    brand : String,
    description : String,
    image : String,
    openFoodFactsId : String,
    quantity : Number,
    barcode : String
});

module.exports = mongoose.model('Product', ProductSchema);
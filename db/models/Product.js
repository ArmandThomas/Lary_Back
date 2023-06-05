const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    idUser: String,
    name : String,
    brand : String,
    description : String,
    image : String,
    openFoodFactsId : String,
    barcode : String,
    nutritionGrade : String,
    quantity : Number,
    expirationDate : Date || null,
    where : String,
    ingredients : String,
});

module.exports = mongoose.model('Product', ProductSchema);
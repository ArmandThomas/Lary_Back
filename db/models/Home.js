const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const HomeSchema = new Schema({
    users: [String],
    name : String,
    waitingList : [String],
});

module.exports = mongoose.model('Home', HomeSchema);
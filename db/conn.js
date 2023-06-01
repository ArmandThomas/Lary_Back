const mongoose = require('mongoose');
const db = process.env.DB_STRING;

const connectDB = async () => {
    try{
        mongoose.set('strictQuery', true);
        await mongoose.connect(db);
        console.log('MongoDB connected')
    } catch(err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
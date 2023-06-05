const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db/conn.js');

const users = require('./routes/api/users');
const search = require('./routes/api/search');
const products = require('./routes/api/products');
const homes = require('./routes/api/homes');

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to Lary API !',
    });
});

app.use('/api/users', users);
app.use('/api/search', search);
app.use('/api/products', products);
app.use('/api/homes', homes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
})

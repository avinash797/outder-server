require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./Routes/routes');


const app = express();
const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

app.use('/api', routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(3000, () => {
    console.log(`Server Started at ${4100}`)
})
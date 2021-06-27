require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/2fa', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const PORT = process.env.PORT || 8080;

// Use  Express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Starting the server
app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}. http://localhost:${PORT}`);
});
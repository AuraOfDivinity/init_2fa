const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/userModel')
const { generateToken, isAuth } = require('../utils/util')
const userRouter = express.Router();

userRouter.post('/register', async (req, res, next) => {
    const { name, email, phone, password } = req.body

    //create a new user 
    const user = new User({
        name,
        email,
        password: bcrypt.hashSync(password, 8),
        phone
    });
    // save new user in db
    const createdUser = await user.save();

    // send user obj back
    res.send({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        isVerified: createdUser.isVerified,
        token: generateToken(createdUser)

    });
})

module.exports = userRouter;

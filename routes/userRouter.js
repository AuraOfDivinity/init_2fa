const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/userModel')
const { generateToken, isAuth } = require('../utils/util')
const userRouter = express.Router();

userRouter.post('/register', async (req, res, next) => {
    const { name, email, phone, password } = req.body

    const otpNumber = Math.floor(100000 + Math.random() * 900000)

    //create a new user 
    const user = new User({
        name,
        email,
        password: bcrypt.hashSync(password, 8),
        phone,

        // Generating a random number of 6 digits for the OTP
        otp: otpNumber
    });
    // save new user in db
    const createdUser = await user.save();

    // Send the otp number to user's phone using twilio programmable messaging
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({ body: `Your account verification OTP is: ${otpNumber}`, from: '+18325583432', to: `${phone}` })
        .then(message => console.log(message.sid)).catch(e => {
            console.log(e)
        });

    // send user obj back
    res.send({
        message: "Success. An OTP has been sent to your phone number. Please verify it.",
        data: {
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            phone: createdUser.phone,
            isVerified: createdUser.isVerified,
            token: generateToken(createdUser)
        }
    });
})

userRouter.post('/verifyOtp', async (req, res, next) => {
    const { otp, phone } = req.body;

    // Checking if a user exists with given phone number
    const user = await User.findOne({ phone });
    let updatedUser;

    if (user && user.otp == otp) {
        user.isVerified = true;
        updatedUser = await user.save();

        return (
            res.send({
                message: "User successfully verified. You can now access protected resources using the provided jwt token",
                data: {
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    isVerified: updatedUser.isVerified,
                    token: generateToken(updatedUser)
                }
            }));
    }
    res.status(400).send({ message: 'No user found with the provided phone number or the provided OTP is invalid' });
})

userRouter.get('/protected', isAuth, (req, res, next) => {
    res.send({
        message: "You have succesfully received the protected resource!",
        data: {
            protectedResource: "I <3 MLH"
        }
    });
})

module.exports = userRouter;

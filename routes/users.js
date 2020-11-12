const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const emailConfig = require('../config/email')
const User = require('../models/user');
const nodemailer = require('nodemailer')

// let mailer = nodemailer.createTransport(emailConfig)
// mailer.verify((err, success) => {
//     if(err) console.log(err)
//     else console.log("Mail connected")
// })

router.post('/register', (req, res, next) => {
    if(!req.body.email || !req.body.password) return res.json({success:false, msg: "Invalid Request"})
    let newUser = new User ({
        email: req.body.email,
        password: req.body.password
    })
    User.verifyAndAddUser(newUser, (err, user) => {
        if (err) {
            return res.json({success: false, msg: err.message})
        } else {
            return res.json({success: true, msg: "User registered"})
        }
    })
})

router.post('/authenticate', (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    if(!password) return res.json({success: false, msg:"No password entered"})
    if (!email) return res.json({success: false, msg:"Invalid email"})
    User.getUserByEmail(email, (err, user) => {
        if(err) throw err;
        if(!user){
            return res.json({success: false, msg: "User not found"})
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err
            if(isMatch) {
                if(!user.verified){
                    return res.json({success: false, msg: "User not verified"})
                }
                else{
                    const token = jwt.sign({data: {_id: user._id, email: user.email, code: user.code, class: user.class, left: user.left}}, config.secret, {
                        expiresIn: 604800
                    })
                    return res.json({
                        success: true,
                        token: 'JWT '+token,
                        user: {
                            id: user._id,
                            email: user.email,
                            code: user.code,
                            class: user.class
                        }
                    })
                }
            } else {
                return res.json({success: false, msg: "Wrong password"});
            }
        })
    })
}) 

router.post('/like', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    if(req.user.code == undefined || req.body.receiver == undefined || req.body.receiver.match(/^(21|22|23|24)[0-9]{4}$/) ==  null){
        return res.json({success: false, msg: "Input a valid alpha"})
    }
    else if(req.user.code.substring(0,2) === "24" && req.body.receiver.substring(0,2) !== "24"){
        return res.json({success: false, msg: "Plebes cannot like upperclass"})
    }
    else if (req.user.code.substring(0,2) !== "24" && req.body.receiver.substring(0,2) === "24"){
        return res.json({success: false, msg: "Upperclass cannot like plebes"})
    }
    else{
        User.pushVote(req.user.code, req.body.receiver, (err, doc) => {
            if(err) return res.json({success: false, msg: err.message})
            else return res.json({success: true, msg: "Like pushed"})
        })
    }
})

router.get('/verify', (req, res, next) => {
    if(!req.query.user || !req.query.string) return res.json({success:false, msg: "Invalid Request"})
    User.verifyEmailLink(req.query.user, req.query.string, (err, cnt) => {
        if(err){
            return res.json({success: false, msg: err.message})}
        else{
            //res.json({success: true, msg: "Email Verified!"})
            return res.redirect("/login")
        }
    })
})

router.post('/reset', (req, res, next) => {
    if(!req.body.email || !req.body.string || !req.body.password) return res.json({success: false, msg: "Invalid Request"})
    User.doReset(req.body.email, req.body.string, req.body.password, (err, doc) => {
        if (err) return res.json({success: false, msg: err.message})
        else{
            return res.json({success: true, msg: "Password reset"})
        }
    })
})

router.post('/sendReset', (req, res, next) => {
    if(!req.body.email) return res.json({success: false, msg: "Invalid Request"})
    User.sendReset(req.body.email, (err, doc) => {
        if(err) return res.json({success:false, msg: err.message})
        else{
            return res.json({success: true, msg: "Reset email sent!"})
        }
    })
})

module.exports = router
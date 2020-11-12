const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const cryptoRandomString = require('crypto-random-string');
mailgunConf = require('../config/mailgun')
const mailgun = require('mailgun-js');
const domain = 'mg.midmatch.live';

const mg = mailgun({apiKey: mailgunConf.apiKey, domain: domain})


Array.prototype.forEachAsync = async function (fn) {
    for (let t of this) { await fn(t) }
}
Set.prototype.forEachAsync = async function (fn) {
    for (let t of this) { await fn(t) }
}

const UserSchema = mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    code: {type: String},
    class: {type: Number},
    incoming: {type: [String]},
    confirm: {type: String},
    left: {type: Number, default: 10},
    verified: {type: Boolean, default: false},
    resetToken: {type: String, default: null}
})

const User = module.exports = mongoose.model('User', UserSchema)

const makeVerifyEmail = function(email, code, token){
    return {
        from: "MidMatch Oracle <oracle@midmatch.live>",
        to: email,
        subject: "Welcome to MidMatch! Verify Your Email ❤️💦🤯",
        html: "<p>Welcome to Midmatch!<br> Please click the link below to verify your email: <br> <a href='https://www.midmatch.live/users/verify?user="+code+"&string="+token+"'>LINK</a></p>"
    }
}

const makeMatchEmail = function(email1, email2){
    return {
        from: "MidMatch Oracle <oracle@midmatch.live>",
        to: [email1, email2],
        subject: "It's A Match! 🥰🥰💞💞",
        html: "<p>Congratulations! <br> " + email1 + " and " + email2 + " have matched on MidMatch!</p>"
    }
}

const makeResetEmail = function(email, token){
    return {
        from: "MidMatch Oracle <oracle@midmatch.live>",
        to: email,
        subject: "Reset MidMatch Password ❗️",
        html: "<p>Hello! <br> You have requested a password reset, click the link to reset: <a href='https://www.midmatch.live/reset?email=" + email+"&token="+token+"'>LINK</a></p>"
    }
}

const makeLikedEmail = function(email){
    return {
        from: "MidMatch Oracle <oracle@midmatch.live>",
        to: email,
        subject: "Someone Likes You 💞",
        html: "<p> Check it out! <br> Someone has 'liked' you on MidMatch! Who could it be? <br> <a href='https://www.midmatch.live/'>https://www.midmatch.live</a></p>"
    }
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback)
}

module.exports.getUserByCode = function(code, callback){
    const query = {code: code}
    User.findOne(query, callback)
}

module.exports.getUserByEmail = function(email, callback) {
    const query = {email: email}
    User.findOne(query, callback)
}

// module.exports.findAll = async function(){
//     let notLiked = new Set()
//     let dne = new Set()
//     var allUsers = await User.find({})
//     await allUsers.forEachAsync( async (user) => {
//         incoming = user.incoming
//         await incoming.forEachAsync(async (alpha) => {
//             var recvUser = await User.findOne({code: alpha})
//             if(recvUser !== null){
//                 var recvIncoming = recvUser.incoming
//                 if (!recvIncoming.includes(user.code)){
//                     //The reciever user has not liked the sender user.
//                     notLiked.add(alpha)
//                     //return await mg.messages().send(makeLikedEmail(`m${alpha}@usna.edu`))
//                 } else return;
//             } else {
//                 //Reciever user does not exist, email them
//                 dne.add(alpha)
//                 //return await mg.messages().send(makeLikedEmail(`m${alpha}@usna.edu`))
//             }

//         })
//     })
//     await notLiked.forEach(async (alpha1) => {
//         mg.messages().send(makeLikedEmail(`m${alpha1}@usna.edu`), (err, body) => {
//             if (err) {console.log(err); return;}
//             else {
//                 console.log("sent")
//             }
//         })
//     })
// }

module.exports.pushVote = async function(senderCode, recieverCode, callback){
    senderUser = await User.findOne({code: senderCode});
    recieverUser = await User.findOne({code: recieverCode})
    if(senderUser.left <= 0) return callback(new Error("No likes left today, come back tomorrow! (Limit 3)"))
    else if(senderUser.incoming.includes(recieverCode)){
        //Already been pushed
        return callback(new Error("Already Liked"), null)
    }
    else if(recieverUser != null){
        if(senderUser.code === recieverUser.code){
            return callback(new Error("You cannot like yourself!", null))
        }
        else if(recieverUser.incoming.includes(senderCode)){
            //User has account, and likes me back
            User.findOneAndUpdate(
                {code: senderCode},
                {"$push": {"incoming": recieverCode}, $inc: {left: -1}},
                { new: true },
                (err, doc) => {
                    if(err) return callback(err, null)
                    else mg.messages().send(makeMatchEmail(senderUser.email, recieverUser.email), (err, info)=>{
                        if(err)return callback(err, null)
                        else{
                            return callback(null, null)
                        }
                    })
                }
            )
        }
        else{
            //Do the push, user has account, but has not liked me back
            User.findOneAndUpdate(
                {code: senderCode},
                {"$push": {"incoming": recieverCode}, "$inc": {"left": -1}},
                { new: true },
                (err) => {
                    if (err) return callback(err, null)
                    else{
                        return callback(null,null)//mg.messages().send(makeLikedEmail(recieverUser.email), callback)
                    }
                }
            )
        }
    }
    else{
        //Do the push, user does not have account
        User.findOneAndUpdate(
            {code: senderCode},
            {"$push": {"incoming": recieverCode}, "$inc": {"left": -1}},
            { new: true },
            (err) => {
                if (err) return callback(err, null)
                else{
                    return callback(null,null)//mg.messages().send(makeLikedEmail(`m${recieverCode}@usna.edu`), callback)
                }
            }
        )
    }
}

module.exports.verifyAndAddUser = async function(newUser, callback){
    emailmatch = newUser.email.match(/^m((21|22|23|24)[0-9]{4})@usna\.edu$/)
    if(newUser.password == null) return callback(new Error("Invalid Password", null))
    if(emailmatch == null){
        return callback(new Error("Invalid Email"), null)
    }
    else{
        foundDoc = await User.findOne({email: newUser.email})
        if(foundDoc){
            return callback(new Error("Email already registered", null))
        }else{
            newUser.class = Number(emailmatch[2])
            newUser.code = emailmatch[1]
            newUser.incoming = []
            newUser.confirm = cryptoRandomString({length: 64, type: 'url-safe'});
            newUser.resetToken = cryptoRandomString({length: 64, type: 'url-safe'})
            bcrypt.genSalt(10, (err, salt) => {
                if(err) throw err
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save((err, user)=>{
                        if(err){
                            console.log(err)
                            return
                        }
                        else{
                            mg.messages().send(makeVerifyEmail(newUser.email, newUser.code, newUser.confirm), (err,info)=> {
                                if(err) console.log(err)
                                else{
                                    return callback(err, user)
                                }
                            })
                        }
                    })
                })
            })
        }
    }
}

module.exports.verifyEmailLink = function(usercode, string, callback){
    User.findOne({code:usercode},(err, user) => {
        if(err) throw err
        else if(!user) return callback(new Error("Could not find your account"))
        else if(user.confirm === string){
            User.findOneAndUpdate(
                {code: usercode},
                {verified: true},
                callback
            )
        }
        else return callback(new Error("Server error"))
    })
}

module.exports.sendReset = async function(email, callback){
    foundUser = await User.findOne({email: email})
    if(!foundUser){
        return callback(new Error("Email not registered"))
        
    }
    else{
        resetToken = cryptoRandomString({length: 64, type: 'url-safe'})
        User.findOneAndUpdate(
            {email: email},
            {resetToken: resetToken},
            (err, doc) => {
                if(err){
                    console.log(err)
                    return
                }//DO email send
                else mg.messages().send(makeResetEmail(email, resetToken), (err, info)=> {
                    if(err)console.log(err)
                    else {
                        return callback(err, doc)
                    }
                })
            }
        )
    }
}

module.exports.doReset = async function(email, string, password, callback){
    foundUser = await User.findOne({email: email, resetToken: string})
    if(!foundUser){
        return callback(new Error("Invalid reset token"), null)
        
    }
    else{
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) throw err;
                User.findOneAndUpdate(
                    {email: email, resetToken: string},
                    {password: hash, verified:true, resetToken: cryptoRandomString({length: 64, type: 'url-safe'})},
                    (err, user) => {
                        if(err){
                            console.log(err)
                            return
                        }
                        else return callback(err, user)
                    }
                )
            })
        })
    }

}

module.exports.comparePassword = function(candidate, hash, callback){
    bcrypt.compare(candidate, hash, (err, isMatch) => {
        if (err) throw err
        return callback(null, isMatch)
    })
}
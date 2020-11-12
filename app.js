const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const sslRedirect = require('heroku-ssl-redirect')
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const rateLimit = require('express-rate-limit');
const ipfilter = require('express-ipfilter').IpFilter
const IpDeniedError = require('express-ipfilter').IpDeniedError
const User = require('./models/user');
const schedule = require('node-schedule')

//Start with that one suspicious email..
ips = ['174.196.133.37']

//Limit 3 requests per 2 seconds. might help spamming of login button...
const apiLimiter = rateLimit({
  windowMs: 4000,
  max: 1
})
const banLimiter = rateLimit({
  windowMs: 1000 * 60 * 5,
  max: 50,
  onLimitReached: function(req, res, options) {
    ips.push(req.ip)
  }
})


mongoose.connect(config.database, {useUnifiedTopology: true, useNewUrlParser: true})

mongoose.connection.on('connected', async () => {
    console.log('Connected to db: ' + config.database)
})

mongoose.connection.on('error', (err) => {
    console.log('Database error '+err);
});

const app = express();

app.use(ipfilter(ips, {trustProxy: true}))


const users = require('./routes/users');

// Port Number
const port = process.env.PORT || 8080;

// CORS Middleware
app.use(cors());
app.use(sslRedirect())
// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
app.set('trust proxy', 1);
require('./config/passport')(passport);
app.use("/users", banLimiter)
app.use("/users", apiLimiter)

app.use('/users', users);

var s = schedule.scheduleJob('0 0 11 * * *', async ()=> {
  try{
          let x = await User.updateMany({},{$set: {left: 3}}).exec()
          console.log("Daily reset like count")
  } catch(e){
          console.error(e)
  }
})



// Index Route
app.get('/', (req, res) => {
   res.send('invaild endpoint');
 });
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use((err, req, res, next) => {
  if(err instanceof IpDeniedError){
    res.status(401).send('You have been banned, appeal by emailing oracle@midmatch.live')
  }
  else next(err)
})

// Start Server
app.listen(port, () => {
  console.log('Server started on port '+port);
});

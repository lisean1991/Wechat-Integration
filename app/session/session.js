var session = require('express-session');
var RedisStrore = require('connect-redis')(session);
var config={
"cookie" : {
   "maxAge" : 1800000,
   'secure': false,
   'path':"/web"
}
}

var sessionConfig = session({
    name : "ygsd",
    secret : 'session_ygsd',
    resave : true,
    saveUninitialized : true,
    cookie : config.cookie,
    // store : new RedisStrore({
    //   client: redisClient,
    //   prefix:'ygsd'
    // })
})

module.exports = sessionConfig;

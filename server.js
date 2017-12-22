
var http = require('http');
var port = 18080;
var express = require('express'),
    routes = require('./app/routes/index.js'),
    session = require("./app/session/session.js"),
    cookieParser = require('cookie-parser'),
    babelCore = require('babel-core'),
    bodyParser = require('body-parser'),
    redis = require('redis');
    require("body-parser-xml")(bodyParser);

  // connect to RedisStrore
  var username = <your redis username>;
  var password = <your redis passcode>;
  var db_host = <your ridis host>;
  var db_port = 80;
  var db_name = <your host DB name>;
  var options = {"no_ready_check":true};
  var clientStrore = redis.createClient(db_port, db_host, options);
  clientStrore.auth(username + '-' + password + '-' + db_name);


  var app = express();
  app.use(bodyParser.xml({
    limit: "1MB",   // Reject payload bigger than 1 MB
    xmlParseOptions: {
    normalize: true,     // Trim whitespace inside text nodes
    // normalizeTags: true, // Transform tags to lowercase
    explicitArray: false // Only put nodes in array if >1
  }
  }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

    app.use('/public', express.static(process.cwd() + '/public'));
    app.use('/client', express.static(process.cwd() + '/client'));
    app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
    // app.use(cookieParser('session_ygsd'));
//cross domain
    app.all('*', function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
      res.header("X-Powered-By",' 3.2.1');
      res.header("Content-Type", "application/json;charset=utf-8");
      next();
    });
    routes(app,clientStrore);


    app.listen(port, function () {
        console.log('Listening on port 18080...');
    });



//});

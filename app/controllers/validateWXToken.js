// var jsSHA = require('jssha');
var crypto = require('crypto');
function validateWXToken(req,res){
  var token="<token>";
  var signature = req.query.signature,
      timestamp = req.query.timestamp,
      echostr   = req.query.echostr,
      nonce     = req.query.nonce;
      oriArray = new Array();
  oriArray[0] = nonce;
  oriArray[1] = timestamp;
  oriArray[2] = token;
  oriArray.sort();
  var original = oriArray.join('');
  var shasum = crypto.createHash('sha1');
  shasum.update(original);
  var scyptoString = shasum.digest('hex');

  if (signature == scyptoString) {
    res.send(echostr);
  }else {
    res.send('bad token');
  }

}

module.exports = validateWXToken;

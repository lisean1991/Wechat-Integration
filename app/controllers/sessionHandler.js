var oUserModel = require(process.cwd() + '/mongo/mongoModel/userModel.js');
function sessionHandler(db){
  var request = require('request');
  var userModel = new oUserModel(db);
  var user = userModel.userModel;
  this.getSeesion = function(req, res) {

      var code = req.body.code;
      var url = "https://api.weixin.qq.com/sns/jscode2session?appid=wx8d204d2c695a5bce&secret=7ba13fb3c801c9bb8786324e5501882f&js_code="+code+"&grant_type=authorization_code";
      request(url,function(error, response, data){
        var oData = JSON.parse(data);
        var returnData = {};
        if (oData.openid) {
          user.findOne({"userId":oData.openid},function(err, result) {
            if(err)
            {
              console.log('Error:'+ err);
              return;
            }
            if(result == null){
              returnData = {"openid":oData.openid,"isExited":false};
            }else{
              returnData = {"openid":oData.openid,"isExited":true};
            }

            res.json(returnData);
          });
        }else{
          res.send(data);
        }

      })

  };

}

module.exports = sessionHandler;

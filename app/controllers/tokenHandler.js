var request = require('request');
function tokenHandler(clientStore){

  this.refreshWechatToken = function(){
    //refresh wechat token per 2h
    setInterval(function(){
      request("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=<appid>&secret=<secret>",function(error,response,data){
        var result = JSON.parse(data);
        clientStore.set("wechartToken",result.access_token);
      });
    },7200000);

    return new Promise(function(resolve,reject){
      request("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=<appid>&secret=<secret>",function(error,response,data){
        var result = JSON.parse(data);
        clientStore.set("wechartToken",result.access_token);
        resolve(result);
      });
    });

  };

  this.getWechatToken = function(){
    return new Promise(function(resolve,reject){
        clientStore.get("wechartToken",function(err,result){
          if(err){
            reject(err);
          }else{
            resolve(result);
          }
        });
    });

  };

  this.refreshC4CToken = function(){

  };

  this.getC4CToken = function(){

  };


}

module.exports = tokenHandler;

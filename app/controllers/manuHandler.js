var request = require('request');
function manuHandler(token){
    var oprions = {
          url:"https://api.weixin.qq.com/cgi-bin/menu/create?access_token="+token,
          method: "POST",
          json:true,
          headers: {
          "content-type": "application/json"},
          body:{
                 "button":[
                     {
                       "name":"账户管理",
                       "sub_button":[{
                            "type": "click",
                            "name": "创建账户",
                            "key": "dataCreate"
                       },{
                            "type": "click",
                            "name": "查询账户",
                             "key": "dataQuery"
                       }]
                     },
                     {
                       "name":"试驾",
                       "sub_button":[{
                            "type": "click",
                            "name": "预约试驾",
                            "key": "tryDrive"
                       },{
                            "type": "click",
                            "name": "查询试驾",
                             "key": "queryDrive"
                       }]
                     },
                     {
                       "name":"高级功能",
                       "sub_button":[{
                            "type": "view",
                            "name": "创建账户",
                            "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2e364477a9159672&redirect_uri=http%3A%2F%2Ftestc4cwc.duapp.com%2Fclient%2Fwebapp%2Findex.html%23%2Faccount&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect"
                       },{
                            "type": "view",
                            "name": "创健票据",
                             "url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx2e364477a9159672&redirect_uri=http%3A%2F%2Ftestc4cwc.duapp.com%2Fclient%2Fwebapp%2Findex.html%23%2Fticket&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect"
                       }]
                     }

                 ]
            }
        };
    request(oprions,function(error,response,data){
      console.log("manu refersh!");
    });
}

module.exports = manuHandler;

var request = require('request'),
    wchatValidateToken = require(process.cwd() + '/app/controllers/validateWXToken.js'),
    oTokenHandler = require(process.cwd() + '/app/controllers/tokenHandler.js'),
    manuHandler = require(process.cwd() + '/app/controllers/manuHandler.js'),
    oHandleC4CRequest = require(process.cwd() + '/app/controllers/handleC4CRequest.js');

module.exports = function (app,clientStrore) {
  var that = this;
  that.waitConfirm = [];
  console.log("begain");
  //get wechat token
  var tokenHandler = new oTokenHandler(clientStrore);
  var handleC4CRequest = new oHandleC4CRequest();
  tokenHandler.refreshWechatToken().then(function(token){
    console.log(token);
      manuHandler(token);
  });

  app.route('/')
      .get(function (req, res) {
        var url = "<your service url>/sap/c4c/odata/v1/c4codata/AccountAddressCollection";
          var options = {
            url: url,
            method: "GET",
            json:true,
            headers: {
                "content-type": "application/json",
                'Authorization': 'Basic ' + new Buffer("name:password").toString('base64')
            },
          };
          request(options,function(error,response,data){
            if(data){
              res.send(data);
            }else {
              res.send(error.message);
            }
          });
        });

  app.route('/').post(function(req,res){
    console.log(req.body);
    res.status(200).end();
  });

  app.route('/create').post(function(req,res){
    var createData = req.body;
    switch (createData.entity) {
      case "customerAccount":
        var oAccountData = {
          "LastName" :createData.lastName,
          "FirstName": createData.firstName,
          "StreetName": createData.address,
          "RoleCode": "CRM000",
          "Mobile":createData.phone,
          "Phone":createData.phone
        };
        handleC4CRequest.createDataToC4C(createData.wxOpenId,oAccountData,"IndividualCustomerCollection").then(function(result){
          res.status(200);
          res.send("创建成功！账户ID："+result);
        }).catch(function(error){
          res.status(500);
          res.send(error);;
        });
        break;
      case "ticket":
        var newDate = new Date();
        var id = newDate.getFullYear()+newDate.getTime();
        handleC4CRequest.createSocialMediaMessage(createData.wxOpenId,{'id':id,'text':createData.text})
        .then(function(result){
          res.status(200);
          res.send({"success:":result});
        })
        .catch(function(error){
          res.status(500);
          res.send({"error:":error});
        });
        break;
      default:

    }
  });

  app.route('/getWXWebToken').post(function(req,res){
    var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=<appid>&secret=<secret>&code="
                  +req.body.code
                  +"&grant_type=authorization_code";

      var options = {
        url: url,
        method: "GET",
        json:true,
        // headers: {
        //     "content-type": "application/json"
        //   }
        };
      request(options,function(error,response,data){
        if(data){
          res.status(200);
          console.log(data);
          res.send(data);
        }else {
          res.send(error.message);
        }
      });
  });

  app.route('/c4c/wechat').post(function(req,res){
    var pushData = JSON.parse(req.body.content);
    var replyTime = new Date(pushData.sma_create_datetime);
    var pushTMLData = {
      "time": {
          "value":replyTime.toLocaleString(),
          "color":"#173177"
      },
      "author":{
          "value":pushData.author_name,
          "color":"#173177"
      },
      "text": {
          "value":pushData.text,
          "color":"#173177"
      },
      "ticket": {
          "value":pushData.service_req_no,
          "color":"#173177"
      }
    };
    handleC4CRequest.getSocialMediaMessage(pushData.original_id)
    .then(function(smaMessage){
      handleC4CRequest.getUserProfileById(smaMessage.SocialMediaUserProfileID)
      .then(function(userProfile){
        sendTemplateMeaasge(userProfile.UserInformation.SocialMediaUserAccountID,"QQccQROme-jTNIq645ITDAt9Csbs3ei77ckIQiAhLd4",pushTMLData);
      });
    });
    res.status(200).end();
  });

  app.route('/c4c').post(function(req,res){
    var changeUrl = req.body.odataServiceEndpoint;
    var BO =  req.body.businessObject;
    if(BO === "CUSTOMER"){
      handleC4CRequest.gePushDataFromC4C(changeUrl).then(function(c4cData){
        sendWCMeaasge(c4cData.NickName,"你的账号信息在后台被更改！\n账户ID："+c4cData.CustomerID);
      });
    }else{
      handleC4CRequest.gePushDataFromC4C(changeUrl).then(function(appointmentData){
        var filter = "CustomerID eq \'" +appointmentData.AccountID +"\'";
        handleC4CRequest.getDataFromC4C(filter,"IndividualCustomerCollection").then(function(customerData){
          var bookingDate = new Date(parseInt(appointmentData.StartDateTime.content.replace("/Date(",'').replace(")/",'')));
          var bookData = {
            "date": {
                "value":bookingDate.toLocaleDateString(),
                "color":"#173177"
            },
            "address":{
                "value":appointmentData.LocationName,
                "color":"#173177"
            },
            "id": {
                "value":customerData.Name,
                "color":"#173177"
            },
            "status": {
                "value":"等待审批",
                "color":"#173177"
            }
          };

          if(appointmentData.Subject.split("(").length === 2){
            bookData.status.value = "已确认";
            sendTemplateMeaasge(customerData.NickName,"k8wGS3mKc5_ISWa6mbslpKbY7se_73KNjjRMNgI-byA",bookData);
            return;
          }
          switch (appointmentData.StatusCode) {
            case "1":
              sendTemplateMeaasge(customerData.NickName,"yxW2tYMNiQhLnPyZTRp3R38J5OVpmGEJfQa5Ilmz6Zo",bookData);
              break;
            case "2":
              that.waitConfirm.push({wcID:customerData.NickName,ID:appointmentData.ObjectID});
              bookData.status.value = "等待确认";
              sendTemplateMeaasge(customerData.NickName,"AJj5GVBOfbjuLX7UojGDw5gN7VCNDrgInW9H4E2mHcQ",bookData);
              break;
            case "3":
              bookData.status.value = "已确认";
              sendTemplateMeaasge(customerData.NickName,"k8wGS3mKc5_ISWa6mbslpKbY7se_73KNjjRMNgI-byA",bookData);
              break;
            default:
          }
        });
      });
    }

  });

  app.route('/wechat').get(function(req,res){
    wchatValidateToken(req,res);
  });

  app.route('/wechat').post(function(req,res){
    var oReqData = req.body.xml;
    var toUserName = oReqData.ToUserName;
    var FromUserName = oReqData.FromUserName;
    var CreateTime = oReqData.CreateTime;
    var MsgType = oReqData.MsgType;
    var Content = oReqData.Content;
    var MsgId = oReqData.MsgId;
    var Event = oReqData.Event;
    var EventKey = oReqData.EventKey;
    if(Content === "确认"){
      wConfirm(FromUserName);
      res.status(200).end();
      return;
    }
    if(Event === "subscribe"){
      handleC4CRequest.createUserProfile(FromUserName,{'firstName':"xiao2",'lastName':"wang"});
      sendWCMeaasge(FromUserName,"Welcome!\nC4C集成微信公众号");
      res.status(200).end();
      return;
    }
    if(Event){
      console.log(EventKey);
      switch (EventKey) {
        case 'dataCreate':
          sendWCMeaasge(FromUserName,"请按照以下格式输出创建账户：\n @账户@姓_名$街道$电话");
          res.status(200).end();
          break;
        case 'dataQuery':
          sendWCMeaasge(FromUserName,"请按以下方式查询：\n 1.查询姓名请输入“姓名”\n2.查询地址请输入“地址”\n1.查询电话请输入“电话”\n");
          res.status(200).end();
          break;
        case 'tryDrive':
          sendWCMeaasge(FromUserName,"请按照以下格式输出创建：\n @试驾@日期(2017/11/23)$地址");
          res.status(200).end();
          break;
        case 'queryDrive':
          //sendWCMeaasge(FromUserName,"请按以下方式查询：\n 1.查询姓名请输入“姓名”\n2.查询地址请输入“地址”\n1.查询电话请输入“电话”\n");
          res.status(200).end();
          break;
        case "subscribe":
          sendWCMeaasge(FromUserName,"Welcome!\nC4C集成微信公众号");
          res.status(200).end();
          break;
        default:

      }
      return;
    }
    var createData = Content.split("@");
    if(createData.length === 3){
      var wcData = createData[2].split("$");
      if(createData[1] === "账户"){
        var oAccountData = {
          "LastName" :wcData[0].split("_")[0],
          "FirstName": wcData[0].split("_")[1],
          "StreetName": wcData[1],
          "RoleCode": "CRM000",
          "Mobile":wcData[2],
          "NickName":FromUserName,
          "Phone":wcData[2]
        };
        handleC4CRequest.createDataToC4C(FromUserName,oAccountData,"IndividualCustomerCollection").then(function(result){
          sendWCMeaasge(FromUserName,"创建成功！账户ID："+result);
        }).catch(function(error){
          sendWCMeaasge(FromUserName,error);
        });
      }else if(createData[1] === "试驾"){
        var startDate = new Date(wcData[0]);
        var oDrivingData = {
          "StartDateTime" :{
            "timeZoneCode":"UTC",
            "content":startDate.toISOString().split(":")[0]+":00:00.0000000Z"
          },
          "EndDateTime" :{
            "timeZoneCode":"UTC",
            "content":startDate.toISOString().split(":")[0]+":00:00.0000000Z"
          },
          "Subject": "预约试驾",
          "LocationName": wcData[1],
        };
        handleC4CRequest.createDataToC4C(FromUserName,oDrivingData,"AppointmentCollection").then(function(result){
          sendWCMeaasge(FromUserName,result);
        }).catch(function(error){
          sendWCMeaasge(FromUserName,error);
        });
      }else if(createData[1] === "ticket"){
        console.log(createData);
        handleC4CRequest.createSocialMediaMessage(FromUserName,{'id':MsgId,'text':wcData[0]})
        .then(function(result){
          console.log(result);
          sendWCMeaasge(FromUserName,result);
        })
        .catch(function(error){
          console.log(error);
          sendWCMeaasge(FromUserName,error);
        });
      }


    }else{
      var filter = "NickName eq \'"+FromUserName+"\'";
      handleC4CRequest.getDataFromC4C(filter,"IndividualCustomerCollection").then(function(c4cdata){
            var returanData;
            switch (Content) {
              case "姓名":
                returanData = "账户名:"+c4cdata.Name;
                break;
              case "地址":
                returanData = c4cdata.StreetName;
                break;
              case "电话":
                returanData = c4cdata.Phone;
                break;
              default:
                returanData = "你好，请输入姓名，地址或电话查询！";
            }
            console.log(returanData);
            sendWCMeaasge(FromUserName,returanData);

            }).catch(function(error){
              sendWCMeaasge(FromUserName,error.message);
             });
    }
    //var xml = '<xml><ToUserName>'+FromUserName+'</ToUserName><FromUserName>'+toUserName+'</FromUserName><CreateTime>'+CreateTime+'</CreateTime><MsgType>'+MsgType+'</MsgType><Content>'+""+'</Content></xml>';
    res.status(200).end();
  });

  function getXMLNodeValue(node_name,xml){
    var tmp = xml.split("<"+node_name+">");
    var _tmp = tmp[1].split("</"+node_name+">");
    return _tmp[0];
  };

  function sendWCMeaasge(toUser,sMessage){
    tokenHandler.getWechatToken().then(function(wcToken){
      console.log(wcToken);
      var oprions = {
            url:"https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token="+wcToken,
            method: "POST",
            json:true,
            headers: {
            "content-type": "application/json"},
            body:{
              "touser":toUser,
              "msgtype":"text",
              "text":
              {
                   "content":sMessage
              }
                }
          };
      request(oprions,function(error,response,data){});
    }).catch();
  };

  function sendTemplateMeaasge(toUser,templateId,sMessage){
    tokenHandler.getWechatToken().then(function(wcToken){
      var oprions = {
            url:"https://api.weixin.qq.com/cgi-bin/message/template/send?access_token="+wcToken,
            method: "POST",
            json:true,
            headers: {
            "content-type": "application/json"},
            body: {
                 "touser":toUser,
                 "template_id":templateId,
                 "data":sMessage
             }
          };
      request(oprions,function(error,response,data){
      });
    }).catch();
  };

  function wConfirm(userId){
    for(var i = 0;i<that.waitConfirm.length;i++){
      if(that.waitConfirm[i].wcID === userId){
        handleC4CRequest.updateC4CDate("AppointmentCollection",that.waitConfirm[i].ID).then(function(result){
          sendWCMeaasge(that.waitConfirm[i].wcID,result);
          that.waitConfirm.splice(i,1);
        }).catch(function(error){
          sendWCMeaasge(that.waitConfirm[i].wcID,error);
          that.waitConfirm.splice(i,1);
        });

      }
    }
  }




};

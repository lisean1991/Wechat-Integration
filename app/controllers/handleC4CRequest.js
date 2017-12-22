var request = require('request');
var parseString = require('xml2js').parseString;
function handleC4CRequest(){
  this.getDataFromC4C = function(filter,entity){
    var url = "<your service url>/sap/c4c/odata/v1/c4codata/"+entity+"?$filter="+filter;
      var options = {
        url: url,
        method: "GET",
        json:true,
        headers: {
            "content-type": "application/json",
            'Authorization': 'Basic ' + new Buffer("name:password").toString('base64')
        },
    //    proxy:"http://proxy.wdf.sap.corp:8080"
  //       host:'proxy.hkg.sap.corp',
  //       port:'8080'
      };

   return new Promise(function(resolve,reject){
     request(options,function(error,response,data){
       if(data && data.d && data.d.results.length > 0){
         resolve(data.d.results[0]);
       }else {
         reject({message:"No data found!"});
       }

       if(error){
         reject(error);
       }

     });
   });
  };

  this.gePushDataFromC4C = function(url){
      var options = {
        url: url,
        method: "GET",
        json:true,
        headers: {
            "content-type": "application/json",
            'Authorization': 'Basic ' + new Buffer("name:password").toString('base64')
        },
      };

   return new Promise(function(resolve,reject){
     request(options,function(error,response,data){
       if(data && data.d && data.d.results){
         resolve(data.d.results);
       }else {
         reject({message:"No data found!"});
       }

       if(error){
         reject(error);
       }

     });
   });
  };

  this.createDataToC4C = function(userWCId,oData,entity){
    var that = this;
    var postData = oData;
    var url = "<your service url>/sap/c4c/odata/v1/c4codata";
      var getTokenOptions = {
        url: url+"/IndividualCustomerCollection?$filter=NickName eq \'"+userWCId+"\'",
        method: "GET",
        json:true,
        headers: {
            "content-type": "application/json",
            'Authorization': 'Basic ' + new Buffer("name:password").toString('base64'),
            "x-csrf-token" :"fetch"
        }
      };
  return new Promise(function(resolve,reject){
      var requestC = request.defaults({jar: true});
      requestC(getTokenOptions,function(error,response,body){
        var csrfToken = response.headers['x-csrf-token'];
        if(!csrfToken){
          reject({message:"验证令牌错误"});
          return;
          }
        if(body && body.d && body.d.results.length > 0 ){
          if(entity === 'IndividualCustomerCollection'){
            reject("你已关联账号，请不要重复创建！你的账户ID:"+body.d.results[0].CustomerID);
          }else{
            postData.AccountID = body.d.results[0].CustomerID;
            var createOptions = {
              url: url+"/"+entity,
              method: "POST",
              json:true,
              headers: {
                  "content-type": "application/json",
                  'x-csrf-token': csrfToken
              },
              body:postData
            };
            requestC(createOptions,function(error,response,data){
              //console.log(data);
              if(error){
                reject(error.message);
              }else{
                if(data.code && data.code === "ERROR"){
                  resolve("在相同时间段内，你已有预约！");
                }
                resolve("预约成功！预约号："+data.d.results.ID);
              }

            });
          }


        }else{
          if(entity !== 'IndividualCustomerCollection'){
            reject("你尚未关联账号，请先创建账户！");
          }else{
            var createOptions = {
              url: url+"/"+entity,
              method: "POST",
              json:true,
              headers: {
                  "content-type": "application/json",
                  'x-csrf-token': csrfToken
              },
              body:postData
            };
            requestC(createOptions,function(error,response,data){
              //console.log(data);
              if(error){
                reject(error.message);
              }else{
                that.updateUserProfile(userWCId,data.d.results.CustomerID);
                resolve(data.d.results.CustomerID);
              }

            });
          }
            }

          });
      });

  };

  this.updateC4CDate = function(entity,objId){
    var url = "<your service url>/sap/c4c/odata/v1/c4codata";
      var getTokenOptions = {
        url: url+"/"+entity+"(\'"+objId+"\')",
        method: "GET",
        json:true,
        headers: {
            "content-type": "application/json",
            'Authorization': 'Basic ' + new Buffer("name:password").toString('base64'),
            "x-csrf-token" :"fetch"
        }
      };
  return new Promise(function(resolve,reject){
      var requestC = request.defaults({jar: true});
      requestC(getTokenOptions,function(error,response,body){
        var csrfToken = response.headers['x-csrf-token'];
        if(!csrfToken){
          reject({message:"验证令牌错误"});
          return;
          }
        if(body && body.d && body.d.results ){
          var newData = body.d.results;
          newData.Subject = body.d.results.Subject+"(已确认)";
          var updateOptions = {
            url: url+"/"+entity+"(\'"+objId+"\')",
            method: "PUT",
            json:true,
            headers: {
                "content-type": "application/json",
                'x-csrf-token': csrfToken
            },
            body:newData
          };
          console.log(body);
          requestC(updateOptions,function(error,response,data){
            console.log(data);
            if(error){
              reject(error.message);
            }else{
              resolve("确认成功！");
            }

          });
        }
        });
      });
  };

  this.updateUserProfile = function(openId,customerId){
    this.getUserProfile(openId).then(function(userProfile){
      console.log(userProfile.ID);
      var options = { method: 'POST',
                  url: '<your service url>/sap/bc/srt/scs/sap/managesocialmediauserprofilein',
                  qs: { 'sap-vhost': 'my306768.vlab.sapbydesign.com' },
                  headers: {
                     'cache-control': 'no-cache',
                     'content-type': 'text/xml',
                     authorization: 'Basic ' + new Buffer("name:password").toString('base64') },
                  body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:glob="http://sap.com/xi/SAPGlobal20/Global"><soapenv:Header/><soapenv:Body><glob:SocialMediaUserProfileBundleMaintainRequest_sync>'
                        +'<SocialMediaUserProfile>'
                        +'<UUID>'+userProfile.UUID+'</UUID>'
                        +'<UserInformation >'
                        +'<SocialMediaUserAccountID>'+openId+'</SocialMediaUserAccountID>'
                        +'</UserInformation>'
                        +'<CustomerInternalID>'+customerId+'</CustomerInternalID>'
                        +'</SocialMediaUserProfile>'
                        +'</glob:SocialMediaUserProfileBundleMaintainRequest_sync></soapenv:Body></soapenv:Envelope>'
                };
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log("userProfile.ID1");
        console.log(body);
        // var paersString = "<SocialMediaActivity>"+body.split("<SocialMediaActivity>")[1].split("</SocialMediaActivity>")[0]+"</SocialMediaActivity>";
        // parseString(paersString,{explicitArray : false}, function (err, result) {

        });
    }).catch(function(){
    });
  };

  this.createUserProfile = function(openId,oUserInfo){
    var options = { method: 'POST',
                url: 'h<your service url>/sap/bc/srt/scs/sap/managesocialmediauserprofilein',
                qs: { 'sap-vhost': 'my306768.vlab.sapbydesign.com' },
                headers: {
                   'cache-control': 'no-cache',
                   'content-type': 'text/xml',
                   authorization: 'Basic ' + new Buffer("name:password").toString('base64') },
                body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:glob="http://sap.com/xi/SAPGlobal20/Global"><soapenv:Header/><soapenv:Body><glob:SocialMediaUserProfileBundleMaintainRequest_sync>'
                      +'<SocialMediaUserProfile>'
                      +'<SocialMediaUserCategoryCode>02</SocialMediaUserCategoryCode>'
                      +'<UserInformation >'
                      +'<SocialMediaUserAccountID>'+openId+'</SocialMediaUserAccountID>'
                      +'<SocialMediaChannelCode>905</SocialMediaChannelCode>'
                      +'<FamilyName>'+oUserInfo.lastName+'</FamilyName>'
                      +'<GivenName>'+oUserInfo.firstName+'</GivenName>'
                      // +'<SocialMediaUserName>'+Wang+'</SocialMediaUserName>'
                      +'</UserInformation>'
                      // +'<ContactPartyInternalID>'+Wang+'</ContactPartyInternalID>'
                      // +'<CustomerInternalID>'+Wang+'</CustomerInternalID>'
                      +'</SocialMediaUserProfile>'
                      +'</glob:SocialMediaUserProfileBundleMaintainRequest_sync></soapenv:Body></soapenv:Envelope>'
              };
    this.getUserProfile(openId).then().catch(function(){
      request(options, function (error, response, body) {;
        if (error) throw new Error(error);
        // var paersString = "<SocialMediaActivity>"+body.split("<SocialMediaActivity>")[1].split("</SocialMediaActivity>")[0]+"</SocialMediaActivity>";
        // parseString(paersString,{explicitArray : false}, function (err, result) {

        });
    });
  };

  this.getUserProfile = function(openId){
    var options = { method: 'POST',
                url: '<your service url>/sap/bc/srt/scs/sap/requestforsocialmediauserprofi',
                qs: { 'sap-vhost': 'my306768.vlab.sapbydesign.com' },
                headers: {
                   'cache-control': 'no-cache',
                   'content-type': 'text/xml',
                   authorization: 'Basic ' + new Buffer("name:password").toString('base64') },
                body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:glob="http://sap.com/xi/SAPGlobal20/Global"><soapenv:Header/><soapenv:Body><glob:SocialMediaUserProfileRequest_sync>'
                      +'<SocialMediaUserProfileSelectionByElements>'
                      +'<SelectionBySocialMediaUserProfileUserAccountID>'
                      +'<InclusionExclusionCode>I</InclusionExclusionCode>'
                      +'<IntervalBoundaryTypeCode>1</IntervalBoundaryTypeCode>'
                      +'<LowerBoundarySocialMediaUserProfileUserAccountID >'+openId+'</LowerBoundarySocialMediaUserProfileUserAccountID>'
                      +'</SelectionBySocialMediaUserProfileUserAccountID>'
                      +'</SocialMediaUserProfileSelectionByElements>'
                      +'</glob:SocialMediaUserProfileRequest_sync></soapenv:Body></soapenv:Envelope>'
              };

    return new Promise(function(resolve,reject){
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        if(body.split('<ReturnedQueryHitsNumberValue>')[1].split('</ReturnedQueryHitsNumberValue>')[0] !== '0'){
          var paersString = "<SocialMediaUserProfile>"+body.split("<SocialMediaUserProfile>")[1].split("</SocialMediaUserProfile>")[0]+"</SocialMediaUserProfile>";
          parseString(paersString,{explicitArray : false}, function (err, result) {
            resolve(result.SocialMediaUserProfile);
          });
        }else{
          reject();
        }
      });
    });
  };

  this.getUserProfileById = function(userProfileId){
    var options = { method: 'POST',
                url: '<your service url>/sap/bc/srt/scs/sap/requestforsocialmediauserprofi',
                qs: { 'sap-vhost': '<your service url>' },
                headers: {
                   'cache-control': 'no-cache',
                   'content-type': 'text/xml',
                   authorization: 'Basic ' + new Buffer("name:password").toString('base64') },
                body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:glob="http://sap.com/xi/SAPGlobal20/Global"><soapenv:Header/><soapenv:Body><glob:SocialMediaUserProfileRequest_sync>'
                      +'<SocialMediaUserProfileSelectionByElements>'
                      +'<SelectionBySocialMediaUserProfileID>'
                      +'<InclusionExclusionCode>I</InclusionExclusionCode>'
                      +'<IntervalBoundaryTypeCode>1</IntervalBoundaryTypeCode>'
                      +'<LowerBoundarySocialMediaUserProfileID >'+userProfileId+'</LowerBoundarySocialMediaUserProfileID>'
                      +'</SelectionBySocialMediaUserProfileID>'
                      +'</SocialMediaUserProfileSelectionByElements>'
                      +'</glob:SocialMediaUserProfileRequest_sync></soapenv:Body></soapenv:Envelope>'
              };

    return new Promise(function(resolve,reject){
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        if(body.split('<ReturnedQueryHitsNumberValue>')[1].split('</ReturnedQueryHitsNumberValue>')[0] !== '0'){
          var paersString = "<SocialMediaUserProfile>"+body.split("<SocialMediaUserProfile>")[1].split("</SocialMediaUserProfile>")[0]+"</SocialMediaUserProfile>";
          parseString(paersString,{explicitArray : false}, function (err, result) {
            resolve(result.SocialMediaUserProfile);
          });
        }else{
          reject();
        }
      });
    });
  };

  this.createSocialMediaMessage = function(openId,oMessage){
    var that = this;
   return new Promise(function(resolve,reject){
    that.getUserProfile(openId).then(function(userProfile){
      console.log(userProfile);
      var options = { method: 'POST',
                  url: '<your service url>/sap/bc/srt/scs/sap/managesocialmediaactivityin',
                  qs: { 'sap-vhost': '<your service url>' },
                  headers: {
                     'cache-control': 'no-cache',
                     'content-type': 'text/xml',
                     authorization: 'Basic ' + new Buffer("name:password").toString('base64') },
                  body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:glob="http://sap.com/xi/SAPGlobal20/Global"><soapenv:Header/><soapenv:Body><glob:SocialMediaActivityBundleMaintainRequestsync>'
                        +'<SocialMediaActivity>'
                        +'<SocialMediaMessageID>'+oMessage.id+'</SocialMediaMessageID>'
                        +'<SocialMediaUserProfileID>'+userProfile.ID+'</SocialMediaUserProfileID>'
                        +'<SocialMediaActivityProviderID >WechatTest</SocialMediaActivityProviderID>'
                        +'<InteractionContent ><Text>'+oMessage.text+'</Text></InteractionContent>'
                        +'</SocialMediaActivity>'
                        +'</glob:SocialMediaActivityBundleMaintainRequestsync></soapenv:Body></soapenv:Envelope>'
                };
        request(options, function (error, response, body) {
          if (error){
            console.log(error);
            reject("创建失败");
          };
          console.log(body);
          resolve("Ticket创建成功！");
          // var paersString = "<SocialMediaActivity>"+body.split("<SocialMediaActivity>")[1].split("</SocialMediaActivity>")[0]+"</SocialMediaActivity>";
          // parseString(paersString,{explicitArray : false}, function (err, result) {
          //
          // });
        });
      });
    });
  };

  this.getSocialMediaMessage = function(msgId){
    var that = this;
    return new Promise(function(resolve,reject){
    var options = { method: 'POST',
                  url: '<your service url>/sap/bc/srt/scs/sap/querysocialmediaactivityin',
                  qs: { 'sap-vhost': '<your service url>' },
                  headers: {
                     'cache-control': 'no-cache',
                     'content-type': 'text/xml',
                     authorization: 'Basic ' + new Buffer("name:password").toString('base64') },
                  body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:glob="http://sap.com/xi/SAPGlobal20/Global"><soapenv:Header/><soapenv:Body><glob:SocialMediaActivityByElementsQuery_sync>'
                        +'<SocialMediaActivitySelectionByElements>'
                        +'<SelectionBySocialMediaMessageID>'
                        +'<InclusionExclusionCode>I</InclusionExclusionCode>'
                        +'<IntervalBoundaryTypeCode>1</IntervalBoundaryTypeCode>'
                        +'<LowerBoundarySocialMediaMessageID >'+msgId+'</LowerBoundarySocialMediaMessageID>'
                        +'</SelectionBySocialMediaMessageID>'
                        +'</SocialMediaActivitySelectionByElements>'
                        +'</glob:SocialMediaActivityByElementsQuery_sync></soapenv:Body></soapenv:Envelope>'
                };
        request(options, function (error, response, body) {
          if (error){
            reject(error.message);
            return;
          };
          if(body.split('<ReturnedQueryHitsNumberValue>')[1].split('</ReturnedQueryHitsNumberValue>')[0] !== '0'){
            var paersString = "<SocialMediaActivity>"+body.split("<SocialMediaActivity>")[1].split("</SocialMediaActivity>")[0]+"</SocialMediaActivity>";
            parseString(paersString,{explicitArray : false}, function (err, result) {
              resolve(result.SocialMediaActivity);
            });
          }else{
            reject();
          }

        });
    });
  };

}

module.exports = handleC4CRequest;

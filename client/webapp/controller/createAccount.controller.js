sap.ui.define([
	"ygsd/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(Controller,JSONModel) {
	"use strict";

	return Controller.extend("ygsd.controller.createAccount", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ygsd.view.createAccount
		 */
		 onInit: function() {
			 this.accountModel = new JSONModel({
				 "lastName":"",
				 "firstName":"",
				 "address":"",
				 "phone":"",
			 },true);
			 var that = this;
			 this.getView().byId("createForm").setModel(this.accountModel,"createAccpunt");
			 this.getView().byId("createForm").bindElement("createAccpunt>/");
			 this.getRouter().getRoute("createAccount").attachPatternMatched(this._onCreate, this);
		 },

		 _onCreate:function(oEvent){

		 },

		 onSubmit :function(){
			 var oAccount = {};
			 oAccount = this.accountModel.getData();
			 oAccount.wxOpenId = this.getAccessInfo().openid;
			 oAccount.entity = "customerAccount";
			 this.getView().setBusy(true);
			 this.callService("/create","POST",oAccount,jQuery.proxy(this.submitSuccess,this),jQuery.proxy(this.submitError,this));
		 },

		 submitSuccess:function(result){
			 this.getView().setBusy(false);
			 this.showMessage("创建成功");
			 this.navBack();
		 },

		 submitError:function(result){
			 this.getView().setBusy(false);
			 this.showMessage(result,"error");
		 },

		 onCancel :function(){
			 this.navBack();
		 },

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ygsd.view.createAccount
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ygsd.view.createAccount
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ygsd.view.createAccount
		 */
		//	onExit: function() {
		//
		//	}

	});

});

sap.ui.define([
	"ygsd/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(Controller,JSONModel) {
	"use strict";

	return Controller.extend("ygsd.controller.createTicket", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ygsd.view.createTicket
		 */
			onInit: function() {
				this.accountModel = new JSONModel({
					"text":"",
				},true);
				var that = this;
				this.getView().byId("createForm").setModel(this.accountModel,"ticket");
				this.getView().byId("createForm").bindElement("ticket>/");
			},

			onSubmit :function(){
				var oTicket = {};
				oTicket = this.accountModel.getData();
				oTicket.wxOpenId = this.getAccessInfo().openid;
				oTicket.entity = "ticket";
				this.getView().setBusy(true);
				this.callService("/create","POST",oTicket,jQuery.proxy(this.submitSuccess,this),jQuery.proxy(this.submitError,this));
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
		 * @memberOf ygsd.view.createTicket
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ygsd.view.createTicket
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ygsd.view.createTicket
		 */
		//	onExit: function() {
		//
		//	}

	});

});

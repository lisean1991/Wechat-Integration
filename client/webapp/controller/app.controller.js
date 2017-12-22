sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("ygsd.controller.app", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ygsd.view.app
		 */
			onInit: function() {
			this.appdata = this.getOwnerComponent().getAppData();
			this.WXCode = this.getWXCode();
			var that = this;
			$.ajax({ url: "<your service url>/getWXWebToken",
							// dataType: 'application/json',
							 type:"POST",
							 data:{
								 "code":this.WXCode
							 },
							 success: function(data){
									that.appdata.accessInfo = data;
								},
							error:function( XMLHttpRequest, textStatus, errorThrown){

								}
							});
		},

		 getWXCode: function(){
			return window.location.search.substr(1).split("&state")[0].split("code=")[1];

		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ygsd.view.app
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ygsd.view.app
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ygsd.view.app
		 */
		//	onExit: function() {
		//
		//	}

	});

});

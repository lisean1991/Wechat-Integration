sap.ui.define([
	"ygsd/controller/BaseController",
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("ygsd.controller.home", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ygsd.view.home
		 */
		onInit: function() {
			var oModel = new JSONModel({
				"TileCollection": [{
					"type": "Create",
					"title": "Create Account",
					"info": "Please create account",
					"infoState": "Success",
					"key":"CA"
				}, {
					"type": "Create",
					"title": "Create Ticket",
					"info": "Please create ticket",
					"infoState": "Success",
					"key":"CT"
				}]
			});
			this.getView().setModel(oModel);

		},
		
		onTilePress :function(oEvent){
			var tileKey = oEvent.getSource().getBindingContext().getObject().key;
			switch(tileKey){
				case 'CA':
					this.getRouter().navTo("createAccount", {}, false);
				break;
				case 'CT':
					this.getRouter().navTo("createTicket", {}, false);
				break;
			}
		}
		

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf ygsd.view.home
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf ygsd.view.home
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf ygsd.view.home
		 */
		//	onExit: function() {
		//
		//	}

	});

});
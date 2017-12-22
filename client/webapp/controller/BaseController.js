sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("ygsd.controller.BaseController", {

		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},
		getDeviceModel: function() {
			return this.getOwnerComponent().getModel("device");
		},

		getServiceUrl: function() {
			return "<your service url>";
		},

		getAccessInfo :function(){
			return this.getOwnerComponent().getAppData().accessInfo;
		},

		callService: function(sPath, method, postData, callBack,errorCallback) {
			var url = this.getServiceUrl() + sPath;

			$.ajax({
				url: url,
				type: method,
				data: postData,
				success: callBack,
				error: errorCallback
			});
		},

		showMessage: function(sMessage, Type) {
			jQuery.sap.require("sap.m.MessageBox");
			switch (Type) {
				case "error":
					sap.m.MessageBox.error(sMessage, {
						title: "错误", // default
						onClose: null, // default
						textDirection: sap.ui.core.TextDirection.Inherit // default
					});
					break;
				case "warnning":
					sap.m.MessageBox.warning(sMessage, {
						title: "警告", // default
						onClose: null, // default
						textDirection: sap.ui.core.TextDirection.Inherit // default
					});
					break;
				default:
					sap.m.MessageToast.show(sMessage, {
						duration: 3000, // default
						width: "15em", // default
						my: "center bottom", // default
						at: "center bottom", // default
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: true, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
			}
		},

		navBack: function() {
			var oRouter = this.getRouter();

			var oHistory = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
				return;
			} else {
				oRouter.navTo("home", true);
			}
		}

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf tmspln.view.App
		 */
		//	onInit: function() {
		//
		//	},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf tmspln.view.App
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf tmspln.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf tmspln.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});

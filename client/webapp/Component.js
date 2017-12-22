sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ygsd/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("ygsd.Component", {

		metadata: {
			manifest: "json",
			config: {
				serviceUrl: "<your service url>"
			}
		},
		AppData : {
			userInfo:{}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this._initializeRouter();
		},

		_initializeRouter: function() {
			// initialize the router
			this._oRouter = this.getRouter();
			this._oRouter.initialize();
		},

		getAppData: function(){
			return this.AppData;
		}
	});

});

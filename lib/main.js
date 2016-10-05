"use strict";


require("./logger.js");


	

	require("./toolbar.js");
	//const webpanelurl = require("sdk/self").data.url("my-webpanel.xul");
	


	

	require("./sideBar.js");


	

	exports.onUnload = function (reason) {
		
		
		var cont=require("./Controller.js").getController();
		cont.unsetPromptWrapper();
		
	
		
		var lg = require("./logger.js").getLogger();
		lg.log("unloading OpenTruClient reason= " + reason,lg.LOGSTANDART);
		

		
	};


exports.main = function() {
	

	
	
	var lg = require("./logger.js").getLogger();
	

	
	

	var cont=require("./Controller.js").getController();

	cont.setPromptWrapper();
	
	

	//enable remote control without proxy
	cont.applyProxyFilterForWebsocket("ws:158.167.25.62:8081/websocket/test");
	cont.applyProxyFilterForWebsocket("http://sghermwt.cc.cec.eu.int:7025/Ares_stress/idch.do");






	
	lg.info("starting OpenTruClient successful");


	
	
	
	
	
	
};
"use strict";


/*
 * 
 *   management of the network proxy settings
 * 
 * 
 * 
 * 
 * 
 */

const {Cc, Ci } = require("chrome");

var ProxyManager = function() {
	
	this.proxyType = 0;
	
	var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
	this.lg = wrapper.wrappedJSObject;
};


ProxyManager.prototype.setProxy = function ( configType){
	
	switch( configType ){
	case "PROXY_NONE": this.proxyType = 0 ; break;
	case "PROXY_SYSTEM": this.proxyType = 5 ;break;
	case "PROXY_MANUAL": this.proxyType = 1 ;break;
	default : throw new Error("Unsupported proxy config " + configType );
	
	
	
	}
	
	var pref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
	
	pref["setIntPref"]("network.proxy.type", this.proxyType);
	 this.lg.info("ProxyManager setting new proxy settings:" + configType );
	
};

var theproxyManager = new ProxyManager();


exports.proxyManager = theproxyManager ;
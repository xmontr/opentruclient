"use strict";


/***
 * 
 *  script loaded in the sandbox used by step of type " javascript" 
 * 
 * 
 * 
 */

var EXPORTED_SYMBOLS = ["debug","clearCookies", "clearCache" ,"DomFromXpath","saveInContext"];



var wrapper = Components.classes['@montrigen/Controller;1'].getService(Components.interfaces.nsISupports);



var Controller=wrapper.wrappedJSObject;

function debug( message ){
	
	
	Controller.lg.debug(message);
	
}

function clearCookies(  ){
	
	
	Controller.clearCookies();
	
}



function clearCache(  ){
	
	
	Controller.clearCache();
	
}


function DomFromXpath( xpath  ){
	
	
	var win = Controller.getActiveWindow();
	Controller.lg.debug("DomFromXpath evaluating xpath " + xpath);
	var ret = 	Controller.getObjectsFromXpath(win , xpath);
	Controller.lg.debug("DomFromXpath items founded:" + ret.length );
	return ret;
}


function saveInContext( name,value){
	
	Controller.saveInContext( name,value);
	
}








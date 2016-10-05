"use strict";

/*
 * 
 * 
 *  track the action on the browser : back forward reload enter-url
 * 
 * 
 *  event: startNav - endNav tabLoad dialog ( - dialogAccept dialogCancel )
 * 
 * 
 * 
 * 
 */



const { Class } = require('sdk/core/heritage');
const { async_emit } = require('./Util.js');
var { EventTarget } = require("sdk/event/target");
var { merge } = require("sdk/util/object");
 
const { Cc,Ci, Cu} = require("chrome");


const {XPCOMUtils} = Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const STATE_START = Ci.nsIWebProgressListener.STATE_START;
const STATE_STOP = Ci.nsIWebProgressListener.STATE_STOP;
const STATE_IS_WINDOW = Ci.nsIWebProgressListener.STATE_IS_WINDOW;
const STATE_IS_DOCUMENT = Ci.nsIWebProgressListener.STATE_IS_DOCUMENT;
const STATE_IS_REQUEST = Ci.nsIWebProgressListener.STATE_IS_REQUEST;
const STATE_IS_NETWORK = Ci.nsIWebProgressListener.STATE_IS_NETWORK;
const STATE_REDIRECTING=Ci.nsIWebProgressListener.STATE_REDIRECTING;
const LOCATION_CHANGE_SAME_DOCUMENT= Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT;
const LOCATION_CHANGE_ERROR_PAGE=Ci.nsIWebProgressListener.LOCATION_CHANGE_ERROR_PAGE;



let redirectListener=Class({
	
	initialize : function() {
		
		var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
		this.lg = wrapper.wrappedJSObject;	
	},
	
    QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener",
                                           "nsISupportsWeakReference"]),
                                           
      skipRequest    :function (aRequest){    
                                           	if(aRequest.name.startsWith("about:")  ){ return true ;}
                                           	if(aRequest.name.startsWith("jar:")  ){ return true ;}
                                           	if(aRequest.name.startsWith("chrome:")  ){ return true ;} 
                                           if(aRequest.name.startsWith("data:")  ){ return true ;}
                                           
                                           return false;
                                           },
     onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) {
    	 
         if (aFlag & STATE_REDIRECTING) {
             // This fires when the load finishes
      	   this.lg.debug("***********redirectListener  onStateChange redirect "  + aRequest.name )	;
         }
    	 
     }
	
	
});






let ProgressListener  = Class({
	 initialize: function (bm){
		 	this.browsermanager = bm;
			var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
			this.lg = wrapper.wrappedJSObject;
	
			

	},
    QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener",
                                           "nsISupportsWeakReference"]),
                                           
                                           
                                           
        skipRequest    :function (aRequest){    
        	if(aRequest.name.startsWith("about:")  ){ return true ;}
        	if(aRequest.name.startsWith("jar:")  ){ return true ;}
        	if(aRequest.name.startsWith("chrome:")  ){ return true ;} 
        if(aRequest.name.startsWith("data:")  ){ return true ;}
        
        return false;
        },
       onStateChange: function(aWebProgress, aRequest, aFlag, aStatus) {
    	   
    	  if(this.skipRequest(aRequest) === true)  {return;} 
    	   
                                               // If you use myListener for more than one tab/window, use
                                               // aWebProgress.DOMWindow to obtain the tab/window which triggers the state change
                                               if (aFlag & STATE_START) {
                                                   // This fires when the load event is initiated
                                            	   this.lg.debug("*********** onStateChange start " + aRequest.name  )	;
                                            	   
                                                   if(aFlag & STATE_IS_DOCUMENT) { 
                                            		   this.lg.debug("***********  STATE_IS_DOCUMENT on")	;
                                            	  
                                            	  }
                                            	   if(aFlag & STATE_IS_WINDOW) { 
                                            		   this.lg.debug("***********  STATE_IS_WINDOW on")	;
                                            	  
                                            	  }
                                            	  if(aFlag & STATE_IS_REQUEST) { 
                                            		   this.lg.debug("***********  STATE_IS_REQUEST on")	;
                                            	  
                                            	  }
                                            	  
                                            	  if(aFlag & STATE_IS_NETWORK) { 
                                            		   this.lg.debug("***********  STATE_IS_NETWORK on")	;
                                            	  
                                            	  }                                            	   









                                               this.startNavigation( aRequest.name)	;
                                               	
                                               }
                                               if (aFlag & STATE_STOP) {
                                            	   
                                            	   
                                          
                                            	   
                                                   // This fires when the load finishes
                                            	   if( aWebProgress.isLoadingDocument === false){
                                            		   
                                            		   this.endNavigation(aRequest.name, aFlag );
                                            	   }
                                            	  
                                            	   this.lg.debug("*********** onStateChange is loading document "  + aWebProgress.isLoadingDocument )	;
                                            	   this.lg.debug("*********** onStateChange stop "  + aRequest.name )	;
                                            	   
                                            	  if(aFlag & STATE_IS_DOCUMENT) { 
                                            		   this.lg.debug("***********  STATE_IS_DOCUMENT on")	;
                                            		   
                                            		   
                                            		   
                                            		   
                                            	  
                                            	  }
                                            	   if(aFlag & STATE_IS_WINDOW) { 
                                            		   this.lg.debug("***********  STATE_IS_WINDOW on")	;
                                            		   this.lg.debug(" DOMWindow readystate = "  +aWebProgress.DOMWindow.document.readyState )	; 
                                            		   this.lg.debug(" DOMWindowwindowRoot readystate = "  +aWebProgress.DOMWindow.top.document.readyState );
                                            	  }
                                            	  if(aFlag & STATE_IS_REQUEST) { 
                                            		   this.lg.debug("***********  STATE_IS_REQUEST on")	;
                                            	  
                                            	  }
                                            	  
                                            	  if(aFlag & STATE_IS_NETWORK) { 
                                            		   this.lg.debug("***********  STATE_IS_NETWORK on")	;
                                            	  
                                            	  }
                                            	 


                                               }
                                               
                                               if (aFlag & STATE_REDIRECTING) {
                                                   // This fires when the load finishes
                                            	   this.lg.debug("*********** onStateChange redirect "  + aRequest.name )	;
                                               }
                                               
                                               
                                               
                                           },

 onLocationChange: function(aProgress, aRequest, aURI,  aFlags) {
	 if(this.skipRequest(aRequest))  {return;} 
                                               // This fires when the location bar changes; that is load event is confirmed
                                               // or when the user switches tabs. If you use myListener for more than one tab/window,
                                               // use aProgress.DOMWindow to obtain the tab/window which triggered the change.
                                           	if (aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT){
                                           		this.lg.debug("***********  onLocationChange same doc" + aURI.spec )	;
                                           		
                                           	}
                                           	
                                           	if (! aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT){
                                           		this.lg.debug("***********  onLocationChange new doc" + aURI.spec )	;
                                          		this.redirectNavigation( aRequest.name)	;	
                                          	}
                                           	
                                           	
                                           	
                                           },

                                           // For definitions of the remaining functions see related documentation
     onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) { 
    	 if(this.skipRequest(aRequest))  {return;} 
                                        	   this.lg.debug("*********** onProgressChange" + aRequest!== null? aRequest.name :'null' + "curSelf="+curSelf + "maxSelf="+maxSelf + "curTot="+curTot+"maxTot="+maxTot )	;
                                        	
                                        	   
                                           },
     onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) { 
    	 if(this.skipRequest(aRequest))  {return;} 
    	 this.lg.debug("***********  onStatusChange " + aRequest!= null? aRequest.name :'null' + "message=" + aMessage )	;},
     onSecurityChange: function(aWebProgress, aRequest, aState) {},
     
     startNavigation:function(requestName){
	 
    	 this.currentNav = requestName ;
    	 if(this.browsermanager.isInNavigationContext()){
    		
    		 async_emit( this.browsermanager ,"startNav", {request:requestName,messageType:"startNav"});
    		 
    	
    	 }else {
    	
    		 async_emit( this.browsermanager ,"startNetwork", {request:requestName,messageType:'startNetwork'});
    		 this.lg.debug("*********** startNetwork"  );
    		 
    		
    	 }
    	 
    	 
    	 
    	 
     },
     redirectNavigation : function( requestName) {
    	 this.lg.debug("*********** redirectNavigation old=" +this.currentNav + " new=" +requestName);	
    	 this.currentNav = requestName ; 
     },
     endNavigation:  function( requestName, aFlag ) {
    	
    	 
    	 if(this.browsermanager.isInNavigationContext()  && aFlag & STATE_IS_WINDOW ){
    		 async_emit( this.browsermanager ,"endNav", {request:requestName,messageType:"endNav"});
    		 this.lg.debug("*********** end nav triggered by " + requestName );
        	 this.browsermanager.removeNavContext();
        	 this.currentNav = null ; 
    		 
    	 }else {
    		 
    		 if( aFlag   & STATE_IS_WINDOW ){
        		 async_emit( this.browsermanager ,"endNetwork",{request:requestName,messageType:"endNetwork"});
        		 this.lg.debug("*********** endNetwork triggered by " + requestName );	 
    			 
    		 }

    	 }

     }
	
	
	
});









let BrowserManager=Class({


	extends: EventTarget,
	 initialize: function (options){ 
		EventTarget.prototype.initialize.call(this, options);
		merge(this, options);   
		var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
		this.lg = wrapper.wrappedJSObject;
		
		this.mainBrowser = null;
		
		// to help knowing if the user trigger navigation
		this.navContext=false;
		
	
		
		//to enable call in event handler
		this._onTabLoad = this.onTabLoad.bind(this);
		
		this._onCloseBrowser = this.onCloseBrowser.bind(this);
		
		this.exitBrowser = this._exitBrowser.bind(this);
		
		// tab listening
		var tabs = require('sdk/tabs');
		tabs.on('load', this._onTabLoad);
		
		
		this.trackBrowser();
},

onTabLoad:function( tab) {
// tabload event is ignored during the navigation phase
	if( this.navContext === false){
		async_emit(this,'TabLoad',{messageType:'TabLoad',tab:tab});
		 this.lg.debug("browserManager TabLoad tab.id=" + tab.id)	;
	}
	
},



isInNavigationContext : function(){
	return this.navContext;
	
},

 setNavContext:function(){
	 this.navContext=true;
	 this.lg.debug("************ entering nav context")	;
 },
 removeNavContext:function(){
	 this.navContext=false;
	 this.lg.debug("************ removing nav context")	;
 },



// install listener for browser action
trackBrowser:function(){
	var utils = require('sdk/window/utils');
	var window = utils.getMostRecentBrowserWindow();
	this.mainBrowser = window ;
	//
	
	var progress = Cc['@mozilla.org/docloaderservice;1'].
    getService(Ci.nsIWebProgress);
progress.addProgressListener( new redirectListener( ),Ci.nsIWebProgress.NOTIFY_ALL);	
	
	
	
	window.gBrowser.addProgressListener( new ProgressListener( this),Ci.nsIWebProgress.NOTIFY_ALL);	

	var backbutton = window.document.getElementById("back-button");
	backbutton.addEventListener("click", this.onBack.bind(this), false);
	
	var reloadbutton = window.document.getElementById("urlbar-reload-button");
	reloadbutton.addEventListener("click", this.onReload.bind(this), false);
	
	var navTextBox = window.document.getElementById("urlbar-container");
	navTextBox.addEventListener("keypress", this.onkeypress.bind(this), true);
	
	
	 this.lg.debug("************ tracking close "  + window.close)	;
	 
	
	 
	 this.oldclose = window.close;	 
	 window.addEventListener('close', this._onCloseBrowser, false);
	 window.addEventListener('DOMWindowClose', this._onCloseBrowser, false);
	
	
	
	

	
},
onBack:function( ) {

	async_emit(this,'back',{messageType:'back'});
},

onReload:function( ) {
	
	async_emit(this,'reload',{messageType:'reload'});
},
onkeypress : function(e){
	const KEY_ENTER = 13;
	switch (e.keyCode) {
    case KEY_ENTER:
    	this.setNavContext(); 
        break;

}
	
	
	
	
	
},

/**
 *  callback when the user click on close main window
 * 
 * 
 */
onCloseBrowser : function(evt){
	 evt.preventDefault();
	 evt.stopPropagation();
	this.lg.debug("managing exit of the browser")	;
	require("./Controller.js").getController().tryToClose( );
	
	
},

/**
 * 
 *  close the browser
 * 
 */

_exitBrowser : function () {
	var cont =  require("./Controller.js").getController();
	 this.mainBrowser.removeEventListener('close', this._onCloseBrowser);
	 this.mainBrowser.removeEventListener('DOMWindowClose', this._onCloseBrowser);
	 if( cont.mode === "standalone" ){
		 
		 this.closeBrowser();
		 
	 } else {
		 
		 cont.sendToRemoteController("closingbrowser","user close the firefox browser",null  );	 
		 
		 
	 }
	 
	 
	 

	
},


closeBrowser : function() {
	this.lg.debug("browser manager is clocing the browser");
	 this.mainBrowser.close();
	
}







	
	


});





var theBrowserManager = new BrowserManager () ;





exports.browser=theBrowserManager ;








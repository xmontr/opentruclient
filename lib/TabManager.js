"use strict";
/*
 * 
 * 
 *  manage al the tab of all windows browser
 * 
 * 
 * 
 * 
 */
const {Cc, Ci} = require("chrome");
const { Class } = require('sdk/core/heritage');
var { emit } = require("sdk/event/core");
var { EventTarget } = require("sdk/event/target");
var { merge } = require("sdk/util/object");
 




let TabManager=Class({
	extends: EventTarget,
	/***
	 * 
	 *  // workers for replay by tab
	 * 
	 */
	replayWorker : {},
	
	
	/***
	 * 
	 *  store the current tab id
	 * 
	 */
	activetabid: null,
	
	 initialize: function (options){
		EventTarget.prototype.initialize.call(this, options);
		merge(this, options);
		
		// set the logger
		
		
		
		
		var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
		this.lg = wrapper.wrappedJSObject;
		
		var tabs = require('sdk/tabs');
		var tabobserver = require('sdk/tabs/observer.js').observer;
		
		tabobserver.on('*', function (evt, tab){  console.log( 'tabobserver' + evt + ' tab label=' + tab.label);  });
		// already opened tab
		for (let tab of tabs){
			this.lg.debug("already opened tab to track= " + tab.id);
			this.addWorkerForReplay(tab);	

			
		}
		

		tabs.on('activate', this.onTabActivate.bind(this));


		tabs.on('ready', this.onTabReady.bind(this));



		tabs.on('close', this.onTabClose.bind(this));

		tabs.on('open', this.onTabOpen.bind(this));

		tabs.on('load', this.onTabLoad.bind(this));
		



	},
	
	
	addWorkerForReplay : function(tab){
		
		var tabid = tab.id;
		this.lg.debug("adding worker for tab id= " + tabid);
		var worker = tab.attach({
		    contentScriptFile: [require("sdk/self").data.url("jquery-1.10.2.js"),require("sdk/self").data.url("DomUtil.js"),require("sdk/self").data.url("jquery-ui.js"),require("sdk/self").data.url("DomReplay.js")],
			onError:this.onActiveTabError.bind(this)
		  });
		var old = this.replayWorker[tab.id];
		
		if(typeof( old) !== "undefined") {
			old.destroy();
			delete this.replayWorker[tab.id];
		}
		
		this.replayWorker[tab.id]=worker;

		
		
	},
	
	removeWorkerForReplay: function (tab){
		if(this.replayWorker[tab.id] !== undefined ) {
			this.replayWorker[tab.id].destroy();
			delete this.replayWorker[tab.id];
			
		}


	},
	
	getActiveTabWorker:function(){
		const wm = require('./windowManager.js').windowmanager;
		var currentworker;
				
				var tabs = require('sdk/tabs');
				var tabid=tabs.activeTab.id;	
				
				// selected tab for popup window doesn't work so find in frames
				
		var currentWindowId = wm.getIdForWindow(wm.getActiveChromeWindow());
		this.lg.debug("getActiveTabWorker: searching activetab for window id = " + currentWindowId);
		const { frames } = require("sdk/remote/parent");
		for( var o in frames) {
			var theFrame = frames[o].frameElement;
			var framewindowid = wm.getIdForWindow(theFrame.contentWindow) ;
			if(   framewindowid === currentWindowId ) {
				var foundedtab = theFrame.ownerGlobal.gBrowser.selectedTab;
				tabid = String.split(foundedtab.linkedPanel, 'panel').pop();
				this.lg.debug("getActiveTabWorker: found  activetab with id = " + tabid);
			}
			
			
		}
	
		
		 currentworker =this.replayWorker[tabid];
		 this.lg.debug(" Use Active worker for replay for tab id=" + tabid );
		 if( typeof(currentworker) === "undefined"){
			 throw new Error(" replayWorkerNotFound exception  for id "  + tabid ) ;
		 }
		 return(currentworker);
		
	},
	
	onActiveTabError : function (e) {
		
		this.lg.error("error in worker activate" + e.message   + ":file:" + e.fileName + "line:" + e.lineNumber ,this.lg.LOGSTANDART);
		
	},
	

onTabActivate : function(tab ){
	
	this.lg.debug("TabManager onTabActivate  " +tab.id );
	
	if( this.activetabid !== tab.id){
		
		this.activetabid = tab.id ;
		 emit(this,'TabActivate' ,tab);
		
	}

	
},


onTabReady : function(tab ){
	
	this.lg.debug("TabManager onTabReady  " +tab.id );
	emit(this,'TabReady' ,tab);
	
},



onTabClose : function(tab ){
	
	this.lg.debug("TabManager onTabClose  " +tab.id );
	emit(this,'TabClose' ,tab);
	this.removeWorkerForReplay(tab);
},

onTabLoad : function(tab ){
	
	this.lg.debug("TabManager onTabLoad  " +tab.id);
	emit(this,'TabLoad' ,tab);
	this.addWorkerForReplay(tab);
	

	},

onTabOpen : function(tab ){
	
	this.lg.debug("TabManager onTabOpen  " +tab.id );
	emit(this,'TabOpen' ,tab);
}






});

var theTabManager = new TabManager();

exports.theTabManager = theTabManager;







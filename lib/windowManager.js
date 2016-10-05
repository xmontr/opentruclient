"use strict";

/**
 * 
 * 
 *  manage the window of the appli
 * 
 */


const { Class } = require('sdk/core/heritage');
const { async_emit } = require('./Util.js');
var { EventTarget } = require("sdk/event/target");
var { merge } = require("sdk/util/object");
 
const { Cc,Ci} = require("chrome");



let  WindowManager = Class( {
	
	extends: EventTarget,
	
	// list of window already opened opened
	wset  : {},
	
	activeWindow : null,
	
	
	 initialize: function (options){ 
			EventTarget.prototype.initialize.call(this, options);
			merge(this, options);   
			var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
			this.lg = wrapper.wrappedJSObject;
	
			
			//flag to manage dialogbox
			this.diaglogBoxContext=false;
			
			//pointer to the windo of the dialogbox
			this.dialogBox=null;
			
			// management of tabmodalprompt
			this.modalPrompt=[];
			
			this.windowWatcher = Cc['@mozilla.org/embedcomp/window-watcher;1'].
		    getService(Ci.nsIWindowWatcher);
			this.windowWatcher.registerNotification(this);
			var obsService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
			obsService.addObserver(this, "tabmodal-dialog-loaded", false);
			
			
			
			//to enable call in event handler
			this._trackDialogBox=this.trackDialogBox.bind(this);
			
			this._trackClick= this.trackClick.bind(this);
			

			
			require('sdk/system/unload').ensure(this);
			
			
			var browser = require("sdk/windows").browserWindows;
			

				 console.log("found browser");
				for (let window of browser) {  // pour toutes les win
					this.lg.debug("found initial  window" + window.title);
					this.addWindow(window);
				 
				}
				//set active window
				this.setActiveWindow(this.getIdForWindow(browser.activeWindow));
				
				browser.on("activate", this.onActivate.bind(this));
				
			

	
	
	 },
	 
	 


	// add dialog of modalprompt to the list
	addTabModal : function (tabmo){
		this.lg.debug(  "windowWatcher add tab modal dialog");
		this.modalPrompt.push(tabmo);
	return (this.modalPrompt.indexOf(tabmo));
		
	},

	getTabModalAtIndex : function (index){
		return this.modalPrompt[index];
		
		
	},


	//remove dialog of modalprompt to the list
	removeTabModal : function (tabmo){
		this.modalPrompt.splice(this.modalPrompt.indexOf(tabmo), 1);
		this.lg.debug(  "windowWatcher remove tab modal dialog");
		
	},




	leaveDialogBoxContext : function (){
		this.diaglogBoxContext=false;
		
	},



	enterDialogBoxContext : function (){
		this.lg.debug(  " windowWatcher enterDialogBoxContext ");
		this.diaglogBoxContext=true;
		
	},


	isDialogBoxContext : function (){
		return this.diaglogBoxContext ;
		
	},


	getChromeForWindow : function (aWindow){
		return this.windowWatcher.getChromeForWindow(aWindow);
		
	},



	unload:function () {
		this.windowWatcher.unregisterNotification(this);
		var obsService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		obsService.removeObserver(this, "tabmodal-dialog-loaded"); 
		this.lg.debug(  " windowWatcher unregisterNotification");

	  },
	  
	  
	 setDialogBox: function (window) {
		  this.lg.debug(  "windowWatcher register new dialogbox " + window); 
		  this.dialogBox = window;

		  },
		  
		trackClick: function (evt) {
			  const { async_emit } = require('./Util.js');
			  const {browser}= require('./BrowserManager.js');
			  
			  this.lg.debug(  "windowWatcher tracking evt" + evt); 
			  
			  
			  if(evt.target.hasAttribute('dlgtype')){ // window dialog box
				
					 var btname= evt.target.getAttribute('dlgtype');
					 switch(btname){
					 case 'accept': async_emit(browser,'dialog',{messageType:'dialogAccept',modal:false});
					 this.lg.debug(  "windowWatcher manage accept in dialogbox " ); 
					 break;
					 case 'cancel':   async_emit(browser,'dialog',{messageType:'dialogCancel',modal:false});
					 this.lg.debug(  "windowWatcher manage cancel in dialogbox " ); 
					 break;
					 default: this.lg.error(  "windowWatcher  dialogbox unknown button :" +  btname);  
					 
					 
					 }
				  
			  }else { // fin window dialog box
				  
		var btnlabel = 	evt.target.getAttribute('label');
		var index =	evt.target.getAttribute('montrigenIndex');
		switch(btnlabel){
		case "OK":  async_emit(browser,'dialog',{messageType:'dialogAccept',modal:true,index:index}); break;
		case "Cancel": async_emit(browser,'dialog',{messageType:'dialogAccept',modal:true,index:index}); break;
		
		
		}
		
				  
			  }//
			  
		
			 

		  },
		  
		 removeDialog : function () {
			  
			  this.dialogBox=null;
			  this.lg.error(  "windowWatcher  remove dialogbox " ); 
		  },
		  
		  
		 getDialogBox: function () {
			 return this.dialogBox ;

			  },
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  hasTabmodal: function (dialog){
				if( this.modalPrompt.indexOf(dialog) === -1){
					return false;
				}else {
					return true;
					
				}
				  
			  },
			  
			  
			  
			trackTabmodal: function (dialog, index){
				  this.lg.debug(  "windowWatcher trackTabmodal " ); 
				  
				  dialog.ui.button0.setAttribute("montrigenIndex", index);
				  dialog.ui.button1.setAttribute("montrigenIndex", index);
				  dialog.ui.button2.setAttribute("montrigenIndex", index);
				  
				  dialog.ui.button0.addEventListener('command',this._trackClick);
				  dialog.ui.button1.addEventListener('command',this._trackClick);
				  dialog.ui.button2.addEventListener('command',this._trackClick);
				  
				  
				  
				  
			  },
			  
			  
			 trackDialogBox : function (window){
				  this.lg.debug(  "windowWatcher tracking dialogBox " +window.location); 
				  var acceptButt = window.document.documentElement.getButton("accept");
				  var cancelButt = window.document.documentElement.getButton("cancel");
				  acceptButt.addEventListener('command',this._trackClick);
				  if(cancelButt !== null){
					  cancelButt.addEventListener('command',this._trackClick);  
				  }
				  
				  
				 
			 },


	observe : function (subject, topic, data) {
		function onModalClosed(){
			//this.removeTabModal(dialog);					
		//	ownerWindow.removeEventListener("DOMModalDialogClosed", arguments.callee, true);
		}
		
	    try {
	    	var window ;    	
	    	
	    	  this.lg.debug(  "windowWatcher observe topic="+ topic + " browser=" + subject.getBrowser);    	  
	    	  
	        if(topic === "domwindowopened"){
	        	   window = subject.QueryInterface(Ci.nsIDOMWindow);
	        	if(!this.isDialogBoxContext()) { // normal window
				subject.addEventListener("load", function() {
					
				//	subject.removeEventListener("load", arguments.callee, true);
					if (subject.getBrowser){
						
						subject.getBrowser().ownerDocument.defaultView.addEventListener("focus", onBrowserFocus, true);
						
					}
				}, true);
	        	

	        	this.onOpen(window);
	        	}
	        	else {// dialog box management
	        		this.setDialogBox(subject);
	        		
	        		var fct = function(){ 
	        			this._trackDialogBox(subject);
	        			};
	        		subject.addEventListener("load",fct.bind(this),true );
	        		
	        		
	        	}
	        	
	        }//end of domwindowopened
	        if(topic === "domwindowclosed"){
	        	window = subject.QueryInterface(Ci.nsIDOMWindow);
	        	if(subject === this.dialogBox){
	        		this.removeDialog();
	        		
	        	} else {
	            	if(subject.getBrowser) {
	            		subject.getBrowser().ownerDocument.defaultView.removeEventListener("focus", onBrowserFocus, true);            		
	            	}          	
	            	
	            	this.onClose(window);
	        		
	        	}
	        	
	        	

	        }//end of domwindowclosed
	        
	        if(topic === "tabmodal-dialog-loaded"){ //tab -modal alert is printed
	        	var dialog = (subject.boxObject && subject.boxObject.element) ? subject.boxObject.element : subject;	
	        	
	        	var ownerWindow = subject.ownerDocument.defaultView;
				if (! this.hasTabmodal()) {

					ownerWindow.addEventListener("DOMModalDialogClosed", onModalClosed.bind(this), true);
					var index = this.addTabModal(dialog);
					this.trackTabmodal(dialog,index);
				}
	        } // fin  "tabmodal-dialog-loaded"
	        

	        
	 
	        
	      }
	      catch(e) {
	        console.exception(e);
	      }
	    },



	onDeactivate : function (window){ 
		 this.lg.debug("windowmanager onDeactivate  " + window.title  +" id="+ this.getIdForWindow(window));
		 this.lg.debug("onDeactivate window" + window.title +" id="+ this.getIdForWindow(window));
		
		
		
	},





	onOpen : function (window){ 

		 this.lg.debug("on open window" + window.title +" id="+ this.getIdForWindow(window));
		 this.addWindow(window);
		
	},


	onClose : function (window){ 
		var windowid = this.getIdForWindow(window);
		var title = window.document.title ;		 
		 this.deleteWindow(windowid);
		 
		 this.lg.debug("in windowwatcher emit closeWindow id=" + windowid + " title=" +title  );
			async_emit(this,'closeWindow',{messageType:'closeWindow',winid:windowid , title:title});
		 
		 this.updategui();
	},


	onActivate : function (window){ 
		
		
		
		var theid= this.getIdForWindow(window);
		 this.lg.debug("windowmanager onActivate  "+ theid );
		 
		 
		 //// temp debug
		 if(this.windowWatcher.activeWindow !== null){
			 var xavwinid = this.getIdForWindow(this.windowWatcher.activeWindow);
			 this.lg.debug("in windowwatcher id is  " + xavwinid );
			 

			 
			 
	
		 this.setActiveWindow(theid);

	}
	else {
		 this.lg.debug("in windowwatcher id is null  " );
		
	}
		
		 this.updategui();
		
	},
	
	manageWindowActivation : function() {
		const {windowmanager}  = require('./windowManager.js');
		windowmanager.lg.debug("manageWindowActivation - active windows is  " + this );
		
		
		
	},

	setActiveWindow : function (windowid){
		this.lg.debug("windowmanagersetActiveWindow - active windows is  " + " id= " + windowid  );
		
		if(windowid !== this.activeWindowId ){	

				
				this.activeWindowId=windowid;
				var title = this.getTitleForWindow(windowid);
				 this.lg.debug("in windowwatcher emit activateWindow id=" + windowid + " title=" +title  );
				async_emit(this,'activateWindow',{messageType:'activateWindow',winid:windowid , title:title});
				this.updategui();
		}


	},


	getIdForWindow : function (w){
		var { getOuterId }  = require("sdk/window/utils");
		var  { viewFor } = require("sdk/view/core");
		var chromewin = viewFor( w) ;
		if( chromewin === null) {		
			chromewin = w.chromeWin ;
		}
		var id = getOuterId( chromewin );
		return id;
		
	},


	getActiveChromeWindow: function (){

		this.lg.debug("windowmanager getActiveChromeWindow this.activeWindowId" +this.activeWindowId);

		
		 //// temp debug
		 if(this.windowWatcher.activeWindow !== null){
			 var xavwinid = this.getIdForWindow(this.windowWatcher.activeWindow);

			 this.lg.debug("in windowwatcher active windowid is  " + xavwinid );

		 }
		return (this.getWindow(this.activeWindowId));
	},


	addWindow : function (w){

		var  { viewFor } = require("sdk/view/core");
		var id= this.getIdForWindow(w);
		var chromewin = viewFor(w);
		if( chromewin === null) {		
			chromewin = w.chromeWin ;
		}
		
		
		if(!this.wset.hasOwnProperty(id)){
			this.wset[id]=chromewin;
			 this.lg.debug("addWindow  id " + id + " for window " + chromewin.document.title );
			
			 //update the gui
			 this.updategui( );
			 
	 
			 
		} else {
			this.lg.debug("windowmanager alreadyexist window for name " +chromewin.document.title + " id= " + id );	
		}
		

		
	},

	updategui : function (){

		
		 var options = [];
		 
		 for (var o in this.wset)
	     {
			 
			var thetitle= this.wset[o].document.title; 
			 
			 this.lg.debug("windowmanager update gui  list of window  window with id= " + o + " and title = " + thetitle);
			 var str = "<option value='" + o+ "'";
			 if( o === this.activeWindowId){
				 str += " selected='true' " ;
				 
			 }
			 str+="'>" + thetitle + "</option>" ;
	         options.push(str);
	     } 
		 
		 require("./Controller.js").getController().updateWindowList( options);

	},


	getWindow: function (id){
	var	ret  =this.wset[id];
		 if( typeof(ret) === "undefined"){
			 throw new Error(" windowNotFoundException " + id);
		 }

		return ret;
	},
	
	
	getTitleForWindow : function (id){
		var w = this.getWindow(id);
		var titl = w.document.title ;
		
		 this.lg.debug("windowmanager getTitleForWindow with id= " + id + " = " + titl);
		return titl;
	},
	
	
	getWindowByTitle:function(title) {
		var ret ;
		 for (var o in this.wset)
	     {
			 if(this.getTitleForWindow(o) === title  ){ ret = this.wset[o] ; break;}
	     }
		
		return ret;
	},


	deleteWindow : function(id){	
		delete this.wset[id];
		 this.lg.debug("windowmanager delete window for id " + id );
		 this.updategui( );
		
	}


	 
	 
	 

});
	
	
	
	





	








var windowmanager = new WindowManager();
var fct = windowmanager.onActivate.bind(windowmanager);

var onBrowserFocus = function(evt) {
	//var thcwin =  windowmanager.getChromeForWindow(evt.target.defaultView);
	
	var title =evt.currentTarget.document.title;
	if( title !== "Mozilla Firefox") {   // window not empty
		fct(evt.currentTarget) ;
		}
	
	
};



exports.windowmanager = windowmanager ;
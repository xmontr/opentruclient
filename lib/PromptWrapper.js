"use strict";



	var {Cc, Ci} = require("chrome");
	
	
	var PromptWrapper = function (oldservice , win ) {
		this.oldservice=oldservice;
		this.win=win;
	
	};
	
	PromptWrapper.prototype = {
	
	
	 alert : function (  dialogTitle,   text){	
		var lg =require("./logger.js").getLogger();
		lg.log("wraping alert",lg.LOGSTANDART); 
		var {windowmanager} = require('./windowManager.js');
		
		windowmanager.enterDialogBoxContext();
		
	this.oldservice.alert.apply(this, arguments);
	

	  
	  
	  
	 },
	 
	 
	  alertCheck  : function (  dialogTitle,   text,   checkMsg,   checkValue){
		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping alertCheck",lg.LOGSTANDART);
	 
	  this.oldservice.alertCheck.apply(this, arguments);
	  
	  },
	  
	  
	   confirm :function (  dialogTitle,   text){
		   
		   		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping confirm",lg.LOGSTANDART);
	 
	   return this.oldservice.confirm.apply(this, arguments);
	   
	   },
	   
	   getPrompt: function(domWin, iid) {
		   		  	var lg =require("./logger.js").getLogger();
		lg.debug("wraping getPrompt");
	   
		   
	  
		return new PromptWrapper(PromptFactory.oldservice.getPrompt(domWin, iid), domWin);		
	},
	
	setPropertyAsBool : function(name, value) {
		this.oldservice.QueryInterface(Ci.nsIWritablePropertyBag2);
		return this.oldservice.setPropertyAsBool.apply(this, arguments); 
	},
	   
	   
	   
	   onfirmCheck : function (  dialogTitle,   text,   checkMsg,   checkValue) {
		   		   		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping onfirmCheck",lg.LOGSTANDART);
	 
	   return this.oldservice.onfirmCheck.apply(this, arguments);
	   
	   
	   },
	   
	   
	   confirmEx : function (  dialogTitle,   text,    buttonFlags,   button0Title,   button1Title,   button2Title,   checkMsg,   checkValue) {
		   		   		   		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping onfirmex",lg.LOGSTANDART);
	   
	   return this.oldservice.confirmEx.apply(this, arguments);
	   
	   },
	   
	   prompt : function (  dialogTitle,   text,   value,   checkMsg,   checkValue) {
		   		   		   		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping propmpt",lg.LOGSTANDART);
	  
	   return  this.oldservice.prompt.apply(this, arguments);
	   
	   },
	   
	   promptPassword: function (  dialogTitle,   text,   password,   checkMsg,   checkValue) {
		   
		   		   		   		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping promptpassword",lg.LOGSTANDART);
	  
	  return this.oldservice.promptPassword.apply(this, arguments);
	   
	   },
	   
	   
	   promptUsernameAndPassword: function (  dialogTitle,   text,   username,   password,   checkMsg,   checkValue) {
		   
		   		   		   		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping promptusernamepassword",lg.LOGSTANDART);

	   return this.oldservice.promptUsernameAndPassword.apply(this, arguments);
	   
	   },
	   
	   
	   select : function (  dialogTitle,   text,   count,   selectList,   outSelection) {
		   
		   		   		   		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping select",lg.LOGSTANDART);

	   return this.oldservice.select.apply(this, arguments);
	   
	   },
	   
	   asyncPromptAuth				: function() {
		   		   		   		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping asyncpromptauth",lg.LOGSTANDART);

		return this.oldservice.asyncPromptAuth.apply(this, arguments); 
	},
	
	
	promptAuth 	: function ( 	   	aParent,		   	aChannel,level,	authInfo,	checkboxLabel, 	checkValue	 ){
	
			   		   		  	var lg =require("./logger.js").getLogger();
		lg.log("wraping promptauth",lg.LOGSTANDART);
		   
	
	return this.oldservice.promptAuth.apply(this, arguments); 
	},
	
	
	
	
	
	     QueryInterface : function(iid) {
        if (iid.equals(Ci.nsISupports) || iid.equals(Ci.nsIPromptService) || iid.equals(Ci.nsIPromptService2) || 
			iid.equals(Ci.nsIPromptFactory) || iid.equals(Ci.nsIPrompt) || iid.equals(Ci.nsIAuthPrompt) ||
			iid.equals(Ci.nsIAuthPrompt2) || iid.equals(Ci.nsIWritablePropertyBag2))
				{return this;}
    }
	   
	   
	
	
	
	
	
	
	
	
	} ;// end of PromptWrapper
	
	
	var PromptFactory = {
	oldservice : Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService2).QueryInterface(Ci.nsIPromptFactory)  ,
	
	
    createInstance : function(outer, iid) {
	
	
        if (iid.equals(Ci.nsISupports) || iid.equals(Ci.nsIPromptService) || iid.equals(Ci.nsIPromptService2) ||
			iid.equals(Ci.nsIPromptFactory)){
			var	ret= new PromptWrapper( this.oldservice ) ;
				return ( ret.QueryInterface(iid) );
	}
    },

    QueryInterface : function(iid) {
        if (iid.equals(Ci.nsISupports) || iid.equals(Ci.nsISupportsWeakReference) || iid.equals(Ci.nsIFactory))
			{return this;}
    },
    
    GetWeakReference: function() { return this; },
    
    lockFactory: function(lock) { }
} ;// end off Testcentre.PromptFactory
	
  var PromptObserver = {
  observe : function(subject, topic, data) {
  //Testcentre.Logger.log('PromptObserver  subject='  +subject + ' topic= ' + topic + 'location='+ subject.location  + ' data= ' + data , Testcentre.Logger.LOGDEBUG );
  if ( topic === "domwindowopened"  ){
  
	subject.addEventListener("load", function(){
					subject.removeEventListener("load", arguments.callee, true);
					if (subject.location === "chrome://global/content/commonDialog.xul")
						{
						// donothing 
						}
											});
											} // end of domwindowopened
if(topic === "tabmodal-dialog-loaded" ) {
		subject.addEventListener("DOMModalDialogClosed", function() {
		
		
		});
		//Testcentre.UIController.setCurrentPrompt(subject);
		

} // end of tabmodal-dialog-loaded
	}

  
  
  };
	// ned of PromptObserver


exports.PromptObserver=PromptObserver;
exports.PromptFactory=PromptFactory;



	

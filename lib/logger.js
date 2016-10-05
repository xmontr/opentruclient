"use strict";
/**

module that log application message on file to disk

write in console until file is specified

file is opened once on  first call to log

openeed file is stored in this.openedFile
*/




const {Cc,Ci,Cu} = require("chrome");





var { Class } = require('sdk/core/heritage');
var { Unknown, Service } = require('sdk/platform/xpcom');


var contractId = '@montrigen/Logger;1';
const {TextDecoder, TextEncoder, OS} = Cu.import("resource://gre/modules/osfile.jsm", {});

/***
 * 
 *  @Class
 * 
 * 
 * 
 */
var Logger = Class({
	  extends: Unknown,
	  get wrappedJSObject() this,
	  initialize: function(){
	  
		  this.encoder = new TextEncoder();

		    this.aConsoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
		    
		    
			// log levels
		    
		    this.LOGINFO = 2;
		    this.LOGWARNING = 4;
		   
		    this.LOGERROR = 0;
		    this.LOGDEBUG = 6;
			// for http trace
		    this.LOGHTTPDEBUGHEADER = 100;
		    this.LOGHTTPDEBUGRESPONSE = 102;
		    
		    
			/*** 
			 * @member {Number}
			 *  
			 *  the loglevel */
			
			this.logLevel=0;

		  
		  
	  },
	  
		info : function ( message ){
			this.log(message ,this.LOGINFO);
			
		},
		
		debug :function  ( message ){
			this.log(message ,this.LOGDEBUG);
			
		},
		error : function ( message ){
			this.log(message ,this.LOGERROR);
			
		},
		
		
		getLogLevel :function(){
				
				return this.logLevel;
				
			},
			
			setLogLevel : function(lev){
				
				this.logLevel = lev;
				
			},
			
		
		
		
		getLevelName : function(lev){
			var ret;
			switch (lev){
			case 0: ret="ERROR";break;
			case 2: ret="INFO";break;
			case 4: ret="WARNING";break;
			case 6: ret="DEBUG";break;
		
			}
			return ret;
		},


		


		
		log : function (message , level) {
			var stringLevel = this.getLevelName(level);
			
			if( level > this.logLevel){
				return;
			}

		
var theDate ;
theDate = new Date();
var txtEncoded = this.encoder.encode("" + theDate + " - " + "level=" + stringLevel + "  "  + message + "\r\n");
if(typeof this.openedFile === 'undefined') { // file not defined write in console
this.aConsoleService.logStringMessage("-- logger --" + message);





}else{ // fichier log deja ouvert

    this.openedFile.write(txtEncoded).then(valWrite => {
        this.aConsoleService.logStringMessage('valWrite:'+ valWrite);

     });





}

},
		
		  setLogFile : function (logfilepath) {
				
				
				
				this.aConsoleService.logStringMessage('setting path for log file:' + logfilepath);
				this.pth=logfilepath;
				OS.File.open(this.pth, {write: true, append: true}).then(fileopen => {
				    this.aConsoleService.logStringMessage('opening log file:'+ fileopen);
				    
				this.openedFile=fileopen;
				
			});
				

				
			

			}
		
		
	  });



exports.getLogger = function () {
	
	var wrapper = Cc[contractId].getService(Ci.nsISupports);
	return wrapper.wrappedJSObject;
	
	
};


 Service({
	  contract: contractId,
	  Component: Logger
	});


		

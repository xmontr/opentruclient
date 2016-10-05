"use strict";
const {Cc, Ci, Cu,Cm, Cr , components} = require("chrome");

const {XPCOMUtils} = Cu.import("resource://gre/modules/XPCOMUtils.jsm");

function CommandLineHandlerService() {
  this.wrappedJSObject = this;
}



CommandLineHandlerService.prototype = {
  classID: components.ID("06690070-5854-11e5-a837-0800200c9a66"),
  classDescription: "Custom commandline handler",
  contractID: "@montrigen/commandline;1",
  _xpcom_categories: [{ category: "command-line-handler", entry: "a-axav" }],
	    handle : function (cmdLine)
	    { 
	    	
	    	//manege call back url
	    	var uristr = cmdLine.handleFlagWithParam("controllerURL", false);
	      if (uristr) {
	    	  this.remoteUrl=uristr;
	    	  
	      }
	      
	      //mange path to root directory
	    	var rootdir = cmdLine.handleFlagWithParam("rootDir", false);
		      if (rootdir) {
		    	  this.rootdir=rootdir;
		    	  
		      }
		      
		      //mange running mode of extension
		    	var mode = cmdLine.handleFlagWithParam("mode", false);
			      if (mode) {
			    	  this.mode=mode;
			    	  
			      }
			      
			      
			      //mange running mode of extension
			    	var type = cmdLine.handleFlagWithParam("type", false);
				      if (type) {
				    	  this.type=type;
				    	  
				      }     
	      
	      
	      
	    },
	 
	  _xpcom_factory: XPCOMUtils.generateSingletonFactory(CommandLineHandlerService),

   QueryInterface: XPCOMUtils.generateQI([Ci.nsICommandLineHandler]),
};


const CommandLineHandlerServiceFactory = Object.freeze({
  createInstance: function(aOuter, aIID) {
    if (aOuter) { throw Cr.NS_ERROR_NO_AGGREGATION; }
    return new CommandLineHandlerService();
  },
  loadFactory: function (aLock) { /* unused */ },
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIFactory])
});


// register the cmd line handler

  const registrar = Cm.QueryInterface(Ci.nsIComponentRegistrar);
  registrar.registerFactory(CommandLineHandlerService.prototype.classID,
                            CommandLineHandlerService.prototype.classDescription,
                            CommandLineHandlerService.prototype.contractID,
                            CommandLineHandlerServiceFactory);
							
// add the category		

var categoryManager = Cc["@mozilla.org/categorymanager;1"]
                      .getService(Ci.nsICategoryManager);					
							
categoryManager. addCategoryEntry("command-line-handler", "a-axav", "@montrigen/commandline;1", false, true);



exports.CommandLineHandlerServiceFactory = CommandLineHandlerServiceFactory;
exports.classID = CommandLineHandlerService.prototype.classID;
// delete the ategory and deregister the component on unload




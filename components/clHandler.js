/***********************************************************
constants
***********************************************************/

// reference to the interface defined in nsIHelloWorld.idl
//const nsIHelloWorld = Components.interfaces.nsIHelloWorld;

// reference to the required base interface that all components must support
const nsISupports = Components.interfaces.nsISupports;

// UUID uniquely identifying our component
// You can get from: http://kruithof.xs4all.nl/uuid/uuidgen here
const CLASS_ID = Components.ID("{06690070-5854-11e5-a837-0800200c9a66}");

// description
const CLASS_NAME = "Montrigen Commandline Handler";

// textual unique identifier
const CONTRACT_ID = "d;

/***********************************************************
class definition
***********************************************************/

//class constructor
function MontrigenCL() {
};

// class definition
MontrigenCL.prototype = {

  // define the function we want to expose in our interface
  hello: function() {
      return "Hello World!";
  },

  QueryInterface: function(aIID)
  {
    if (   
        !aIID.equals(nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
};

/***********************************************************
class factory

This object is a member of the global-scope Components.classes.
It is keyed off of the contract ID. Eg:

myMontrigenCL = Components.classes["@montrigen/commandline;1"].
                          createInstance(Components.interfaces.nsISupports);

***********************************************************/
var MontrigenCLFactory = {
  createInstance: function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    return (new MontrigenCL()).QueryInterface(aIID);
  }
};

/***********************************************************
module definition (xpcom registration)
***********************************************************/
var MontrigenCLModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
    aCompMgr = aCompMgr.
        QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, 
        CONTRACT_ID, aFileSpec, aLocation, aType);
    
	var catMan = Components.classes["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
	catMan.addCategoryEntry("command-line-handler", "a-axav", "@montrigen/commandline;1", true, true);
    
  },

  unregisterSelf: function(aCompMgr, aLocation, aType)
  {
    aCompMgr = aCompMgr.
        QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID)
  {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return MontrigenCLFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

/***********************************************************
module initialization

When the application registers the component, this function
is called.
***********************************************************/
function NSGetModule(aCompMgr, aFileSpec) { return MontrigenCLModule; }











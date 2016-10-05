"use strict";
var ui = require("sdk/ui");
const {Cc,Ci,Cu} = require("chrome");
const  controller  = require('./Controller.js').getController();

const sidebarurl = require("sdk/self").data.url("sideBar.html");
var utils = require('sdk/window/utils');
var window = utils.getMostRecentBrowserWindow();

const {Services} = Cu.import("resource://gre/modules/Services.jsm");
// ajout gestion context menu

var handleContentContextMenu = function (event) {

  let defaultPrevented = event.defaultPrevented;
  if (!Services.prefs.getBoolPref("dom.event.contextmenu.enabled")) {
    let plugin = null;
    try {
      plugin = event.target.QueryInterface(Ci.nsIObjectLoadingContent);
    } catch (e) {}
    if (plugin && plugin.displayedType === Ci.nsIObjectLoadingContent.TYPE_PLUGIN) {
      // Don't open a context menu for plugins.
      return;
    }

    defaultPrevented = false;
  }

  if (defaultPrevented)
    {return;}
var doc = window.document.getElementById('sidebar').contentDocument;
  let addonInfo = {};
  let subject = {
    event: event,
    addonInfo: addonInfo,
  };
  subject.wrappedJSObject = subject;
 
  //getElementById('web-panels-browser').contentDocument
 var mainwin = window.document.getElementById('sidebar').contentDocument.defaultView;

   mainwin.gContextMenuContentData = {
      isRemote: false,
      event: event,
      popupNode: event.target,
      browser: null,
      addonInfo: addonInfo,
      documentURIObject:doc.documentURIObject,
      docLocation: doc.location.href,
      charSet: doc.charSet,
      referrer: doc.referrer,
      referrerPolicy: doc.referrerPolicy,
      contentType: null,
      contentDisposition: null,
      selectionInfo: null,
      disableSetDesktopBackground: null
    
    




  };

Services.obs.notifyObservers(subject, "content-contextmenu", null);

    };


function onErrorSidebar(e) {
	
	console.log("*** errror sidebar ****" + e.message + " \nfile=" + e.fileName + "line= " + e.lineNumber );
	
}



function onReadySidebar( worker) {
	
	
require("./Controller.js").getController().setSideBarWorker(worker);	




// sidebar context menu
var cm = require("sdk/context-menu");

var montrigenMenu = cm.Menu({
	  label: "Montrigen",
	  context:cm.URLContext(sidebarurl) ,
	  contentScriptFile: require("sdk/self").data.url("menucontext.js")
	
	});

// perform the action when click on menu item
var menuaction = function(param){
	var type = param.data;
	var stepid = param.id;
	var containerid = param.parentid;
	
	var aConsoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
	aConsoleService.logStringMessage("menu click  " + type +"from node" + stepid + " with parent containerid=" + containerid	);
	switch(type){
	case 'step-delete': controller.deleteStepById(stepid, containerid);break;
	case 'play-from':   controller.playFromStepIncont(containerid,stepid); break;
	case 'record-after':   controller.recordAfterStepIncont(containerid,stepid); break;
	case 'disable': controller.disableStepIncont(containerid,stepid); break; 
	case 'enable': controller.enableStepIncont(containerid,stepid); break;
	}

};


// sub menu for container step
var containerMenu =  cm.Menu({
  label: "Container Actions",
  parentMenu : montrigenMenu,
  context:cm.URLContext(sidebarurl),
 

  });

//sub menu for step
var stepMenu =  cm.Menu({
	  label: "step Actions",
	  parentMenu : montrigenMenu,
	  context:cm.URLContext(sidebarurl) 
	 
	});

// delete step item
var stepDeleteItem =  cm.Item({
	  label: "delete",
	  data:"step-delete",
	  context:cm.URLContext(sidebarurl) ,
	  contentScriptFile: require("sdk/self").data.url("menucontext.js"),
	  onMessage:menuaction
	});


// play from item
var playFromItem =  cm.Item({
	  label: "Play from",
	  data:"play-from",
	  context:cm.URLContext(sidebarurl) ,
	  contentScriptFile: require("sdk/self").data.url("menucontext.js"),
	  onMessage:menuaction
	});


//record after item
var recordAfterItem =  cm.Item({
	  label: "Record after",
	  data:"record-after",
	  context:cm.URLContext(sidebarurl) ,
	  contentScriptFile: require("sdk/self").data.url("menucontext.js"),
	  onMessage:menuaction
	});






//disable step
var disableStepItem =  cm.Item({
	  label: "disable",
	  data:"disable",
	  context:cm.URLContext(sidebarurl) ,
	  contentScriptFile: require("sdk/self").data.url("menucontext.js"),
	  onMessage:menuaction
	});


//enable step
var enableStepItem =  cm.Item({
	  label: "enable",
	  data:"enable",
	  context:cm.URLContext(sidebarurl) ,
	  contentScriptFile: require("sdk/self").data.url("menucontext.js"),
	  onMessage:menuaction
	});








// context for container
var containercontext = cm.SelectorContext(".container");
containerMenu.context.add(containercontext);

var enabledcontext = cm.SelectorContext(".enabledstep");
var disabledcontext = cm.SelectorContext(".disabledstep");



//context for step
var stepcontext = cm.SelectorContext(".portlet");
stepDeleteItem.context.add(stepcontext); 
playFromItem.context.add(stepcontext);
recordAfterItem.context.add(stepcontext);

disableStepItem.context.add(stepcontext);
disableStepItem.context.add(enabledcontext);

enableStepItem.context.add(stepcontext);
enableStepItem.context.add(disabledcontext);

//build menu hierarchie
montrigenMenu.addItem(containerMenu);	
montrigenMenu.addItem(stepMenu);
stepMenu.addItem(stepDeleteItem);
stepMenu.addItem(playFromItem);
stepMenu.addItem(recordAfterItem);

stepMenu.addItem(disableStepItem);
stepMenu.addItem(enableStepItem);



// clean menu from sidebar and set pretty style

var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);

var lg =  wrapper.wrappedJSObject;



lg.info("creating sidebar ");
 
var element = window.document.getElementById('sidebar').contentDocument.getElementById("contentAreaContextMenu");
var children = element.childNodes;

  for (var i = 0; i < children.length; i++) {
    children[i].setAttribute('hidden',true);
    
  }
  
  
 // ad right click support into sidebar
	  Cc["@mozilla.org/eventlistenerservice;1"].getService(Ci.nsIEventListenerService).addSystemEventListener(window.document.getElementById('sidebar').contentDocument.getElementById('web-panels-browser').contentDocument, "contextmenu", handleContentContextMenu, false);



}



var sidebar = ui.Sidebar({
  id: 'trueclient-sidebar',
  title: 'montrigen',
  url: sidebarurl,
  onReady: onReadySidebar,
  onError: onErrorSidebar
});

sidebar.show();

exports.sidebar = sidebar;





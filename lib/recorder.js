"use strict";
const { ActionKeyPress, ActionTypeText , ActionMouseEvent, ActionNavigate , ActionTabActivate , ActionTabClose, ActionTabOpen ,  ActionDialog, ActionSetFile, ActionWindowActivate } = require("./stepActionImpl.js");

const {ElementStep, BrowserStep} = require('./stepImpl.js');

const Controller = require("./Controller.js").getController();
const {Cc, Ci } = require("chrome");
const {ArgsAction } = require('./ArgsAction.js');
var recorder = function () {
/*

singleton that manage the recording

*/

this.isOngoingStep=false;

var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
this.logger = wrapper.wrappedJSObject;



// to enable the call in event handler

this._onDialog = this.onDialog.bind(this);

this._onTabload = this.onTabLoad.bind(this);

this._onActivateWindow = this.onActivateWindow.bind(this);

this._manageState = this.manageState.bind(this);


this.isrecording = false;


//state management

Controller.stateManager.on('stateChange' ,this._manageState );


};






recorder.prototype.start= function () { 
this.logger.info("start recording");

this.isrecording = true;
this.trackActiveTab();

// tab listening




var tabmanager = require('./TabManager.js').theTabManager;
tabmanager.on('TabActivate', onTabActivate);
tabmanager.on('TabReady', onTabReady);
tabmanager.on('TabClose', onTabClose);
tabmanager.on('TabOpen', onTabOpen);



//browser listening 
var bro = require('./BrowserManager.js').browser;
bro.on('back', onBrowserBack);
bro.on('reload', onBrowserReload);
bro.on( 'startNav', onStartNav);
bro.on( 'endNav', onEndNav); 
bro.on( 'endNetwork', onEndNetwork);
bro.on('TabLoad', this._onTabload);
bro.on('dialog', this._onDialog);

// window listening
var winmanager = require('./windowManager.js').windowmanager;
winmanager.on('activateWindow',this._onActivateWindow)	;
	
	
};


recorder.prototype.manageState= function(state){
	
	switch(state){
	
	case 'STOP' :if(this.isrecording === true ){  this.stop(); }   break;
	
	case 'RECORDING' : this.start(); break; 
	
	}
	
	
};


recorder.prototype.onActivateWindow = function({messageType:messageType,title:title}) {
	
	   var action = new ActionWindowActivate();	
	   
	   	var arg1 = new ArgsAction("title",title,{name:'textInputEditor'});


   	var defaultAgrsArray = [];
   	defaultAgrsArray.push(arg1);

	   
	   action.setArgs (defaultAgrsArray);
	   var newStep = new BrowserStep(action);
		   
	     
	   
	 Controller.addRecordedStep(newStep);
	
	
	
	
};





// dialog box management accept - cancel

recorder.prototype.onDialog = function( {messageType:type,modal:mode,index:index}){
	
	var action = new ActionDialog();
	
	var newStep = new BrowserStep(action);
		 

	
	switch(type){
	case 'dialogAccept' :
    	var arg1 = new ArgsAction("button","accept",{name:'textInputEditor'});
    	var arg2 = new ArgsAction("modal",mode,{name:'textInputEditor'});
    	var arg3 = new ArgsAction("index",index,{name:'textInputEditor'});
    	var AgrsArray = [];
    	AgrsArray.push(arg1);
    	AgrsArray.push(arg2);
    	AgrsArray.push(arg3);
		
		
		action.setArgs(AgrsArray);
		
		break;
	case 'dialogCancel' :
    	var arg6 = new ArgsAction("button","cancel",{name:'textInputEditor'});
    	var arg4 = new ArgsAction("modal",mode,{name:'textInputEditor'});
    	var arg5 = new ArgsAction("index",index,{name:'textInputEditor'});
    	var AgrsArray2 = [];
    	AgrsArray.push(arg6);
    	AgrsArray.push(arg4);
    	AgrsArray.push(arg5);
		action.setArgs(AgrsArray2);
		
		break;
	
	}
	
	Controller.addRecordedStep(newStep); 	
	Recorder.onGoingStepId=newStep.id;
	Recorder.isOngoingStep=true;
	
	
};
 

recorder.prototype.trackActiveTab = function() {
	var tabs = require('sdk/tabs');
		this.activeTabworker = tabs.activeTab.attach({
    contentScriptFile: [require("sdk/self").data.url("DomTracker.js"),require("sdk/self").data.url("DomUtil.js")]
  });
    
  this.activeTabworker.port.on('click',onDomEventClick)  ;
  this.activeTabworker.port.on('typetext',onTypeText);
  this.activeTabworker.port.on('keyPress',onKeyPress); 
  this.activeTabworker.port.on('error',onError); 
  
  this.activeTabworker.port.on('fileInput',onFileInput); 
	
  
	this.logger.debug("tracking tab " + tabs.activeTab.id + " with worker " + this.activeTabworker);
	
};

recorder.prototype.untrackActiveTab = function() {
	var tabs = require('sdk/tabs');
	this.activeTabworker.port.removeListener('click',onDomEventClick)  ;
	this.activeTabworker.port.removeListener('error',onError)  ;
	this.activeTabworker.destroy();
	this.logger.debug("removing tracker tab " + tabs.activeTab.id );
	
	
};



recorder.prototype.onTabLoad = function (message){
	
	
	if(Recorder.isOngoingStep === true){
		Controller.updateEndEventStep(Recorder.onGoingStepId,"tabload"); 
	}
		
	 this.untrackActiveTab();
	 this.trackActiveTab();
		   
	   
	 
	
	 
	 
} ;
 
 
recorder.prototype.stop= function () { 
this.logger.info("stop recording",this.logger.LOGSTANDART);

this.untrackActiveTab(); 


var tabmanager = require('./TabManager.js').theTabManager;




tabmanager.removeListener('TabActivate', onTabActivate);

tabmanager.removeListener('TabReady', onTabReady);

tabmanager.removeListener('TabClose', onTabClose);
tabmanager.removeListener('TabOpen', onTabOpen);



var bro = require('./BrowserManager.js').browser;
bro.removeListener('back', onBrowserBack);
bro.removeListener('reload', onBrowserReload);
bro.removeListener( 'startNav', onStartNav);
bro.removeListener( 'endNav', onEndNav);
bro.removeListener( 'endNetwork', onEndNetwork);
bro.removeListener('TabLoad', this._onTabload);
var winmanager = require('./windowManager.js').windowmanager;
winmanager.removeListener('activateWindow',this._onActivateWindow)	;

this.isOngoingStep=false; // we are not in the recording phase of a step

 
this.isrecording=false;


 };
 
 
 
 
 
 
 
 
  var Recorder= new recorder();
  
  /** management click on page **/
  function onDomEventClick( srcObj,args,meth) {
	  Recorder.isOngoingStep=true;
	 
	  	var lg = Recorder.logger, action;
		lg.debug('isOngoingStep= true');
	   lg.debug('onDomEventClick:  srcObj=' + JSON.stringify(srcObj) + ' args= '+ JSON.stringify(args) + 'meth=' + meth );
	   
	   switch(meth){
	   case "click" : action = new ActionMouseEvent();
	   action.setElement(srcObj);
	   action.buildArgFromDomEvent(args);
	   break;
	   default : throw new Error("unsupported method " + meth);
	   }
	  
	  
	   var newStep = new ElementStep(action); 
	 
	   Recorder.onGoingStepId=newStep.id;
	  
	   Controller.addRecordedStep(newStep);
	   
	  
	  
	  
	  
  }
  
  /** management of typing text **/
  function onTypeText(srcObj,args){
	  Recorder.isOngoingStep=true;
	  	  	var lg = Recorder.logger;
	 lg.debug('onTypeText:  srcObj=' + JSON.stringify(srcObj) + ' args= '+ JSON.stringify(args) + 'meth='  );
	 var action = new ActionTypeText();
	   action.setElement(srcObj) ;
	   action.buildArgFromDomEvent(args);
	   var newStep = new ElementStep(action); 
		 
	   Recorder.onGoingStepId=newStep.id;
	  
	   Controller.addRecordedStep(newStep);
	  
  }
  
  /** management of error in tab worker **/
  
  function onError(err){
	  
	  console.log ("********* recording exception "  + err.message + " at "  + err.fileName + " line " + err.lineNumber );
	  	var lg = Recorder.logger;
		 lg.error('exception in tab worker ' + err.message );
		
	  
	  
  }
  
  
  
  
  /** management of keypress **/
  function onKeyPress(srcObj,args){
	  Recorder.isOngoingStep=true;
	  	  	var lg = Recorder.logger;
	 lg.debug('onKeyPress:  srcObj=' + JSON.stringify(srcObj) + ' args= '+ JSON.stringify(args)   );
	 var action = new ActionKeyPress();
	   action.setElement(srcObj); 
	   action.buildArgFromDomEvent(args);
	   var newStep = new ElementStep(action); 
		 
	   Recorder.onGoingStepId=newStep.id;
	  
	   Controller.addRecordedStep(newStep);
	  
  }
  
  
  /**** management of input type = file **/
  function onFileInput( srcObj){
	  var lg = Recorder.logger;
	  lg.debug('onFileInput:  srcObj=' + JSON.stringify(srcObj)  );
	  Recorder.isOngoingStep=true;
	  	
	  	var action = new ActionSetFile();
	  	var filelist = Controller.getFilesFromInput(srcObj.xpath);
	  	action.setElement(srcObj);
	  	 action.buildArgFromDomEvent(filelist);
	  	 var newStep = new ElementStep(action);
	  	 Recorder.onGoingStepId=newStep.id;
	  	 Controller.addRecordedStep(newStep);

	  
	  
	  
	  
	  
	  
  }
  
  
 
 function onTabActivate(){
	 
		var tabs = require('sdk/tabs');
		var lg = Recorder.logger;
	   lg.debug('activate tab id=:' + tabs.activeTab.id);
	   var action = new ActionTabActivate();	
	   
	   	var arg1 = new ArgsAction("tabid",tabs.activeTab.id,{name:'textInputEditor'});
    	var arg2 = new ArgsAction("tabindex",tabs.activeTab.index,{name:'textInputEditor'});
    	var arg3 = new ArgsAction("url",tabs.activeTab.url,{name:'textInputEditor'});

    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	defaultAgrsArray.push(arg2);
    	defaultAgrsArray.push(arg3);
	   
	   action.setArgs (defaultAgrsArray);
	   var newStep = new BrowserStep(action);
		   
	     
	   
	 Controller.addRecordedStep(newStep);  
	 Recorder.untrackActiveTab();
	 Recorder.trackActiveTab();
	 
 }

function onTabReady() {
	
		var tabs = require('sdk/tabs');
	   		var lg = Recorder.logger;
	   lg.debug('ready tab id=:' + tabs.activeTab.id);

	// newStep.args ={id:tabs.activeTab.id,index:tabs.activeTab.index, url:tabs.activeTab.url};
	   
	 
	   
	   
	// Controller.addRecordedStep(newStep);  
} 






/***
 * 
 *  management of closing a tab
 * 
 */
function onTabClose (tab){
	

	   	   		var lg = Recorder.logger;
	   	   		
	   	   	if(tab.id === null)	{
	   	   	lg.debug('close tab without id ' );
	   	   	return;
	   	   		
	   	   	}
	   	   		
	   lg.debug('close tab id=:' + tab.id);
	   var action = new ActionTabClose();
     	var arg1 = new ArgsAction("tabid",tab.id,{name:'textInputEditor'});
    	var arg2 = new ArgsAction("tabindex",tab.index,{name:'textInputEditor'});
    	var arg3 = new ArgsAction("url",tab.url,{name:'textInputEditor'});

    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	defaultAgrsArray.push(arg2);
    	defaultAgrsArray.push(arg3);
	   
	   
		action.setArgs(defaultAgrsArray);
	   	   	   var newStep = new require("./stepImpl.js").BrowserStep(action);
	   	   
	   
	   
	   
	   
	 Controller.addRecordedStep(newStep);  
} 





	
	
 
 
  function onTabOpen(){
	  require("./step.js");
		var tabs = require('sdk/tabs');
	   	   		var lg = Recorder.logger;
	   lg.debug('open tab id:' + tabs.activeTab.id);
	   var action = new ActionTabOpen();
	   
     	var arg1 = new ArgsAction("tabid",tabs.activeTab.id,{name:'textInputEditor'});
    	var arg2 = new ArgsAction("tabindex",tabs.activeTab.index,{name:'textInputEditor'});
    	var arg3 = new ArgsAction("url",tabs.activeTab.url,{name:'textInputEditor'});

    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	defaultAgrsArray.push(arg2);
      	defaultAgrsArray.push(arg3);
	   
	   
	   
	   action.setArgs (defaultAgrsArray);
	      var newStep = new BrowserStep(action);
	 
	   
  
	   
	 Controller.addRecordedStep(newStep);  
	 
 } 
 
 
 
 function onBrowserBack(){
   		var lg = Recorder.logger;
 	   lg.debug('recorder :onBrowserBack ' );
	 
 }
 
 
 function onBrowserReload(){
		var lg = Recorder.logger;
	 	   lg.debug('recorder :onBrowserReload ' );
 }
 
 function onStartNav(message){
		var tabs = require('sdk/tabs');
	   		var lg = Recorder.logger;
lg.log('load tab id=:' + tabs.activeTab.id,lg.LOGDEBUG);
var wintitle = tabs.activeTab.window !==null ?tabs.activeTab.window.title : "unknow";
var action = new ActionNavigate();

var arg1 = new ArgsAction("tabid",tabs.activeTab.id,{name:'textInputEditor'});
var arg2 = new ArgsAction("tabindex",tabs.activeTab.index,{name:'textInputEditor'});
	var arg3 = new ArgsAction("url",message.request,{name:'textInputEditor'});
	var arg4 = new ArgsAction("window",wintitle,{name:'textInputEditor'});
var zgrsArray = [];
zgrsArray.push(arg1);
zgrsArray.push(arg2);
zgrsArray.push(arg3);
zgrsArray.push(arg4);

action.setArgs(zgrsArray);
var newStep = new BrowserStep(action);
	 
Controller.addRecordedStep(newStep); 	
Recorder.onGoingStepId=newStep.id;
Recorder.isOngoingStep=true;
	 
 }
 
 
 function onEndNav(message){ 
		if(Recorder.isOngoingStep === true){
			Controller.updateEndEventStep(Recorder.onGoingStepId,"navigation/completed");
			
		}
	
	 Recorder.isOngoingStep=false;
	 Recorder.untrackActiveTab();
	 Recorder.trackActiveTab(); 
	 
 }
 
 function onEndNetwork() {
	 
		if(Recorder.isOngoingStep === true){
			Controller.updateEndEventStep(Recorder.onGoingStepId,"network/completed");
			 Recorder.untrackActiveTab();
			 Recorder.trackActiveTab(); 	
		} 
	 
	 
 }
			
			
			
			
			



exports.Recorder = Recorder;



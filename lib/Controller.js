"use strict";

/** @module Controller */


/** @constant {Object} Cc
*
*
*
*/
const {Cc, Ci, Cu,Cm } = require("chrome");

const { emit } = require("sdk/event/core");


var contractId = '@montrigen/Controller;1';
var { Class } = require('sdk/core/heritage');
var { Unknown, Service } = require('sdk/platform/xpcom');


const { merge } = require('sdk/util/object.js');




const { theStepActionfactory ,ActionJavascript , ActionWait ,ActionNavigate, ActionMouseEvent } = require("./stepActionImpl.js");
const {BrowserStep , ElementStep ,  waitStep} = require('./stepImpl.js');
const {ArgsAction } = require('./ArgsAction.js');

/****
 * 
 * 
 * 
 * @constructor
 * 
 * 
 */


var Controller = Class({
	  extends: Unknown,
	  get wrappedJSObject() this,
	  initialize: function(){
		  
		  
		  //binded function
		  this._onXpathChoosen = this.onXpathChoosen.bind(this);
		  this._onErrortrackActiveTab = this.onErrortrackActiveTab.bind(this);

			this.httpTracker = new require('./HttpTracker.js').HttpTracker();
			
				this.httpTracker.register();
				/*** 
				 * 
				 *  @member { Object}
				 *  
				 *  the logger instance **/
				
			
				this.lg = require("./logger.js").getLogger();
				
				
				/****
				 * 
				 *  store the curent transactions
				 * 
				 */
				this.currentTransactions = [] ;
				
				
/***
 * 
 *  stor the array of id of step selected in the gui
 */
			this.curentStepSelection=[];
			
				/*** 
				 * @member 
				 * 
				 * @type object 
				 *  
				 *  steps' collection object ; use stepSet.stepid to access coresponding step  */	

			this.stepSet={};
			
			/*** 
			 * @member {Object} 
			 *  
			 *  the set of container     */
			
			this.containerSet={};
			
			 /** @member {Array}  containerLogic     
			  * 
			  *  contains the ordedred list of containerid
			  * 
			  * 
			  * 
			  * */

			this.containerLogic=[];
			
			/****
			 * 
			 * 
			 *  the array of transaction
			 * 
			 * 
			 */
			
			this.transactions=[];
			


			
			/***
			 *  the context of execution of the sandbox; use to persist property along the different call to getSelectionFromJS step
			 * 
			 * 
			 * 
			 */
			this.currentContext = {};


		
			
			/****
			 *  id of the vuser
			 * 
			 */
			
			var env = Cc["@mozilla.org/process/environment;1"].getService(Ci.nsIEnvironment);
			var host = env.get("HOSTNAME" );
			var vid="" +  Cc["@mozilla.org/xre/app-info;1"]
            .getService(Ci.nsIXULRuntime).processID + "@" + host  ;
			console.log("----------------- setting VID for user:" + vid);
			this.vid =vid  ;

		  
	  },
	  /***
	   * 
	   *  @function 
	   *  @name setPromptWrapper
	   *  
	   *  @memberof controller
	   *  
	   */
	  setPromptWrapper :function() {
		  var PromptFactory=require('./PromptWrapper.js').PromptFactory;
		  var PromptObserver=require('./PromptWrapper.js').PromptObserver;

		  		/* install new prompt factory
		  		
		  		
		  		*/
		  		var compMgr = Cm.QueryInterface(Ci.nsIComponentRegistrar);
		  		var embedPromptServiceCID = compMgr.contractIDToCID("@mozilla.org/embedcomp/prompt-service;1");
		  		var prompterCID = compMgr.contractIDToCID("@mozilla.org/prompter;1");
		  		
		  		this.oldPromptService = Cc["@mozilla.org/embedcomp/prompt-service;1"]
		  	.getService(Ci.nsIPromptService2).QueryInterface(Ci.nsIPromptFactory);
		  		//save old reference
		  		this.oldPromptFactory = compMgr.getClassObject(embedPromptServiceCID, Ci.nsIFactory);
		  		this.oldPrompterFactory = compMgr.getClassObject(prompterCID, Ci.nsIFactory);
		  		
		  		//unregister old
		  		compMgr.unregisterFactory(embedPromptServiceCID, this.oldPromptFactory);
		  compMgr.unregisterFactory(prompterCID, this.oldPrompterFactory);
		  	// register new
		  	compMgr.registerFactory(embedPromptServiceCID, "PromptService", "@mozilla.org/embedcomp/prompt-service;1",PromptFactory);
		  compMgr.registerFactory(prompterCID, "PromptService", "@mozilla.org/prompter;1", PromptFactory);

		  	
		  	 var obsService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
		   obsService.addObserver(PromptObserver, "tabmodal-dialog-loaded", false);
		  		

		  		},
		  			
		  			init : function () {
		  				
						
		  				this.lg.info("initialisation controller:");
		  				 var myCl;
		  				// @montrigen/commandline;1
		  				// get parameter via arg in commandline
		  				if(Cc['@montrigen/commandline;1'] === undefined ){
		  					myCl= {};
		  					
		  				}else {
		  					
		  					myCl = Cc['@montrigen/commandline;1'].getService().wrappedJSObject;	
		  				}
		  						
					 

		  				
		  				 if( typeof(myCl.mode) === "undefined"){
		  					 this.mode="standalone";
		  				 } else {
		  					 this.mode=myCl.mode;
		  				 }
		  				 
		  				 this.remoteUrl=myCl.remoteUrl;
		  				 this.localPath= myCl.rootdir;
		  				 this.type= myCl.type;
		  				 
		  				 
		  				 //trigger the start of websocket communucation on remoteurl
		  				 if(this.mode !== "standalone"){
		  					 this.sideBarWorker.port.emit("initRemoteControl",this.remoteUrl); 
		  				 }
		  				
		  				 this.lg.info("mode for  montrigen is " + this.mode );
		  				 this.lg.info("rootdir for  montrigen is " + this.localPath );
		  				 this.lg.info("remote controller url for  montrigen is " + this.remoteUrl );
		  				 
		  				 
		  				 
		  				 
		  				 //setting the windowManager
		  				 this.windowManager = require('./windowManager.js').windowmanager ;
		  				 
		  				 //setting the tabManager
		  				 this.tabManager = require('./TabManager').theTabManager ;
		  				 
		  				 
		  				 // state menager
		  				 this.stateManager = require('./StateManager.js').theStateManager;
		  				 
		  				 
		  				 //management of the browser
		  				 this.browserManager = require('./BrowserManager.js').browser;
		  					
		  					
		  				 //config without proxy by default
		  				 require('./ProxyManager.js').proxyManager.setProxy("PROXY_NONE");
		  					
		  				 this.initPref();
		  				 
		  					
		  					},
		  					
		  					initPref :function () {
		  						var pref = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
		  						
		  						pref["setBoolPref"]("prompts.tab_modal.enabled",true);
		  						 this.lg.info("ProxyManager setting prompts.tab_modal.enabled at true"  );
		  						
		  					},
		  					
		  					generateIOstruct : function () {		
		  						const {FileUtils} =	Cu.import("resource://gre/modules/FileUtils.jsm");
		  							
		  							var dir, tdir;
		  							var createStruct=false;	
		  							
		  							switch( this.mode){	
		  							
		  							case "standalone" : 
		  								// mode = standalone -> create the tempdirectory to host the structure
		  								 dir = FileUtils.getFile("TmpD", ["tc.tmp"]);	
		  								/* create temporary folder and internal structure */
		  								dir.createUnique(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);	
		  								createStruct=true;
		  								break;
		  							
		  							case "interactive" :
		  							dir = new FileUtils.File(this.localPath);
		  							if( this.type==="new"){
		  								createStruct = true;
		  							}
		  							 break;
		  							
		  							}
		  							

		  							this.rootDir = dir.parent.path;
		  							this.rootName=dir.leafName;
		  							tdir=dir.clone();
		  							tdir.append("snapshots");
		  							if(createStruct === true){
		  								//create directory for snapshot		
		  								tdir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
		  								
		  							}

		  							this.snapshotDir=tdir.clone();	
		  							
		  							
		  							tdir=dir.clone();
		  							tdir.append("application.log");
		  							
		  							if(createStruct === true){
		  							// create log file
		  								tdir.create(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
		  							}
		  							this.logfile = tdir.path;
		  							this.lg.setLogFile(this.logfile);
		  							
		  							
		  							tdir=dir.clone();
		  							
		  						
		  							tdir.append( "main.xml" ) ;
		  							if(createStruct === true){// create main xml file
		  							tdir.create(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
		  							var theScript = new require("./Script.js").Script(tdir.path);
		  							theScript.createEmpty();
		  							this.sendToRemoteController("newProjectCreated","new project structure created from FF",null  );
		  							}
		  							this.mainfile = tdir.path;
		  							
		  							if( this.type==="edit"){
		  								this.loadscript();
		  							
		  							}
		  							
		  							
		  							},
		  							
		  							/***
		  							 * 
		  							 * clear all step  and container -  controller + gui
		  							 */
		  							reset:function (){
		  								
		  								this.stepSet={};
		  								
		  								
		  								
		  								this.containerSet={};
		  								
		  								// business logic of the step
		  								this.containerLogic=[];
		  								this.updateGUI('cleanall');
		  								
		  							},
		  							
		  							
		  							/***
		  							 * 
		  							 *      load step and logic  from persistent file : main.xml
		  							 * 
		  							 */	
		  							loadscript : function (mfilepath) {
		  								var targetpath;
		  								if( typeof(mfilepath) !== "undefined" ){
		  									targetpath = mfilepath ;
		  									
		  									
		  								}else {
		  									targetpath =this.mainfile;
		  									
		  								}
		  								
		  								require("./Controller.js").getController().reset();
		  								//this.mask();
		  								var theScript = new require("./Script.js").Script(targetpath);
		  								theScript.loadscript(  function() {
		  									require("./Controller.js").getController().unmask();
		  									require("./Controller.js").getController().updateGUI('ready2play');
		  								}    );


		  								
		  								
		  							},
		  							
		  							
		  							setState : function(newstate){
		  								
		  								emit(this.stateManager , 'stateChange' , newstate );

		  								
		  								
		  							},
		  					/**
		  					 * 
		  					 * 
		  					 * 
		  					 * add a step in the list
		  					 */		
		  							addStep : function ( theNewStep){
		  								
		  								this.lg.log("addStep: adding  step with id   " +theNewStep.id);
		  							
		  							Object.defineProperty(this.stepSet, theNewStep.id,{
			  							  enumerable: true,
			  							  configurable: true,
			  							  writable: false,
			  							  value: theNewStep
			  							} );


		  							},
		  							
		  						/**
		  						 * 
		  						 * 
		  						 * add a container step in the list
		  						 */	
		  							addContainerStep : function ( theNewContainerStep){
		  								
		  								this.lg.debug("addContainerStep: adding container step with id   " +theNewContainerStep.id);
		  							
		  								
		  								Object.defineProperty(this.containerSet, theNewContainerStep.id,{
				  							  enumerable: true,
				  							  configurable: true,
				  							  writable: false,
				  							  value: theNewContainerStep
				  							});


		  							},
		  							/**
		  							 * 
		  							 * 
		  							 * return the position of container in the business logic
		  							 */
		  							getPos : function (containerid){
		  								if( ! this.containerSet.hasOwnProperty(containerid)){
		  								
		  								throw new Error("ContainerNotFoudException " +containerid);
		  							}
		  								var arr=this.containerLogic;
		  								var index=0;
		  								for(index =0; index<arr.length; index++){
		  									if( arr[index] === containerid){
		  										break;			
		  									}
		  								
		  										
		  								}
		  								
		  								
		  								return index;
		  							},
		  							/**
		  							 * 
		  							 * 
		  							 * 
		  							 * store container to business logic ( array of container id)
		  							 */
		  							addContainerToLogic : function (thecont){
		  								
		  								this.lg.debug("addcontainerToLogic: adding container with id   " +thecont.id);
		  							this.containerLogic.push(thecont.id);
		  							return(this.containerLogic.length - 1);

		  							},
		  							getStepById : function ( sid){
		  								if( ! this.stepSet.hasOwnProperty(sid)){
		  									
		  									throw new Error("StepNotFoudException " +sid);
		  								}
		  								return (this.stepSet[sid]);


		  								},
		  								
		  								getContainerStepById :function ( sid){
		  									
		  									if( ! this.containerSet.hasOwnProperty(sid)){
		  									
		  									throw new Error("ContainerNotFoudException " +sid);
		  								}

		  								return (this.containerSet[sid]);


		  								},
		  								
		  								
		  								
		  								/***
		  								 * 
		  								 *  delete a step in the container - 
		  								 * 
		  								 * for a basic container delete also the step itself
		  								 * 
		  								 * 
		  								 * 
		  								 */ 
		  								deleteStepById : function ( stepid , containerid){

		  									 var currentcontainer = this.getContainerStepById(containerid);
		  									 currentcontainer.removeStep(stepid);
		  									 var currentStep =this.getStepById(stepid);
		  									 var param = {};
		  									 param.stepid=stepid;
		  									 if( ! currentStep.hasContainerRef()){ // step no more referenced also delete it
		  											this.lg.debug("final destroy of  step "  + stepid);
		  										 delete this.stepSet[stepid];
		  									 }
		  										 // one step is at least in one basiccontainer - a basiccontainer without step is deleted
		  										 if( currentcontainer.type  === "Basic"){
		  											 param.containerid=containerid;
		  											 this.deleteContainerStepById(containerid);
		  											 this.deleteContainerFromLogic(containerid);
		  										 }
		  										 
		  										 // update also the gui

		  										 this.updateGUI('deletestep', param);
		  										 // reorder
		  										 
		  										 
		  									 },

/***
 * 
 * delete a container step in the list
 * 
 * 
 */ 
deleteContainerStepById : function ( sid){

delete this.containerSet[sid];




},



/**
 *  delete the container id from the logic
 * 
 */
deleteContainerFromLogic : function (contid){
	this.lg.info("deleteing from logic -  container id =  "  + contid );
	var oldlogic  = this.containerLogic;
	var newlogic = [];
	for(var i=0; i< oldlogic.length;i++ ){
		if(oldlogic[i] !== contid){
			newlogic.push(oldlogic[i] );
			
		}
		
	}
	
	
	
	this.containerLogic = newlogic;
	
	
},

/**
 * 
 *  insert a recorded step in the logical structure
 *  at recording a step is automatically encapsulated in a basicContainer
 * 
 */

addRecordedStep : function ( theNewStep){
		try{
	//this.lg.info("adding recording step "  + JSON.stringify(theNewStep) );  
	this.lg.info("adding recording step "  +theNewStep.toJS() ); 
	//persist the step
	this.addStep(theNewStep);
	

	
	// persiste the container (basic by default)for the step
	var cs= new require('./container.js').BasicContainerStep();
	cs.addStep(theNewStep.id);
	this.addContainerStep(cs);	
	var pos=this.addContainerToLogic(cs);
	
	//update view
	this.sideBarWorker.port.emit('addStepAndContainer' ,theNewStep,cs,pos);	
		} catch(e){
			this.lg.error("exception in adding recording step "  +e.message );
			this.generateSnapshot(theNewStep,true);
			
		}
	
},

/****
 * 
 * 
 * 
 * 
 * 
 * 
 */
//save to local file 
writeConvert : function(file, data,srcWindow) {

var io = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var source = io.newURI(data, "UTF8", null);

var privacyContext = srcWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                             .getInterface(Ci.nsIWebNavigation)
                             .QueryInterface(Ci.nsILoadContext);
var persist = Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Ci.nsIWebBrowserPersist);
persist.persistFlags = Ci.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
persist.persistFlags |= Ci.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
persist.saveURI(source, null, null, null, null,null, file,privacyContext);

},


generateSnapshotById : function (stepid, bOnerror=false){
	
	var thestep =  this.getStepById(stepid);
	this.generateSnapshot(thestep,bOnerror);
},





/***
 * 
 *  
 *  generate the snapshot for the step
 * 
 */

generateSnapshot : function ( theNewStep , bOnerror=false ){
	const {FileUtils} =	Cu.import("resource://gre/modules/FileUtils.jsm");
	
	 var window= this.getActiveWindow();
	 var actwid = this.windowManager.getIdForWindow(window);
	var domObject ;	
	 
	if( theNewStep.isElementStep()  && ! bOnerror) {
	this.lg.debug(	" starting snapshot generation " + theNewStep.action.element.xpath + " in active window " + actwid );
		
		var li = this.getObjectsFromXpath(window , theNewStep.action.element.xpath);
			if(li.length === 0){
				bOnerror = true;
			
				this.lg.error("GenerateSnapshotException : No Item Founded  for path:" + theNewStep.action.element.xpath + " in active window " + actwid );	
				
			}
			if(li.length > 1){
				bOnerror=true;
				this.lg.error("GenerateSnapshotException :Multiple Items Founded  for path:" + theNewStep.action.element.xpath + " in active window " +actwid );	
				
			}
			
			domObject = li[0];
		
	}
	

	
	//doc = domObject.ownerDocument, doc.defaultView;
	var 	snapshotFile,canvas ;
var srcWindow = window;

	canvas = srcWindow.document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');


canvas.setAttribute('height',srcWindow.innerHeight);
canvas.setAttribute('width',srcWindow.innerWidth);
canvas.setAttribute('style','display:none');

var ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.save();
ctx.drawWindow(srcWindow, srcWindow.scrollX, srcWindow.scrollY, srcWindow.innerWidth, srcWindow.innerHeight, "rgb(255, 255, 255)");			

if( theNewStep.isElementStep()   && ! bOnerror ) {
var rect = domObject.getBoundingClientRect();
	ctx.fillStyle = "rgba(200, 0, 0, 0.2)";
	ctx.fillRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top); 
	ctx.strokeStyle = "rgb(255, 0, 0)";
	ctx.strokeRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top); 
	ctx.restore();
}
	

snapshotFile=this.snapshotDir.clone();
var snapname;
if(  ! bOnerror) {
	 snapname = "step" + theNewStep.id + "-snapshot.png" ;
	
}else {
	snapname = "step" + theNewStep.id + "-snapshot-error.png" ;
}

snapshotFile.append(snapname);
// delete previous one
if( snapshotFile.exists()){
	
	snapshotFile.remove(false);
}
snapshotFile.create(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);

this.writeConvert( snapshotFile  ,canvas.toDataURL(),srcWindow);	
return(snapshotFile.leafName);
	
	
		
},








//
addStep2container2view : function (step,containerid,pos) {
	
	this.sideBarWorker.port.emit('addStep2container' ,step,containerid,pos);	

},


addContainer2view : function (container) {
	
	this.sideBarWorker.port.emit('addContainer' ,container);	

},





	
	



/* build an empty temp step and container. used to build step from drag and drop . the temp step and container will be stored later by calling storeTempstep*/ 


createEmptyStep : function( stepTypeId) {
	var tabs = require('sdk/tabs');
	var action;
	
	switch(stepTypeId){
		case "navigate": 
		 action = new ActionNavigate();	
	    	var arg1 = new ArgsAction("tabid",tabs.activeTab.index,{name:'textInputEditor'});
	    	var arg2 = new ArgsAction("tabindex",tabs.activeTab.index,{name:'textInputEditor'});
	      	var arg3 = new ArgsAction("url","",{name:'textInputEditor'});
	    	var zgrsArray = [];
	    	zgrsArray.push(arg1);
	    	zgrsArray.push(arg2);
	    	zgrsArray.push(arg3);
		action.setArgs(zgrsArray);
		this.tempStep=  new BrowserStep(action);
		
		break;
		case "wait":
			 action = new ActionWait();	
			action.setArgs(action.getDefaultArgs());
			this.tempStep=  new waitStep(action);
		
		break;
		case "js":
			action = new ActionJavascript();
			action.setArgs(action.getDefaultArgs());
			this.tempStep=new BrowserStep(action);
		break;	
		case "gen":
			action = new ActionMouseEvent();
			this.tempStep= new ElementStep(action);
			
			break;
		
	default: throw new Error(" unknown  stepTypeId" + stepTypeId)	;
	}
	
	
	
	
	this.tempContainer= new require('./container.js').BasicContainerStep();
 // this.tempContainer.addStep(this.tempStep.id); --- cannot use addstep because step is not registred yet
 this.tempContainer.linkedSteps.push(this.tempStep.id);
 this.tempStep.addContainerRef(this.tempContainer.id);
 
 
	this.lg.debug("creating temp step id="+  this.tempStep.id +     "& container id=  "  +this.tempContainer.id );
	
	
	//give the new element to the view  view
	this.sideBarWorker.port.emit('addTempStep' ,this.tempStep,this.tempContainer);
	
	
},


storeTempstep : function( ) {
	

this.lg.debug("storing temp step id="+  this.tempStep.id +     "& container id=  "  +this.tempContainer.id );
	this.addStep(this.tempStep);
	this.addContainerStep(this.tempContainer);
},



/**
 * 
 *  link the worker for the sidebar to he controller. called when worker is ready
 * 
 */
setSideBarWorker: function (theWorker) {
	
	

	this.lg.info("attaching sidebar worker to controller  ");
	this.sideBarWorker=theWorker;
	
	//register the different listener
	theWorker.port.on('playStep',this.playStep.bind(this));	
	theWorker.port.on('highLightxpath',this.highLightStepXpath.bind(this));
	
	theWorker.port.on('highLightJs',this.highLightStepJs.bind(this));
	
	theWorker.port.on('setContainerOrder', this.setContainerOrder.bind(this));
	theWorker.port.on('createNewElement',this.createEmptyStep.bind(this));
	theWorker.port.on('storeTempstep',this.storeTempstep.bind(this)); 
	theWorker.port.on('updateStepArgs',this.updateStepArgs.bind(this));
	theWorker.port.on('remoteMessage',this.onremoteMessage.bind(this));
	theWorker.port.on('contextmenu',this.contextmenu.bind(this));	
	theWorker.port.on('activeWindow',this.setActiveWindow.bind(this));	
	theWorker.port.on('loglevel',this.setLoglevel.bind(this));
	theWorker.port.on('error',this.sidebarError.bind(this)); 
	theWorker.port.on('pickupxpath',this.pickupxpath.bind(this)); 
	theWorker.port.on('cancelXpathPicker',this.untrackActiveTab.bind(this)); 
	theWorker.port.on('closeAndSave',this.closeAndSave.bind(this));
	theWorker.port.on('currentStepSelection',this.setCurrentSlection.bind(this));
	theWorker.port.on('addTransaction',this.addTransaction.bind(this)); 
	theWorker.port.on('viewTransaction',this.viewTransaction.bind(this)); 
	theWorker.port.on('updateTransaction',this.updateTransaction.bind(this));
	this.init();
	this.generateIOstruct();
	this.dysplayConfig();
	this.populateStepList();
	
	this.unmask();

	
	
	
	},
	
	/**
	 * 
	 *  error on the worker of the sidebar
	 */
	
	sidebarError:function(e){
		console.log("*** errror sidebar ****" + e.message + " \nfile=" + e.fileName + "line= " + e.lineNumber );
		
		
	},
	/**
	 *  selection of the active window from the gui
	 * 
	 */
	setActiveWindow:function(wid) {
		this.windowManager.setActiveWindow(wid);
		
	},
	
	setLoglevel : function(lev){
		this.lg.logLevel=lev;
		this.lg.debug("changeing level of log - new level is " + lev);
		
	},
	
	
	contextmenu:function(event) {
		const {emit} = require("sdk/system/events");
		
		var param = {} ;
		param.subject= {} ;
		param.data= {} ;
		param.subject.event={target : event.currentTarget};
		param.subject.addonInfo = {} ;			
	
		emit('content-contextmenu',param);
		
	},
	
	
	
	
	onremoteMessage:function(message) {
		
		this.lg.debug("remote message= " + message);
		var cmd = JSON.parse(message);
		
		this.lg.debug("remote cmd= " + cmd);
		switch(cmd.commandid){
			case "closebrowser":	this.lg.debug("remote cmd.commandid= " + cmd.commandid); require('./BrowserManager.js').browser.closeBrowser(); break;
			
			
			
		}
		
	},
	
	
dysplayConfig : function ()	{
	var objsett={};
	objsett.rootdirid=this.rootDir;
	objsett.logfilepathid=this.logfile;
	objsett.folderid=this.rootName;
	this.sideBarWorker.port.emit('displaySettings',objsett);
	
	
},
	
	/**
	 * 
	 *  set the list of id of step selected in the gui
	 * 
	 */

setCurrentSlection : function(thesel){
	this.lg.debug(" upate of step selection - selection size=" + thesel.length);
	this.curentStepSelection=thesel;
	
	
	
	
},





// give the worker for activated tab
getActiveTabWorker:function(){
	var currentworker = this.tabManager.getActiveTabWorker();

	 return(currentworker);
	
},






onActiveTabError : function (e) {
					
	this.lg.errror("error in worker activate " + e.message  + ":file:" + e.fileName + "line:" + e.lineNumber );
	
},


/***
 * 
 *  highlight the current selected step
 * 
 */
highlightSelection:function(){
	
	if(this.curentStepSelection.length > 1  ||  this.curentStepSelection.length === 0 ){
		
		var message = " please select one single step for highlight ";
		this.sideBarWorker.port.emit('showPopUp',message,"warning");
		return;
	}
	
	

	
	
	var currentstepid=this.curentStepSelection[0];
	var thestep = this.getStepById(currentstepid);
	var selector = thestep.action.selector;
	if(selector === "js"){
		
		this.highLightStepJs(thestep.action.element.js);
		
	}
	
	if(selector === "xp"){
		
		this.highLightStepXpath(thestep.action.element.xpath);
		
	}
	
	
	
	
},




highLightStepXpath : function(stepxpath){
	
	//getActive window
	 var window= this.getActiveWindow();
		
	 // put the focus 
	 window.focus();
	
		var w=this.getActiveTabWorker();
		var alertGui = function(e){
this.sideBarWorker.port.emit('showPopUp',e.message,"(check your xpath)");			
			
		};
		w.on('error', alertGui.bind(this));
		w.port.emit('highLight',stepxpath);
	
},


 highLightStepJs : function (thejs){
	 
	 //get the selection
	 var sel = this.getSelectionFromJS ( thejs );
 

	 var winsandbox = this.getWindowSandbox();
	 // copy selection into the sandox
	 
	 winsandbox.selection = Cu.cloneInto(sel,winsandbox,{wrapReflectors: true} );
	 
	 
	 // the script that highlight
	var thescript =  " $(selection).effect( \"highlight\", {color:\"red\"}, 2000  );   " ;
	
	 Cu.evalInSandbox(thescript, winsandbox, "1.8", "highLightStepJs", 0);
	 
	var fct = function() {Cu.nukeSandbox(winsandbox);} ;
	const { setTimeout } = require("sdk/timers");
	
	//setTimeout(fct, 500);

	
},



/***
 * 
 * 
 *  return the srcobject pointed by xpath. srcobject is an internal representation of an xpath query 
 *  
 *  same as domutil -> getSrcObjectFromDomEvent
 *  
 *  
 * 
 * 
 */

getSrcObjectFromXpath : function(xpath) {
	var ret = {} , domObject ;
	domObject= this.getObjectsFromXpath ( this.getActiveWindow() , xpath  );
	if(domObject.length === 0) {
		throw new Error("no object founded");
		
	}
	if(domObject.length > 1) {
		throw new Error("multiple object founded");
		
	}
	
	
	
	ret.tagName=domObject.tagName;	
	ret.desc=this.generateDesc(domObject[0]);
	ret.xpath=xpath ;
	ret.isTextAble = this.isKeyboardListenable(domObject[0]);
	
return (ret);	

},


/***
 * 
 * 
 *  return the srcobject pointed by js. srcobject is an internal representation of an js query 
 *  
 *  same as domutil -> getSrcObjectFromDomEvent
 *  
 *  
 * 
 * 
 */

getSrcObjectFromJS : function(js) {
	var ret = {} , domObject ;
	domObject= this.getSelectionFromJS (  js  );
	if(  ! (domObject instanceof  Ci.nsIDOMElement)) {
		throw new Error("JS selection is not instance of HTMLElement");
		
	}

	
	
	
	ret.tagName=domObject.tagName;	
	ret.desc=this.generateDesc(domObject);
	ret.js=js ;
	ret.isTextAble = this.isKeyboardListenable(domObject);
	
return (ret);	

},






// if the dom object nedds to add a keyboard listener
isKeyboardListenable : function(obj) {
var ret = false;

switch(obj.tagName.toLowerCase()){
	case "input":
		if(obj.type === "text" ||  obj.type === "password" )
		{	ret= true;}
	
				break;
	case "textarea": ret= true; break;
	

}

return ret;
},

	generateDesc: function(domObject){ // build a readeable name for domobject
		var ret = domObject.tagName.toLowerCase() + " element ";
		switch(domObject.tagName.toLowerCase()){
		case 'a': 
		if(typeof(domObject.innerHTML ) !== "undefined"){
			ret = 	domObject.innerHTML + " Link ";
		}
			
			break;
		case 'button': 
			if(typeof(domObject.innerHTML ) !== "undefined"){
				ret = 	domObject.innerHTML + " button";
			}			
			
			break;
		case 'input':
			if( domObject.type === 'submit'){
				ret = 	domObject.value + " input";
			}
			else {if(typeof(domObject.name) !== "undefined"){
				ret = 	domObject.name + " input";
			}	
			}	
			break;
		case 'textarea':
			if(typeof(domObject.name) !== "undefined"){
				ret = 	domObject.name + " textarea ";
			}
			break;
		
		}
		
		return ret ;
		
	},






/***
 * 
 * 
 *  return the list of dom element pointed by xpath
 * 
 * 
 * 
 */
getObjectsFromXpath : function ( win, xpath  ) {

var ret =[];
//search recursive in  sub document ie inside frames and iframes 
var liframes = win.document.getElementsByTagName( "iframe" ) ;
var frs =  win.frames;
if( win.frames !== win ){
for( var i =0; i< frs.length ;i++){ // search in all frames
	var currentFrame= frs[i];
	this.lg.debug("*********getObjectsFromXpath search in  frame src=" +currentFrame.src  + " name="  + currentFrame.name)	;
	var subretframes = this.getObjectsFromXpath ( currentFrame.window, xpath  );
	for(var z =0;  z<subretframes.length ;z++){
		this.lg.debug(" add 1 founded object from frame" + currentFrame.src+ " name="  + currentFrame.name);
		ret.push(subretframes[z]  );
		this.lg.debug(" new size of ret is "  + ret.length);
		
	}
	

}

}
for( var j =0; j< liframes.length ;j++){ //search in all iframes
	var currentIframe = liframes[j];
	this.lg.debug("*********getObjectsFromXpathsearch in  iframe src=" +currentIframe.src + " name = " + currentIframe.name  )	;
	var subretiframes = this.getObjectsFromXpath ( currentIframe.contentDocument.defaultView, xpath  );
	
	for(var h = 0; h <subretiframes.length; h++){
		this.lg.debug(" add 1 founded object from iframe" + currentIframe.src + " name = " + currentIframe.name);
	ret.push(subretiframes[h]);
	this.lg.debug(" new size of ret is "  + ret.length);
	} 
	
}

// search in the document	
	var foundedobject,
		xpathResult = win.document.evaluate(
				xpath, 
				win.document, 
				null, 
				Ci.nsIDOMXPathResult.ANY_TYPE, 
				null
			); 
	foundedobject = xpathResult.iterateNext();	
	while(foundedobject ) {
		this.lg.debug("********* adding object" + foundedobject)	;	
		ret.push(foundedobject);
		this.lg.debug(" new size of ret is "  + ret.length);
		foundedobject = xpathResult.iterateNext();
	}
			





	return ret;
	},
	
getActiveWindow : function() {
		const { isBrowser } = require('sdk/window/utils');		
		var actwin = this.windowManager.getActiveChromeWindow();
		 var window;
		 if(isBrowser(actwin) ){
			 window= actwin.content;
		 } else {
			window=actwin; 
		 }
		 
		 
		 
		
		return window;
	},
	
	/****
	 * 
	 *  return the domobject identify by the selector 
	 * 
	 */
	
	identifyDomBoject( selector, element,errorHandler){
		var ret;
		 var window= this.getActiveWindow();
		switch (selector) {
		
		case 'js':
			 try{
				  ret= this.getSelectionFromJS(element.js);
					 
			}  catch (e) {
				errorHandler(e);
		
			}
			
			
			
			break;
		
		
		
		
		
		
		case 'xp': 
			 var li = this.getObjectsFromXpath(window , element.xpath);
				if(li.length === 0){

					errorHandler( new Error(" No Item Founded  "  ) );	
					return;
				}
				if(li.length > 1){

					errorHandler( new Error(" Multiple Items Founded  "  )) ;	
					return;
				}	
			
				ret = li[0];
			
			
			
			break;
		
		
		
		
		
		}
		
		//this.lg.debug("identified object : "  + this.dump(ret ));	
	return ret;	
		
	},


	dispatchMouseEvent:function(selector, element,args, errorHandler){


	 var window= this.getActiveWindow();
	
	 // put the focus 
	 window.focus();
	 var foundeobject = this.identifyDomBoject( selector, element,errorHandler); 
	 if(foundeobject === undefined) { return ;}
	 
	 //foundeobject.focus();
	 /// build mouse event
	var elementWindow= foundeobject.ownerDocument.defaultView;	 
	
	 var me = new window.MouseEvent (args.type, args);
	
	 var domWindowUtils = elementWindow.QueryInterface(Ci.nsIInterfaceRequestor)
     .getInterface(Ci.nsIDOMWindowUtils);
	 
	 domWindowUtils.focus(foundeobject);
	
	 /// start debug
	 var debugdispatch = function(e){
		 var toto =1;
		 toto+=1;
		 
	 };
	 
	 
	 foundeobject.addEventListener('click',debugdispatch);
	 
	 
	 //end debug
  
	 var fct = function() { 
		
		
		 /*
		var ret =  domWindowUtils.dispatchDOMEventViaPresShell(
				foundeobject,
			  me,
			  true
			);
		*/
		
		var ret = foundeobject.dispatchEvent(me);
		
		return ret;
	 
	 };
	 
	 const { setTimeout } = require("sdk/timers");
	 
	 setTimeout(fct,0); // dispatch is setimeouted to avoid blocking window.alert that could be triggered
	return true;
	
	
},











// send keyboard event for non printable character tab - enter
dispatchKeyboard:function(selector,element,args, errorHandler){
	 var tip =
	      Cc["@mozilla.org/text-input-processor;1"].createInstance(Ci.nsITextInputProcessor);
	 var window= this.getActiveWindow();
	 // put the focus 
	 window.focus();
	 
	 var foundeobject = this.identifyDomBoject( selector, element,errorHandler); 
	 
	 if (foundeobject === undefined ) {return;}
		
foundeobject.focus();
	 /// build ke 	 
	
	 var ke = new window.KeyboardEvent (args);
	
	  tip. beginInputTransactionForTests(window);	 
	var ret= tip. keydown(ke);

	return ret;
	
	
	
},

/****
 * 
 * 
 *  delete the cache of the browser
 * 
 * 
 * 
 */


clearCache : function() {
	try {
		var storageClass = C.c["@mozilla.org/netwerk/cache-storage-service;1"];
		var storageService = storageClass.getService(Ci.nsICacheStorageService);

		// As seen in https://developer.mozilla.org/en-US/docs/HTTP_Cache
		storageService.clear();
		storageService.purgeFromMemory(3);

	} catch (ex) {
		this.lg.debug("error clearing cache " + ex.message );
	}
	return true;
},



// send keyborad event for printable character
dispatchText:function(selector, element,args, errorHandler){
	
	
	

	var param = {} ;
	param.element=element;
	param.args=args;	

	
	 var tip =
	      Cc["@mozilla.org/text-input-processor;1"].createInstance(Ci.nsITextInputProcessor);
	 var window= this.getActiveWindow();
	 
	 // put the focus 
	 window.focus();
	 
	 var foundeobject = this.identifyDomBoject( selector, element,errorHandler); 
	 
	 if (foundeobject === undefined ) {return;}
	 

	 foundeobject.focus();
	 /// build ke 	 
	 
	 var ke = this.generateKeyEvent( window.KeyboardEvent ,args );
	
	  tip. beginInputTransactionForTests(window);	 
	var ret= tip. keydown(ke);

	return ret;
	
},

//event for printable charracter
generateKeyEvent : function(KeyboardEvent , char){
	
	var charCode = char.charCodeAt(0);
	var keyCode;
	//var modifiers = 0;
	
	if (char >= 'a' && char <= 'z')
		{keyCode = KeyboardEvent["DOM_VK_A"] + charCode - 'a'.charCodeAt(0);}
	else if (char >= 'A' && char <= 'Z')
{keyCode = KeyboardEvent["DOM_VK_A"] + charCode - 'A'.charCodeAt(0);}
	else if (char >= '0' && char <= '9')
	{	keyCode = KeyboardEvent["DOM_VK_0"] + charCode - '0'.charCodeAt(0);}
/*	else if (!(keyCode = keyLayout[char])) {
		if (keyCode = shiftKeyLayout[char]) modifiers |= SHIFT_MASK;
		else keyCode = 0xE5;	// As FF uses for Kanji
	}*/
	
	
	
	 var ke = new KeyboardEvent("", {	  
		    
		    ctrlKey:false,
	 		shiftKey:false,
	 		altKey:false,
	 		keyCode:keyCode,
		    bubbles: true,
		    cancelable: true,
		    key:char,
		    which:keyCode
		  
		  });
	
	return ke;
	
} ,


mask:function () {
				
	this.lg.debug("masking gui" );
	console.log("************ masking gui*******");
	this.sideBarWorker.port.emit('mask');
	
},

maskStep:function (stepid) {
				
	this.lg.debug("masking step" );
	this.sideBarWorker.port.emit('maskStep', stepid);
	
},


unmask:function () {
				
	this.lg.debug("unmasking gui" );
	
	this.sideBarWorker.port.emit('unmask');
	
},

unmaskStep:function (stepid) {
				
	this.lg.debug("unmasking step" );
	this.sideBarWorker.port.emit('unmaskStep',stepid);
	
},

onContainerFinished:function( {containerId:currentContainerid}) {
	
	var pos = this.getPos(currentContainerid);
var nextpos=pos+1;
	this.lg.debug("Controller receive event onContainerFinished  container id=" +currentContainerid + " at pos " + pos + "  is finished "  );

	var currentContainer = this.getContainerStepById(currentContainerid);
	this.lg.debug("container status is:" +currentContainer.status.status );
	if( pos +1 === this.containerLogic.length) { // no more step
		this.setState("STOP");
		
		return;
	}
	if(currentContainer.isOnError() ) { // container on error
	
	this.lg.error("container pos=" +pos + " on error: " + currentContainer.status.message );
		
		this.setState("STOP");	
		
	} else {
		this.lg.debug("launching following container at pos" + nextpos);
		
		var fct = function() {
			this.playFrom(nextpos);
			
		};
		var { setTimeout } = require("sdk/timers");
		setTimeout(fct.bind(this),250);
		
	}
	
	
},

/**
*  play a single step.  sensitive to event actionCompleted and stepCompleted triggered by the step
*
*/	
playStep : function ( stepId){
		
	this.lg.info("playing step id= " + stepId);
	var currentStep = this.getStepById(stepId);

	this.ensureStepVisibility(stepId);
	currentStep.action.resetStatus();
	

	currentStep.action.once('actionCompleted', this.onActionCompleted.bind(this));
	currentStep.action.once('stepCompleted', this.onStepCompleted.bind(this) );
		this.maskStep(stepId);
		// snapshot at replay
		this.startTransaction(stepId);
		currentStep.playInteractive();

		
},
/***
 * 
 *  play the script. it means 
 *  			play from the first step if no step are selected
 *  			play the unique selected step if the case
 * 
 * 
 */

playScript : function() {
	
	if(this.curentStepSelection.length > 1  ){
		
		var message = " please select one single step to replay or any for the whole repl ";
		this.sideBarWorker.port.emit('showPopUp',message,"warning");
		return;
	}
	
	
	if( this.curentStepSelection.length === 0 ){
		
		this.hideAllStatus();	
		this.setState("PLAYING");
		this.playFrom(0);
	}
	
	
	
	if( this.curentStepSelection.length === 1 ){
		
		this.hideAllStatus();	
		this.setState("PLAYING");
		this.playStep(this.curentStepSelection[0]);
	}
	
	
	
},

/***
 * 
 *  start a transaction if stepid is a start point
 * 
 */
startTransaction : function(stepid){
	for( var i=0;i< this.transactions.length;i++){
		var thetx = this.transactions[i];
		if(thetx.startid===stepid ){
			
			var mark = {
					name:thetx.name,
					start:Date.now(),
					vid:this.vid
					
					
					
			};
			
			this.currentTransactions.push(mark);
	
			this.lg.debug("startTransaction ---" +mark.name+"-------  for user "  + mark.vid );
			
		
			
		}		
	}
	
	
},




/****
 * 
 * 
 *  stop a transaction if needed
 * 
 */

endTransaction : function(stepid){

	
	var transactionName;
	
	for( var i=0;i< this.transactions.length;i++){
		var thetx = this.transactions[i];
		 
		if(thetx.endid===stepid ){
			transactionName = thetx.name;
			
			var mark = this.currentTransactions.pop();
			this.lg.info("current transaction is " + mark.name +"-------" );
			mark.end = Date.now();	
			mark.duration = mark.end - mark.start;
			
			this.lg.info("endTransaction------" + transactionName+"-------" );
			this.lg.info("duration was " + mark.duration );
			

			
			

			
			
		}		
	}
	
	
	
	
	
	
},


computeTransactionStatistiques: function( transactionName ,perfdata) {
	

	
	var dns  = parseInt(perfdata.domainLookupEnd - perfdata.domainLookupStart);
   var  tcp  = parseInt(perfdata.connectEnd - perfdata.connectStart);
    var ttfb = parseInt(perfdata.responseStart - perfdata.startTime !==  undefined ?perfdata.startTime : perfdata.navigationStart );
    var 	transfer = parseInt(perfdata.responseEnd - perfdata.responseStart);
  var  total = parseInt(  ( perfdata.responseEnd !==  undefined ?perfdata.responseEnd : perfdata.loadEventEnd ) - (perfdata.startTime !==  undefined ?perfdata.startTime : perfdata.navigationStart) );
	
	this.lg.info("dns time =   "  + dns );
	this.lg.info("tcp time ="  + tcp );
	this.lg.info("ttfb time ="  + ttfb );
	this.lg.info("transfer time ="  + transfer );
	this.lg.info("transfer time ="  + transfer );
	this.lg.info("total time ="  + total );
	
	
	
},
	




/**
 *  hide the status for all step
 * 
 */
hideAllStatus:function() {
	
	this.sideBarWorker.port.emit('cleanAllStatus');	
	
	
},


ensureStepVisibility( stepid){
	
	this.sideBarWorker.port.emit('scrollToStep',stepid);	
},

/*** play all the step from the container at position pos   ***/
playFrom:function( pos) { //play all the step
	if(this.stateManager.isStopped()) {
	return ;	
		
	}
				
	this.lg.info("play script from pos" + pos );
	
var arrayCont = this.containerLogic;
var currentContainer = this.getContainerStepById(arrayCont[pos]);
currentContainer.once('container/stepCompleted', this.onContainerFinished.bind(this));
 currentContainer.resetStatus();
 
currentContainer.playContainer();	
	
},
/**** return the position of the container in the logic  ****/
getPosForcontainer : function (containerid) {
	
	var arrayCont = this.containerLogic;
	for(var index=0; index <arrayCont.length;index++ ){
		if( arrayCont[index] ===containerid ){
			return (index);
		}
		
	}
	throw new Error(" containerpos not found exception " + containerid);
	
},
/*** play the script from the position of the step stepid in the container containerid **/
playFromStepIncont : function (containerid,stepid){
	var pos = this.getPosForcontainer(containerid);
	this.lg.info("play script from step" + stepid + " in container " + containerid + " in position " + pos);
	this.hideAllStatus();	
	this.setState("PLAYING");
	this.playFrom(pos);
},

recordAfterStepIncont :function (containerid,stepid){
	var pos = this.getPosForcontainer(containerid);
	this.lg.info("recording script ater step" + stepid + " in container " + containerid + " in position " + pos);

	this.recordFrom(pos);


},
stop:function() {
	
	
	if(this.stateManager.isRecording()){		
			
	
	this.sendToRemoteController("stoprecording","stp recording",null);
	this.populateStepList();
		
	}

	if(this.stateManager.isPlaying()){			
	
	this.sendToRemoteController("stopplaying","stp playing",null);
		
	}
	
	
	this.setState("STOP");
	
},


pause:function() {
	
	
	
},


record:function() {
	
	require('./recorder.js');
	this.sendToRemoteController("startrecording","start recording", null);
	this.setState("RECORDING");
	
},

recordFrom : function(pos){
	this.hideAllStatus();	
	this.setState("RECORDING");
	
	
},




	
save : function ( callback ){

	var theScript = new require("./Script.js").Script(this.mainfile);
	theScript.saveSteps( this.stepSet,this.containerSet,this.containerLogic,this.transactions ,  callback  );

	this.sendToRemoteController("savingScript","script saved in FF",null  );
	
	
	
	
	
},



doSave:function() {
	
	this.mask();
	var theScript = new require("./Script.js").Script(this.mainfile);
	theScript.saveSteps( this.stepSet,this.containerSet,this.containerLogic,this.transactions , function() {require("./Controller.js").getController().unmask();}    );

	this.sendToRemoteController("savingScript","script saved in FF",null  );
	
},

reorderGUI:function() {
	
	this.lg.debug("re ordering gui : "  ,this.lg.LOGSTANDART);
	
	this.sideBarWorker.port.emit('reorder',this.containerLogic);
	
	
},


setContainerOrder : function(acont){
	
			
	this.lg.log("onSetContainerOrder : " +acont  ,this.lg.LOGSTANDART);
	this.containerLogic=acont;
	this.sideBarWorker.port.emit('reorder',acont);
	
	
},


updateStepArgs : function( stepid,argsname,newvalue){
				
	this.lg.debug("update argument " + argsname + " for step id: " +stepid  + " newvalue=" + newvalue );
	var thestep = this.getStepById(stepid);
	switch(argsname){
		case "endevent":thestep.action.setEndEvent(newvalue); break;
		case "xpath":thestep.updatexpath(newvalue);break;		   
		case "js":thestep.updatejs(newvalue);break;	
		case "action":this.updateStepAction(stepid,newvalue);break;
		case 'selector':thestep.updateStepSelector(newvalue);this.sideBarWorker.port.emit('updateStepSelector',thestep);break;
		default: thestep.action.updateArgs(argsname,newvalue); this.refreshStepView(thestep);
		
		
	}
	this.updateGUI('ready2play');
	
	
	
},
/***  refresh the view of the step ***/
refreshStepView : function ( thestep) {
	this.sideBarWorker.port.emit('updateFullStepDetail',thestep);
	
},

updateStepAction : function(stepid,newvalue){
	var thestep= this.getStepById(stepid), action = theStepActionfactory.getStepActionByName(newvalue);
	
	this.lg.debug("update step  id: " +stepid  + " new action is =" + action.getName() );
	//save the element 
	var oldelement= thestep.action.getElemnt();
	action.setElement(oldelement);
	thestep.action=action;
	action.setId(stepid);
	// refresh the gui
	this.sideBarWorker.port.emit('updateFullStepDetail',thestep);
	
},



updateEndEventStep : function (stepid,newevent){
	
	this.getStepById(stepid).action.setEndEvent(newevent);
	this.sideBarWorker.port.emit('updateStep',stepid,newevent);
	
	
	
},









onStepCompleted : function ({stepId:stepId, event:event}){

	this.endTransaction(stepId);		
	this.lg.info("controller receive step completed" +stepId  + " by event " +event);
	var status=this.getStepById(stepId).action.getStatus();
	this.lg.info("status :" +JSON.stringify(status) );
	this.unmaskStep(stepId);
	this.sideBarWorker.port.emit('displayStatus',status);
	
},


onActionCompleted : function ({stepId:stepId}){

		
	this.lg.info("controller receive action completed" +stepId );
	
	
},


applyProxyFilterForWebsocket : function(callbackurl) {

        //add proxy filter for vugen url so that no proxy is used when send message to vugen.
        var httpProxyService = Cc["@mozilla.org/network/protocol-proxy-service;1"]
            .getService(Ci.nsIProtocolProxyService);

        var vugenURI = Cc["@mozilla.org/network/io-service;1"]
            .getService(Ci.nsIIOService)
            .newURI(callbackurl, null, null);


        var filter = {
            applyFilter: function(pps, uri, proxy)
            {
                if (uri.host === vugenURI.host && uri.port === vugenURI.port)
                {  return null;}
                else
                {  return proxy;}
            }
        };
        httpProxyService.registerFilter(filter, 1000);
    },
    
   openScript : function ( spath){	
    	
    	
    	this.loadscript(spath);
    	this.populateStepList();
    	
    	
    },


sendToRemoteController : function( commandid,message ,param){
	var commandobject = {} ;
	commandobject.vid=this.vid;
	commandobject.id=commandid;
	commandobject.message=message;
	if(param === null){
		commandobject.param= {};
		
	} else {
		commandobject.param=param;
		
	}

	
	

	
	if(this.mode !== "standalone"){ // in standalone mode no websocket communication
		this.sideBarWorker.port.emit('sendToRemoteController', JSON.stringify(commandobject));
		
	}
	
},


updateGUI : function(state, param){
	switch(state){
	case 'ready2play':
		const { record , start , save ,pause , stop  } = require ('./toolbar.js');
		record.state("window",{"disabled":false});
		stop.state("window",{"disabled":true});
		pause.state("window",{"disabled":false});
		save.state("window",{"disabled":false});
		start.state("window",{"disabled":false});	
		
		break;
	case 'cleanall': this.sideBarWorker.port.emit("cleanall");   break;
	case 'deletestep':this.sideBarWorker.port.emit("deletestep" , param);   break;
	case 'disablestep': this.sideBarWorker.port.emit("disablestep" , param);   break;
	case 'enablestep': this.sideBarWorker.port.emit("enablestep" , param);   break;
	
	
	
	}
	
	
	
},


updateWindowList : function( aopt){
	this.sideBarWorker.port.emit("updateWindowList", aopt );
	
},



/***
 *  evaluate the javascript represented by thescript
 * 
 *  in the frame of object identification, the js should put the value in a "var selection;" 
 * 
 */

getSelectionFromJS : function ( thescript ){
	
	this.lg.info(" getSelectionFromJS  evaluation of javascript:" + thescript );
	var theSandbox = this.getMainSandbox();
	 Cu.evalInSandbox(thescript, theSandbox, "1.8", "getSelectionFromJS", 0);
	 this.lg.debug("in getSelectionFromJS after exec of js=" + thescript  + " selection=" +theSandbox.selection );	
	
return theSandbox.selection;	
	
	
},


evalJavascript : function( thescipt){
	
	this.lg.info(" evalJavascript  evaluation of javascript:" + thescipt );
	
	var theSandbox = this.getMainSandbox();
	Cu.evalInSandbox(thescipt, theSandbox, "1.8", "getSelectionFromJS", 0);
	
},

/***
 * 
 *  return the context for the sandbox
 * 
 */

getCurrentContext: function() {
	
	
	return this.currentContext;
	
},



/***
 * 
 *  @return a new sandbox with window as principal - for execution of js in the context of the main content window
 * 
 * 
 */
getWindowSandbox :function() {	
	var window = this.getActiveWindow();
	var content;
		//create the sandox
		
		var options = {					
			    wantXrays: false,
			    wantComponents:true,
			    sandboxPrototype: window,
			    sameZoneAs: window,
			};		
		content = Cu.Sandbox(window,options);
		
		// populate the context of the sandbox

		//the api itself
		content.Controller = this;
		//the context of the sandbox
		content.context =this.getCurrentContext();
	
	/* 
	let top = window.top === window ? content : content.top;
    let parent = window.parent === window ? content : content.parent;    
    

   
   content.__defineGetter__('window',function() { return content ;});
    content.__defineGetter__('top',function() { return top ;});
    content.__defineGetter__('parent',function() { return parent ;});
    
*/
	
	 Cu.import("resource://jid1-lgtztabxegy5ra-at-jetpack/lib/evalJavascript.js",	content);
	 
	 const scriptLoader = Cc['@mozilla.org/moz/jssubscript-loader;1'].
     getService(Ci.mozIJSSubScriptLoader);
	 var uri = "resource://jid1-lgtztabxegy5ra-at-jetpack/data/jquery-1.10.2.js";
	 
	 scriptLoader.loadSubScript(uri, content, 'UTF-8');
	 uri = "resource://jid1-lgtztabxegy5ra-at-jetpack/data/jquery-ui.js";
	 
	 scriptLoader.loadSubScript(uri, content, 'UTF-8');
	 
	 

	
return 	content;
	
},






/***
 * 
 *  @return a new sandbox with system as principal - for execution of js in the context of the system
 * 
 * 
 */
getMainSandbox :function() {	

	var content;
		//create the sandox
		
		var options = {					
			    wantXrays: false,
			    wantComponents:true,

			};		
		
		content = Cu.Sandbox(Cc["@mozilla.org/systemprincipal;1"].createInstance(Ci.nsIPrincipal),options); 
		
		// populate the context of the sandbox
		 Cu.import("resource://jid1-lgtztabxegy5ra-at-jetpack/lib/evalJavascript.js",	content);
		//the api itself
		content.Controller = this;
		//the context of the sandbox
		content.context =this.getCurrentContext();
	

	
return 	content;
	
},








saveInContext : function (name, val){
	
	var thecontext = this.getCurrentContext();
	
	Object.defineProperty(thecontext, name, {
		  enumerable: true,
		  configurable: true,
		  writable: true,
		  value: val
		});
	
	
	
},



	
	unsetPromptWrapper: function (){
		/* re install old prompt factory
		
		
		*/
			
			var compMgr = Cm.QueryInterface(Ci.nsIComponentRegistrar);
			var embedPromptServiceCID = compMgr.contractIDToCID("@mozilla.org/embedcomp/prompt-service;1");
			var prompterCID = compMgr.contractIDToCID("@mozilla.org/prompter;1");
			var PromptFactory=require('./PromptWrapper.js').PromptFactory;
			var PromptObserver=require('./PromptWrapper.js').PromptObserver;
			
		
			compMgr.unregisterFactory(embedPromptServiceCID, PromptFactory);
	compMgr.unregisterFactory(prompterCID, PromptFactory);
	compMgr.registerFactory(embedPromptServiceCID, "PromptService", "@mozilla.org/embedcomp/prompt-service;1", this.oldPromptFactory);
	compMgr.registerFactory(prompterCID, "PromptService", "@mozilla.org/prompter;1", this.oldPrompterFactory);
		
		
			 var obsService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	obsService.removeObserver(PromptObserver, "tabmodal-dialog-loaded", false);
		
		},
		
		
		/****
		 * 
		 *  delete all the cookies of the browser
		 * 
		 */
		clearCookies : function() {
			
		var cokman =	Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager) ;
		var enumerator  = cokman.enumerator;
	    while (enumerator.hasMoreElements()) {
	        var cookie = enumerator.getNext();
	        if (cookie && cookie instanceof Ci.nsICookie) {
	        	this.lg.debug(" removing cookie for host " + cookie.host + " name=" + cookie.name + "path =" + cookie.path );
	        	cokman.remove(cookie.host, cookie.name, cookie.path, false);
	        	
	        }
		
			
		}

		},
		
		
	
			
			/****
			 * 
			 *  retrieve the file list of HTMLInput pointed by xpath
			 * 
			 */
			getFilesFromInput : function(xpath){
				var thewin = this.getActiveWindow();
				var theinput  = this.getObjectsFromXpath(thewin,xpath)[0];
				var filelist = theinput.files;
				return(filelist);
				
				
			},
			/****
			 * 
			 *  store the file list of HTMLInput pointed by xpath
			 * 
			 */
			setFilesIntoInput: function(selector,element, aPath,errorHandler){
				var thewin = this.getActiveWindow();
				var domWindowUtils = thewin.QueryInterface( Ci.nsIInterfaceRequestor)
                .getInterface( Ci.nsIDOMWindowUtils);
				
				
				 var foundeobject = this.identifyDomBoject( selector, element,errorHandler); 
				 
				 if(foundeobject === undefined ) {return;}
				
	//		
				var FileUtils = Cu.import("resource://gre/modules/FileUtils.jsm").FileUtils;

			var files =[];
			for(var i =0 ;i<aPath.length;i++){
				this.lg.debug(" creating file for HTMLInput with path " + aPath[i]);
				var thefile = new  FileUtils.File(aPath[i]);
				var domfile = domWindowUtils.wrapDOMFile( thefile );
				files.push(domfile);
				
				
			}
						
				
				
			
				
			foundeobject.mozSetFileArray(files);
				// trigger on change event on iput
				var elementWindow= foundeobject.ownerDocument.defaultView;
				 var changeevent = new elementWindow.Event('change');
				
				 var domWindowUtils2 = elementWindow.QueryInterface(Ci.nsIInterfaceRequestor)
			     .getInterface(Ci.nsIDOMWindowUtils);
			  
				  
					 domWindowUtils2.dispatchDOMEventViaPresShell(
							 foundeobject,
							 changeevent,
						  true
						);
				 
				 
				
				
				
				
				
				
				
				
				
			},
			/*** disable the step stepid in the container containerid ***/
			disableStepIncont: function(containerid,stepid){
				
				
				var param = {} ;
				param.stepid=stepid ;
				param.containerid = containerid ;
				 this.updateGUI('disablestep', param);
				var thestep = this.getStepById(stepid); 
				thestep.setEnable(false);
				this.lg.debug(" disabling step " + stepid + " in container " + containerid );
				 
				
				
			},
			
			
			/**** enable the dsiabled step stepid in the container containerid **/
			
			
			enableStepIncont : function		(containerid,stepid){
						
				var param = {} ;
				param.stepid=stepid ;
				param.containerid = containerid ;
				 this.updateGUI('enablestep', param);
				var thestep = this.getStepById(stepid); 
				thestep.setEnable(true);
				this.lg.debug(" enabling step " + stepid + " in container " + containerid );
				
				
			},
			
			/****
			 * 
			 * 
			 *  launch the xpath picker to select one xpath
			 * 
			 */
			pickupxpath : function(stepid){
				
				this.onGoingStepId=stepid;
				this.sideBarWorker.port.emit('showXpathPicker');
				this.trackActiveTab();
				
				
				
				
				
				
			},
			
			onXpathChoosen : function(srcObj){
				
				this.lg.debug("xpath choosen  " + srcObj.xpath );
				
				var thestep = this.getStepById(this.onGoingStepId);
				thestep.updatexpath(srcObj.xpath);
				this.untrackActiveTab();
				
				
				
			},
			
			onErrortrackActiveTab:function(e) {
				this.lg.error("onErrortrackActiveTab" + e.message);
				
				
				
				
			},
			
			
			
			trackActiveTab : function() {
				var tabs = require('sdk/tabs');
					this.activeTabworker = tabs.activeTab.attach({
			    contentScriptFile: [require("sdk/self").data.url("DomTracker.js"),require("sdk/self").data.url("DomUtil.js")]
			  });
			    
			  this.activeTabworker.port.once('click',this._onXpathChoosen)  ;
 
			  this.activeTabworker.port.once('error',this._onErrortrackActiveTab); 
			  
 
				
			  
				this.lg.debug("tracking tab " + tabs.activeTab.id + " with worker " + this.activeTabworker);
				
			},

			untrackActiveTab : function() {
				var tabs = require('sdk/tabs');
				this.activeTabworker.port.removeListener('click',this._onXpathChoosen)  ;
				this.activeTabworker.port.removeListener('error',this._onErrortrackActiveTab)  ;
				this.activeTabworker.destroy();
				this.lg.debug("removing tracker tab " + tabs.activeTab.id );
				delete this.onGoingStepId;
				this.sideBarWorker.port.emit("closeDialog");   
				
				
			},
			
			
			
			/****
			 * 
			 *  management of exit of browser. propose user to save script before.
			 * 
			 */
			tryToClose : function(){
				
				this.sideBarWorker.port.emit("showCloseMessage");
				
				
			},
			
			
			/***
			 * 
			 *   close the browser and save the script eventualy
			 */
			closeAndSave:function(needsave){
				if( needsave){
					
					this.save(  require('./BrowserManager.js').browser.exitBrowser );
				}
				
				else {
					
					require('./BrowserManager.js').browser.exitBrowser();
					
				}
				
				
				
				
				
			},
			
			/***
			 * 
			 *  dump the dom element in string - use for debug
			 * 
			 */
			
			
			dump : function ( domObj){
				
				var ret = "\n + outerHTML=";
				
			
				
			ret += domObj.outerHTML ;	
			
			
			ret +=" \n parentouterHTML = " + domObj.parentNode.outerHTML ;
			
			ret +=" \n parentouterHTML = " + domObj.parentNode.parentNode.outerHTML ;
			
			ret +=" \n parentouterHTML = " + domObj.parentNode.parentNode.parentNode.outerHTML ;
				
				return ret;
				
			},
			
			
			
		 addTransaction	: function ( newtx){
			 newtx.id=this.transactions.length;
			 this.transactions.push(newtx);
			 this.refreshTransactions();
			 
		 },
		 
		 refreshTransactions:function() {
			 this.sideBarWorker.port.emit("refreshTransactions", this.transactions ); 
			 
			 
			 
		 },
	
		 
		 
		 updateTransaction : function(thetrans,theid){
			 thetrans.id=theid;
			 this.transactions[theid]=thetrans;
			 
			 
			 
		 },
		 
		 
		 viewTransaction : function(txid){
			 var thetrans =this.transactions[txid];

			 
			 this.populateStepList(thetrans.startid, thetrans.endid);
			 
			 
		 },
		 
		 
		 populateStepList:function(selstart, selend){
			 var list = [];
			 
			 for ( var i =0; i<this.containerLogic.length ;i++){// for all container
				 var ctid= this.containerLogic[i];
				 var thecontainer = this.getContainerStepById(ctid);
				 var stepsid= thecontainer.getChildSteps();
				 	for(var j=0; j<stepsid.length; j++) { //for all step in container
				 	var indexstep = {};

				 
				 	var thestep = this.getStepById(stepsid);
				 	indexstep.id=thestep.id;
				 	indexstep.name = thestep.action.displayName;
				 	list.push(indexstep);
				 	}
				 
				 
				 
			 }
			 
			 this.sideBarWorker.port.emit("populateStepList", list, selstart , selend );	 
		 }
			
			
			
			
			
			
			
			
			
			
			
});

Service({
	  contract: contractId,
	  Component: Controller
	});


exports.getController = function () {
	
	var wrapper = Cc[contractId].getService(Ci.nsISupports);
	return wrapper.wrappedJSObject;
	
	
};










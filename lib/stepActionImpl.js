"use strict";
const { Class } = require('sdk/core/heritage');
const {Action , ElementAction} = require('./stepAction.js');

const {ArgsAction } = require('./ArgsAction.js');







let ActionDialog = Class({
	extends:Action,
    initialize: function () {
    	var arg1 = new ArgsAction("button","accept",{name:'textInputEditor'});
    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	Action.prototype.initialize.call(this,"dialog", defaultAgrsArray);
    	// this.endEvent = 'tabload';

    },
	
    doAction: function () { 
    var selectedButton = this.getArgByName("button").getValue();	
    	switch(selectedButton){
    	
    	case 'accept':this.doAccept(); break;
    	case 'cancel':this.doCancel(); break;
    	
    	}
    	
    	
    },
    
    
    generateDisplayName:function(){
    	
    	this.displayName="press" + this.getArgByName("button").getValue()  + " on dialog box "  ;
    	
    },
    
    
    
    // simulate click ok on dialogBox
    doAccept:function(){
    	const {windowmanager } = require('./windowManager.js');
    	if(this.getArgByName('modal')){ // tab modal promt
    		this.lg.debug(" click ok on tab modal box index="+ this.getArgByName('index'));
    		var thedialog = windowmanager.getTabModalAtIndex(this.getArgByName('index'));
    		thedialog.ui.button0.doCommand();
    	} else { // windows  prompt
    		
        	windowmanager.getDialogBox().document.documentElement.getButton("accept").doCommand();
        	this.lg.debug(" click ok on dailog box");
    		
    	}
    	
    	

    	
    	
    },
    // simulate click cancel on dialogBox
    doCancel:function(){
    	const {windowmanager } = require('./BrowserManager.js');
    	
    	
    	if(this.getArgByName('modal')){ // tab modal promt
    	
    	
    	} else {  // windows  prompt
    		
        	windowmanager.getDialogBox().document.documentElement.getButton("cancel").doCommand();
        	this.lg.debug(" click cancel on dailog box");
    		
    	}
    	

    	
    	
    }
    
    
    
    
    
	
	
	
});




let ActionJavascript = Class({
	extends:Action,
    initialize: function () {
    	var arg1 = new ArgsAction("JS","",{name:'jsEditor'});
    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	Action.prototype.initialize.call(this,"Javascript", defaultAgrsArray);
    },
    doAction: function () {
		
    	
    	this.evalJascript(this.getArgByName("JS").getValue());		
    			
    	        
    	    },
    	    
    	  
    	    evalJascript : function(thescript) {
    	    	
    	    	require("./Controller.js").getController().evalJavascript(thescript);	
    	    	
    	    }
    
});





let ActionNavigate=Class({
	extends:Action,
    initialize: function () {
  
    	var arg1 = new ArgsAction("tabid","",{name:'textInputEditor'});
    	var arg2 = new ArgsAction("tabindex","",{name:'textInputEditor'});
      	var arg3 = new ArgsAction("url","",{name:'textInputEditor'});
    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	defaultAgrsArray.push(arg2);
    	defaultAgrsArray.push(arg3);
    	Action.prototype.initialize.call(this,"navigate", defaultAgrsArray);
    	// this.endEvent = 'tabload';

    },
    doAction: function () {
		
	
this.navigate(this.getTabById(this.getArgByName("tabid").getValue()),this.getArgByName("url").getValue());
			
			
			
			
			
	
		
		
        
    },
    navigate:function(tab,url){
    
    var mainwindow= require("sdk/window/utils").getMostRecentBrowserWindow();
    //initiate the browser for navigation event
    require('./BrowserManager.js').browser.setNavContext();
    		mainwindow.gBrowser.loadURI(url);
    	
    	
    		
    		
    		
    	},
    
    generateDisplayName:function(){
    	
    	this.displayName=" Browser navigate to " + this.getArgByName("url").getValue() ;
    	
    }


});



let ActionWindowActivate=Class({
	extends:Action,
    initialize: function () {
    	
    	var arg1 = new ArgsAction("title","",{name:'textInputEditor'});
    	

    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	
 
    	
    	Action.prototype.initialize.call(this,"activate window", defaultAgrsArray);


    },
    doAction: function () {
this.getWindowByTitle(this.getArgByName("title").getValue()).focus();
			
			
			
			
		},
		
		getWindowByTitle:function(title){
			const {windowmanager}  = require('./windowManager.js');
			return windowmanager.getWindowByTitle(title);
			
		},
		
		
		getWindowById:function(theid){
			const {windowmanager}  = require('./windowManager.js');
			
			return windowmanager.getWindow(theid);
			
		}	
		
		
        
    


});






let ActionTabActivate=Class({
	extends:Action,
    initialize: function () {
    	
    	var arg1 = new ArgsAction("tabid","",{name:'textInputEditor'});
    	var arg2 = new ArgsAction("tabindex","",{name:'textInputEditor'});

    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	defaultAgrsArray.push(arg2);
 
    	
    	Action.prototype.initialize.call(this,"activate tab", defaultAgrsArray);


    },
    doAction: function () {
this.getTabById(this.getArgByName("tabid").getValue()).activate();
			
			
			
			
		}
		
		
        
    


});



let ActionTabClose=Class({
	extends:Action,
    initialize: function () {
    	
      	var arg1 = new ArgsAction("tabid","",{name:'textInputEditor'});
    	var arg2 = new ArgsAction("tabindex","",{name:'textInputEditor'});

    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	defaultAgrsArray.push(arg2);
    	
    	Action.prototype.initialize.call(this,"close tab", defaultAgrsArray);


    },
    doAction: function () {
		
			var thetabid = this.getArgByName("tabid").getValue();
    		this.lg.debug(" ActionTabClose closing tab with id " + thetabid);
    		var thetab;
    		try{
    			
    			thetab = this.getTabById(thetabid);
				this.lg.debug(" ActionTabClose closing tab with id " + thetabid);
				thetab.close();	
    			
    		}catch( e) {
    			this.lg.debug(" ActionTabClose already closed tab with id " + thetabid);
    			
    		}
    		
			

			
			
			
			
			
				
        
    },
    
   generateDisplayName:function(){
    	
    	this.displayName=" Browser close tab # " + this.getArgByName("tabindex").getValue() ;
    	
    }


});


let ActionTabOpen=Class({
	extends:Action,
    initialize: function () {
      	var arg1 = new ArgsAction("tabid","",{name:'textInputEditor'});
    	var arg2 = new ArgsAction("tabindex","",{name:'textInputEditor'});

    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	defaultAgrsArray.push(arg2);
    	Action.prototype.initialize.call(this,"open tab", defaultAgrsArray);


    },
    doAction: function () {
		
		var tabs = require('sdk/tabs');
		tabs.open({  url: "about:blank",  inBackground: true});
		
        
    },
    
   generateDisplayName:function(){
    	
    	this.displayName=" Browser open new tab "  ;
    	
    }



});




let ActionWait=Class({
	extends:Action,
    initialize: function () {
      	var arg1 = new ArgsAction("duration",5000,{name:'textInputEditor'});


    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    
    	Action.prototype.initialize.call(this,"Wait", defaultAgrsArray);
    	this.endEventConfigurable=false;
    	this.endEvent="Step Completed";
    	this.generateDisplayName();

    },
	    doAction: function () {
		// no timeout for this step
			var { setTimeout, clearTimeout } = require("sdk/timers");
		clearTimeout(this.timeoutId);
		var duration = this.getArgByName("duration").getValue();
		var fct = function() {this.notifyEnd('step/completed');};  
		setTimeout(fct.bind(this), duration);
		
		
        
    },
    generateDisplayName:function(){
    	
    	this.displayName=" wait for" + this.getArgByName("duration").getValue() + " ms" ;
    	
    }



});



let ActionSetFile = Class({
	
	extends:ElementAction,
    initialize: function () {
    	
      	var arg1 = new ArgsAction("path","",{name:'textInputEditor'});


    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	ElementAction.prototype.initialize.call(this,"setFile", defaultAgrsArray);
    	
    	
    	},
    	
    	buildArgFromDomEvent:function (afilelist) {
    		var defaultAgrsArray = [];
    		for( var nbfiles=0; nbfiles<afilelist.length; nbfiles++){
    			var arg = new ArgsAction("path",afilelist[nbfiles].mozFullPath,{name:'textInputEditor'});
    			defaultAgrsArray.push(arg);    			
    		}
    		this.setArgs(defaultAgrsArray);    		
    		
    	},
	    doAction: function () {
	    	
	    	//get path from args
	    	var path = this.getArgByName("path").getValue();
	    	var selector = this.getSelector();
	    	var pathArray = [];
	    	pathArray.push( path);	

	    	
	    	require("./Controller.js").getController().setFilesIntoInput(selector,this.element,pathArray ,this.dispatchError.bind(this));	
	        
	    }
	
	
	
	
	
});







let ActionKeyPress=Class({
	extends:ElementAction,
    initialize: function () {
    	
      	var arg1 = new ArgsAction("key","",{name:'textInputEditor'});


    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);
    	ElementAction.prototype.initialize.call(this,"keypress", defaultAgrsArray);
    	
    	
    	},

buildArgFromDomEvent : function(ar){
	var code; var key;
	var type="keypress";
	switch(ar){
	case 13:code="Enter";type="";key="Enter";break;
	case 9:code="Tab";type="";key="Tab";break;
	}
	
  	var arg1 = new ArgsAction("key",ar,{name:'textInputEditor'});
  	var arg2 = new ArgsAction("type",type,{name:'textInputEditor'});
  	var arg3 = new ArgsAction("code",code,{name:'textInputEditor'});


	var defaultAgrsArray = [];
	defaultAgrsArray.push(arg1);defaultAgrsArray.push(arg2);defaultAgrsArray.push(arg3);

	this.setArgs(defaultAgrsArray);
	
	
},

doAction: function () {
	
	var theselector = this.getSelector();
	var keyboardinit = {};
	keyboardinit.key = this.getArgByName("key").getValue();
	keyboardinit.type = this.getArgByName("type").getValue();
	keyboardinit.code = this.getArgByName("code").getValue();
	
	require("./Controller.js").getController().dispatchKeyboard(theselector ,this.element,keyboardinit,this.dispatchError.bind(this));
}
});



let ActionTypeText=Class({
	extends:ElementAction,
    initialize: function () {
      	var arg1 = new ArgsAction("text","",{name:'textInputEditor'});
      	var arg2 = new ArgsAction("typingInterval",350,{name:'textInputEditor'});
    	var defaultAgrsArray = [];
    	defaultAgrsArray.push(arg1);defaultAgrsArray.push(arg2);
      	
      	
    	ElementAction.prototype.initialize.call(this,"typeText", defaultAgrsArray);
    	this.endEventConfigurable=false;
    	this.endEvent="Step Completed";
    	
	
    	
    },


doAction: function () {
	
	var { setInterval  , clearTimeout} = require("sdk/timers");

	
	clearTimeout(this.timeoutId); // no timeout for that
	var typeinterval = this.getArgByName("typingInterval").getValue();
	this.lettercount=0;
	this.letterArray=this.getArgByName("text").getValue().split('');
	if( this.letterArray.length ===0 ){
		this.notifyEnd('step/completed');
	} else {
		this.intervalid=setInterval( this.typeText.bind(this), typeinterval);
		
	}
		   
	
},
buildArgFromDomEvent : function(ar){
	
  	var arg1 = new ArgsAction("text",ar,{name:'textInputEditor'});
  	var arg2 = new ArgsAction("typingInterval",350,{name:'textInputEditor'});
  	var defaultAgrsArray = [];
  	defaultAgrsArray.push(arg1);defaultAgrsArray.push(arg2);

	this.setArgs(defaultAgrsArray);
	
	
},
typeLetter : function(char){
	var theselector = this.getSelector();
	require("./Controller.js").getController().dispatchText(theselector,this.element,char,this.dispatchError.bind(this));
	
},
typeText: function(){
	var {  clearInterval  } = require("sdk/timers");
	var char=this.letterArray[this.lettercount];
	this.typeLetter(char);
	if(this.lettercount === this.letterArray.length -1 ){
		clearInterval(this.intervalid);
		this.notifyEnd('step/completed');
		
		
	}else{
		this.lettercount++;
		
	}
	
}
    
    
    
    
    
});







/*** simple clik , only arg is button default is 0 ( button droit ***/

let ActionMouseEvent = Class({
	extends:ElementAction,
	    initialize: function () {
	      	var arg1 = new ArgsAction("button",0,this.buildButtonEditor());
	      	var arg2 =  ArgsAction("type","click",this.buildTypeEditor());

	      	var defaultAgrsArray = [];
	      	defaultAgrsArray.push(arg1);
	      	defaultAgrsArray.push(arg2);
	    	ElementAction.prototype.initialize.call(this,"mouseEvent",defaultAgrsArray);	    
	    	this.setElement({xpath:"/html"}); // defaultelemnt
	    	
	
	    },
	    /***
	     * 
	     *  return the editor for the type of click
	     */
	    buildTypeEditor : function() {
	    	
	    var ret= {name:'listInputEditor',
	    		values: [
	    		         {key:"click",val:"click"},
	    		         {key:"dblclick",val:"dblclick"},
	    		         {key:"mouseover",val:"mouseover"},
	    		         {key:"mouseenter",val:"mouseenter"},
	    		         {key:"mouseup",val:"mouseup"}
	    		         ]};	
	    	
	    return ret;	
	    },
	    
	    
	    /***
	     * 
	     *  return the editor for the button of click
	     */
	    buildButtonEditor : function() {
	    	
	    var ret= {name:'listInputEditor',
	    		values: [
	    		         {key:0,val:"left"},
	    		         {key:1,val:"middle"},
	    		         {key:2,val:"right"}
	    		     
	    		         ]};	
	    	
	    return ret;	
	    },
	    
	    /***
	     * 
	     *  return the editor for the button of click
	     */
	    buildTrueFalseEditor : function() {
	    	
	    var ret= {name:'listInputEditor',
	    		values: [
	    		         {key:true,val:"true"},
	    		         {key:false,val:"false"}
	    		        
	    		     
	    		         ]};	
	    	
	    return ret;	
	    },
	    
	    
	    generateDisplayName:function(){
	    	var detail= this.getArgByName('type').getValue() ;
	   
	    	
	    	
	    	if(typeof(this.element ) !== "undefined"){ // no element set
	    	 

	    		
	    		if( typeof(this.element.desc) !== "undefined"  ){ // more precise detail
	    			
	    			detail += " on " +this.element.desc;
	    			
	    		} else {
	    			
	    			detail += " on element " + this.element.tagName;	
	    			
	    		}
	    		
	    		
	    		
	    	
	    	}else{		
	    		
	    		this.displayName="select an object";
	    		
	    	}
	    	
	    	
	    
	    	
	    	
	    	
	    	
	    	
	    	
	    	
	    	this.displayName = detail;
	    	
	    },
	    
	    
	    doAction: function () {
	    	
	    	var theselector = this.getSelector();

	    	var thearg ={};
	    	if( this.hasArgByName('ctrlKey')){
	    		thearg.ctrlKey=this.getArgByName('ctrlKey').getValue();
	    		
	    	}
	    	
	    	if( this.hasArgByName('altKey')){
	    		thearg.ctrlKey=this.getArgByName('altKey').getValue();
	    		
	    	}
	    	
	    	if( this.hasArgByName('metaKey')){
	    		thearg.metaKey=this.getArgByName('metaKey').getValue();
	    		
	    	}
	    	
	    	if( this.hasArgByName('shiftKey')){
	    		thearg.shiftKey=this.getArgByName('shiftKey').getValue();
	    		
	    	}
	    	
	    	if( this.hasArgByName('cancelable')){
	    		thearg.cancelable=this.getArgByName('cancelable').getValue();
	    		
	    	}
	    	
	    	if( this.hasArgByName('bubbles')){
	    		thearg.bubbles=this.getArgByName('bubbles').getValue();
	    		
	    	}
	    	
	   


	    	thearg.button=this.getArgByName('button').getValue();
	    	thearg.type=this.getArgByName('type').getValue();

	    	var ret = require("./Controller.js").getController().dispatchMouseEvent(theselector, this.element,thearg,this.dispatchError.bind(this));

	    	
	    	
	    		
	    			return ret;	    			
	    	    },
	    	    
	    	    
	    	    buildArgFromDomEvent : function(ar){
	    	    	
	    	    	var {button  ,ctrlKey, shiftKey, altKey,metaKey,bubbles,cancelable} = ar;

	    	    	
	    	    	
	    	    	var arg1 = new ArgsAction("ctrlKey",ctrlKey,this.buildTrueFalseEditor());
	    	    	var arg2 = new ArgsAction("altKey",altKey,this.buildTrueFalseEditor());
	    	    	var arg3 = new ArgsAction("metaKey",metaKey,this.buildTrueFalseEditor());
	    	    	var arg4 = new ArgsAction("shiftKey",shiftKey,this.buildTrueFalseEditor());
	    	    	var arg5 = new ArgsAction("button",button,this.buildButtonEditor());
	    	    	var arg6 = new ArgsAction("type","click",this.buildTypeEditor());
	    	    	var arg7 = new ArgsAction("bubbles",bubbles,this.buildTrueFalseEditor());
	    	    	var arg8 = new ArgsAction("cancelable",cancelable,this.buildTrueFalseEditor());
	    	      	var defaultAgrsArray = [];
	    	      	defaultAgrsArray.push(arg1);defaultAgrsArray.push(arg2);defaultAgrsArray.push(arg3);
	    	      	defaultAgrsArray.push(arg4);defaultAgrsArray.push(arg5);defaultAgrsArray.push(arg6);
	    	      	defaultAgrsArray.push(arg7);defaultAgrsArray.push(arg8);
	    	    	
	    	    	this.setArgs(defaultAgrsArray);
	    	    }

});




let StepActionfactory=Class({
	extends:Object,
	   getStepActionByName:function (name){
		   var retaction;
		   switch ( name){
		   case "Javascript" : retaction = new ActionJavascript();break;
		   case "keypress":retaction= new ActionKeyPress();break;
		   case "mouseEvent":retaction= new ActionMouseEvent();break;
		   case  "typeText":retaction= new ActionTypeText();break;
		   case "navigate":retaction= new ActionNavigate();break;
		   case "close tab":retaction= new ActionTabClose();break;
		   case "open tab":retaction= new ActionTabOpen();break;
		   case "Wait":retaction= new ActionWait();break;
		   case "activate tab":retaction = new ActionTabActivate();break; 
		   case "activate window":retaction = new ActionWindowActivate();break; 
		   case "dialog":retaction = new ActionDialog();break;
		   case "setFile": retaction= new ActionSetFile(); break;
		   
		   
		   default : throw new Error("unknown action " + name);
		   
		   
		   }
		 
		   return retaction;
	   }
});






var theStepActionfactory = new StepActionfactory();


//the actions
exports.ActionTypeText= ActionTypeText;
exports.ActionMouseEvent=ActionMouseEvent;
exports.ActionNavigate=ActionNavigate;
exports.ActionDialog = ActionDialog ;
exports.ActionTabActivate=ActionTabActivate;
exports.ActionTabClose=ActionTabClose;
exports.ActionTabOpen=ActionTabOpen;
exports.ActionWait=ActionWait;
exports.ActionKeyPress=ActionKeyPress;
exports.theStepActionfactory=theStepActionfactory;
exports.ActionJavascript=ActionJavascript;
exports.ActionSetFile = ActionSetFile;
exports.ActionWindowActivate = ActionWindowActivate ;



"use strict";
/**

 action for the step definitions


*/

const {Cc, Ci } = require("chrome");
const { Class } = require('sdk/core/heritage');
const { async_emit } = require('./Util.js');
var { EventTarget } = require("sdk/event/target");
var { merge } = require("sdk/util/object");
 


const  bro = require('./BrowserManager.js').browser;



 
//  base classse for action ( encapsule name and args for method  





let AbstractAction=Class({
	
extends: EventTarget,
 initialize: function (options){
	EventTarget.prototype.initialize.call(this, options);
	merge(this, options);
	this.endEvent="Action Completed";
	this.status={status:'ok', message:""};
	
	var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
	this.lg = wrapper.wrappedJSObject;


},
setId : function(stepid){
	this.id = stepid;
	
},

setErrorStatus:function(err){
	this.status.status="fail";
	this.status.message=err.message;
	
	
	
},

resetStatus:function(){
	// fail
		this.status.status="ok";
	this.status.message="pass";
	
},
getStatus:function(){
	this.status.id=this.id;
	return this.status;
	
},

setEndEvent : function(evt){
			
	this.lg.debug("step id=" + this.id + " action " + this.name + " set end event" + evt);
	this.endEvent = evt;
	
},
setArgs:function(oArgs){
	this.args= oArgs;
	this.generateDisplayName();

}




});


let Action = Class({
	extends:AbstractAction,
	    initialize: function (sName, odefaultargs) {
	    	AbstractAction.prototype.initialize.call(this,{} );
	    	this.name=sName;
	    	this.defaultArgs=odefaultargs;
	    	  this.setArgs(odefaultargs);
			this.stepTimeout=10000; //timeout in ms
			this.endEventConfigurable = true; // if the user can choose the end for the step
		
			
			
			// to enable a call inside a evnet handler
			this._endHandler = this.endHandler.bind(this);
			this._manageError=this.manageError.bind(this);
			this._triggerExecutionTimeout=this.triggerExecutionTimeout.bind(this);
			
	    	
	    },

	    
	    generateDisplayName:function(){
	    	
	    	this.displayName=this.name;
	    	
	    },
	    
	    
	    
	    getName:function() {
	    	
	    	return this.name;
	    },
	    
		getTabById:function(tabId){
			var ret;
			var tabs = require('sdk/tabs');
			for (let tab of tabs){
				if( tab.id === tabId ){
					ret=tab;
					return ret;
				}
				
				
			}
			throw( new Error(" Tab Not found " + tabId));
			
		},
	    
	    
	    /***  @return the array of argument **/
	    getArgs:function() {
	    	return this.args;
	    	
	    },
	    /**** @return the argument of name thename ***/
	    getArgByName: function(thename){
	    	var ret = null;
	    	var arryargs = this.args;
	    	for ( var index=0;index<arryargs.length; index++){
	    		if( arryargs[index].getName() === thename ){
	    			ret = arryargs[index];break;
	    		}
	    		
	    	}
	    if(ret === null)	{ throw new Error( " ArgumentNotFoundException " + thename ) ;   }
	    return( ret);	
	    },
	    /***** return if the action has an argument with name name ***/
	    hasArgByName : function(name){
	    	
	    	var ret = false;
	    	var arryargs = this.args;
	    	for ( var index=0;index<arryargs.length; index++){
	    		if( arryargs[index].getName() === name ){
	    			ret = true;break;
	    		}
	    		
	    	}
	  
	    return( ret);
	    	
	    	
	    },
	    
	    getDefaultArgs : function() {
	    	
	    	return this.defaultArgs;
	    },
	    

		updateArgs : function(name,newval) {
			this.getArgByName(name).value=newval;
			this.generateDisplayName();
			
			
		},
		dispatchError : function ( e){
			
			this.lg.debug("dispatching error " + e.message +" in step " + this.id );
		async_emit(this,'error',e);
		},
		triggerExecutionTimeout:function(){
			this.lg.debug("trigger timeout for step "  + this.id );
			async_emit(this,'error',new Error("Step Timeout Exception") );
			
			
		},
		
		manageError: function(e){
			

		
			this.lg.error(   "step id:" + this.id   + " name:" + this.displayName +   "managing error:" + e.message     + ":file:" + e.fileName + "line:" + e.lineNumber);
				this.setErrorStatus(e);
			async_emit(this,'actionCompleted',{messageType:'actionCompleted',stepId:this.id});	
				this.unregisterEndHandler(this.endEvent);		
			
			
			this.notifyEnd('step/ended');
			
			
		},
		
		
		
		playInteractive : function(){
			var { setTimeout } = require("sdk/timers");
		
			this.lg.info("------------ start playInteractive step id:" + this.id + " name:" + this.displayName +" end of event:" + this.endEvent); 
			// tle timeout d'exec
			this.timeoutId = setTimeout( this._triggerExecutionTimeout      ,this.stepTimeout );		
			this.lg.debug("timeoutId for stp is" + this.timeoutId + " with a duration of" +  this.stepTimeout + " ms"); 
			//management od error
			this.on('error', this._manageError)	;
			//management of end of play
			this.registerEndHandler(this.endEvent);
			
			try{
				require('./Controller.js').getController().generateSnapshotById(this.id);
			this.doAction(); // call abstract methof
			async_emit(this,     'actionCompleted',{ messageType:  'actionCompleted', stepId:this.id} );	
			
			} catch (e){				
				this.dispatchError(e);				
			}		
			
		},	
		// set the handler for the end of the step accoriding end event settled at recording time
		registerEndHandler : function(endevt){
			
			this.lg.debug("step id:"  + this.id + " register end on " + endevt);
	    	switch( endevt){
    		case 'tabload':
 				const {browser} = require('./BrowserManager.js');   			
 				browser.once('TabLoad',this._endHandler)	;	
  		break;
    		case 'network/completed':
  			
 		
  			bro.once('endNetwork',this._endHandler);
   	
    		break;
    		case 'Action Completed':
     				
    				this.once('actionCompleted',this._endHandler)	;

    			break; 
    		case 'navigation/completed':
    			
    				
    				bro.once('endNav', this._endHandler );
    		
    			break;

    	}
			
		},
		// unset the handler for the end of the step accoriding end event settled at recording time
		unregisterEndHandler : function(endevt){
			this.lg.debug("step id:"  + this.id + "remove listener for end event " + endevt );
	    	switch( endevt){
    		case 'tabload':
    			const {browser} = require('./BrowserManager.js');    				
    			browser.removeListener('TabLoad',this._endHandler)	;	
  		break;
    		case 'network/completed':
    			
  		bro.removeListener('endNetwork',this.endHandler.bind(this));
   	
    		break;
    		case 'Action Completed':
    				this.removeListener('actionCompleted',this._endHandler)	;

    			break; 
    		case 'endNav':
    				
    				bro.removeListener('endNav', this._endHandler );
    		
    			break;

    	}
			
		},
		
		

		
		
		
		endHandler : function({messageType:messageType}) {
			this.lg.debug("stepid: "  + this.id+ " name:" + this.displayName  + "receive end event " + messageType );
			this.notifyEnd(messageType);
			
		},
		
		
		
	/*

	trigger the end of the step ie stepCompleted , evt describe the cause of the end actioncompleted network step ended dur to error

	*/	
		notifyEnd: function(evt){	
		var {  clearTimeout } = require("sdk/timers");
		this.lg.debug("clearing timeout " + this.timeoutId ); 
		this.lg.debug("step " + this.id +"  clear timeout "   +this.timeoutId );
			clearTimeout(this.timeoutId);	
			this.lg.info("------------ stop playInteractive step id:" + this.id + " name:" + this.displayName +" end of event:" + this.endEvent);		 		
		this.lg.debug("stepid:"  + this.id + " notify end  - "+ evt);
			async_emit(this,'stepCompleted',{stepId:this.id,event:evt,messageType:'stepCompleted'});	
				this.removeListener('error', this._manageError)	;
		}


		




		



	    

});

/*** action that depends on an one element   ***/

let ElementAction = Class({
	extends:Action,
	    initialize: function (sname, defaultArg) {
	    	Action.prototype.initialize.call(this, sname,defaultArg );
	    	
	    	this.selector="xp"; // by default select the element by xpath. alternative is js for javascript
	    },
	       setElement: function(element){
	    	   this.element = element; 
	    	   this.lg.debug("setElement" + this.id +"  association with srcobject:"   +element );
	    	   this.generateDisplayName();
	    
	    	   
	       },
	       
	       getElemnt:function (){
	    	   return this.element;
	    	   
	       },
	       
	       setSelector:function( newselector){
	    	   
	    	   this.selector=newselector;  
	    	   this.lg.debug("setSelector" + this.id +"  new selector for element:"   +newselector );
	    	   
	       },
	       
	       getSelector:function () {
	    	   
	    	   return this.selector;
	    	   
	       },
	       
	       updatexpath : function(newpath){
	    	   const cont= require('./Controller.js').getController(); 
	    	   var theStep=cont.getStepById(this.id);
	    	 try{
	    		
	    		 var newelement =   cont.getSrcObjectFromXpath(newpath);  
	    		 this.lg.debug("updatexpath" + this.id +"  success xpath is updated "   +newpath );
	    		 this.setElement(newelement);
	    		
	    		 cont.refreshStepView(theStep);
	    		 
	    	 }  
	    	 catch (e){
	    		 this.lg.debug("updatexpath" + this.id +"  wrong xpath not updated "   +newpath );	 
	    		 this.element.xpath=newpath;
	    		 cont.refreshStepView(theStep);
	    	 }
	    	   
	    	   
	    	  
	    	   
	       },
	       
	       
	       updatejs : function(newjs){
	    	   const cont= require('./Controller.js').getController();
		    	 try{
		    		
		    		 var newelement =   cont.getSrcObjectFromJS(newjs); 
		    		 newelement.js=newjs;
		    		 this.lg.debug("updatejs" + this.id +"  success js is updated "   +newjs );
		    		 this.setElement(newelement);
		    		 var theStep=cont.getStepById(this.id);
		    		 cont.refreshStepView(theStep);
		    		 
		    	 }  
		    	 catch (e){
		    		 this.lg.debug("updatejs" + this.id +"  wrong js not updated "   +newjs );	 
		    		 
		    			var err = {
		    					message :" JS ERROR " +  e.message,	
		    					fileName: e.fileName,
		    					lineNumber: e.lineNumber
		    					
		    			};
		    			
		    			this.lg.debug("exception" +err.message +" line " +e.lineNumber + " file " + e.fileName );	
		    			cont.sideBarWorker.port.emit('showPopUp',e.message,"(check your js)");	
		    		
		    		 
		    		 
		    		 
		    	 }
		    	   
		    	   
		    	  
		    	   
		       },
	       
		    
		    generateDisplayName:function(){

		    	
		    	if(typeof(this.element ) !== "undefined"){ // no element set
		    		var detail = " on element " + this.element.tagName;

		    		
		    		if( typeof(this.element.desc) !== "undefined"  ){ // more precise detail
		    			
		    			detail = " on " +this.element.desc;
		    			
		    		}
		    		
		    		
		    		
		    		this.displayName=this.name + detail ;
		    	}else{		
		    		
		    		this.displayName="select an object";
		    		
		    	}
		    	
		    	
		    }



});









exports.Action=Action;
exports.ElementAction=ElementAction;






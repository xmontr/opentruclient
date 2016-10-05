const { Class } = require('sdk/core/heritage');
var { emit } = require("sdk/event/core");
var { EventTarget } = require("sdk/event/target");
var { merge } = require("sdk/util/object");
 
var {Cc, Ci, Cu} = require("chrome");









let HttpTracker=Class({


extends: EventTarget,
 initialize: function (options){
	 
	 this.httpStack = [];
	 
	EventTarget.prototype.initialize.call(this, options);
    merge(this, options);
	

   

},

	pushRequest:function( url){
		var req = new Object();
		req.url=url;
		this.httpStack.push(req);
		
		
	},
	
	popRequest : function() {
		var req = this.httpStack.pop();
		if(this.httpStack.length == 0){
			emit(this,'network/completed' );
			
		}
		
		
		
	},
	
    observeActivity: function(aHttpChannel, aActivityType, aActivitySubtype, aTimestamp, aExtraSizeData, aExtraStringData)
    {	var lg = require("./logger.js").Logger;
	
		
		
		
      if (aActivityType == Ci.nsIHttpActivityObserver.ACTIVITY_TYPE_HTTP_TRANSACTION) {
        switch(aActivitySubtype) {
			case Ci.nsIHttpActivityObserver.ACTIVITY_SUBTYPE_REQUEST_HEADER:
			//The HTTP request is about to be queued for sending. Observers can look at request headers in 
			this.pushRequest(aExtraStringData);
		//	lg.log("httptracker:request header aExtraStringData=" +aExtraStringData + "aExtraSizeData=" +aExtraSizeData,lg.LOGDEBUG);
			break;
          case Ci.nsIHttpActivityObserver.ACTIVITY_SUBTYPE_RESPONSE_HEADER:	
            // received response header
			//lg.log("httptracker: received response header aExtraStringData=" +aExtraStringData + "aExtraSizeData=" +aExtraSizeData,lg.LOGDEBUG);
            break;
          case Ci.nsIHttpActivityObserver.ACTIVITY_SUBTYPE_RESPONSE_COMPLETE:
            // received complete HTTP response
			//lg.log("httptracker: received complete HTTP responseaExtraStringData=" +aExtraStringData + "aExtraSizeData=" +aExtraSizeData,lg.LOGDEBUG);
            break;
		         case Ci.nsIHttpActivityObserver.ACTIVITY_SUBTYPE_TRANSACTION_CLOSE:
            // The HTTP transaction has been closed.
		//	lg.log("httptracker: received close transaction HTTP responseaExtraStringData=" +aExtraStringData + "aExtraSizeData=" +aExtraSizeData,lg.LOGDEBUG);
			this.popRequest();
            break;	
        }
      }
    },
	
	register:function() {
			var activityDistributor = Cc["@mozilla.org/network/http-activity-distributor;1"]
                                    .getService(Ci.nsIHttpActivityDistributor);
activityDistributor.addObserver(this);
		
	},
	
	unregister:function() {
		
		activityDistributor.removeObserver(this);
		
	}
	
	

});

exports.HttpTracker=HttpTracker;


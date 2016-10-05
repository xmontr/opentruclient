"use strict";

/** script management  **/



const { theStepActionfactory } = require("./stepActionImpl.js");
const {ElementStep, BrowserStep , waitStep} = require('./stepImpl.js');

const { Class } = require('sdk/core/heritage');
const {Cc, Ci, Cu} = require("chrome");
const {TextDecoder, TextEncoder, OS} = Cu.import("resource://gre/modules/osfile.jsm", {});
const BasicContainerStep = require('./container.js').BasicContainerStep ; 





let Script=Class({
	initialize: function (path){
	
	this.path=path;
	this.encoder = new TextEncoder("utf-8");
	this.version='1.0' ;

	this.lg = require("./logger.js").getLogger();

				
	
	
	
	
},
init:function(reset){
	const {FileUtils} = Cu.import("resource://gre/modules/FileUtils.jsm");
	const {NetUtil} = Cu.import("resource://gre/modules/NetUtil.jsm"); 
	var ofile = new FileUtils.File(this.path);
	
	var fiStream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
	fiStream.init(
			ofile,
		0x01    ,
		parseInt("0400", 8),
		0			);
	
	

	var data = NetUtil.readInputStreamToString(fiStream, fiStream.available(), {charset:"utf-8"});	
	if(data.length === 0 || reset===true ){
		data= "<?xml  version=\"1.0\" encoding=\"utf-8\"?>\r\n<script xmlns=\"http://model.montrigenplug\" version=\"" + this.version + "\"></script>";
	}
	var parser = Cc["@mozilla.org/xmlextras/domparser;1"]
    .createInstance(Ci.nsIDOMParser);
	try{
		var newdoc=parser.parseFromString(data, "application/xml");
		this.doc=newdoc;	
		
	}
	catch ( e) {
		this.lg.log("parseException " + e.message ,this.lg.LOGSTANDART);
		
	}
	
	
	
},


/***
 * 
 *  perform xpath query onthe script. i.e //step . default namespace is 'http://model.montrigenplug'
 * 
 * 
 */
getObjectsFromXpath : function ( xpath ) {
	var nameresolver = function nsResolver(prefix) {
		  var ns = {
				    'mtg' : 'http://model.montrigenplug'
				  };
				  return ns[prefix] || 'http://model.montrigenplug';
				};
	
	var ret = [] ,
		foundedobject,
		xpathResult = this.doc.evaluate(
				xpath, 
				this.doc, 
				nameresolver, 
				Ci.nsIDOMXPathResult.ANY_TYPE, 
				null
			); 
	foundedobject = xpathResult.iterateNext();	
	while(foundedobject ) {
		ret.push(foundedobject);
		foundedobject = xpathResult.iterateNext();
	}
			
			
	return ret;
	},

createEmpty : function() {
	var stringFile="<script xmlns=\"http://model.montrigenplug\" version=\"" + this.version + "\"></script>";
	var txtEncoded = this.encoder.encode(stringFile);
OS.File.open(this.path, {write: true, append: false}).then(fileopen => {
    fileopen.write(txtEncoded).then(valWrite => {
     
	   fileopen.close();
	
    });
});	
	
	
},


loadscript : function ( callback){
this.init();




// load steps
var steplist = this.getObjectsFromXpath("//mtg:step");
this.lg.debug("nb step in script in " +this.path  + " = "+ steplist.length );
for(var index=0; index<steplist.length; index++) {
	var step2import = this.loadStep(steplist[index]);
	require('./Controller.js').getController().addStep(step2import);
	
}

//load all container
var contlist = this.getObjectsFromXpath("//mtg:containerstep");
this.lg.debug("nb containerstep in script in " +this.path  + " = "+ contlist.length );
for(var index=0; index<contlist.length; index++) {
	var cont2import = this.loadContainer(contlist[index]);
	require('./Controller.js').getController().addContainerStep(cont2import);
	
}

//load logic
var logicElement = this.doc.getElementsByTagName('logic')[0];
if(logicElement) {
var alogic = JSON.parse(logicElement.firstChild.nodeValue);
 
this.lg.debug("logic in script in " +this.path  + " = "+ alogic);
this.loadLogic(alogic);
}


//loadtransactions
var transElement = this.doc.getElementsByTagName('transactions')[0];
var atrans = JSON.parse(transElement.firstChild.nodeValue);
require('./Controller.js').getController().transactions= atrans ;
require('./Controller.js').getController().refreshTransactions();


callback();
	
},

loadLogic : function(alogic){
	var indexcont=0, indexstep=0 , pos =0, currentstepid , currentstep,contid,currentCont,childsteps;
	// pour ts les container
	for( indexcont=0; indexcont < alogic.length; indexcont++ ){
		 contid = alogic[indexcont];
		 currentCont = require('./Controller.js').getController().getContainerStepById(contid);
		 require('./Controller.js').getController().addContainerToLogic(currentCont);
		require('./Controller.js').getController().addContainer2view(currentCont);
		 childsteps = currentCont.getChildSteps();
		//pour chaque fils
		for( var i=0; i<childsteps.length; i++){
			 currentstepid= childsteps[i];
			 currentstep = require('./Controller.js').getController().getStepById(currentstepid);
			require('./Controller.js').getController().addStep2container2view(currentstep,currentCont.id,pos);
			pos++;
		}
	}
	
	
	
},
loadContainer : function(domNode){
	var ret, type = domNode.getAttribute("type");
	switch(type){
	case 'Basic' : 
		ret = new BasicContainerStep();
		 ret.fromDom(domNode);
		
		
		
		break;
	
	default : throw new Error(" Unsupported container type " + type);
	}
	
	return ret;
	
},
loadStep : function(domNode) {  
	var ret , type = domNode.getAttribute("type"), saction = domNode.getAttribute("action");
	var action = theStepActionfactory.getStepActionByName(saction);
	switch(type){
	case 'Element': ret = new ElementStep(action); break;
	case 'Wait':   ret = new waitStep(action) ;break;
	case 'Browser': ret = new BrowserStep(action); break;
	case 'Wait': break;
	
	
	}
	ret.fromXml(domNode);
	return ret;
	
},



saveSteps: function (oSteps, oContainer, aContlogic ,aTransactions ,callback){
				
			var oSerializer = Cc["@mozilla.org/xmlextras/xmlserializer;1"].createInstance(Ci.nsIDOMSerializer);

	this.lg.info("saving script in " +this.path );
	this.init(true);
	var stringFile="";
	var currentstep,  stepelement;
	for( var o in oSteps){ // write step
		 currentstep = oSteps[o];
		 stepelement = currentstep.toXml(this.doc);
		this.doc.documentElement.appendChild(stepelement);
	
	
	}
		for( var c in oContainer){ // write containerstep
		 currentstep = oContainer[c];
		 stepelement = currentstep.toXml(this.doc);
		this.doc.documentElement.appendChild(stepelement);
	
	
	}
	// write container logic
	var logicelement = this.doc.createElementNS("http://model.montrigenplug",'logic');
	logicelement.appendChild(this.doc.createCDATASection(JSON.stringify(aContlogic)));
	this.doc.documentElement.appendChild(logicelement);
	
	
	// write transactions
	var transactionselement = this.doc.createElementNS("http://model.montrigenplug",'transactions');
	transactionselement.appendChild(this.doc.createCDATASection(JSON.stringify(aTransactions)));
	this.doc.documentElement.appendChild(transactionselement);
	
	
	
	stringFile=oSerializer.serializeToString(this.doc, "UTF-8");
	var txtEncoded = this.encoder.encode(stringFile);
	/** **  old method 
OS.File.open(this.path, {write: true, append: false}).then(fileopen => {
    fileopen.write(txtEncoded).then(valWrite => {    
	   fileopen.close();
	callback();
    });
});	*/
	
	var totalsize = txtEncoded.byteLength;
	var filepath = this.path;
	
	var writePremise, closePremise, openPremise,  thefileopen, logger=this.lg;
	openPremise = OS.File.open(this.path , {write: true, append: false});
	openPremise.then( // opening 
		function onSuccess(fileopen)	{
			// file succesfully opened
			thefileopen = fileopen;
			logger.debug( " start writting to disk - total size= " + totalsize);
			writePremise =  thefileopen.write(txtEncoded);
			writePremise.then( // writing 
					function onSuccess( valwrite){
						// txt has been written so close the file
						logger.debug( valwrite + " written to disk on total of " + totalsize );
						closePremise = thefileopen.close();
						closePremise.then( // closing  
								function onSuccess(valclose){
									// file has been closed
									logger.debug( + " file has been closed :" + filepath );
									callback();
									
								},
								function onFailure(reason) {
									logger.error( + " fail to close file :" + filepath  + "reason=" + reason );
									callback();
									throw reason;
								}
						
						);
						
						
					},
					function onFailure(reason){
						logger.debug( " fail to write txt " + txtEncoded );
						callback();
						throw reason;
					}
			
			
			);
			
		},
		function onFailure(reason){
			logger.error( " fail to open file " + filepath );
			callback();
			throw reason;
			
		}
	
	
	
	);
	
	
	
	
	
	
	
}
});

















exports.Script = Script;
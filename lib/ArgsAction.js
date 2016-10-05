"use strict";

/**

 argument for stepAction definitions


*/


const { Class } = require('sdk/core/heritage');






let ArgsAction=Class({



	 initialize: function (name, value , editor){

	this.name = name;
	this.value=value;
	this.editor=editor;

   

},
getName : function() {
	
	return this.name;
},

getValue:function(){
	
	return this.value;
},

getEditor:function(){
	
	return this.editor;
}




});

var argsActionFromObject = function(o){
	
	var ret = new ArgsAction( o.name, o.value,o.editor);
	return ret;
	
	
}


exports.ArgsAction = ArgsAction ;
exports.argsActionFromObject= argsActionFromObject ;

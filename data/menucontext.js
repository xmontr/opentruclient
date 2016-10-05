var managefromaddon = function(){
	
	var titi;
};


var manageClick = function(node, data) {
	
	var message = new Object();
	message.data=data;
	message.id=node.id;
	message.parentid=node.parentNode.id;
	
	self.postMessage(message);
};

self.on("click", manageClick);
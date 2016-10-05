"use strict";

var ui = require("sdk/ui");
const data = require('sdk/self').data;


const Controller =  require("./Controller.js").getController();

var record = ui.ActionButton({
  id: "record",
  label: "record",
  icon: data.url("images/media-record-2.png"),
onClick:onClickRecord
});

var start = ui.ActionButton({
  id: "start",
  label: "start",
  disabled:true,
  icon: data.url("images/media-playback-start-2.png"),
  onClick:onClickStart
});

var pause = ui.ActionButton({
  id: "pause",
  label: "pause",
  disabled:false,
  icon: data.url("images/media-playback-pause-2.png"),
  onClick:onClickPause
});

var stop = ui.ActionButton({
  id: "stop",
  label: "stop",
  disabled : true,
  icon: data.url("images/media-playback-stop-2.png"),
  onClick:onClickStop
});


var save = ui.ActionButton({
  id: "save",
  label: "save",
  icon: data.url("images/document-export.png"),
onClick:onClickSave
});


var openb = ui.ActionButton({
  id: "open",
  label: "open",
  icon: data.url("images/document-open-8.png"),
onClick:onClickOpen
});




var hgb = ui.ActionButton({
	  id: "highlight",
	  label: "highlight",
	  icon: data.url("images/system-search-6.png"),
	onClick:onClickHighlight
	});







ui.Toolbar({
  title: "trueclient-toolbar",
  items: [record,start,pause,stop,save, openb , hgb]
});


function onClickRecord(state){
record.state("window",{"disabled":true});
stop.state("window",{"disabled":false});
pause.state("window",{"disabled":false});
save.state("window",{"disabled":true});
start.state("window",{"disabled":false});
Controller.record();



}


function onClickStop(state){
record.state("window",{"disabled":false});
stop.state("window",{"disabled":true});
pause.state("window",{"disabled":true});
save.state("window",{"disabled":false});
start.state("window",{"disabled":false});
Controller.stop();


}



function onClickSave(){
	
Controller.doSave();



}

function onClickStart() {
	
record.state("window",{"disabled":true});
stop.state("window",{"disabled":false});
pause.state("window",{"disabled":false});
save.state("window",{"disabled":true});
start.state("window",{"disabled":true});
Controller.playScript();
	
}





function onClickOpen(state){
var filepicker = require("./filepicker.js");
var path = filepicker.promptForFile();
Controller.openScript(path);
}


function onClickPause ()  {
	
	
	Controller.stop();
	
}



function onClickHighlight() {
	
	Controller.highlightSelection();
	
}



exports.record = record;
exports.start = start;
exports.save = save;
exports.pause = pause;
exports.stop = stop;





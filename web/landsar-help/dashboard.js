/* globals Chart:false, feather:false */

function clearSelection() {
	var anchors = document.getElementsByTagName('a');
	for(var i = 0; i < anchors.length; i++) {
	    var anchor = anchors[i];
	    if(anchor.classList.contains('nav-link') || anchor.classList.contains('nav-sub-link')) {
	    	anchor.style.color = 'black';
	    }
	}
}

function loadSelection(headingText) {
	var fileName = "content/" + headingText.trim().replaceAll(" ", "_") + ".html";
	document.getElementById("contentFrame").src = fileName;
	document.getElementById("contentHeading").innerText = headingText;
	clearSelection();
	
	var anchors = document.getElementsByTagName('a');
	for(var i = 0; i < anchors.length; i++) {
		var anchor = anchors[i];
		if(anchor.innerText.trim() == headingText) {
			anchor.style.color = '#0069FC';
		}
	}
}


(function () {
  'use strict'

  feather.replace();
  
  	var anchors = document.getElementsByTagName('a');
	for(var i = 0; i < anchors.length; i++) {
	    var anchor = anchors[i];
	    if(anchor.classList.contains('nav-link') || anchor.classList.contains('nav-sub-link')) {
		    anchor.onclick = function() {
			loadSelection(this.innerText);
		    }
		    anchor.style.color = 'black';
	    }
	}
	
	loadSelection("Help - Dashboard");

})()

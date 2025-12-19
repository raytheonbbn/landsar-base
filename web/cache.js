/**
 * @Summary
 * This file creates an IndexedDB to cache data on the client.
 * The database create a mapData objectStore which currently
 * only hold the user's last mapSelection, but could potentially
 * store more data.
 * 
 * 
 * @author Devon Minor
 */


var db;

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

var request = window.indexedDB.open("windowDatabase", 1);

request.onerror = function(event) {
	console.log("Database error: " + event.target.errorCode);
	alert("You may be browsing in incognito mode, which is not supported by LandSAR")
};

request.onupgradeneeded = function(event) {
	db = event.target.result;
	
	var objectStore = db.createObjectStore("mapData", { keyPath: "object" });
};

request.onsuccess = function(event) {
	db = event.target.result;
	
	$(document).ready(function() {
		var transaction = db.transaction(["mapData"], "readwrite");
		var objectStore = transaction.objectStore("mapData");
		var req = objectStore.openCursor("selectedMap");
		req.onsuccess = function(e) {
			var cursor = e.target.result; 
			if (cursor && cursor.value.value != null) { // key already exists, then do nothing
				
			} else { // key does not exist, add default map
				objectStore.put({object: "selectedMap", value: "mapbox.streets"});
			}
		};

		// TODO: this could probably be removed since it is called in changeActiveLPI
		loadLayerSettingsFromCache();
	});
};


function getFromCache(keyName, successFunc) {
	db.transaction("mapData").objectStore("mapData").get(keyName).onsuccess = successFunc;
}

function putToCache(keyName, value) {
	var transaction = db.transaction(["mapData"], "readwrite");
	var objectStore = transaction.objectStore("mapData");
	var request = objectStore.put({object: keyName, value: value});
}


















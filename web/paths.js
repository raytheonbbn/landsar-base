function loadSamplePathsKML(lpiID) {
	return $.ajax("/webmap/servlet/?action=getSamplePathsOverlay&lpiID=" + lpiID).done(function (msg) {
		if (msg == null || msg == undefined || msg.length == 0) {
			console.log("Received empty message from getSamplePathsOverlay request");
			return;
		}

		if (msg.getElementsByTagName == undefined) {
			//  ** not XML - interpret as string
			console.log("Error on getting sample paths overlay");
			console.log(msg);
			setStatus(msg);
			return;
		}

		var track = new L.KML(msg, lpiID, "paths");
		map.addLayer(track);

		// Adjust map to show the kml
		map.fitBounds(track.getBounds());

		updateMapBasedOnLayerSelections();
	});
}

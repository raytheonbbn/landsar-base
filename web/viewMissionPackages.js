/**
 * @Summary
 * This file loads in the mission packages into a selector
 * that the user can then choose from.
 * 
 * @author Devon Minor
 */


function openViewMissionPackages() {
	missionPackagesForm.open();
	$('#openMainMenu').hide();
	mainMenu.close();
	
	$("#slider").show();
	
	$.ajax("/webmap/servlet/?action=listOverlays").done(function(msg) {
		var jsonMsg = JSON.parse(msg);
		var mpSelect = document.getElementById("mpid");
		
		for(var i = 0; i < jsonMsg.length; i++) {
			var option = document.createElement("option");
		    option.text = jsonMsg[i];
		    mpSelect.add(option, mpSelect[0]);
		}
		
	});
	
	$.ajax("/webmap/servlet/?action=getOverlay&mpid=" + document.getElementById("mpid").value).done(function( msg ) {
		for(var i = 0; i < msg.length; i++) {
	    	overlay = msg[i];
		    imageBounds = [[overlay.boundingBox.north, overlay.boundingBox.east], [overlay.boundingBox.south, overlay.boundingBox.west]];
			L.rotateImageLayer(overlay.imageURL, imageBounds, {rotation: 0}).addTo(mymap);
		}
	  });
	
}

$('#backToMainViewMissionPackages').click(function() {
	missionPackagesForm.close();
	
	$("#slider").hide();
	
	$("#mpid option").each(function() {
	    $(this).remove();
	});
	
	openMainMenu();
});



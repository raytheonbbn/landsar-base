/**
 * @Summary
 * Walks the user through each step of creating
 * a new LPI.
 *
 * @author Devon Minor
 */

var lpWrapper,
	lpInputs,
	pdParams;

var completedPoints = false

var NATIONAL_LANDCOVER_DATA_BASE = "National Land Cover Data Base";

function cancelNewLpi(){
	clearMap();
	mapItems.pop();
	lpWrapper = undefined;
	lpInputs = undefined;
	pdParams = undefined;
	$('.incompleteText').text("");
	lppMenu.close();
	lkpMenu.close();
	parachuteMenu.close();
	mmMenu.close();
	mvmtSchedMenu.close();
    wanderingParamsMenu.close();
	openMainMenu();
	goalParamsMenu.close();
	stopDrawing();
	hideHelperText();
	pointMenu.close();

	$(".landcoverMetaFormHolder").empty();

	$("#wanderingParamsWarning").hide();
	$('#goalParamsWarning').hide();
	$('#lppWarning').hide();

	landcoverMetaFormMenu.close();

	// hide delete button from layer settings
	$("#lpiDeleteButton").css("display", "none");

	openMainMenu();
}

/**
 * Deletes LPI that is currently being drawn,
 * including all shapes and layers
 */
function promptDeleteCurrentlyDrawingLPI(){
	showConfirmCancelLPIModal()
}

function openNewLpi() {
	$(".landcoverMetaFormHolder").empty();
	$('#pointContinue').off();

	if(!isLoggedIn()){
		if (confirm("Your session expired, would you like to log back in? Press 'cancel' to continue viewing your current session.")) {
			location.reload();
		}
		cancelNewLpi();
		return;
	}

	// Update default values based on Unit System
	let ipWeight = $('input[name=ipWeight]');
	ipWeight.val(kgToLbs(getDefaultLpp().wgtKg))
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC){
		ipWeight.val(getDefaultLpp().wgtKg)
	}

	let ipLoad = $('input[name=ipLoad]');
	ipLoad.val(kgToLbs(getDefaultLpp().loadKg));
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC){
		ipLoad.val(getDefaultLpp().loadKg)
	}

	let minSpeedOfAdvance = $('input[name=minSpeedOfAdvance]');
	minSpeedOfAdvance.val(kphToMph(getDefaultLpp().minBaseSoa));
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC){
		minSpeedOfAdvance.val(getDefaultLpp().minBaseSoa)
	}

	let maxSpeedOfAdvance = $('input[name=maxSpeedOfAdvance]');
	maxSpeedOfAdvance.val(kphToMph(getDefaultLpp().maxBaseSoa))
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC){
		maxSpeedOfAdvance.val(getDefaultLpp().maxBaseSoa)
	}

	stateManagement.setSavedState(false)

	if(lpWrapper != null) {
		clearLayers(lpWrapper.getMapItemUUIDs());
	}

	// confirm button clicked listener
	$('#pointContinue').click(function(){
		if (shapeFinished) {
			console.log("called point continue")
			stopDrawing();
			hideHelperText();

			if(stateManagement.getLastState() === DRAW_LKP) {
				stateManagement.broadcastUpdate(MOTION_MODEL);
			}else if(stateManagement.getLastState() === RENDEZVOUS) {
				stateManagement.broadcastUpdate(KNOWN, false, lpWrapper.geospatialDescToRequired != null
					&& lpWrapper.geospatialDescToRequired[EXCLUSION_ZONE]);
			}else if(stateManagement.getLastState() === KNOWN) {
				stateManagement.broadcastUpdate(DISCOVERED, false, lpWrapper.geospatialDescToRequired != null
					&& lpWrapper.geospatialDescToRequired[EXCLUSION_ZONE]);
			}else if(stateManagement.getLastState() === DISCOVERED) {
				if (lpWrapper.landcoverMetadataEnabled) {
                    stateManagement.broadcastUpdate(META_LANDCOVER);
                } else {
                    stateManagement.broadcastUpdate(MOVEMENT_SCHEDULE);
                }
			}else if(stateManagement.getLastState() === BOUNDING_BOX) {
				stateManagement.broadcastUpdate(LKP);

				// pluggable motion model
				// -> order = GOAL_POINTS -> EXCLUSION or POLY EXCLUSION ZONES
			}else if(stateManagement.getLastState() === GOAL_POINTS){
				if(lpWrapper.applicableGeospatialInputs != null){
					if(lpWrapper.applicableGeospatialInputs.has(POLYGON_EXCLUSIONS)){
						stateManagement.broadcastUpdate(POLYGON_EXCLUSIONS, false,
							lpWrapper.geospatialDescToRequired != null && lpWrapper.geospatialDescToRequired[POLYGON_EXCLUSIONS]);
					}else if(lpWrapper.applicableGeospatialInputs.has(EXCLUSION_ZONE)){
						stateManagement.broadcastUpdate(KNOWN, false,
							lpWrapper.geospatialDescToRequired != null && lpWrapper.geospatialDescToRequired[EXCLUSION_ZONE]);
					}else if(lpWrapper.landcoverMetadataEnabled){
						stateManagement.broadcastUpdate(META_LANDCOVER);
					}else{
                        stateManagement.broadcastUpdate(MOVEMENT_SCHEDULE);
                    }
				}else{
					console.error("motion model inputs was null")
				}
			}else if(stateManagement.getLastState() === POLYGON_EXCLUSIONS){
                if (lpWrapper.landcoverMetadataEnabled) {
				    stateManagement.broadcastUpdate(META_LANDCOVER);
                } else {
                    stateManagement.broadcastUpdate(MOVEMENT_SCHEDULE);
                }
			}

			if (completedPoints && hadIssueWithPoint.size === 0) {
				pointMenu.close();
				completedPoints = false
				//$("#pointContinue").off()
				hadIssueWithPoint = new Set()
			}
			$('#confirmDraw').hide();
		}
	});
	if($(".leaflet-control-measure-on").length > 0) {
		bootbox.alert("The measurement control is currently active. Please turn this off by clicking the measurement tool icon, or hitting the Esc key, before entering new lost person information.");
		return;
	}

	//if(lpWrapper != null && hadErrorLast) {
	//	showConfirmCancelLPIModal()
	//}

	mainMenu.close();
	$('#openMainMenu').hide();
	var x = new Date();
	document.getElementById("lpiDate").value = x.getUTCFullYear() + "-" + ((x.getUTCMonth() + 1 < 10) ? ("0" + (x.getUTCMonth() + 1)) : (x.getUTCMonth() + 1)) + "-" + ((x.getUTCDate() < 10) ? ("0" + (x.getUTCDate())) : (x.getUTCDate())) + "T" + ((x.getHours() < 10) ? ("0" + x.getHours()) : (x.getHours())) + ":" + ((x.getUTCMinutes() < 10) ? ("0" + x.getUTCMinutes()) : (x.getUTCMinutes())) + ":" + ((x.getUTCSeconds() < 10) ? ("0" + x.getUTCSeconds()) : (x.getUTCSeconds()));
	lppMenu.open();
	document.getElementById("lpiName").value = getNextDefaultLPIName();
	lpWrapper = new LostPersonInputsWrapper;
	lpInputs = new LostPersonInputs;
	lpInputs.setattributeNameToValues(new Map());
	mapItems.push(lpWrapper);
}

function openLKP() {
	lkpMenu.open()
}

function openMotionModel() {
	mmMenu.open();

	$('input[name=motionModel]').click(function() {
        let model = ($('input[name=motionModel]').filter(":checked")[0].value);
        console.log("selected motion model = " + model);
        let modelSelected = motionModelsWithAttrs.get(model);
        let stayOutOfWaterEnabled = true;
        if(modelSelected != null && modelSelected != undefined){
           $("#ipWaterToggle").prop('checked', modelSelected._stayOutOfWaterEnabled)
           if(!modelSelected._stayOutOfWaterEnabled){
                stayOutOfWaterEnabled = false;
           }
        }

        modelSelected = motionModelsWithGeospatialAttrs.get(model);
        if(modelSelected != null && modelSelected != undefined){
           $("#ipWaterToggle").prop('checked', modelSelected._stayOutOfWaterEnabled)
           if(!modelSelected._stayOutOfWaterEnabled){
               stayOutOfWaterEnabled = false;
           }
        }

        if(stayOutOfWaterEnabled){
            $("#ipWaterToggle").show();
            $("#ipWaterToggleText").show();
        }else{
            $("#ipWaterToggle").hide();
            $("#ipWaterToggleText").hide();
        }

    });
}

/**
 * Creates motion model option in "Select motion model" menu
 *
 * @param name, name of motion model
 */
function createMotionModelDialogOption(name){
	$("#motionModelSelections").append(
		"<input type='radio' name='motionModel' id='" + name + "'" +
		" value='" + name + "'>" + name + "<br>")
}

function openWanderingParams() {
    wanderingParamsMenu.open();
	pointMenu.close();

	let incrementDistMeters = $('input[type=number][name=incrementDistMeters]');
	let defaultDistanceIncrementMeters = getDefaultWanderingParams()[DISTANCE_INCREMENT_METERS_DEFAULT_PARAM_NAME];
	incrementDistMeters.val(defaultDistanceIncrementMeters);
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
		incrementDistMeters.val(mToFeet(defaultDistanceIncrementMeters))
	}

	let maxDistanceInput = $('input[type=number][name=maxDistance]');
	let numSegments = getDefaultWanderingParams()[NUMBER_SEGMENTS_DEFAULT_PARAM_NAME];
	let maxDistanceKm = (numSegments * defaultDistanceIncrementMeters) / 1000; // (numSegments = maxDistance * 1000 / this.incrementDistMeters)
	maxDistanceInput.val(maxDistanceKm);
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
		maxDistanceInput.val(kmToMiles(maxDistanceKm))
	}

	let numberPathsConsidered = $('input[type=number][name=numberPathsConsidered]');
	numberPathsConsidered.val(getDefaultWanderingParams()[NUMBER_OPTIONS_DEFAULT_PARAM_NAME]);

	let courseChangeSigmaDegrees = $('input[type=number][name=courseChangeSigmaDegrees]');
	courseChangeSigmaDegrees.val(getDefaultWanderingParams()[COURSE_STD_DEFAULT_PARAM_NAME]);
}


function openGoalParams() {
	goalParamsMenu.open();
	pointMenu.close();

	/**
	 * Populate with landcover
	 */
	lpInputs.setLandcoverMetadata();

	let maxLegLengthInput = $('input[type=number][name=maxLegLength]');
	let maxLegLengthMeters = getDefaultGoalOrientedParams()[MAXIMUM_LEG_LENGTH_DEFAULT_PARAM];
	let maxLegLengthKM = maxLegLengthMeters / 1000;
	maxLegLengthInput.val(maxLegLengthKM);
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
		maxLegLengthInput.val(kmToMiles(maxLegLengthKM));
	}

	let awarenessRadiusInput = $('input[type=number][name=awarenessRadius]');
	let awarenessRadiusMeters = getDefaultGoalOrientedParams()[AWARENESS_RADIUS_DEFAULT_PARAM];
	let awarenessRadiusKM = awarenessRadiusMeters / 1000;
	awarenessRadiusInput.val(awarenessRadiusKM)
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
		awarenessRadiusInput.val(kmToMiles(awarenessRadiusKM));
	}

	let moveRadiusInput = $('input[type=number][name=moveRadius]');
	let moveRadiusMeters = getDefaultGoalOrientedParams()[MOVE_RADIUS_DEFAULT_PARAM];
	let moveRadiusKM = moveRadiusMeters / 1000;
	moveRadiusInput.val(moveRadiusKM);
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
		moveRadiusInput.val(kmToMiles(moveRadiusKM));
	}

	let minTurnAngleInput = $('input[type=number][name=minTurnAngle]');
	let minTurnAngle = getDefaultGoalOrientedParams()[MINIMUM_TURN_ANGLE_DEFAULT_PARAM];
	minTurnAngleInput.val(minTurnAngle);

	let maxTurnAngleInput = $('input[type=number][name=maxTurnAngle]');
	let maxTurnAngle = getDefaultGoalOrientedParams()[MAXIMUM_TURN_ANGLE_DEFAULT_PARAM];
	maxTurnAngleInput.val(maxTurnAngle);
}

function openMetaForm(){
	$(".landcoverMetaFormHolder").empty();
	landcoverMetaFormMenu.open();
	pointMenu.close();
	mvmtSchedMenu.close();

	// Don't show landcover metadata menu for VIZNAV
	if(osppreConfig.landcoverType !== NATIONAL_LANDCOVER_DATA_BASE){
		lpInputs.setLandcoverMetadata(null);
		lastState = "metaForm";
		broadcastUpdate();
	}else{
		var mParams = getDefaultMetadata();

		lpInputs.setLandcoverMetadata(mParams);
		console.log("landcover meta: " + lpInputs.getLandcoverMetadata());

		//mParams.metaDataItems.forEach(element => createLandcoverMetaCell(element))


		let metaLandInputTable = [
			"<table id='metaLandInputTable'>",
			"<tr>\n",
			"    <th style='background: #e2e0e0;'>Color</th>\n",
			"    <th style='background: #e2e0e0;'>Code</th>\n",
			"    <th style='background: #e2e0e0;'>Landcover Description</th>\n",
			"    <th style='background: #e2e0e0;'>Cost</th>\n",
			"    <th style='background: #e2e0e0;'><div></div>SOA<span style='margin-left: 4px; font-size: small'><i class='fa fa-info-circle' data-toggle='tooltip' title='Speed of Advance Factor'></i></span></th>\n",
			"  </tr>",
			"</table>"
		].join('')

		$(".landcoverMetaFormHolder").append(metaLandInputTable);
		mParams.metaDataItems.forEach(element => createLandcoverMetaRow(element))
	}

}
function createLandcoverMetaRow(metaDataItem){
	let row = ([
					"<tr>",
					"<td class='landcoverCell'><div class='lpiInfoColor' style='background-color: " + RGBToHex(metaDataItem.rgbColor[0], metaDataItem.rgbColor[1], metaDataItem.rgbColor[2]) + "'></div></td>",
					"<td class='landcoverCell'>" + metaDataItem.lcCode + "</td>",
					"<td class='landcoverCell' style='min-width: 210px;'>" + metaDataItem.shortDescription + "<span style='margin-left: 4px; font-size: small'><i class='fa fa-info-circle' data-toggle='tooltip' title='",
					metaDataItem.detailedDescription,
					"'></i></span></td>",
					"<td class='landcoverCell'><input class='metaCost landcoverMetaSubContainer' value='" + metaDataItem.cost + "'></td>",
					"<td class='landcoverCell'><input class='metaSoa landcoverMetaSubContainer' value='" + metaDataItem.soaFactor + "'></td>",
					"<td style='display: none' class='landcoverCell'><input class='metaTrp landcoverMetaSubContainer' value='" + metaDataItem.terrainResourceParameter + "'></td>",
					"</tr>"
				].join(''))
	$('#metaLandInputTable').append(row);
}


function createLandcoverMetaCell(item){
	console.log("key = " + item.lcCode)
	console.log("value = " + item.soaFactor)
	$(".landcoverMetaFormHolder").append("" +
		"<div class='metaItemContainer'>" +
		"<div class='landcoverMetaSubContainer'><label class='lcMetaDataLabel' for='metaCode'>Code:</label>" +
		"<div class='metaCode'>" + item.lcCode + "</div>" +
		"<div class='metaDataColor' style='background-color: " + RGBToHex(item.rgbColor[0], item.rgbColor[1], item.rgbColor[2]) + "'></div></div>" +
		"<div class='landcoverMetaSubContainer'  style='align-items: flex-start'><label class='lcMetaDataLabel' for='metaDescription'>Description:</label>" +
		"<div class='metaDescription'>" + item.shortDescription + "</div></div>" +
		"<div class='landcoverMetaSubContainer'><label class='lcMetaDataLabel' for='metaCost'>Cost:</label>" +
		"<input class='metaCost' value='" + item.cost + "'></div>" +
		"<div class='landcoverMetaSubContainer'><label class='lcMetaDataLabel' for='metaSoa'>SOA:</label>" +
		"<input class='metaSoa' value='" + item.soaFactor + "'></div>" +
		"<div class='landcoverMetaSubContainer' style='align-items: flex-start'><label class='lcMetaDataLabel' for='metaLongDescription'>Details:</label>" +
		"<div class='metaLongDescription'>" + item.detailedDescription + "</div></div>" +
		"</div>" +
		"<hr style='width:50%;text-align:left;margin-left:0'>")
}

function openMvmtSched() {
	landcoverMetaFormMenu.close();
	pointMenu.close();
	mvmtSchedMenu.open();
}

function openParachuteDrop() {
	parachuteMenu.open();
}

var enterInputSOAWarning = false;

//called when the user hits continue on the lost person parameters page
document.getElementById("lppContinue").addEventListener("click", function() {
	if (!checkFormStatus("lppMenu")) {
		return;
	}

	let duration = $('input[name=duration]').val();
	let maxDuration = (duration === "") ? -1 : duration;
	let ipWeight = $('input[name=ipWeight]').val();
	let loadWeight = $('input[name=ipLoad]').val();

	let ipp = new IsolatedPersonParameters(
		layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
			? lbsToKg(ipWeight) :
			ipWeight,
		layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
			? lbsToKg(loadWeight) :
			loadWeight,
		$('input[name=stealthSpeed]').val(),
		maxDuration,
	);

	// this usually happens when we lose focus on maxSOA, but since it is the last input we sometimes don't trigger the
	// lost focus before this method is called, and then the (stale) warning makes the continue not go to the next page
	checkMaxSOA();

	let minSpeedOfAdvanceInput = $('input[name=minSpeedOfAdvance]').val();
	let maxSpeedOfAdvanceInput = $('input[name=maxSpeedOfAdvance]').val();

	if($('#lppWarning').text() !== ''){
		return;
	}else if(!minSpeedOfAdvanceInput){
		showLPPWarning(true, "Please enter min speed of advance");
		enterInputSOAWarning = true;
		return;
	}else if(!maxSpeedOfAdvanceInput){
		showLPPWarning(true, "Please enter max speed of advance");
		enterInputSOAWarning = true;
		return;
	}

	// miles per hour to kilometers per hour to meters per millisecond
	ipp.setMinBaseSoa(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
		? (mphToMetersPerSec(minSpeedOfAdvanceInput) / 1000) :
		(kphToMetersPerSec(minSpeedOfAdvanceInput) / 1000))
	ipp.setMaxBaseSoa(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
		? (mphToMetersPerSec(maxSpeedOfAdvanceInput) / 1000) :
		(kphToMetersPerSec(maxSpeedOfAdvanceInput) / 1000))

	lpInputs.setIpp(ipp);
	//lpInputs.setStartTime(new Date($('#lpiDate').val()).getTime());
	lpInputs.setStartTime(new Date(moment.tz($('#lpiDate').val(),$('input[name=timezone]').filter(':checked')[0].value)).getTime());

	let name = $('input[name=lpiName]').val()
	lpInputs.setName(name);

	let username = getCookie("username")
	let usernames = getCookie("usernameAttempts")

	if(usernames != null) {
		usernames = JSON.parse(usernames)
		let usernames2 = []
		for (let i = 0; i < usernames; i++) {
			let tempUsername = usernames[i];
			if (!tempUsername.startsWith("Test " + username) && !tempUsername.startsWith(username)) {
				usernames2.push(tempUsername)
			}
		}
		usernames2 = JSON.stringify(usernames2)
		setCookie("usernameAttempts", usernames2, 0)
	}

	stateManagement.broadcastUpdate(BOUNDING_BOX)

	lppMenu.close();
});

function openBoundingBox(){
	showHelperText("Hold down the left mouse button and drag to draw the bounding box. You may attempt drawing multiple times.");
	lpWrapper = drawItem(BOUNDING_BOX, lpWrapper);
}

//called when the user hits continue on the lkp selection page
document.getElementById("lkpContinue").addEventListener("click", function() {
	if (!checkFormStatus("lkpMenu")) {
		return;
	}
	showHelperText("Select the last known position of the lost person.");
	lpWrapper.setLkpType($('input[name=lkpShape]').filter(":checked")[0].value);
	lkpMenu.close();
	stateManagement.broadcastUpdate(DRAW_LKP)
});

function openDrawLKPShape(){
	showHelperText("Select the last known position of the lost person.");

	if(lpWrapper.getLkpType() === "parachute")
		lastState = 'parachute';
	lpWrapper = drawItem(lpWrapper.getLkpType() + "LKP", lpWrapper);
}

$("#lpiPointLat").on('input', function() {
	var lat = $("#lpiPointLat").val();
	var lon = $("#lpiPointLon").val();

	if(lat != null && lon != null){
		if (lpInstance.getLkpUUIDs() != null && lpInstance.getLkpUUIDs().length > 0) {
			drawnItems.removeLayer(lpInstance.getLkpUUIDs());
			lpInstance.lkpUUIDs.pop();
		}

		const circle = L.circleMarker([lat, lon], {
			color: setColor('orange'),
			repeatMode: true,
			metric: ['km', 'm'],
			feet: false,
		});

		drawnItems.addLayer(circle);
		lpInstance.addLkpUUID(circle._leaflet_id);
	}
});

var newLPIPointCancelListener = function(){
	showConfirmCancelLPIModal()
}

function showConfirmCancelLPIModal(){
	$('#cancelLPIModal').modal("show");

	document.getElementById("backButtonLPI").addEventListener("click", function() {
		$('#cancelLPIModal').modal("hide");
		stateManagement.broadcastUpdate(stateManagement.getLastState())
		$("#backButtonLPI").off( "click", "**" );
	})

	document.getElementById("cancelButtonLPI").addEventListener("click", function() {
		if(stateManagement.getSavedStateType() === LPI) {
			$("#pointContinue").off()
			hadIssueWithPoint = new Set()
			pointMenu.close();
			cancelNewLpi()
		}else if(stateManagement.getSavedStateType() === SEARCH) {
			cancelSearch()
		}else{ // is AAR
			delete aarStates[AAR_INFO]
			delete aarStates[AAR_UP_FRONT]
			delete aarStates[AAR_SEARCH]
			delete aarStates[AAR_LP_FEEDBACK]

			removeAARPoints()
			openMainMenu();
		}
		stateManagement.setSavedFormState(null);
		$("#cancelButtonLPI").off( "click", "**" );
		$('#cancelLPIModal').modal("hide");
	})

	document.getElementById("saveButtonLPI").addEventListener("click", function() {
		stateManagement.setSavedState(true)
		openMainMenu()
		$("#saveButtonLPI").off( "click", "**" );
		$('#cancelLPIModal').modal("hide");

		if(stateManagement.getSavedStateType() === AAR) {
			removeAARPointDrawer()

			let searchSize = 0;
			map.eachLayer(
				function (layer) {
					if (layer.finderInfo !== undefined && layer.finderInfo.finderElementType === "search") {
						if (layer.finderInfo.name !== undefined) {
							searchSize = searchSize + 1;
						}
					}
				}
			)

			let searchList = getSearchesInputs(searchSize, true)
			aarState.aarInfo.setSearchAfterActionReports(searchList);
			stateManagement.setSavedFormState(aarState)
			aarStates[AAR_SEARCH] = cloneHTML($("#aarContent"));
		}
	})
}

function removeAARPointDrawer(){
	cancelAARPointListener()
	removeAARPoints();

	$('#addPointAAR').hide();
	hideHelperText();
	map.closePopup();
	stopDrawing();
	pointMenu.close();

	if(drawnAARPoints !== null && drawnAARPoints !== undefined) {
		for (let i = 0; i < drawnAARPoints.length; i++) {
			drawnItems.removeLayer(drawnAARPoints[i])
		}
	}

	$("#slider").show();
	statusBar.open();

	numberOfNonShapePointsDrawn = 0
	drawnAARPoints = new L.FeatureGroup();
}


// called when the user hits continue in the lkp point
//document.getElementById("pointContinue").addEventListener("click", newLPIPointListener)
document.getElementById("pointCancel").addEventListener("click", newLPIPointCancelListener)

//called when the user hits continue on the parachute drop parameters page
document.getElementById("pdContinue").addEventListener("click", function() {
	var listPts = [];
	for (var i = 0; i < drawnItems._layers[lpWrapper.getLkpUUIDs()].getLatLngs().length; i++) {
		var pt = {};
		pt.latRad = toRadians(drawnItems._layers[lpWrapper.getLkpUUIDs()].getLatLngs()[i].lat);
		pt.lonRad = toRadians(drawnItems._layers[lpWrapper.getLkpUUIDs()].getLatLngs()[i].lng);
		listPts.push(pt);
	}
	pdParams = new ParachuteDropParameters(
			listPts[0],
			listPts[1],
			$('input[name=sigmaUncertainty]').val(),
			$('input[name=parachuteAltitude]').val(),
			$('input[name=windSpeed]').val(),
			$('input[name=windDirection]').val()
	);
	parachuteMenu.close();
	openMotionModel();
});



//called when the user hits continue on the motion model page
document.getElementById("mmContinue").addEventListener("click", function() {
	if (!checkFormStatus("mmMenu")) {
		return;
	}
	let model = ($('input[name=motionModel]').filter(":checked")[0].value);
	lpInputs.setModel(model);

    // Should we display landcover metadata?
    let motionModelInfo = null;
    if (motionModelsWithAttrs.has(model)) {
        motionModelInfo = motionModelsWithAttrs.get(model);
    } else if (motionModelsWithGeospatialAttrs.has(model)) {
        motionModelInfo = motionModelsWithGeospatialAttrs.get(model);
    }

    if (model != null && motionModelInfo != null && motionModelInfo.landcoverMetadataEnabled != null
        && motionModelInfo.landcoverMetadataEnabled != undefined) {
        lpWrapper.landcoverMetadataEnabled = motionModelInfo.landcoverMetadataEnabled;
    } else {
        lpWrapper.landcoverMetadataEnabled = true;
    }

	let stayOutOfWater = $('#ipWaterToggle:checked').is(':checked');
	console.log("Stay out of water: " + stayOutOfWater);
	lpInputs.setStayOutOfWater(stayOutOfWater);

	mmMenu.close();
	stateManagement.broadcastUpdate(model);
});

document.getElementById("wanderingParamsContinue").addEventListener("click", function() {
	if(checkWanderingParams()) {
		console.log("submitting wandering params");
		var wParams = new WanderingParameters(
			$('input[name=incrementDistMeters]').val(),
			$('input[name=maxDistance]').val(),
			$('input[name=numberPathsConsidered]').val(),
			$('input[name=courseChangeSigmaDegrees]').val()
		);
		lpInputs.getIpp().setWanderingParameters(wParams);
		wanderingParamsMenu.close();
        if (lpInputs.landcoverMetadataEnabled) {
		    stateManagement.broadcastUpdate(META_LANDCOVER);
        } else {
            stateManagement.broadcastUpdate(MOVEMENT_SCHEDULE);
        }
	}
});

document.getElementById("goalParamsContinue").addEventListener("click", function() {
	if (checkGoalParams()) {
		console.log("submitting goal params");

		let awarenessRadius = $('input[name=awarenessRadius]');
		let moveRadius = $('input[name=moveRadius]');
		let maxLegLength = $('input[name=maxLegLength]');
		let gParams = new GoalParameters(
			layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL ?
				feetToM(milesToFeet(awarenessRadius.val())) : kmToMeters(awarenessRadius.val()),
			layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL ?
				feetToM(milesToFeet(moveRadius.val())) : kmToMeters(moveRadius.val()),
			$('input[name=minTurnAngle]').val(),
			$('input[name=maxTurnAngle]').val(),
			layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL ?
				feetToM(milesToFeet(maxLegLength.val())) : kmToMeters(maxLegLength.val()),
		);

		lpInputs.setGoalOrientedParams(gParams);
		goalParamsMenu.close();

        if (lpWrapper.landcoverMetadataEnabled) {
		    stateManagement.broadcastUpdate(META_LANDCOVER);
        }
	}
});

document.getElementById("landcoverMetaContinue").addEventListener("click", function() {
	console.log("submitting meta data params");
	let landcoverMetadata = lpInputs.getLandcoverMetadata()

	let i = 0
	$(".metaCost").each(function(){
		landcoverMetadata.metaDataItems[i].cost = this.value;
		i += 1;
	})

	i = 0
	$(".metaSoa").each(function(){
		landcoverMetadata.metaDataItems[i].soaFactor = this.value;
		i += 1;
	})

	lpInputs.setLandcoverMetadata(landcoverMetadata);

	landcoverMetaFormMenu.close();
	$(".landcoverMetaFormHolder").empty();

	stateManagement.broadcastUpdate(MOVEMENT_SCHEDULE);
});

document.getElementById("resetMeta").addEventListener("click", function() {
    $.ajax("/webmap/servlet/?action=getDefaultLandcover").done(function (landcoverMetadata) {
        if (landcoverMetadata === null || landcoverMetadata === undefined || landcoverMetadata.length === 0) {
            console.log("Received empty message from getDefaultLandcover request");
            return;
        }
        console.log("Received default landcover metadata: " + landcoverMetadata);
        setDefaultMetadata(landcoverMetadata)
        openMetaForm();
    });
});

//called when the user hits submit at the end of creating a new lpi
document.getElementById("newLpiSubmit").addEventListener("click", function() {
	$("#mainMenuContinueBtn").hide()

	if (!checkFormStatus("mvmtSchedMenu")) {
		return;
	}
	lpInputs.setMoveSchedule(($('input[name=mvmtSched]').filter(":checked")[0].value).toUpperCase());
	console.log("ready to submit LPI form");
	lpInputs = returnNewLpi();

	// for time zones we include quotes because that is how Java serializes TimeZone objects
	let selectedTimezone = $('input[name=timezone').filter(':checked')[0].value;
	lpInputs.setTimezone(selectedTimezone);

	// Add attempted username to cookie / cache
	let usernames = getCookie("usernameAttempts")
	if(usernames != null) {
		usernames = JSON.parse(usernames)
	}else{
		usernames = []
	}
	usernames.push(lpInputs.getName())

	setCookie("usernameAttempts", JSON.stringify(usernames), 0)

	if (lpWrapper.getLkpType() == 'circle') {
		var centerPt = {
			latRad: toRadians(drawnItems._layers[lpWrapper.getLkpUUIDs()].getLatLng().lat),
			lonRad: toRadians(drawnItems._layers[lpWrapper.getLkpUUIDs()].getLatLng().lng)
		}
		var lpCircle = new CircleScenarioInputs(
			lpInputs.getBoundingBox(),
			lpInputs.getIpp(),
			lpInputs.getMoveSchedule(),
			lpInputs.getName(),
			lpInputs.getPolyExclnZones(),
			lpInputs.getRendezvousPoints(),
			lpInputs.getSearchInterval(),
			lpInputs.getStartTime(),
			lpInputs.getModel(),
			lpInputs.getExclusionZones(),
			centerPt,
			drawnItems._layers[lpWrapper.getLkpUUIDs()].getRadius(),
			lpInputs.getTimezone(),
            lpInputs.getDeploymentMode(),
			lpInputs.getStayOutOfWater(),
			lpInputs.getGoalOrientedParams(),
			lpInputs.getLandcoverMetadata(),
			lpInputs.getRandomSeed(),
			lpInputs.getRequestId(),
			lpInputs.getattributeNameToValues()
		);
		lpCircle.setRequestId(randUUID())
		lpCircle.attributeNameToValues = Object.fromEntries(lpInputs.getattributeNameToValues());
		lpWrapper.setLostPersonInputs(lpCircle);
		lpWrapper.setLkpType('circular');
	}
	else if (lpWrapper.getLkpType() == 'point') {
		var listPts = [];
		for (var i = 0; i < lpWrapper.getLkpUUIDs().length; i++) {
			var pt = {};
			pt.latRad = toRadians(drawnItems._layers[lpWrapper.getLkpUUIDs()[i]].getLatLng().lat);
			pt.lonRad = toRadians(drawnItems._layers[lpWrapper.getLkpUUIDs()[i]].getLatLng().lng);
			listPts.push(pt);
		}
		var lpPoint = new PointScenarioInputs(
			lpInputs.getBoundingBox(),
			lpInputs.getIpp(),
			lpInputs.getMoveSchedule(),
			lpInputs.getName(),
			lpInputs.getPolyExclnZones(),
			lpInputs.getRendezvousPoints(),
			lpInputs.getSearchInterval(),
			lpInputs.getStartTime(),
			lpInputs.getModel(),
			lpInputs.getExclusionZones(),
			listPts,
			lpInputs.getTimezone(),
            lpInputs.getDeploymentMode(),
			lpInputs.getStayOutOfWater(),
			lpInputs.getGoalOrientedParams(),
			lpInputs.getLandcoverMetadata(),
			lpInputs.getRandomSeed(),
			lpInputs.getRequestId(),
			lpInputs.getattributeNameToValues()
		);
		lpPoint.setRequestId(randUUID())
		lpPoint.attributeNameToValues = Object.fromEntries(lpInputs.getattributeNameToValues());
		lpWrapper.setLostPersonInputs(lpPoint);
	}
	else if (lpWrapper.getLkpType() == 'polygon') {
		var listPts = [];
		for (var i = 0; i < drawnItems._layers[lpWrapper.getLkpUUIDs()[0]].getLatLngs()[0].length; i++) {
			var pt = {};
			pt.latRad = toRadians(drawnItems._layers[lpWrapper.getLkpUUIDs()[0]].getLatLngs()[0][i].lat);
			pt.lonRad = toRadians(drawnItems._layers[lpWrapper.getLkpUUIDs()[0]].getLatLngs()[0][i].lng);
			listPts.push(pt);
		}
		var lpPolygon = new PolygonScenarioInputs(
			lpInputs.getBoundingBox(),
			lpInputs.getIpp(),
			lpInputs.getMoveSchedule(),
			lpInputs.getName(),
			lpInputs.getPolyExclnZones(),
			lpInputs.getRendezvousPoints(),
			lpInputs.getSearchInterval(),
			lpInputs.getStartTime(),
			lpInputs.getModel(),
			lpInputs.getExclusionZones(),
			listPts,
			lpInputs.getTimezone(),
            lpInputs.getDeploymentMode(),
			lpInputs.getStayOutOfWater(),
			lpInputs.getGoalOrientedParams(),
			lpInputs.getLandcoverMetadata(),
			lpInputs.getRandomSeed(),
			lpInputs.getRequestId(),
			lpInputs.getattributeNameToValues()
		);
		lpPolygon.setRequestId(randUUID())
		lpPolygon.attributeNameToValues = Object.fromEntries(lpInputs.getattributeNameToValues());
		lpWrapper.setLostPersonInputs(lpPolygon);

	}
	else if (lpWrapper.getLkpType() == 'parachute') {
		var lpParachute = new ParachuteDropScenarioInputs(
			lpInputs.getBoundingBox(),
			lpInputs.getIpp(),
			lpInputs.getMoveSchedule(),
			lpInputs.getName(),
			lpInputs.getPolyExclnZones(),
			lpInputs.getRendezvousPoints(),
			lpInputs.getSearchInterval(),
			lpInputs.getStartTime(),
			lpInputs.getModel(),
			lpInputs.getExclusionZones(),
			pdParams.getFirstBailoutPt(),
			pdParams.getLastBailoutPt(),
			pdParams.getPos2SigUncertMeters(),
			pdParams.getAltitudeFeet(),
			pdParams.getWindSpeedKts(),
			pdParams.getWindDirNavDeg(),
			lpInputs.getTimezone(),
            lpInputs.getDeploymentMode(),
			lpInputs.getStayOutOfWater(),
			lpInputs.getGoalOrientedParams(),
			lpInputs.getLandcoverMetadata(),
			lpInputs.setRandomSeed(randomSeed),
			lpInputs.getRequestId(),
			lpInputs.getattributeNameToValues()
		);
		lpParachute.setRequestId(randUUID())
		lpPoint.attributeNameToValues = Object.fromEntries(lpInputs.getattributeNameToValues());
		lpWrapper.setLostPersonInputs(lpParachute);
		lpWrapper.setLkpType('parachuteDrop');
	}

	lpInputs = lpWrapper.getLostPersonInputs()


//	$.post(
//			'http://192.168.50.120:8081/FINDER/newLostPersonInstance/' + lpWrapper.getLkpType() + 'LKP',
//			JSON.stringify(lpWrapper.getLostPersonInputs())
//			)
//			.done(function(data) {console.log(data);});
	console.log('Submitting web sockets request');
	try {
		let socket = createWebSocket('FINDER/newLostPersonInstance/' + lpWrapper.getLkpType() + 'LKP');

		socket.onopen = function(e) {
			console.log('[open] connection established');
			console.log('Initiating keep-alive on socket');
			keepAlive(this);
			console.log('LOST PERSON INSTANCE INPUTS: ' + JSON.stringify(lpWrapper.getLostPersonInputs()));

			console.log(lpWrapper)
			socket.send(JSON.stringify(lpWrapper.getLostPersonInputs()));
			mvmtSchedMenu.close();
			openMainMenu();
		};
		socket.onclose = function(e) {
			if (e.wasClean) {
				console.log('[close] connection closed cleanly, code=${e.code} reason=${e.reason}');
			} else {
				console.log('[close] connection died');
			}
			mvmtSchedMenu.close();
			openMainMenu();
		};
		socket.onerror = function(error) {
			console.log('[error] ${error.message}');
			mvmtSchedMenu.close();
			openMainMenu();

			$("#lpiDeleteButton").css("display", "block");
			if(error.message === undefined){
				if(confirm("There was an unknown networking error while processing LPI request\nWould you like to clear this LPI from the map? \nAlternatively, when ready, you can clear this LPI in layer settings.")){
					cancelNewLpi();
				}
			}else{
				if(confirm("There was a networking error while processing LPI request:\n" + error.message + "\nWould you like to clear this LPI from the map? \nAlternatively, when ready, you can clear this LPI in layer settings.")){
					cancelNewLpi();
				}
			}
		};
		socket.onmessage = function(msg) {
			console.log(msg.data);
			setStatus(msg.data);

			if(msg.data !== null && msg.data !== undefined && msg.data.includes("Successfully created Lost Person Instance")) {
				clearMap()
				setTimeout(function() {getLPIsFromServer(lpInputs.requestId, true)}, 2000);
			}
		};
	}catch (error) {
		console.log(error.message);
		$("#lpiDeleteButton").css("display", "block");
		if(error.message === undefined){
			if(confirm("There was an unknown networking error while processing LPI request\nWould you like to clear this LPI from the map? \nAlternatively, when ready, you can clear this LPI in layer settings.")){
				cancelNewLpi();
			}
		}else{
			if(confirm("There was a networking error while processing LPI request:\n" + error.message + "\nWould you like to clear this LPI from the map? \nAlternatively, when ready, you can clear this LPI in layer settings.")){
				cancelNewLpi();
			}
		}
	}
});

function promptForDeleteOfLPI() {
	if(isOperationalUse()) {
		promptForOperatinalDeleteOfLPI();
	} else {
		promptForTestingDeleteOfLPI();
	}
}

function promptForTestingDeleteOfLPI() {
	let dialog = bootbox.dialog({
		title: 'Delete Lost Person Instances',
		message: buildLPIDeletionTable(),
		size: 'large',
		buttons: {
			cancel: {
				label: "Cancel",
				className: 'btn-danger',
			},
			noclose: {
				label: "Reset",
				className: 'btn-warning',
				callback: function () {
					for (var i = 0; i < lpis.lostPersonInstances.length; i++) {
						var id = lpis.lostPersonInstances[i].id;
						$("#cb_" + id).prop('checked', false);
					}
					return false;
				}
			},
			ok: {
				label: "Delete Selected",
				className: 'btn-info',
				callback: function () {
					for (var i = 0; i < lpis.lostPersonInstances.length; i++) {
						var id = lpis.lostPersonInstances[i].id;
						if ($("#cb_" + id).is(':checked')) {
							console.log("Deleting LPI " + lpis.lostPersonInstances[i].id);
							deleteLPI(id);
						}
					}
				}
			}
		}
	});

	$('#allLostPersonsDelete').change(function() {
		for (var i = 0; i < lpis.lostPersonInstances.length; i++) {
			var id = lpis.lostPersonInstances[i].id;
			$("#cb_" + id).prop('checked', this.checked);
		}
	});
}

function buildLPIDeletionTable() {
	var table = "Select lost person instances to delete, and then click the Delete Selected button.<br><br><table>";
	table += "<tr><th><input type='checkbox' id='allLostPersonsDelete'/>Select</th><th>Lost Person Instance Identifier</th></tr>";
	for(var i = 0; i < lpis.lostPersonInstances.length; i++) {
		var id = "cb_" + lpis.lostPersonInstances[i].id;
		table += "<tr><td style='padding-left: 9px;'><input type='checkbox' id='" + id + "' name='" + id + "'/></td><td>" + lpis.lostPersonInstances[i].name + "</td></tr>";
	}
	table += "</table>";

	return table;
}

function promptForOperatinalDeleteOfLPI() {
	var lpiID = $("#lostPersonSelect").val();
	var lpiName = $("#lostPersonSelect").children("option:selected").text();

	if(lpiID == NO_LPI_MARKER) {
		bootbox.alert("Please first select a lost person.");
		return;
	}

	bootbox.confirm({
	    title: "Delete lost person: " + lpiName,
	    message: "Do you want to delete " + lpiName + "? This cannot be undone.",
	    buttons: {
	        cancel: {
	            label: '<i class="fa fa-times"></i> Cancel'
	        },
	        confirm: {
	            label: '<i class="fa fa-check"></i> Confirm'
	        }
	    },
	    callback: function (result) {
	        if(result) {
	        	deleteLPI(lpiID);
	        }
	    }
	});
}

function deleteLPI(lpiID) {
	clearMap();
	clearLPI(lpiID)
	$('#overlays').children().remove();
	sliderContainer.close();

	console.log('Submitting web sockets request to delete LPI: ' + lpiID);
    let socket = createWebSocket('FINDER/deleteLostPersonInstance');
    socket.onopen = function(e) {
        console.log('[open] connection established');
        socket.send(lpiID);
    };
    socket.onclose = function(e) {
        if (e.wasClean) {
            console.log('[close] connection closed cleanly, code=${e.code} reason=${e.reason}');
        } else {
            console.log('[close] connection died');
        }
    };
    socket.onerror = function(error) {
        console.log('[error] ${error.message}');
    };
    socket.onmessage = function(msg) {
        console.log(msg.data);
        setStatus(msg.data);

		if(lpiID === getCurrentLPIID()){
			document.getElementById("lostPersonSelect").value = NO_LPI_MARKER
			getLPIsFromServer();
		}else {
			getLPIsFromServer(getCurrentLPIID());
		}
    };
}

/**
 * The below functions (beginning with return) each return
 * either an object or array of the given shapes referenced
 * by the _leaflet_id (referred to as uuid).
 */

function returnBoundingBox() {
	let boundingObj = {};
	if(lpWrapper != null && lpWrapper.getBoundingBoxUUID() != null) {
		boundingObj.eastLonDeg = drawnItems._layers[lpWrapper.getBoundingBoxUUID()].getBounds()._northEast.lng;
		boundingObj.northLatDeg = drawnItems._layers[lpWrapper.getBoundingBoxUUID()].getBounds()._northEast.lat;
		boundingObj.southLatDeg = drawnItems._layers[lpWrapper.getBoundingBoxUUID()].getBounds()._southWest.lat;
		boundingObj.westLonDeg = drawnItems._layers[lpWrapper.getBoundingBoxUUID()].getBounds()._southWest.lng;
	}
	return boundingObj;
}



function returnRendezvousPts() {
	const rendezvousArr = [];
	for(let point of lpWrapper.getRendezvousPointUUIDs()){
		const obj = {};
		obj.latRad = toRadians(drawnItems._layers[point].getLatLng().lat);
		obj.lonRad = toRadians(drawnItems._layers[point].getLatLng().lng);
		rendezvousArr.push(obj);
	}
	return rendezvousArr;
}

function returnExclusionZones() {
	var exclusionArr = [];
	for (var i = 0; i < lpWrapper.getKnownExclusionZoneUUIDs().length; i++) {
		var obj = {}
		var ptValues = {}
		obj.known = true;
		ptValues.latRad = toRadians(drawnItems._layers[lpWrapper.getKnownExclusionZoneUUIDs()[i]].getLatLng().lat);
		ptValues.lonRad = toRadians(drawnItems._layers[lpWrapper.getKnownExclusionZoneUUIDs()[i]].getLatLng().lng);
		obj.pt = ptValues;
		obj.radius = drawnItems._layers[lpWrapper.getKnownExclusionZoneUUIDs()[i]].getRadius();
		exclusionArr.push(obj);
	}
	for (var i = 0; i < lpWrapper.getDiscoveredExclusionZoneUUIDs().length; i++) {
		var obj = {}
		var ptValues = {}
		obj.known = false;
		ptValues.latRad = toRadians(drawnItems._layers[lpWrapper.getDiscoveredExclusionZoneUUIDs()[i]].getLatLng().lat);
		ptValues.lonRad = toRadians(drawnItems._layers[lpWrapper.getDiscoveredExclusionZoneUUIDs()[i]].getLatLng().lng);
		obj.pt = ptValues;
		obj.radius = drawnItems._layers[lpWrapper.getDiscoveredExclusionZoneUUIDs()[i]].getRadius();
		exclusionArr.push(obj);
	}

	return exclusionArr;
}

function returnPolyPts() {
	var polyExclnArr = [];
	for (var i = 0; i < lpWrapper.getPolyExclusionZoneUUIDs().length; i++) {
		var vertices = [];
		for (var x = 0; x < drawnItems._layers[lpWrapper.getPolyExclusionZoneUUIDs()[i]].getLatLngs()[0].length; x++) {
			var obj = {};
			obj.latRad = toRadians(drawnItems._layers[lpWrapper.getPolyExclusionZoneUUIDs()[i]].getLatLngs()[0][x].lat);
			obj.lonRad = toRadians(drawnItems._layers[lpWrapper.getPolyExclusionZoneUUIDs()[i]].getLatLngs()[0][x].lng);
			vertices.push(obj);
		}
		var polyExclusionZone = {};
		polyExclusionZone.vertices = vertices;
		polyExclnArr.push(polyExclusionZone);

	}
	return polyExclnArr;
}

function returnNewLpi() {
	lpInputs.setExclusionZones(returnExclusionZones());
	lpInputs.setRendezvousPoints(returnRendezvousPts());
	lpInputs.setPolyExclnZones(returnPolyPts());
    var operationalUseStr = sessionStorage.getItem('operationalUse');
    var operationalUse = operationalUseStr !== null && operationalUseStr === 'true';
    console.log("Operational use: " + operationalUse);
    lpInputs.setDeploymentMode(operationalUse);
	return lpInputs;
}

/**
 * Below click event listeners are added to the back
 * buttons in the new lpi menus.
 *
 */
$('#backToMainLpi').click(function() {
	showConfirmCancelLPIModal()
});

$('#backToLPP').click(function() {
	lkpMenu.close();
	drawnItems.removeLayer(lpWrapper.getBoundingBoxUUID());
	lpWrapper.boundingBoxUUID = undefined;
	$('.incompleteText').text("");
	lppMenu.open();
	stateManagement.broadcastUpdate(LPP)
});


$('.backToLKP').click(function() {
	pointMenu.close();
	$("#confirmDraw").hide();
	stopDrawing();
	hideHelperText();

	if(stateManagement.getLastState() === AAR_DRAW_AAR){
		removeAARPoints();
		stateManagement.broadcastUpdate(AAR_LP_FEEDBACK)
	}else if(stateManagement.getLastState() === LPP){
		clearMapBounding()
		stateManagement.broadcastUpdate(LPP)
	}else if(stateManagement.getLastState() === RENDEZVOUS){
		clearLayers(lpWrapper.getRendezvousPointUUIDs());
		lpWrapper.rendezvousPointUUIDs = new Set();
		stateManagement.broadcastUpdate(MOTION_MODEL)
	} else if(stateManagement.getLastState() === KNOWN){
		clearLayers(lpWrapper.getKnownExclusionZoneUUIDs());
		lpWrapper.knownExclusionZoneUUIDs = [];
		clearLayers(lpWrapper.getRendezvousPointUUIDs());
		lpWrapper.rendezvousPointUUIDs = new Set();
		if(lpWrapper.applicableGeospatialInputs != null){
			if(lpWrapper.applicableGeospatialInputs.has(GOAL_POINTS)){
				clearLayers(lpWrapper.getRendezvousPointUUIDs());
				lpWrapper.rendezvousPointUUIDs = new Set();
				stateManagement.broadcastUpdate(GOAL_POINTS, false,
					lpWrapper.geospatialDescToRequired != null && lpWrapper.geospatialDescToRequired[GOAL_POINTS]);
			} else if (motionModelsWithAttrs.has(lpInputs.theModel)) { // there are motion model attributes
				stateManagement.broadcastUpdate(lpInputs.theModel);
			} else { // there are no motion model attributes
                stateManagement.broadcastUpdate(MOTION_MODEL);
            }
		}else {
			stateManagement.broadcastUpdate(RENDEZVOUS)
		}
	}else if(stateManagement.getLastState() === DISCOVERED){
		clearLayers(lpWrapper.getDiscoveredExclusionZoneUUIDs());
		lpWrapper.discoveredExclusionZoneUUIDs = [];
		clearLayers(lpWrapper.getKnownExclusionZoneUUIDs());
		lpWrapper.knownExclusionZoneUUIDs = [];
		stateManagement.broadcastUpdate(KNOWN, false, lpWrapper.geospatialDescToRequired != null
			&& lpWrapper.geospatialDescToRequired[EXCLUSION_ZONE]);
	}else if(stateManagement.getLastState() === BOUNDING_BOX){
		clearLayers([lpWrapper.boundingBoxUUID]);
		lpWrapper.boundingBoxUUID = null
		stateManagement.broadcastUpdate(LPP)
	}else if(stateManagement.getLastState() === GOAL_POINTS){
		clearLayers(lpWrapper.getRendezvousPointUUIDs());
		lpWrapper.rendezvousPointUUIDs = new Set();
		stateManagement.broadcastUpdate(lpInputs.theModel)
	} else if(stateManagement.getLastState() === POLYGON_EXCLUSIONS){
		clearLayers(lpWrapper.getPolyExclusionZoneUUIDs());
		lpWrapper.polygonalExclusionZoneUUIDs = [];
		if(lpWrapper.applicableGeospatialInputs.has(GOAL_POINTS)){
			clearLayers(lpWrapper.getRendezvousPointUUIDs());
			lpWrapper.rendezvousPointUUIDs = new Set();
			stateManagement.broadcastUpdate(GOAL_POINTS);
		}else{
			stateManagement.broadcastUpdate(lpInputs.theModel);
		}
	}else{
		clearMapExceptBounding()
		backToLKP()
	}
});

$('#backButtonWandering').click(function() {
    wanderingParamsMenu.close();
	$("#wanderingParamsWarning").hide();
    stateManagement.broadcastUpdate(MOTION_MODEL)
});

$('#backButtonGoalParams').click(function() {
	goalParamsMenu.close();
	$('#goalParamsWarning').hide();
	clearLayers(lpWrapper.getDiscoveredExclusionZoneUUIDs());
	if(lpInputs.theModel === "FLEEING_NO_INFO"){
		stateManagement.broadcastUpdate(MOTION_MODEL)
	}else {
		lpWrapper.discoveredExclusionZoneUUIDs = [];
		stateManagement.broadcastUpdate(DISCOVERED)
	}
});


function backToLKP(){
	goalParamsMenu.close();

	pointMenu.close();
	$("#confirmDraw").hide();
	stopDrawing();
	hideHelperText();
	mmMenu.close();
	parachuteMenu.close();

	drawnItems.removeLayer(lpWrapper.getLkpUUIDs());

	clearLayers(lpWrapper.getRendezvousPointUUIDs());

	drawnItems.removeLayer(lpWrapper.getKnownExclusionZoneUUIDs())
	drawnItems.removeLayer(lpWrapper.getDiscoveredExclusionZoneUUIDs())
	drawnItems.removeLayer(lpWrapper.getPolyExclusionZoneUUIDs())

	lpWrapper.rendezvousPointUUIDs = new Set()
	lpWrapper.discoveredExclusionZoneUUIDs = []
	lpWrapper.knownExclusionZoneUUIDs = []
	lpWrapper.polygonalExclusionZoneUUIDs = []

	lpWrapper.lkpUUIDs = [];
	$('.incompleteText').text("");

	stateManagement.broadcastUpdate(LKP)
}

$("#backLandcoverMetaForm").click(function (){
	landcoverMetaFormMenu.close();
	$(".landcoverMetaFormHolder").empty();

	if (lpInputs.getModel() === LOST_HIKER) {
		stateManagement.broadcastUpdate(WANDERING_PARAMS)
	}else if (lpInputs.getModel() === RENDEZVOUS) {
		stateManagement.broadcastUpdate(DISCOVERED)
	}else if(lpInputs.getModel() === FLEEING){
		stateManagement.broadcastUpdate(FLEEING)
	} else if(lpInputs.getModel() === STATIONARY){
		stateManagement.broadcastUpdate(MOTION_MODEL)
	}else{
		if(lpWrapper.applicableGeospatialInputs != null){
			if(lpWrapper.applicableGeospatialInputs.has(POLYGON_EXCLUSIONS)){
				clearLayers(lpWrapper.getPolyExclusionZoneUUIDs())
				lpWrapper.polygonalExclusionZoneUUIDs = []
				stateManagement.broadcastUpdate(POLYGON_EXCLUSIONS, false,
					lpWrapper.geospatialDescToRequired != null && lpWrapper.geospatialDescToRequired[POLYGON_EXCLUSIONS]);
			}else if(lpWrapper.applicableGeospatialInputs.has(EXCLUSION_ZONE)){
				clearLayers(lpWrapper.getDiscoveredExclusionZoneUUIDs());
				lpWrapper.discoveredExclusionZoneUUIDs = [];
				stateManagement.broadcastUpdate(DISCOVERED, false,
					lpWrapper.geospatialDescToRequired != null && lpWrapper.geospatialDescToRequired[EXCLUSION_ZONE]);
			}else if(lpWrapper.applicableGeospatialInputs.has(GOAL_POINTS)){
				clearLayers(lpWrapper.getRendezvousPointUUIDs());
				lpWrapper.rendezvousPointUUIDs = new Set();
				stateManagement.broadcastUpdate(GOAL_POINTS, false,
					lpWrapper.geospatialDescToRequired != null && lpWrapper.geospatialDescToRequired[GOAL_POINTS]);
			}else{
				stateManagement.broadcastUpdate(lpInputs.theModel);
			}
		}else{
			console.error("motion model inputs was null")
		}
	}
})

function goBackToMotionModel()
{
	if (lpInputs.getModel() === LOST_HIKER) {
		stateManagement.broadcastUpdate(WANDERING_PARAMS)
	}else if (lpInputs.getModel() === RENDEZVOUS) {
		stateManagement.broadcastUpdate(GOAL_PARAMS)
	}else if(lpInputs.getModel() === FLEEING){
		stateManagement.broadcastUpdate(FLEEING)
	} else if(lpInputs.getModel() === STATIONARY){
		stateManagement.broadcastUpdate(MOTION_MODEL)
	}else{
		if(lpWrapper.applicableGeospatialInputs != null){
			if(lpWrapper.applicableGeospatialInputs.has(POLYGON_EXCLUSIONS)){
				clearLayers(lpWrapper.getPolyExclusionZoneUUIDs())
				lpWrapper.polygonalExclusionZoneUUIDs = []
				stateManagement.broadcastUpdate(POLYGON_EXCLUSIONS, false,
					lpWrapper.geospatialDescToRequired != null && lpWrapper.geospatialDescToRequired[POLYGON_EXCLUSIONS]);
			}else if(lpWrapper.applicableGeospatialInputs.has(EXCLUSION_ZONE)){
				clearLayers(lpWrapper.getDiscoveredExclusionZoneUUIDs());
				lpWrapper.discoveredExclusionZoneUUIDs = [];
				stateManagement.broadcastUpdate(DISCOVERED, false,
					lpWrapper.geospatialDescToRequired != null && lpWrapper.geospatialDescToRequired[EXCLUSION_ZONE]);
			}else if(lpWrapper.applicableGeospatialInputs.has(GOAL_POINTS)){
				clearLayers(lpWrapper.getRendezvousPointUUIDs());
				lpWrapper.rendezvousPointUUIDs = new Set();
				stateManagement.broadcastUpdate(GOAL_POINTS, false,
					lpWrapper.geospatialDescToRequired != null && lpWrapper.geospatialDescToRequired[GOAL_POINTS]);
			}else{
				stateManagement.broadcastUpdate(lpInputs.theModel);
			}
		}else{
			console.error("motion model inputs was null")
		}
	}
}

$('#backToMM').click(function() {
	mvmtSchedMenu.close();
	//clearMapExceptBounding()
	$('.incompleteText').text("");
	if (lpWrapper.landcoverMetadataEnabled) {
	    stateManagement.broadcastUpdate(META_LANDCOVER);
    } else {
        goBackToMotionModel();
    }
});

function clearMap(){
	if(lpWrapper == null){
		return;
	}
	clearLayers(lpWrapper.getMapItemUUIDs());
	lpWrapper.removeAllShapeUUIDs();
	for(let i=0; i<drawnItems.length; i++){
		map.removeLayer(drawnItems[i]);
	}
}

function clearMapBounding(){
	if(lpWrapper == null){
		return;
	}

	clearLayers([lpWrapper.getBoundingBoxUUID()]);
	lpWrapper.boundingBoxUUID = undefined
}

function clearMapExceptBounding(){
	if(lpWrapper == null){
		return;
	}

	clearLayers(lpWrapper.getRendezvousPointUUIDs());
	lpWrapper.rendezvousPointUUIDs = new Set();
	clearLayers(lpWrapper.getKnownExclusionZoneUUIDs());
	lpWrapper.knownExclusionZoneUUIDs = [];
	clearLayers(lpWrapper.getDiscoveredExclusionZoneUUIDs());
	lpWrapper.discoveredExclusionZoneUUIDs = [];
	clearLayers(lpWrapper.getPolyExclusionZoneUUIDs());
	lpWrapper.polygonalExclusionZoneUUIDs = [];
}






















/**
 * @Summary
 * Contains all of the forms and there initial setups
 *
 * All forms must be added to menus variable
 *
 * Also has openMainMenu() function, checkFormStatus() function,
 * and the stateManagement.broadcastUpdate() state changer function.
 *
 * @author Devon Minor
 */

var mode = "civ"; // ** options = {civ, mil};

// This value is the value set if default value cannot be requested from server. Not zero, because zero breaks some of the forms.
const ZEROED_OUT_DEFAULT_VALUE = 1000;

/**
 * When user presses close button on a dialog (in new LPI or new Search),
 * record that this happened, and restore state when "continue" is pressed
 * in main menu
 */

iconBar = "<div class='icon-bar'>" +
	"<a title='Go To Location' href='#' onClick='showPan()'><i class='fa fa-arrows'></i></a>" +
	"<a title='About LandSAR' href='/webmap/landsar/about/'><i class='fa fa-info-circle'></i></a>" +
	"<a title='Reset Zoom' href='#' onClick='refreshMapView()'><i class='fa fa-globe'></i></a>" +
	"<a title='Show Status Window' href='#' onClick='statusWindow.open();'><i class='fa fa-tasks'></i></a>" +
	"<a title='Export Data' href='#' onClick='exportKMZ();'><i class='fa fa-cloud-download'></i></a>" +
	"<a id='sign-out-button' title='Sign Out or Change Mode' onclick='logout();'><i class='fa fa-sign-out'></i></a>"  +
	"</div>";

var hadErrorLast = false;

var mainMenuContents = ["<input type='hidden' id='mainMenuDialogID'/>",
						'<div style="width: 100%; text-align: center;"><img src="public/account/LandSAR_logo_nobox.png" style="width: 70%;align-content: center;"></div>',
						iconBar + "<br/>",
						"<table style='width: 100%'><tr><td style='width: 115px; font-size: medium;'><b>Map Provider:</b></td><td><select style='width: 100%' id='mapType' onchange='changeMapType()' class='ui-selectmenu-button ui-selectmenu-button-closed ui-corner-all ui-button ui-widget'><option value='mapbox.streets' selected>MapBox Streets</option><option value='mapbox.satellite'>MapBox Satellite</option><option value='mapbox.outdoors'>MapBox Outdoors</option><option value='osm'>OpenStreetMaps</option><option value='opentopomap'>OpenTopoMap</option><option value='esri.delorme'>ESRI DeLorme</option><option value='esri.worldImagery'>ESRI World Imagery</option></select></td></tr>",
						"<tr style='width: 100%'><td style='font-size: medium;'><b>Lost Person:</b></td><td>",
							"<div style='width: 100%'>",
								"<div style='float: right; margin-left: 4px;'>",
									"<button type='button' id='lpiInfoBtn' class='btn btn-dark' onClick='showLPIInfo()'><i class='fa fa-info-circle'></i></button>&nbsp;",
									"<button type='button' id='lpiInfoBtn' class='btn btn-dark' onClick='promptForDeleteOfLPI()'><i class='fa fa-trash'></i></button>",
								"</div>",
								"<div style='width: auto; height: 40px; overflow: hidden;'>",
									"<select style='height: 38px; width: 100%;' id='lostPersonSelect' onchange='changeActiveLPI()' class='ui-selectmenu-button ui-selectmenu-button-closed ui-corner-all ui-button ui-widget'><option value='NO_LPI_MARKER'>Loading...</option></select>&nbsp;",
								"</div>",
							"</div>",
						"</td></tr></table>",
						"<button id='mainMenuContinueBtn' style='display: none; text-align: left; width: 100%;' class='btn btn-dark' onclick='stateManagement.restoreLastState()'><i class='fa fa-plus-circle'></i> Continue New LPI</button><br>",
						"<div style='width: 100%; height: 5px;'></div>",
						"<button style='text-align: left; width: 100%;' class='btn btn-dark' onclick='stateManagement.broadcastUpdate(LPP)'><i class='fa fa-plus-circle'></i> Specify New Lost Person Information</button><br>",
						"<div style='width: 100%; height: 5px;'></div>",
						"<div style='width: 100%'>",
							"<div style='float: right; margin-left: 4px;'><button type='button' id='lpiInfoBtn' class='btn btn-dark' onClick='showSearchDeletionTip()'><i class='fa fa-info-circle'></i></button></div>",
							"<div style='width: auto; overflow: hidden;'><button id='newSearchBtn' disabled style='text-align: left; width: 301px;' class='btn btn-dark' onclick='stateManagement.broadcastUpdate(NEW_SEARCH)'><i class='fa fa-search-plus'></i> Specify New Search Information</button></div>",
						"</div>",
						"<div style='width: 100%; height: 5px;'></div>",
							//"<button style='text-align: left; width: 100%;' class='btn' onclick='openViewLpis()'><i class='fa fa-list-ul'></i> View Lost Persons Information</button><br><br>",
						//"<button style='text-align: left; width: 100%;' class='btn' onclick='openViewMissionPackages()'><i class='fa fa-street-view'></i> View Location Heatmaps</button><br><br>",
						"<button style='text-align: left; width: 100%;' class='btn btn-dark' onclick='openLayersMenu()'><i class='fa fa-navicon'></i> Layer Settings</button><br>",
						"<div style='width: 100%; height: 5px;'></div>",

						// ** The AAR button
            			"<button id='aarButton' style='text-align: left; width: 100%;' class='btn btn-dark' onclick='stateManagement.broadcastUpdate(AAR_UP_FRONT)'><i class='fa fa-navicon'></i> Submit After Action Report</button><br>",
						"<div style='width: 100%; height: 5px;'></div>",

						"<div class='btn' id='operationUseText' style='width: 100%; height: 5px;'></div>",
						"<div style='width: 100%; height: 5px;'></div>",
						].join('');

const isLatitude = num => isFinite(num) && Math.abs(num) <= 90;
const isLongitude = num => isFinite(num) && Math.abs(num) <= 180;

function showPan(){
	let errorLatitude = $("#errorLatitude");
	let errorLongitude = $("#errorLongitude");
	let panToModel = $('#panToPointModal');
	errorLatitude.hide();
	errorLongitude.hide();
	panToModel.modal("show");
	$('#panToLocation').click(function() {
		errorLatitude.hide();
		errorLongitude.hide();

		let latitude = $("#panLatitude").val();
		let longitude = $("#panLongitude").val();

		let hadError = false;
		if(!isLatitude(latitude)){
			errorLatitude.show();
			hadError = true;
		}
		if(!isLongitude(longitude)){
			errorLongitude.show();
			hadError = true;
		}
		if(!hadError) {
			console.log("panning to location " + latitude + ", " + longitude);
			map.panTo([latitude, longitude]);
			panToModel.modal("hide");
		}
	});
}

function logout() {
	setCookie("loggedIn", false, 0)
	$.ajax("/webmap/landsar/public/account/logout").done(
			function( msg ) {
				sessionStorage.clear();
				window.location.href= "/webmap/landsar/public/account/login.html";
			}
		);
	//window.location.href= "/webmap/landsar/account/logout";
}

function isLoggedIn(){
	let loggedIn = getCookie("loggedIn");
	if(loggedIn === null || loggedIn !== "true") {
		return false;
	}else{
		return true;
	}
}

var width = 420;
var height = 570;
var mainMenu = L.control.dialog({initOpen: true, size: [width, height]})
			.setContent(mainMenuContents)
			.addTo(map);

// ** hide the scrollbar
mainMenu._innerContainer.children[0].style.overflow = "hidden";
mainMenu._container.style.zIndex = 20000;

/**
 * Resets map view zoom to bounds set in config.
 * If no bounds are set, it zooms to entire US.
 * (We may want to make this less hardcoded for US in future)
 */
function refreshMapView(){
	if (osppreConfig.initialViewBounds != null) {
		let mBounds = L.latLngBounds(L.latLng(osppreConfig.initialViewBounds.southLatDeg,
				osppreConfig.initialViewBounds.westLonDeg), L.latLng(osppreConfig.initialViewBounds.northLatDeg,
			osppreConfig.initialViewBounds.eastLonDeg));
		map.fitBounds(mBounds);
	}else{
		map.setView([38.47939, -98.08594], 5);
	}
}

function exportKMZ() {
	var lpiID = getCurrentLPIID();
	if(lpiID == undefined || lpiID == null || lpiID == "NO_LPI_MARKER") {
		bootbox.alert("Please first select a lost person instance.");
		return;
	}

	var kmzFileName = "";
	map.eachLayer(
			function(layer){
					if(layer.finderInfo != undefined && layer.finderInfo.finderElementType == "distribution") {
						kmzFileName = layer.finderInfo.fileName;
					}
			}
		);
	var dialogText = "";
	if(kmzFileName != "") {
		//bootbox.alert("No distribution to export for the selected time. Please move the time slider to a point with a distribution and try again.");
		//return;
		var url = "/webmap/landsar/" + kmzFileName + ".kmz";
		dialogText += "Click <a href='" + url + "'><span style='color: steelblue'>here</span></a> to export KMZ for the current distribution.<br/>";
	}

	var fullZipURL = "missionPackages/" + lpiID + "/latest.zip";
	dialogText += "Click <a href='" + fullZipURL + "'><span style='color: steelblue'>here</span></a> to export a ZIP file of all KML/KMZs for this lost person.";
	bootbox.dialog({title: "Export KMZ", message: dialogText,
		buttons: {
	        cancel: {
	            label: "Done",
	            className: 'btn-info',
	            callback: function(){
	            	// ** NO-OP
	            }
	        },}});
}

$(function () {
	  $('[data-toggle="popover"]').popover()
	})

function radians_to_degrees(radians)
{
	var pi = Math.PI;
	return radians * (180/pi);
}

const capitalize = (s) => {
	if (typeof s !== 'string') return ''
		return s.charAt(0).toUpperCase() + s.slice(1)
};

String.prototype.capitalize = function() {
	return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

// Responsible for showing information about an LPI, like the name,
// model, movement schedule, and parameters.
function showLPIInfo() {
	coordinateSystem = layerSettings.coordinateSystem;

	let content = null;
	if(lpis !== undefined && lpis !== null) {
		for(let i = 0; i < lpis.lostPersonInstances.length; i++) {
			if(getCurrentLPIID() === lpis.lostPersonInstances[i].id) {
				// content = JSON.stringify(lpis.lostPersonInstances[i], null, 5);
				content = lpis.lostPersonInstances[i];
				jsonContent = JSON.stringify(lpis.lostPersonInstances[i], null, 5);
			}
		}
	}

	$('#lpiInfo').empty();

	if(null == content) {
		bootbox.alert("No lost person is selected");
		return;
	}else {
		var table = $('<table>').addClass('table');
		var label = $('<span>').addClass('lpiTableLabel');
		table.append(createLPITableRow(0,"Name", content.name.toString().toLowerCase().capitalize()));
		if (content.theModel.toString().toLowerCase().capitalize() === RENDEZVOUS) {
            table.append(createLPITableRow(0,"Model", "Lost hiker with destination"));
        } else {
            table.append(createLPITableRow(0,"Model", content.theModel.toString().toLowerCase().capitalize()));
        }
		table.append(createLPITableRow(0,"Movement Schedule", content.moveSchedule.toString().toLowerCase().capitalize()));

		if (content.rendezvousPoints.length > 0) {
			table.append(createLPITableRow(0,"Goals", ""));
			for(var i=0; i<content.rendezvousPoints.length; i++){
				let lat = radians_to_degrees(content.rendezvousPoints[i].latRad)
				let lon = radians_to_degrees(content.rendezvousPoints[i].lonRad)
				if (coordinateSystem === coordinateSystems.DECIMAL_LAT_LON
					|| (coordinateSystem === coordinateSystems.DMS_LAT_LON)
					|| (coordinateSystem === coordinateSystems.DEC_MIN_LAT_LON)) {
					table.append(createLPITableRow(1,"Lat Deg", formatLatOrLon(lat, true)));
					table.append(createLPITableRow(1,"Lon Deg", formatLatOrLon(lon, false)));
				}else{
					const translator = new Latlon_Utm_Mgrs(lat, lon);

					let coord;
					if (coordinateSystem === coordinateSystems.USNG_MGRS){
						coord = translator.toUtm().toMgrs();
					}else{
						coord = translator.toUtm().toMgrs();
					}

					table.append(createLPITableRow(1, "Coordinate", coord));
				}


				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC) {
					table.append(createLPITableRow(1, "Altitude", content.rendezvousPoints[i].altitude + " " + M_LABEL));
				}else{
					table.append(createLPITableRow(1, "Altitude", mToFeet(content.rendezvousPoints[i].altitude) + " " + FEET_LABEL));
				}
			}
		}

		if (content.polyExclnZones.length > 0) {
			table.append(createLPITableRow(0,"Polygon Exclusion Zones", ""));
			for(var i=0; i<content.polyExclnZones[0].vertices.length; i++){
				table.append(createLPITableRow(1,"Vertex " + (i + 1), ""));

				let lat = radians_to_degrees(content.polyExclnZones[0].vertices[i].latRad)
				let lon = radians_to_degrees(content.polyExclnZones[0].vertices[i].lonRad)
				if (coordinateSystem === coordinateSystems.DECIMAL_LAT_LON
					|| (coordinateSystem === coordinateSystems.DMS_LAT_LON)
					|| (coordinateSystem === coordinateSystems.DEC_MIN_LAT_LON)) {
					table.append(createLPITableRow(1,"Lat Deg", formatLatOrLon(lat, true)));
					table.append(createLPITableRow(1,"Lon Deg", formatLatOrLon(lon, false)));
				}else{
					const translator = new Latlon_Utm_Mgrs(lat, lon);

					let coord;
					if (coordinateSystem === coordinateSystems.USNG_MGRS){
						coord = translator.toUtm().toMgrs();
					}else{
						coord = translator.toUtm().toMgrs();
					}

					table.append(createLPITableRow(1, "Coordinate", coord));
				}

				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC) {
					table.append(createLPITableRow(1, "Altitude", content.polyExclnZones[0].vertices[i].altitude + " " + M_LABEL));
				}else{
					table.append(createLPITableRow(1, "Altitude", mToFeet(content.polyExclnZones[0].vertices[i].altitude) + " " + FEET_LABEL));
				}
			}
		}

		table.append(createLPITableRow(0,"Search Interval", content.searchInterval));

		time = moment.tz(content.startTime, getLPITimeZone(getCurrentLPIID())).format("dddd, MMMM Do YYYY, h:mm:ss a") + " " + getLPITimeZone(getCurrentLPIID());

		table.append(createLPITableRow(0,"Start time", time));

		if(null != content.boundingBox) {
			table.append(createLPITableRow(0, "Bounding Box", ""));
			if (coordinateSystem === coordinateSystems.DECIMAL_LAT_LON
				|| (coordinateSystem === coordinateSystems.DMS_LAT_LON)
				|| (coordinateSystem === coordinateSystems.DEC_MIN_LAT_LON)) {
				table.append(createLPITableRow(1, "North Lat", formatLatOrLon(content.boundingBox.northLatDeg, true)));
				table.append(createLPITableRow(1, "South Lat", formatLatOrLon(content.boundingBox.southLatDeg, true)));
				table.append(createLPITableRow(1, "East Lon", formatLatOrLon(content.boundingBox.eastLonDeg, false)));
				table.append(createLPITableRow(1, "West Lon", formatLatOrLon(content.boundingBox.westLonDeg, false)));
			}else{
				const southWestTranslator = new Latlon_Utm_Mgrs(content.boundingBox.southLatDeg, content.boundingBox.westLonDeg);
				const northEastTranslator = new Latlon_Utm_Mgrs(content.boundingBox.northLatDeg, content.boundingBox.eastLonDeg);

				let southWestCoord;
				let northEastCoord;
				if (coordinateSystem === coordinateSystems.USNG_MGRS){
				    southWestCoord = southWestTranslator.toUtm().toMgrs();
				    northEastCoord = northEastTranslator.toUtm().toMgrs();
				}else{
				    southWestCoord = southWestTranslator.toUtm().toMgrs();
				    northEastCoord = northEastTranslator.toUtm().toMgrs();
				}

			    table.append(createLPITableRow(1, "South West Corner", southWestCoord));
			    table.append(createLPITableRow(1, "North East Corner", northEastCoord));

			}

		}


		if(null != content.ipp){
			table.append(createLPITableRow(0,"Lost Person Parameters", ""));
			// meters per msec to kph/mph
			// (content.ipp.minBaseSoa * mPerMsec2kph * KM_TO_MPH_RATIO)
			// 3600 * 0.621371
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC){
				table.append(createLPITableRow(1,"Minimum Base Movement Speed", metersPerMsecToKPH(content.ipp.minBaseSoa) + " " + KPH_LABEL));
				table.append(createLPITableRow(1,"Maximum Base Movement Speed", metersPerMsecToKPH(content.ipp.maxBaseSoa) + " " + KPH_LABEL));
			}else{
				table.append(createLPITableRow(1,"Minimum Base Movement Speed", metersPerMsecToMPH(content.ipp.minBaseSoa) + " " + MPH_LABEL));
				table.append(createLPITableRow(1,"Maximum Base Movement Speed", metersPerMsecToMPH(content.ipp.maxBaseSoa) + " " + MPH_LABEL));
			}

			//table.append(createLPITableRow(1,"Base Speed of Advance", content.ipp.baseSoa));
			//table.append(createLPITableRow(1,"Maximum Stealth Speed", content.ipp.maxStealthSpeed + " kmph"));
			//table.append(createLPITableRow(1,"Initial Resource Level", content.ipp.minBaseSoa));
			//table.append(createLPITableRow(1,"ResourceLevel", content.ipp.minBaseSoa));
			//table.append(createLPITableRow(1,"Max Resource Level", content.ipp.minBaseSoa));
			//table.append(createLPITableRow(1,"Base Resource Level", content.ipp.minBaseSoa));
			//table.append(createLPITableRow(1,"Exhaustion Level", content.ipp.minBaseSoa));
			//table.append(createLPITableRow(1,"Recovery Level", content.ipp.minBaseSoa));
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC){
				table.append(createLPITableRow(1, "Weight", content.ipp.wgtKg + " " + KG_LABEL));
				table.append(createLPITableRow(1, "Gear Weight", content.ipp.loadKg + " " + KG_LABEL));
			}else {
				table.append(createLPITableRow(1, "Weight", kgToLbs(content.ipp.wgtKg) + " " + LBS_LABEL));
				table.append(createLPITableRow(1, "Gear Weight", kgToLbs(content.ipp.loadKg) + " " + LBS_LABEL));
			}

			if (content.theModel === "LOST_HIKER") {
				table.append(createLPITableRow(1,"Wandering Parameters", ""));

				let distIncMeters = content.ipp.wanderingParameters["Distance increment (m)"];
				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC) {
					table.append(createLPITableRow(2, "Distance Increment (m)", distIncMeters));
				}else{
					table.append(createLPITableRow(2, "Distance Increment (feet)", mToFeet(distIncMeters)));
				}
                table.append(createLPITableRow(2, "Number of segments", content.ipp.wanderingParameters["Number of segments"]));
                table.append(createLPITableRow(2, "Number options (paths) considered", content.ipp.wanderingParameters["Number options (paths) considered"]));
                table.append(createLPITableRow(2, "Course change stdev (deg)", content.ipp.wanderingParameters["Course change stdev (deg)"]));
			}
		}

		if (null != content.goalOrientedParams){
			table.append(createLPITableRow(0,"Goal Oriented Parameters", ""));

			let maxLegLengthMeters = content.goalOrientedParams["Maximum leg length (m)"];
			let awarenessRadiusMeters = content.goalOrientedParams["Awareness radius (m)"];
			let moveRadiusMeters = content.goalOrientedParams["Move radius (m)"];
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC) {
				table.append(createLPITableRow(1,"Maximum leg length", maxLegLengthMeters + " " + M_LABEL));
				table.append(createLPITableRow(1,"Awareness radius", awarenessRadiusMeters + " " + M_LABEL));
				table.append(createLPITableRow(1,"Move radius", moveRadiusMeters + " " + M_LABEL));
			}else{
				table.append(createLPITableRow(1,"Maximum leg length", mToFeet(maxLegLengthMeters) + " " + FEET_LABEL));
				table.append(createLPITableRow(1,"Awareness radius", mToFeet(awarenessRadiusMeters) + " " + FEET_LABEL));
				table.append(createLPITableRow(1,"Move radius", mToFeet(moveRadiusMeters) + " " + FEET_LABEL));
			}

			table.append(createLPITableRow(1,"Minimum turn angle", content.goalOrientedParams["Minimum turn angle (deg)"] + " degrees"));
			table.append(createLPITableRow(1,"Maximum turn angle", content.goalOrientedParams["Maximum turn angle (deg)"] + " degrees"));
		}

		table.append(createLPITableRow(0,"ID", content.id));
		//table.append(createLPITableRow(0,"Area Data ID", content.areaDataid));

		if(null != content.center){
			table.append(createLPITableRow(0,"Center", ""));

			let lat = radians_to_degrees(content.center.latRad);
			let lon = radians_to_degrees(content.center.lonRad);
			if (coordinateSystem === coordinateSystems.DECIMAL_LAT_LON
				|| (coordinateSystem === coordinateSystems.DMS_LAT_LON)
				|| (coordinateSystem === coordinateSystems.DEC_MIN_LAT_LON)) {
				table.append(createLPITableRow(1,"Lat", formatLatOrLon(lat, true)));
				table.append(createLPITableRow(1,"Lon", formatLatOrLon(lon, false)));
			}else{
				const translator = new Latlon_Utm_Mgrs(lat, lon);

				let coord;
				if (coordinateSystem === coordinateSystems.USNG_MGRS){
					coord = translator.toUtm().toMgrs();
				}else{
					coord = translator.toUtm().toMgrs();
				}

				table.append(createLPITableRow(1, "Coordinate", coord));
			}

			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC) {
				table.append(createLPITableRow(1, "Altitude", content.center.altitude + " " + M_LABEL));
			}else{
				table.append(createLPITableRow(1, "Altitude", mToFeet(content.center.altitude) + " " + FEET_LABEL));
			}
		}

		table.append(createLPITableRow(0,"Cumulative Probability of Detection", content.cumulativeProbabilityOfDetection));
		//table.append(createLPITableRow(0,"Elevation Information", content.elevationInformation));


		if (null != content.exclusionZones.length && content.exclusionZones.length > 0) {
			table.append(createLPITableRow(0,"Exclusion Zones", ""));
			for(var i=0; i<content.exclusionZones.length; i++){
				table.append(createLPITableRow(1,"Point " + (i + 1), ""));

				let lat = radians_to_degrees(content.exclusionZones[i].pt.latRad)
				let lon = radians_to_degrees(content.exclusionZones[i].pt.lonRad)
				if (coordinateSystem === coordinateSystems.DECIMAL_LAT_LON
					|| (coordinateSystem === coordinateSystems.DMS_LAT_LON)
					|| (coordinateSystem === coordinateSystems.DEC_MIN_LAT_LON)) {
					table.append(createLPITableRow(2,"Lat", formatLatOrLon(lat)));
					table.append(createLPITableRow(2,"Lon", formatLatOrLon(lon)));
				}else{
					const translator = new Latlon_Utm_Mgrs(lat, lon);

					let coord;
					if (coordinateSystem === coordinateSystems.USNG_MGRS){
						coord = translator.toUtm().toMgrs();
					}else{
						coord = translator.toUtm().toMgrs();
					}

					table.append(createLPITableRow(1, "Coordinate", coord));
				}

				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC) {
					table.append(createLPITableRow(2,"Altitude", content.exclusionZones[i].pt.altitude + " " + M_LABEL));
					table.append(createLPITableRow(2,"Radius", content.exclusionZones[i].radius + " " + M_LABEL));
				}else{
					table.append(createLPITableRow(2,"Altitude", mToFeet(content.exclusionZones[i].pt.altitude) + " " + FEET_LABEL));
					table.append(createLPITableRow(2,"Radius", mToFeet(content.exclusionZones[i].radius) + " " + FEET_LABEL));

				}
				table.append(createLPITableRow(2,"Known", content.exclusionZones[i].known));
			}
		}

		// landcover meta data
		if (content.landcoverMetadata != null){
			table.append(createLPITableRow(0,"Landcover Meta Data", ""));

			var metaLandTable = [
				"<table id='metaLandTable'>",
				"<tr>\n",
				"    <th>Color</th>\n",
				"    <th>Code</th>\n",
				"    <th>Landcover Description</th>\n",
				"    <th>Cost</th>\n",
				"    <th 'style=display:flex;'><div></div>SOA<span style='margin-left: 4px; font-size: small'><i class='fa fa-info-circle' data-toggle='tooltip' title='Speed of Advance Factor'></i></span></th>\n",
				"  </tr>",
				"</table>"
			].join('')

			table.append(metaLandTable);
			$('#lpiInfo').append(table);

			var metaDataItems = content.landcoverMetadata.metaDataItems;
			metaDataItems.sort(function(a, b) {
				var keyA = a.lcCode,
					keyB = b.lcCode;

				if (keyA < keyB) return -1;
				if (keyA > keyB) return 1;
				return 0;
			});

			for(var i=0; i<metaDataItems.length; i++) {
				let metaDataItem = metaDataItems[i];

				var row = ([
					"<tr>",
					"<td><div class='lpiInfoColor' style='background-color: " + RGBToHex(metaDataItem.rgbColor[0], metaDataItem.rgbColor[1], metaDataItem.rgbColor[2]) + "'></div></td>",
					"<td>" + metaDataItem.lcCode + "</td>",
					"<td>" + metaDataItem.shortDescription + "<span style='margin-left: 4px; font-size: small'><i class='fa fa-info-circle' data-toggle='tooltip' title='",
					metaDataItem.detailedDescription,
					"'></i></span></td>",
					"<td>" + metaDataItem.cost + "</td>",
					"<td>" + metaDataItem.soaFactor + "</td>",
					"</tr>"
				].join(''))

				$('#metaLandTable').append(row);

			}

		}else{
			$('#lpiInfo').append(table);
		}

	}

	//$("#lpiInfo").html("<pre>" + content + "</pre>");
	$('#lpiInfoModal').modal("show");
	//$("#lpiInfoBtn").attr('data-content',content).data('bs.popover').setContent();

	$("#viewLPIExportJSON").click(function() {
		console.log("exporting LPI JSON");
		download("lpiJSON.txt", jsonContent)
	});
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function createLPITableRow(index, label, value){
	return createTableRow("lpiTableRow", index, label, value);
}

function createTableRow(tableCssLabel, index, label, value){
	const item = `<b>` + label + `</b>: ` + value;
	return $('<tr>').addClass(tableCssLabel + index).append(item);
}

function showSearchDeletionTip() {
	bootbox.alert("To delete a search, click on the blue search area on the map and in the resulting popup, click 'Delete'.");
}

getLPIsFromServer();

$('#openMainMenu').hide(); // **  initialy hidden, since main menu is initially shown

map.on('dialog:closed', function(e){
	if(e.getContent().includes("mainMenuDialogID")) {
		$('#openMainMenu').show();
	}
});

var statusWindowContents = "<div style='background-color: #88A0B9; font-weight: bold; text-align: center; width:100%;' id='statusTitleBar'>Status</div>"
						 + "<div id='statusWindowDiv'>Status: no active requests</div>";

var statusWindow = L.control.dialog({initOpen: false, size: [475,220]})
					.setContent(statusWindowContents)
					.addTo(map);

statusWindow.getContainer().style.position = "fixed";
statusWindow.getContainer().style.bottom = "110px";
statusWindow.getContainer().style.right = 0;
statusWindow.getContainer().style.top = null;
statusWindow.getContainer().style.left = null;

var statusBarContents = ["<div class='statusBarContainer' id='statusBarDiv' style='font-weight: bold; font-size: large; color: darkslateblue;'>",
	"<div id='statusBarSummary'>Status: no active requests</div>",
	"<div id='statusBarWarnings'></div>",
	"<a id='statusBarMoreButton' href='#'></a>",
	"<div id='statusBarClear'><button class='btn' style='float: right;' onClick='clearWarningsAndStatus()'><i class='fa fa-eraser'></i>Clear</button></div>\n",
	"</div>"].join('');

var statusBar = L.control.dialog({initOpen: true, size: [500,55]})
.setContent(statusBarContents)
.addTo(map);
statusBar.lock();

statusBar.getContainer().style.position = "fixed";
statusBar.getContainer().style.bottom = '0px';
statusBar.getContainer().style.left = '180px';
statusBar.getContainer().style.top = null;
statusBar.getContainer().style.right = null;
statusBar.getContainer().style.margin = '0px';
statusBar.getContainer().style.width = '85%';

var lpiToWarnings = {};
var activeLPI

function setStatus(statusStr, isClearing=false) {
	var msg = "";
	var summary;
	var status = "";
	var lpiid = "N/A";
	var searchID = "N/A";
	var requestId = "";
	var warnings = [];
	var errors = [];

	summary = "";

	try {
		if(statusStr.errors !== undefined) {
			// ** got passed a status object rather than status str representing the JSON for that object
			status = statusStr;
		} else {
			status = JSON.parse(statusStr);
		}

		lpiid = status.lpiId;
		searchID = status.searchId;
		requestId = status.requestId;
		summary = status.summary;
		warnings = status.warnings;
		errors = status.errors;
	} catch (err) {
		summary = statusStr;
		console.log("Error parsing status string: ", err)
		console.log("status string: ", statusStr)
	}

	msg = "<table style='width: 100%'>";
	msg += "<tr><td style='width: 25%; vertical-align: top; font-weight: bold;'>Lost Person ID:</td><td style='vertical-align: top;'>" + lpiid + "</td></tr>";
	msg += "<tr><td style='vertical-align: top; font-weight: bold;'>Search ID:</td><td style='vertical-align: top;'>" + (searchID == null ? "N/A" : searchID) + "</td></tr>";
	msg += "<tr><td style='vertical-align: top; font-weight: bold;'>Summary:</td><td style='vertical-align: top;'>" + summary + "</td></tr>";
	msg += "<tr><td style='vertical-align: top; font-weight: bold;'>Warnings:</td><td style='vertical-align: top;'>" + (warnings.length == 0 ? "None" : warnings) + "</td></tr>";
	msg += "<tr><td style='vertical-align: top; font-weight: bold;'>Errors:</td><td style='vertical-align: top;'>" + (errors.length == 0 ? "None" : errors) + "</td></tr>";
	msg += "</table><br/>";


	/**
	 * If there are errors, ask user if they would like to clear screen of LPI they just drew (and unsuccesfully created).
	 */
	if(errors.length > 0){
		$("#lpiDeleteButton").css("display", "block");
		hadErrorLast = true
		if(confirm("There was an error while processing LPI request. Would you like to clear this LPI from the map? \nAlternatively, when ready, you can clear this LPI in layer settings.")){
			cancelNewLpi();
			hadErrorLast = false;
		}
		// If there were no errors, LPI was sucessfully created, hide LPI Delete Button from layers menu
	}else if(!isClearing){
		$("#lpiDeleteButton").css("display", "none");
	}

	if("N/A" !== lpiid){
		activeLPI = lpiid;
	}

	let warning = "";
	warnings.forEach(function (item, index) {
		warning += item;
		if(index !== (warnings.length - 1)) {
			warning += ", ";
		}
	});

	if(warning.length > 0 && warning !== "undefined"){
		if(lpiToWarnings[activeLPI] === undefined){
			lpiToWarnings[activeLPI] = warning;
		}else {
			lpiToWarnings[activeLPI] = lpiToWarnings[lpiid] + ", " + warning;
		}

		$('#statusBarMoreButton').text("more");
	}

	$('#statusWindowDiv').append(msg);

	var warningMessage = ""
	if(undefined !== lpiToWarnings[activeLPI]){
		warningMessage = " warnings: " + lpiToWarnings[activeLPI];

		$('#statusBarDiv').html("<div id='statusBarSummary'>" + summary + " </div>" +
		"<div id='statusBarWarnings'>" + warningMessage + "</div>" +
		"<a href='#' id='statusBarMoreButton' onclick='statusWindow.open();'>more</a>" +
		"<div id='statusBarClear'><button class='btn' style='float: right;' onClick='clearWarningsAndStatus();'><i class='fa fa-eraser'></i>Clear</button></div>");
	}else{
		$('#statusBarDiv').html("<div id='statusBarSummary'>" + summary + " </div>" +
		"<div id='statusBarWarnings'></div>" +
		"<div id='statusBarClear'><button class='btn' style='float: right;' onClick='clearWarningsAndStatus();'><i class='fa fa-eraser'></i>Clear</button></div>");
	}

	let statusDiv = $("#statusWindowDiv");
	statusDiv.parent().scrollTop(statusDiv.height());
	statusDiv.parent().parent().find(".leaflet-control-dialog-close").unbind('click');
}


function populateCoordinateSystemDropdown() {
	const select = document.querySelector('#coordinateSystem');
	select.innerHTML = '';
	let cs;

	for (cs in coordinateSystems){
		const option = document.createElement('option');
		option.value = cs;
		option.innerHTML = coordinateSystems[cs];
		select.appendChild(option);
	}
}

function populateUnitMeasurementDropdown() {
	const select = document.querySelector('#unitMeasurementSystem');
	select.innerHTML = '';

	for (let unit in UNIT_MEASUREMENT_SYSTEMS){
		console.log(unit)
		const option = document.createElement('option');
		option.value = unit;
		option.innerHTML = UNIT_MEASUREMENT_SYSTEMS[unit]
		select.appendChild(option);
	}
}


function clearWarningsAndStatus(){
	lpiToWarnings[activeLPI] = undefined
	setStatus("", true);
	$('#statusBarMoreButton').empty();
	$('#statusBarWarnings').empty();
}

//var initialStatus = "{\"lpiId\": \"None\", \"searchId\": null, \"requestId\": null, \"summary\": \"This is a sample summary\", \"warnings\": [\"warning 1\"], \"errors\": [\"error 1 -  this is an example error message that might wrap\", \"error 2\"]}";
var initialStatus = "No active requests";
setStatus(initialStatus);

var layersHTML = getLayersHTML();
var layersMenu = L.control.dialog({initOpen:false, size: [380,315]})
.setContent(layersHTML)
.addTo(map);
populateCoordinateSystemDropdown();
populateUnitMeasurementDropdown();

var systemTimeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

var oneMph = 0.44704 / 1000
var minBaseSoa = 2 // mph
var maxBaseSoa = 3.5 // mph

var lpp = [
			"<div id='lppMenu'>",
			"<a class='fa fa-chevron-left' id='backToMainLpi'>  BACK</a><br>",
			"<h4>Lost Person Parameters</h4>",
			"<div class='headerText'>LPI Identifier</div><br>",
			"<input type='text' value='LPI Name' name='lpiName' id='lpiName'><br>",
			"<div class='headerText'>Time at LKP/PLS&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='time at Last Known Position / Point Last Seen'></i>&nbsp;</div><br>",
			"<input id='lpiDate' type='datetime-local' name='time'><br>",
			"<div class='headerText'>Enter your timezone</div><br>",
			"<span>",
			"<input type='radio' name='timezone' value='US/Eastern' " + (systemTimeZoneName === "America/New_York" ? "checked" : "") + ">US/Eastern<br>",
			"<input type='radio' name='timezone' value='US/Central' " + (systemTimeZoneName === "America/Chicago" ? "checked" : "") + ">US/Central<br>",
			"<input type='radio' name='timezone' value='US/Mountain' " + (systemTimeZoneName === "America/Denver" ? "checked" : "") + ">US/Mountain<br>",
			"<input type='radio' name='timezone' value='US/Pacific' " + (systemTimeZoneName === "America/Los_Angeles" ? "checked" : "") + ">US/Pacific<br>",
			"<input type='radio' name='timezone' value='US/Alaska' " + (systemTimeZoneName === "America/Alaska" ? "checked" : "") + ">US/Alaska<br>",
			"<input type='radio' name='timezone' value='US/Arizona' " + (systemTimeZoneName === "America/Arizona" ? "checked" : "") + ">US/Arizona (no DST)<br>",

			"</span>",
			"<div class='headerText'>Lost person's weight (<span class='lbsOrKgUnit'>lbs</span>)</div><br>",
			"<input type='number' min='" + ZEROED_OUT_DEFAULT_VALUE + "' name='ipWeight'><br>",
			"<div class='headerText'>Lost person's gear weight (<span class='lbsOrKgUnit'>lbs</span>)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='the weight of any gear the lost person may be carrying'></i>&nbsp;</div><br>",
			"<input type='number' min='" + ZEROED_OUT_DEFAULT_VALUE + "' value='0' name='ipLoad'><br>",

			"<div class='headerText'>min movement speed (<span class='mphOrKphUnits'>mph</span>)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='min speed the person would move on a flat, unrestricted surface'></i>&nbsp;</div><br>",
			"<input id='minSpeedOfAdvanceInput' type='number' step='0.5' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='minSpeedOfAdvance'><br>",
			"<div class='headerText'>max movement speed (<span class='mphOrKphUnits'>mph</span>)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='max speed the person would move on a flat, unrestricted surface'></i>&nbsp;</div><br>",
			"<input id='maxSpeedOfAdvanceInput' type='number' step='0.5' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='maxSpeedOfAdvance'><br>",

			(mode === "ip" ? "<div class='headerText'>Max stealth speed (kmph)</div><br>" : ""),
			"<input type='" + (mode === "ip" ? "number" : "hidden") + "' min='0' value='1.5' name='stealthSpeed'><br>",
			/**  The below is not shown as LandSAR Web is Civ Only - June 9, 2023 Brandon
			 * 		Zero-ing out values for now (they are not used), in case we decide to add Mil version in
			 * 	    LandSAR web later.	**/
			//"<a href='#' class='advanced'>Advanced Options</a><br>",
			"<div id='moreLppParams'>",
				/*"<div class='headerText'>Maximum duration (hr)</div><br>",
				"<input type='number' placeholder='unlimited' name='duration'><br>",
				"<div class='headerText'>Base resource level (cal)</div><br>",
				"<input type='number' min='0' value='0' name='baseResourceLevel'><br>",
				"<div class='headerText'>Exhaustion level (cal)</div><br>",
				"<input type='number' min='0' value='0' name='exhaustionLevel'><br>",
				"<div class='headerText'>Maximum resource level (cal)</div><br>",
				"<input type='number' min='0' value='0' name='maxResourceLevel'><br>",
				"<div class='headerText'>Recovery level (cal)</div><br>",
				"<input type='number' min='0' value='0' name='recoveryLevel'><br>",
				"<div class='headerText'>Initial resource level (cal)</div><br>",
				"<input type='number' min='0' value='0' name='initResourceLevel'><br>",
				"<div class='headerText'>Base movement speed (mph)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='speed the person would move on a flat, unrestricted surface'></i>&nbsp;</div><br>",
				"<input type='number' min='0' value='0' name='speedOfAdvance'><br>",*/
			"</div>",
			"</div>",
			"<span class='incompleteText'></span><br>",
			"<div class= 'warning' id='lppWarning'></div>",
			"<input type='button' value='Cancel' onclick='promptDeleteCurrentlyDrawingLPI()'>",
			"<input type='button' value='Continue' id='lppContinue'>"

			].join('');

var lppMenu = L.control.dialog({initOpen:false, size: [300,680]})
			.setContent(lpp)
			.addTo(map);

let minSpeedOfAdvanceInput = $('input[type=number][name=minSpeedOfAdvance]');
let maxSpeedOfAdvanceInput = $('input[type=number][name=maxSpeedOfAdvance]');

minSpeedOfAdvanceInput.focusout(function() {
	let minSpeed = parseFloat(minSpeedOfAdvanceInput.val());
	if(minSpeed <= 0){
		showLPPWarning(true, "Please enter min SOA greater than 0");
	}else if(minSpeed > parseFloat(maxSpeedOfAdvanceInput.val())){
		showLPPWarning(true, "Min SOA should be smaller than max SOA");
	}else if(!(parseFloat(maxSpeedOfAdvanceInput.val()) <= 0)){
		showLPPWarning(false);
	}
});

// make this a named function so we can call it from new_lpi.js
function checkMaxSOA() {
	let maxSpeed = parseFloat(maxSpeedOfAdvanceInput.val());
	if(maxSpeed <= 0){
		showLPPWarning(true, "Please enter max SOA greater than 0");
	}else if(maxSpeed < parseFloat(minSpeedOfAdvanceInput.val())){
		showLPPWarning(true, "Min SOA should be smaller than max SOA");
	}else if(!(parseFloat(minSpeedOfAdvanceInput.val()) <= 0)){
		showLPPWarning(false);
	}
}

maxSpeedOfAdvanceInput.focusout(checkMaxSOA());

function showLPPWarning(visible, message = '') {
	if(visible) {
		$('#lppWarning').css('display', 'block')

		// if already showing warning, don't replace
		if(enterInputSOAWarning || $('#lppWarning').text() === ''){
			$('#lppWarning').text(message);
			enterInputSOAWarning = false;
		}
	}else{
		$('#lppWarning').text('');
		$('#lppWarning').css('display', 'none')
	}
}


var lkp = [
			"<a class='fa fa-chevron-left' id='backToLPP'>  BACK</a><br>",
			"<div class='headerText'>Select how to specify the last known position:</div><br>",
			"<span>",
				"<input type='radio' name='lkpShape' value='circle'>Circle<br>",
				"<input type='radio' name='lkpShape' value='polygon'>Polygon<br>",
				(mode == "mil" ? "<input type='radio' name='lkpShape' value='parachute'>Parachute Drop<br>" : ""),
				"<input type='radio' name='lkpShape' value='point'>Point<br>",
			"</span>",
			"<span class='incompleteText'></span><br>",
			"<input type='button' value='Cancel' onclick='promptDeleteCurrentlyDrawingLPI()'>",
			"<input type='button' value='Continue' id='lkpContinue'>"
			].join('');
var lkpMenu = L.control.dialog({initOpen:false})
				.setContent(lkp)
				.addTo(map);

var lkpPointContent = [
	"<div class='headerText'>Coordinates: </div>",

	"<div class='headerText'>Latitude (degrees)</div><br>",
	"<input id='lpiPointLat' type='number' value='' name='lpiLat'><br>",

	"<div class='headerText'>Longitude (degrees)</div><br>",
	"<input id='lpiPointLon' type='number' value='' name='lpiLon'><br>"
]

function addPointInput(counter, lat, lon, shape){
	let lon_values, lon_degrees, lon_minutes, lon_seconds,
		lat_values, lat_degrees, lat_minutes, lat_seconds,
		coordinate;

	let label = "Point";
	if(shape === Shapes.CIRCLE){
		label = "Center Point"
	}

	if(counter >= 3){
		pointMenu._container.style.height = "calc(100vh - 200px)";
	}else{
		pointMenu._container.style.height = "470px";
	}

	switch (coordinateSystem) {
		case coordinateSystems.DECIMAL_LAT_LON:
			return [
				"<div id='addPointInput" + counter + "'>",
				"<div class='headerText'>" + label + " " + (counter + 1) + ":</div><br>",
				"<div class='headerText'>Latitude</div><br>",
				"<input class='editPointInput lpiPointLat' type='numeric' value='" + lat + "' name='lpiLat'><br>",
				"<div class='headerText'>Longitude</div><br>",
				"<input class='editPointInput lpiPointLon' type='numeric' value='" + lon + "' name='lpiLon'><br><br>",
				"</div>"
			].join('');
		case coordinateSystems.DMS_LAT_LON:
			/*
			   Convert decimal degrees to DMS
			 */
			lon_values = deg_to_dms(lon, false);
			lon_degrees = lon_values[0];
			lon_minutes = lon_values[1];
			lon_seconds = lon_values[2];

			lat_values = deg_to_dms(lat, false);
			lat_degrees = lat_values[0];
			lat_minutes = lat_values[1];
			lat_seconds = lat_values[2];

			// DMS
			return [
				"<div id='addPointInput" + counter + "'>",
				"<div class='headerText'>" + label + " " + (counter + 1) + ":</div><br>",

				"<div class='container'>",
				"<div class='headerText'>Latitude</div><br>",
				"<span>Degrees: </span><input class='editPointInput lpiPointDegree' type='numeric' value='" + lat_degrees + "' name='lpiDegree'><br>",
				"<span>Minutes: </span><input class='editPointInput lpiPointMinute' type='numeric' value='" + lat_minutes + "' name='lpiMinute'><br>",
				"<span>Seconds: </span><input class='editPointInput lpiPointSecond' type='numeric' value='" + lat_seconds + "' name='lpiSeconds'><br>",

				"<div class='headerText'>Longitude</div><br>",
				"<span>Degrees: </span><input class='editPointInput lpiPointDegree2' type='numeric' value='" + lon_degrees + "' name='lpiDegree2'><br>",
				"<span>Minutes: </span><input class='editPointInput lpiPointMinute2' type='numeric' value='" + lon_minutes + "' name='lpiMinute2'><br>",
				"<span>Seconds: </span><input class='editPointInput lpiPointSecond2' type='numeric' value='" + lon_seconds + "' name='lpiSeconds2'><br><br>",

				"</div>"
			].join('');
		case coordinateSystems.DEC_MIN_LAT_LON:
			/*
			   Convert decimal degrees to DDM
			 */
			lon_values = deg_to_decimal_minutes(lon, false);
			lon_degrees = lon_values[0];
			lon_minutes = lon_values[1];

			lat_values = deg_to_decimal_minutes(lat, false);
			lat_degrees = lat_values[0];
			lat_minutes = lat_values[1];

			return [
				"<div id='addPointInput" + counter + "'>",
				"<div class='headerText'>" + label + " " + (counter + 1) + ":</div><br>",

				"<div class='container'>",
				"<div class='headerText'>North</div><br>",
				"<span>Degrees: </span><input class='editPointInput lpiPointDegree' type='numeric' value='" + lat_degrees + "' name='lpiDegree'><br>",
				"<span>Minutes: </span><input class='editPointInput lpiPointMinute' type='numeric' value='" + lat_minutes + "' name='lpiMinute'><br>",

				"<div class='headerText'>East</div><br>",
				"<span>Degrees: </span><input class='editPointInput lpiPointDegree2' type='numeric' value='" + lon_degrees + "' name='lpiDegree2'><br>",
				"<span>Minutes: </span><input class='editPointInput lpiPointMinute2' type='numeric' value='" + lon_minutes + "' name='lpiMinute2'><br><br>",

				"</div>"
			].join('');
		case coordinateSystems.UTM:
			/*
			   Convert decimal degrees to UTM

			   UTM coordinates are specified as Zone Number, Meters East (the easting), and Meters North (the northing).
			 */
			coordinate = new Latlon_Utm_Mgrs(lat, lon).toUtm();

			return [
				"<div id='addPointInput" + counter + "'>",
				"<div class='headerText'>" + label + " " + (counter + 1) + ":</div><br>",

				"<div class='container'>",
				"<span>Zone: </span><input class='editPointInput lpiPointZone' type='numeric' value='" + coordinate.zone + "' name='lpiZone'><br>",
				"<span>Easting: </span><input class='editPointInput lpiPointEasting' type='numeric' value='" + Math.trunc(Math.round(coordinate.easting)) + "' name='lpiEasting'><br>",
				"<span>Northing: </span><input class='editPointInput lpiPointNorthing' type='numeric' value='" + Math.trunc(Math.round(coordinate.northing)) + "' name='lpiNorthing'><br><br>",
				"</div>"
			].join('');
		case coordinateSystems.USNG_MGRS:
			/*
			   Convert decimal degrees to MGRS

			   MGRS uses a Zone, A 2 letter code to indicate a 100km square, and an easting and northing value.
			   Then the numeric easting and northing are abbreviated.
			 */
			coordinate = new Latlon_Utm_Mgrs(lat, lon).toUtm().toMgrs();

			return [
				"<div id='addPointInput" + counter + "'>",
				"<div class='headerText'>" + label + " " + (counter + 1) + ":</div><br>",

				"<div class='container'>",
				"<span>Grid Zone Designator: </span><input class='gridZoneDesignator editPointInput' value='" + coordinate.zone + coordinate.band + "' name='gridZoneDesignator' maxlength='3'><br>",
				"<span>100,000 m Identifier: </span><input class='mIdentifier editPointInput' type='text' value='" + coordinate.e100k + coordinate.n100k + "' name='mIdentifier' minlength='2' maxlength='2'><br>",
				"<span>Easting: </span><input class='lpiPointEasting editPointInput' type='numeric' value='" + Math.trunc(Math.round(coordinate.easting)) + "' name='lpiPointEasting'><br>",
				"<span>Northing: </span><input class='lpiPointNorthing editPointInput' type='numeric' value='" + Math.trunc(Math.round(coordinate.northing)) + "' name='lpiPointNorthing'><br><br>",
				"</div>"
			].join('');
	}

}

var pointInput = [
	"<i class=\"fa fa-chevron-left\"></i>",
	"<input type='button' value='BACK' class='fa fa-chevron-left backToLKP backPoint'><br>",
	"<h4 style='font-size: 18px;'>Drawn Coordinates: </h4>",
	"<div id='lkpPointContentHolder'>(will populate after shape is drawn)</div>",
	"<input type='button' value='Cancel' id='pointCancel'>",
	"<input type='button' value='Confirm' id='pointContinue'>",
	"<div id='pointWarning' class='LandSARWarning'></div>"
].join('');


var pointMenu = L.control.dialog({initOpen:false, size: [width, height]})
	.setContent(pointInput)
	.addTo(map);

pointMenu._container.style.marginTop = "60px";

var parachuteDrop = [
						"<a class='fa fa-chevron-left backToLKP'>  BACK</a><br>",
						"<div class='headerText'>Position 2 Signma Uncertainty (meters):</div><br>",
						"<input type='number' min='0' value='1500' name='sigmaUncertainty' id='sigmaUncertainty'><br>",
						"<div class='headerText'>Altitude (feet above sea level):</div><br>",
						"<input type='number' value='1500' name='parachuteAltitude' id='parachuteAltitude'><br>",
						"<div class='headerText'>Wind speed (kts):</div><br>",
						"<input type='number' value='20' name='windSpeed' id='windSpeed'><br>",
						"<div class='headerText'>Wind direction - wind from (deg):</div><br>",
						"<input type='number' value='0' name='windDirection' id='windDirection'><br><br>",
						"<input type='button' value='Cancel' onclick='promptDeleteCurrentlyDrawingLPI()'>",
						"<input type='button' value='Continue' id='pdContinue'>"
					].join('');
var parachuteMenu = L.control.dialog({initOpen:false})
						.setContent(parachuteDrop)
						.addTo(map);

var mm = [
			"<a class='fa fa-chevron-left backToLKP'>  BACK</a><br>",
			"<div class='headerText'>Select motion model:</div><br>",
			"<span>",
			"<div id='motionModelSelections'>",
				"<input type='radio' name='motionModel' id='easiest' value='LOST_HIKER'>Lost hiker - no destination<br>",
				"<input type='radio' name='motionModel' id='rendezvous' value='RENDEZVOUS'>Lost hiker with destination<br>",
				"<input type='radio' name='motionModel' id='fleeing' value='FLEEING_NO_INFO'>Long term unknown destination<br>",
				"<input type='radio' name='motionModel' id='stationary' value='STATIONARY'>Stationary<br>",
			"</div>",
			"</span>",
			"<hr>",
			"<div style='display: flex;'>",
			"<input id='ipWaterToggle' type='checkbox' checked>",
			"<label id='ipWaterToggleText' for='ipWaterToggle' style='padding-left: 5px;'> Stay out of water (not applicable to Stationary model)</label><br>",
			"</div>",
			"<span class='incompleteText'></span><br>",
			"<input type='button' value='Cancel' onclick='promptDeleteCurrentlyDrawingLPI()'>",
			"<input type='button' value='Continue' id='mmContinue'>"
		 ].join('');
var mmMenu = L.control.dialog({initOpen:false})
				.setContent(mm)
				.addTo(map);

var wanderingParamsForm = [
            "<a class='fa fa-chevron-left' id='backButtonWandering'>  BACK</a><br>",
            "<div class='headerText'>Enter wandering parameters</div><br>",
			"<form name='wanderingParamsForm'>",
            "<div class='headerText'>Distance Increment (<span class='metersOrFeetUnits'>m</span>)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='The assessed distance the lost person will attempt to walk before reassessing their situation and change course.  The environment will heavily influence this parameter.'></i>&nbsp;</div><br>",
            "<input type='number' min='0' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='incrementDistMeters'><br>",
            "<div class='headerText'>Max distance (<span class='milesOrKMUnits'>mi</span>)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='The total distance assessed that the lost person will attempt to travel.  The total distance traveled for any single sample path will be comprised of the sum of all of the distance increment segments in order to reach the goal of the maximum theoretical distance.'></i>&nbsp;</div><br>",
            "<input type='number' min='0' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='maxDistance'><br>",
            "<div class='headerText'>Number options (paths) considered&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='The number of choices a lost person will present themselves with after achieving their distance increment before they will move on to the next segment of their movement.'></i>&nbsp;</div><br>",
            "<input type='number' min='0' value='" + ZEROED_OUT_DEFAULT_VALUE + "' pattern=\" 0+\\.[0-9]*[1-9][0-9]*$\" onkeypress=\"return event.charCode >= 48 && event.charCode <= 57\" name='numberPathsConsidered'><br>",
            "<div class='headerText'>Course change stdev (deg)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='The lost person will consider choices presented to them within a set degree of angle with the idea of continuously forward progress (not looking back).'></i>&nbsp;</div><br>",
            "<input type='number' min='0' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='courseChangeSigmaDegrees'><br>",
			"<div id='wanderingParamsWarning' class='LandSARWarning'></div>",
			"<input type='button' value='Cancel' onclick='promptDeleteCurrentlyDrawingLPI()'>",
			"<input type='button' value='Continue' id='wanderingParamsContinue'>",
			"</form>"
        ].join('');
var wanderingParamsMenu = L.control.dialog({initOpen:false, size:[300, 400]})
                            .setContent(wanderingParamsForm)
                            .addTo(map);

let incrementDistMetersInput = $('input[type=number][name=incrementDistMeters]');
let maxDistanceInput = $('input[type=number][name=maxDistance]');
let numberPathsConsideredInput = $('input[type=number][name=numberPathsConsidered]');

incrementDistMetersInput.focusout(function() {
	checkWanderingParams();
});

maxDistanceInput.focusout(function() {
	checkWanderingParams();
});

numberPathsConsideredInput.focusout(function() {
	checkWanderingParams();
});

// default is in metric, convert to imperial if that is user preferences
const INC_DISTANCE_MAX_METERS = 30;
const MAX_DISTANCE_KM_MIN = 0;
const MAX_DISTANCE_KM_MAX = 100;

function checkWanderingParams(){
	let wanderingForm = document.forms['wanderingParamsForm'];

	if(wanderingForm["incrementDistMeters"].valueAsNumber <
		(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL ? feetToM(INC_DISTANCE_MAX_METERS)
	    : INC_DISTANCE_MAX_METERS)){
		toggleWarning('#wanderingParamsWarning', true, "Increment distance must be at least 30m.");
		return false;

		// (always zero)
	}else if(wanderingForm["maxDistance"].valueAsNumber < (layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
		? milesToKm(MAX_DISTANCE_KM_MIN) : MAX_DISTANCE_KM_MIN)){
		toggleWarning('#wanderingParamsWarning', true, "Max distance must be positive");
		return false;
	}else if(wanderingForm["maxDistance"].valueAsNumber > (layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
		? milesToKm(MAX_DISTANCE_KM_MAX) : MAX_DISTANCE_KM_MAX)){
		toggleWarning('#wanderingParamsWarning', true, "Max distance must be 100km or less.");
		return false;
	}else if(wanderingForm["numberPathsConsidered"].valueAsNumber <= 0 || wanderingForm["numberPathsConsidered"].valueAsNumber >= 100) {
		toggleWarning('#wanderingParamsWarning', true, "Number of paths considered must be at least 1, and less than 100.");
		return false;
	}else{
		toggleWarning('#wanderingParamsWarning', false);
		return true;
	}

}

// it would be great if we could get the default goal oriented parameters from the server (since we allow setting
// the defaults for the server via a JSON file, but for now since the only time the defaults change that we know of
// is for PR/SAR, just use the SAR defaults, hard-coded. Adding an option to "use server defaults" could also be good.
var goalParamsFormContent = [
	"<a class='fa fa-chevron-left' id='backButtonGoalParams'>  BACK</a><br>",
	"<div class='headerText'>Enter Goal Oriented parameters (Optional)</div><br><br>",
	"<form id='goalForm' name='goalParamsForm'>",
	"<div class='headerText'>Maximum leg length (<span class='milesOrKMUnits'>m</span>)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='an assessed value with environmental considerations taken into account regarding the maximum distance a person will move BEFORE making a course change.'></i>&nbsp;</div><br>",
	"<input type='number' min='1' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='maxLegLength'><br>",
	"<div class='headerText'>Awareness radius (<span class='milesOrKMUnits'>m</span>)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='a value assessed by LandSAR user defining the maximum distance/range a person may be aware of, knowing their surroundings, taking into account environmental characteristics.'></i>&nbsp;</div><br>",
	"<input type='number' min='1' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='awarenessRadius'><br>",
	"<div class='headerText'>Move radius (<span class='milesOrKMUnits'>m</span>)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='a value assessed by LandSAR user defining the maximum distance/range a person may move to achieve up to but not exceeding their overall awareness.'></i>&nbsp;</div><br>",
	"<input type='number' min='1' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='moveRadius'><br>",
	"<div class='headerText'>Minimum turn angle (deg)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='an assessed value with environmental considerations taken into account regarding the minimum angle a person will turn in order to evaluate their next course change (forward progression).'></i>&nbsp;</div><br>",
	"<input type='number' min='0' max='360' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='minTurnAngle'><br>",
	"<div class='headerText'>Maximum turn angle (deg)&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='an assessed value with environmental considerations taken into account regarding the maximum angle a person will turn in order to evaluate their next course change (forward progression).'></i>&nbsp;</div><br>",
	"<input type='number' min='0' max='360' value='" + ZEROED_OUT_DEFAULT_VALUE + "' name='maxTurnAngle'><br>",
	"<div id='goalParamsWarning' class='LandSARWarning'></div>",
	"<input type='button' value='Cancel' onclick='promptDeleteCurrentlyDrawingLPI()'>",
	"<input type='reset'>",
	"<input type='button' value='Continue' id='goalParamsContinue'>",

	"</form>"
].join('');

var goalParamsMenu = L.control.dialog({initOpen:false, size:[300, 500]})
	.setContent(goalParamsFormContent)
	.addTo(map);

let maxLegLengthInput = $('input[type=number][name=maxLegLength]');
let awarenessRadiusInput = $('input[type=number][name=awarenessRadius]');
let moveRadiusInput = $('input[type=number][name=moveRadius]');
let maxTurnAngleInput = $('input[type=number][name=maxTurnAngle]');
let minTurnAngleInput = $('input[type=number][name=minTurnAngle]');

maxLegLengthInput.focusout(function() {
	checkGoalParams();
});

awarenessRadiusInput.focusout(function() {
	checkGoalParams();
});

moveRadiusInput.focusout(function() {
	checkGoalParams();
});

maxTurnAngleInput.focusout(function() {
	checkGoalParams();
});

minTurnAngleInput.focusout(function() {
	checkGoalParams();
});

//Max leg length > awareness radius > move radius
//These values should all be integers greater than 0
function checkGoalParams(){
	let goalForm = document.forms['goalParamsForm'];
	let maxLegLength = goalForm["maxLegLength"].valueAsNumber;
	let awarenessRadius = goalForm["awarenessRadius"].valueAsNumber;
	let moveRadius = goalForm["moveRadius"].valueAsNumber;

	let minTurnAngle = goalForm["minTurnAngle"].valueAsNumber;
	let maxTurnAngle = goalForm["maxTurnAngle"].valueAsNumber;

	if(maxLegLength < 0){
		toggleWarning('#goalParamsWarning', true, "Max leg length must be greater than 0");
		return false;
	}else if(awarenessRadius < 0){
		toggleWarning('#goalParamsWarning', true, "Awareness radius must be greater than 0");
		return false;
	}else if(moveRadius < 0){
		toggleWarning('#goalParamsWarning', true, "Move radius must be greater than 0");
		return false;
	}else if(maxTurnAngle <= minTurnAngle){
		toggleWarning('#goalParamsWarning', true, "Max turn angle must be greater than min turn angle");
		return false;
	}else if(minTurnAngle < 0 || minTurnAngle > 360){
		toggleWarning('#goalParamsWarning', true, "Min turn angle must be between 0 and 360");
		return false;
	}else if(maxTurnAngle < 0 || maxTurnAngle > 360){
		toggleWarning('#goalParamsWarning', true, "Max turn angle must be between 0 and 360");
		return false;
	}
	else if (maxLegLength > awarenessRadius){
		if ( awarenessRadius > moveRadius) {
			toggleWarning('#goalParamsWarning', false);
			return true;
		}  else {
			toggleWarning('#goalParamsWarning', true, "Move radius must be smaller than Awareness Radius");
			return false;
		}
	} else {
		toggleWarning('#goalParamsWarning', true, "Awareness Radius must be smaller than Max Leg Length");
		return false;
	}

}

var landcoverMetaForm = [
	"<a class='fa fa-chevron-left' id='backLandcoverMetaForm'>  BACK</a><br>",
	"<form>",
	"<div class='headerText'>Enter Landcover Meta Data (Optional)</div><br><br>",
	"<div class='landcoverMetaFormHolder'></div><br>",
	"<input type='button' value='Cancel' onclick='promptDeleteCurrentlyDrawingLPI()'>",
	"<input type='button' value='Reset' id='resetMeta'>",
	"<input type='button' value='Continue' id='landcoverMetaContinue'>",
	"</form>"
].join('');

var landcoverMetaFormMenu = L.control.dialog({initOpen:false, size:[665, 725]})
	.setContent(landcoverMetaForm)
	.addTo(map);

landcoverMetaFormMenu._container.style.LEFT = "60px";

var mvmtSched = [
	"<a class='fa fa-chevron-left' id='backToMM'>  BACK</a><br>",
	"<div class='headerText'>Select movement schedule</div><br>",
	"<span>",
		"<input type='radio' name='mvmtSched' value='continuous'>Continuous&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='always moving, no breaks'></i>&nbsp;<br>",
		"<input type='radio' name='mvmtSched' value='night'>Night&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='moving 5pm-11pm, break 11pm-1am, moving 1am-7am, resting 7am-5pm'></i>&nbsp;<br>",
		"<input type='radio' name='mvmtSched' value='day'>Day&nbsp;<i class='fa fa-info-circle' data-toggle='tooltip' title='moving 5am-11am, break 11-1pm, moving 1pm-7pm, resting 7pm-5am'></i>&nbsp;<br>",
	"</span>",
	"<span class='incompleteText'></span><br>",
	"<input type='button' value='Cancel' onclick='promptDeleteCurrentlyDrawingLPI()'>",
	"<input type='button' value='Submit' id='newLpiSubmit'>"
].join('');
var mvmtSchedMenu = L.control.dialog({initOpen: false, size:[300, 307]})
					.setContent(mvmtSched)
					.addTo(map);

var completedSearchInfoText = "This option allows you to specify a search that has already been completed, but was not generated through LandSAR. This allows LandSAR's algorithms to account for that search. This feature is currently under development and should be available soon.";
var search = [
				"<a class='fa fa-chevron-left' id='backToMainSearch'>  BACK</a><br>",
				"<div class='headerText'>Search type:</div><br>",
				"<span>",
					"<input type='radio' name='searchType' value='completed' disabled=true><span style='color: gray;'>Completed search</span>&nbsp;<i onclick='bootbox.alert(completedSearchInfoText);' class='fa fa-info-circle' style='font-size: larger; cursor: pointer;'></i>&nbsp;<br>",
					"<input type='radio' name='searchType' value='new' checked>New search<br>",
				"</span>",
				"<div class='headerText'>Time</div><br>",
			    "<div id='searchTimeContainer'>",
					"<input id='searchDate' type='datetime-local' name='time'><br>",
					"<div id='searchTimezone'></div><br>",
	            "</div>",
				"<div class='headerText'>How will you be searching?</div><br>",
				"<span>",
					"<input id='footOptionInput' type='radio' name='searchPlatform' value='FOOT'>Foot<br>",
					"<input id='heliOptionInput' type='radio' name='searchPlatform' value='HELICOPTER'>Helicopter<br>",
					"<div id='searchAssetOption'><input id='searchAssetOption' type='radio' name='searchPlatform' value='SEARCH_ASSET'>External Search Asset</div><br>",
				"</span>",
				"<div id='searchAssetOuterContainer'>",
				"<div class='headerText'>External Search Asset</div><br>",
				"<div id='externalSearchAssetContainer'>",
					"<input type='radio' name='searchAsset' value='DEFAULT'>None<br>",
				"</div>",
				"</div>",
				"<span class='incompleteText'></span><br>",
				"<input type='button' value='Cancel' onclick='showConfirmCancelLPIModal()'>",
				"<input type='button' value='Continue' id='spContinue'>"
			].join('');
var searchForm = L.control.dialog({initOpen: false, size:[300, 400]})
					.setContent(search)
					.addTo(map);

var assetSearch = [
	"<a class='fa fa-chevron-left backToPlatform'>  BACK</a><br>",
	"<div class='headerText'>Search Duration (hours)</div><br>",
	"<span>",
	"<input type='number' name='searchDuration'><br>",
	"<div class='headerText'>Enter sweep width (meters):</div><br>",
	"<input type='number' min='1' name='searchSweepWidth'><br>",
	"</span>",
	"<div class='headerText'>Sensor Probability of Success (0 to 1)</div><br>",
	"<span>",
	"<input type='number' min=\"0\" max=\"1\" name='searchSensorProb'><br>",
	"</span>",
	"<input type='number' min=\"0\" name='speedKmPerHr'><br>",
	"</span>",
	"<span class='incompleteText'></span><br>",
	"<input type='button' value='Cancel' onclick='showConfirmCancelLPIModal()'>",
	"<input type='button' value='Submit' id='asContinue'>"
].join('');

var assetSearchForm = L.control.dialog({initOpen: false, size: [270,400]})
	.setContent(assetSearch)
	.addTo(map);

var footSearch = [
					"<a class='fa fa-chevron-left backToPlatform'>  BACK</a><br>",
					"<div class='headerText'>Select sensor</div><br>",
					"<span>",
						"<input type='radio' name='sensor' value='VISUAL'>Visual<br>",
						"<input type='radio' name='sensor' value='NIGHTVISION'>Night Vision<br>",
					"</span>",
					"<div class='headerText'>Foot Search Party Size</div><br>",
					"<span>",
						"<input type='number' name='searchPartySize'><br>",
					"</span>",
					"<div class='headerText'>Crew status</div><br>",
					"<span>",
						"<input type='radio' name='crewStatus' value='FRESH'>Fresh<br>",
						"<input type='radio' name='crewStatus' value='FATIGUED'>Fatigued<br>",
					"</span>",
					"<div class='headerText'>Select season</div><br>",
					"<span>",
						"<input type='radio' name='searchSeason' value='SPRING'>Spring<br>",
						"<input type='radio' name='searchSeason' value='SUMMER'>Summer<br>",
						"<input type='radio' name='searchSeason' value='FALL'>Fall<br>",
						"<input type='radio' name='searchSeason' value='WINTER'>Winter<br>",
					"</span>",
					"<span class='incompleteText'></span><br>",
					"<input type='button' value='Cancel' onclick='showConfirmCancelLPIModal()'>",
					"<input type='button' value='Continue' id='fsContinue'>"
					].join('');
var footForm = L.control.dialog({initOpen: false, size: [300,400]})
					.setContent(footSearch)
					.addTo(map);

var heliSearch = [
					"<a class='fa fa-chevron-left backToPlatform'>  BACK</a><br>",
					"<div class='headerText'>Select sensor</div><br>",
					"<span>",
						"<input type='radio' name='sensor' value='VISUAL'>Visual<br>",
						"<input type='radio' name='sensor' value='NIGHTVISION'>Night Vision<br>",
						"<input type='radio' name='sensor' value='FLIR'>FLIR<br>",
					"</span>",
					"<div class='headerText'>Is the search box constrained to the North-South-East-West orientation?</div><br>",
					"<span>",
						"<input type='radio' name='searchShape' value='constrained'>Constrained<br>",
						"<input type='radio' name='searchShape' value='free'>Free<br>",
					"</span>",
					"<div class='headerText'>Select altitude (above ground level)</div><br>",
					"<span>",
						"<input type='radio'  name='elevation' value='UNDER500'><span id='elevationUnder500'>Under 500 feet</span><br>",
						"<input type='radio' name='elevation' value='TO_1000'><span id='elevationTo1000'>500 to 1000 feet</span><br>",
						"<input type='radio' name='elevation' value='OVER1000'><span id='elevationOver1000'>Over 1000 feet</span><br>",
					"</span>",
					"<div class='headerText'>Crew status</div><br>",
					"<span>",
						"<input type='radio' name='crewStatus' value='FRESH'>Fresh<br>",
						"<input type='radio' name='crewStatus' value='FATIGUED'>Fatigued<br>",
					"</span>",
					"<div class='headerText'>Select season</div><br>",
					"<span>",
						"<input type='radio' name='searchSeason' value='SPRING'>Spring<br>",
						"<input type='radio' name='searchSeason' value='SUMMER'>Summer<br>",
						"<input type='radio' name='searchSeason' value='FALL'>Fall<br>",
						"<input type='radio' name='searchSeason' value='WINTER'>Winter<br>",
					"</span>",
					"<span class='incompleteText'></span><br>",
					"<input type='button' value='Cancel' onclick='showConfirmCancelLPIModal()'>",
					"<input type='button' value='Continue' id='hsContinue'>"
					].join('');
var heliForm = L.control.dialog({initOpen: false, size: [300,520]})
					.setContent(heliSearch)
					.addTo(map);

var footSearchInfoText = "For foot searches this is the sweep width across the search party, not the individual searcher's sweep width";

var directEntry = [
					"<a class='fa fa-chevron-left' id='backToSf'>  BACK</a><br>",
					"<div class='headerText'>Enter sweep width (<span class='metersOrFeetUnits'>m</span>):</div><br>",
					"<input type='number' min='1' name='sweepWidth' id='sweepWidth'>&nbsp;<i onclick='bootbox.alert(footSearchInfoText);' class='fa fa-info-circle' style='font-size: medium; cursor: pointer;'></i><br>",
					"<div class='headerText'>Enter time on station (hours):</div><br>",
					"<input type='number' step='0.01' min='0.01' name='timeOnStationHrs' id='timeOnStationHrs'><br>",
					"<div class='headerText'>Enter search speed (<span class='mphOrKphUnits'>m</span>):</div><br>",
					"<input type='number' step='0.01' min='0.01' name='speed' id='speed'><br><br>",
					"<input type='button' value='Cancel' onclick='showConfirmCancelLPIModal()'>",
					"<input type='button' value='Continue' id='deContinue'>"
					].join('');
var directForm = L.control.dialog({initOpen: false})
					.setContent(directEntry)
					.addTo(map);

var coordinatesEntry = [
						// TODO: fix this back button
						//"<a class='fa fa-chevron-left' id='backToSf'>  BACK</a><br>",
						"<div class='headerText'>Northwest latitude:</div><br>",
						"<input type='number' name='nwLat' id='nwLat'><br>",
						"<div class='headerText'>Northwest longitude:</div><br>",
						"<input type='number' name='nwLng' id='nwLng'><br>",
						"<div class='headerText'>Southeast latitude:</div><br>",
						"<input type='number' name='seLat' id='seLat'><br>",
						"<div class='headerText'>Southeast longitude:</div><br>",
						"<input type='number' name='seLng' id='seLng'><br><br>",
						"<input type='button' value='Cancel' onclick='showConfirmCancelLPIModal()'>",
						"<input type='button' value='Submit' id='searchSubmit'>"
						].join('');
var coordinatesForm = L.control.dialog({initOpen: false})
						.setContent(coordinatesEntry)
						.addTo(map);

var listLpis = [
				"<a class='fa fa-chevron-left' id='backToMainViewLpis'>  BACK</a><br>",
				"<table id='lpiTable'></table>"
				].join('');
var viewLpisForm = L.control.dialog({initOpen: false})
					.setContent(listLpis)
					.addTo(map);

var sliderDateTimeContent = "Start";
var sliderDateTime = L.control.dialog({initOpen: false, size: [440, 50]})
	.setContent(sliderDateTimeContent)
	.addTo(map);
sliderDateTime.hideResize();
sliderDateTime.hideClose();
sliderDateTime.hideGrabber();

var missionPackages = [
						"<a class='fa fa-chevron-left' id='backToMainViewMissionPackages'>  BACK</a><br>",

						"<span style='font-weight: bold;'>Select a search:</span><br>",
						"<select id='mpid' name='mpid' class='ui-selectmenu-button ui-selectmenu-button-closed ui-corner-all ui-button ui-widget'></select><br>",
						"<input type='button' id='loadBtn' name='loadBtn' value='Load' onClick='retrieveMP();' class='ui-button ui-widget ui-corner-all'/><br><br>",
						"<span style='font-weight: bold;'>Jump to specific date/time:</span><br>",
						"<select onChange='overlaySelectChanged(this);' id='overlays' name='overlays' class='ui-selectmenu-button ui-selectmenu-button-closed ui-corner-all ui-button ui-widget'><option>Select a date/time</option></select>"

						].join('');
var missionPackagesForm = L.control.dialog({initOpen: false})
		.setContent(missionPackages)
		.addTo(map);



var sliderContainer = L.control.dialog({initOpen: true, minSize: [70,0], maxSize: [1000000, 100000]})
						.setContent([ "<div style='background: rgb(255, 255, 255); background-opacity: 0.5; margin: 0px;'>&nbsp;<div id='slider'></div>&nbsp;</div>" ].join(''))
						.addTo(map);
sliderContainer.hideResize();
sliderContainer.hideClose();
sliderContainer.freeze();
sliderContainer.setLocation([window.innerHeight - 100, 0]);
sliderContainer.setSize([window.innerWidth, 0]);
sliderContainer.close();

window.addEventListener("resize", function() {
	sliderContainer.setLocation([window.innerHeight - 100, 0]);
});

var pluggableMotionModel = ["<a class='fa fa-chevron-left' id='backPluggableMotionModel'>  BACK</a><br>",
	"<form>",
	"<div id='motionModelInputsHeader' class='headerText'>Pluggable Motion Model Inputs</div><br><br>",
	"<div id='MotionModelInputsDescriptionHolder'>" +
	"</div><br>",
	"<input type='button' value='Cancel' onclick='cancelNewLpi()'>",
	"<input type='reset'>",
	"<input type='button' value='Continue' id='pluggableMotionModelContinue'>",
	"<div id='pluggableMotionModelInputsWarning' class='LandSARWarning'></div>",
	"</form>"
].join('');

var pluggableMotionModelMenu = L.control.dialog({initOpen: false, size: [300, 400]})
	.setContent(pluggableMotionModel)
	.addTo(map);

var menus = [	mainMenu, lppMenu, lkpMenu, pointMenu, parachuteMenu, mmMenu, wanderingParamsMenu, goalParamsMenu, // forms for lpis
				searchForm,footForm, heliForm, directForm, coordinatesForm, // forms for searches
				viewLpisForm, missionPackagesForm,layersMenu, mvmtSchedMenu, landcoverMetaFormMenu, 
				assetSearchForm, pluggableMotionModelMenu
			];

let menusWithoutClose = [
	mainMenu,
	missionPackagesForm,
	layersMenu
];

$(document).ready(function() {

	for(let i in menus) {
		if(menus[i] !== landcoverMetaFormMenu) {
			menus[i].setLocation([20, window.innerWidth - (mainMenu.getElement().clientWidth + 30)]);
		}
	}
	for(let i in menusWithoutClose){
		menusWithoutClose[i].hideClose()
	}
	landcoverMetaFormMenu.setLocation([20, window.innerWidth - (landcoverMetaFormMenu.getElement().clientWidth + 30)]);

	$('#moreLppParams').hide();
	$('.advanced').click(function() {
		if ($('#moreLppParams').is(':hidden')) {
			$('#moreLppParams').slideDown();
		} else {
			$('#moreLppParams').slideUp();
		}
	});

	/**
	 * Close button listeners, (New LPI or New Search state)
	 */
	$('.leaflet-control-dialog-close').click(function(){
		console.log("Dialog's close button pressed")
		showConfirmCancelLPIModal()
	});

	/**
	 * Close button listeners, (AAR)
	 */
	$('.aarClose').click(function() {
		console.log("Dialog's close button pressed")
		aarStates[stateManagement.getLastState()] = cloneHTML($("#aarContent"));

		showConfirmCancelLPIModal()
	});
});

$(window).on('resize', function() {
	for (var i in menus) {
		if(menus[i] !== landcoverMetaFormMenu) {
			menus[i].setLocation([20, window.innerWidth - (mainMenu.getElement().clientWidth + 30)]);
		}
	}
	landcoverMetaFormMenu.setLocation([20, window.innerWidth - (landcoverMetaFormMenu.getElement().clientWidth + 30)]);

	sliderContainer.setLocation([window.innerHeight - 100, 10]);
	sliderContainer.setSize([window.innerWidth - 50, 0]);
});

//when given the variable name of a form, returns a boolean
//corresponding with whether the user has filled out all inputs
function checkFormStatus(menu, isSearchForm=false) {
	var radioNames = {},
	complete = true;
	$(this[menu]._container.getElementsByTagName('input')).filter(":radio").each(function() {
		if(!(this.name in radioNames))
			radioNames[this.name] = null;
		if(this.checked)
			radioNames[this.name] = true;
	});
	$(this[menu]._container.getElementsByTagName('input')).filter("[type=number]").each(function() {
		if(!(this.name in radioNames))
			radioNames[this.name] = null;
		if(this.value != "" || this.placeholder != undefined)
			radioNames[this.name] = true;
	});
	$(this[menu]._container.getElementsByTagName('input')).filter("[type=text]").each(function() {
		if(!(this.name in radioNames))
			radioNames[this.name] = null;
		if(this.value != "")
			radioNames[this.name] = true;
	});

	let searchPlatform = "";
	if(isSearchForm) {
		searchPlatform = $('input[name=searchPlatform]').filter(":checked")[0].value
	}
	for (var prop in radioNames) {
		if(!(radioNames[prop])) {
			console.log(prop)
			if(searchPlatform === "SEARCH_ASSET" && prop === "searchAsset") {
				complete = false;
			} else if(prop !== "searchAsset"){
				complete = false;
			}
		}
	}

	if(!complete)
		$('.incompleteText').text("Please finish filling out the form before you continue");
	else
		$('.incompleteText').text("");
	return complete;
}

function openMainMenu() {
	$('input[type=datetime-local]').each(function() { this.value = ""; });
	$('#openMainMenu').hide();
	//lastState = "MainMenu";
	hideHelperText()
	stopDrawing()

	if(stateManagement.hadSavedState()){
		// TODO: is this necessary?
		for (let i in menus) {
			menus[i].close();
		}
		mainMenu.open();

		let mainMenuContinueBtn = $("#mainMenuContinueBtn");

		if(stateManagement.getSavedStateType() === LPI) {
			mainMenuContinueBtn.text("Continue New Lost Person Instance");
			mainMenuContinueBtn.show()

			if (stateManagement.getLastState() === RENDEZVOUS || stateManagement.getLastState() === GOAL_POINTS) {
				clearLayers(lpWrapper.getRendezvousPointUUIDs());
				lpWrapper.rendezvousPointUUIDs = new Set()
			} else if (stateManagement.getLastState() === KNOWN) {
				clearLayers(lpWrapper.getKnownExclusionZoneUUIDs());
				lpWrapper.knownExclusionZoneUUIDs = []
			} else if (stateManagement.getLastState() === FLEEING || stateManagement.getLastState() === DISCOVERED) {
				clearLayers(lpWrapper.getDiscoveredExclusionZoneUUIDs());
				lpWrapper.discoveredExclusionZoneUUIDs = []
			} else if (stateManagement.getLastState() === DRAW_LKP) {
				clearLayers(lpWrapper.getLkpUUIDs());
				lpWrapper.lkpUUIDs = []
			} else if (stateManagement.getLastState() === BOUNDING_BOX) {
				clearLayers([lpWrapper.getBoundingBoxUUID()]);
				lpWrapper.boundingBoxUUID = null
			} else if (stateManagement.getLastState() === POLYGON_EXCLUSIONS) {
				clearLayers([lpWrapper.getPolyExclusionZoneUUIDs()]);
				lpWrapper.polygonalExclusionZoneUUIDs = []
			}
		}else if (stateManagement.getSavedStateType() === SEARCH){
			mainMenuContinueBtn.text("Continue New Search")
			mainMenuContinueBtn.show()
		}else if(stateManagement.getSavedStateType() === AAR){
			mainMenuContinueBtn.text("Continue After Action Report")
			mainMenuContinueBtn.show()
		}

	}else{
		mainMenu.open();
		$("#mainMenuContinueBtn").hide()
	}
}

/**
 * Updates all units shown in forms to reflect Unit System preferences
 * (Imperial by default, or Metric)
 *
 * For example 'Max distance (miles)' becomes 'Max distance (km)' if
 * Metric system is selected.
 */
function updateUnitLabelsForForms(unitSystem){
	let lbsOrKgUnits = $(".lbsOrKgUnit");
	let mphOrKphUnits = $(".mphOrKphUnits");
	let feetOrKMUnits = $(".feetOrKMUnits");
	let metersOrFeetUnits = $(".metersOrFeetUnits");
	let milesOrKMUnits = $(".milesOrKMUnits");
	let metersOrYardsUnits = $(".metersOrYardsUnits");
	let inchesOrCMUnits = $(".inchesOrCMUnits");
	let celsiusOrFahrenheitUnits = $(".celsiusOrFahrenheitUnits");
	if(unitSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL) {
		lbsOrKgUnits.text(LBS_LABEL)
		mphOrKphUnits.text(MPH_LABEL)
		feetOrKMUnits.text(FEET_LABEL)
		metersOrFeetUnits.text(FEET_LABEL)
		milesOrKMUnits.text(MILE_LABEL)
		metersOrYardsUnits.text(YARD_LABEL)
		inchesOrCMUnits.text(INCH_LABEL)
		celsiusOrFahrenheitUnits.text(FAHRENHEIT_LABEL)
	}else if (unitSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC){
		lbsOrKgUnits.text(KG_LABEL)
		mphOrKphUnits.text(KPH_LABEL)
		feetOrKMUnits.text(KM_LABEL)
		metersOrFeetUnits.text(M_LABEL)
		milesOrKMUnits.text(KM_LABEL)
		metersOrYardsUnits.text(M_LABEL)
		inchesOrCMUnits.text(CM_LABEL)
		celsiusOrFahrenheitUnits.text(CELSIUS_LABEL)
	}else{
		console.error("Unknown unit measurement system")
	}
}

function showHelperText(text) {
	$('#helperText').text(text);
	$('#helperText').css("display", "block");
}

function hideHelperText() {
	$('#helperText').css("display", "none");
}

$("#landcover-legend-btn-minimize").click(function(){
	$(this).toggleClass('btn-plus');
	$("#landcover-legend-content").toggle("slide");

	if($(this).text() === "+"){
		$(this).text('-');
		$(this).css("width", "15px");
	}else{
		$(this).text('+');
		$(this).css("width", "25px");
	}
});

$("#elevation-legend-btn-minimize").click(function(){
	$(this).toggleClass('btn-plus');
	$("#elevation-legend-content").toggle("slide");

	if($(this).text() === "+"){
		$(this).text('-');
		$(this).css("width", "15px");
	}else{
		$(this).text('+');
		$(this).css("width", "25px");
	}
});

function toggleWarning(warningId, visible, message = ''){
	if(visible) {
		$(warningId).css('display', 'block')
		$(warningId).text(message)
	}else{
		$(warningId).css('display', 'none')
	}
}

function showEditPointWarning(visible, message = '') {
	toggleWarning('#pointWarning', visible, message);
}

/**
 * Creates a pluggable model input prompt that contains all of the input attributes
 *
 * @param selectedMotionModel the model that was selected in motion models dialog
 * @param savedFormState
 */
function openPluggableMotionModelInputs(selectedMotionModel, savedFormState){
	let motionModelInputs = motionModelsWithAttrs.get(selectedMotionModel);
	pluggableMotionModelMenu.open();

	// If the last saved state was the pluggable model, simply load the leaflet
	if(savedFormState === selectedMotionModel){
		return;
	}
	stateManagement.setSavedFormState(selectedMotionModel)

	$("#motionModelInputsHeader").text(selectedMotionModel + " Motion Model Inputs")

	let required = new Set();
	let motionModelDescriptionsHolder = $("#MotionModelInputsDescriptionHolder");
	motionModelDescriptionsHolder.empty();

	let keyToTypeMap = {};

	$.each(motionModelInputs.motionModelDescriptions, function(index, motionModelDescription) {
		let inputType = ""
		let extraAttrs = ""
		if(motionModelDescription.type === "java.lang.String"){
			inputType = "text"
		}else if(motionModelDescription.type === "java.lang.Integer"){
			inputType = "number"
		}else if(motionModelDescription.type === "java.lang.Double"){
			inputType = "number"
		} else if(motionModelDescription.type === "java.lang.Boolean"){
			inputType = "checkbox"
		}

		let requiredText = ""
		if(motionModelDescription.required){
			requiredText = "(required)"
			required.add(motionModelDescription.name)
		}

		let unit = "";

		keyToTypeMap[motionModelDescription.name] = motionModelDescription.dataUnit;

		if(motionModelDescription.dataUnit === "KILOMETERS"){
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
				unit = " (" + MILE_LABEL + ")";
			}else {
				unit = " (" + KM_LABEL + ")";
			}
		} else if(motionModelDescription.dataUnit === "METERS"){
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
				unit = " (" + FEET_LABEL + ")";
			}else {
				unit = " (" + M_LABEL + ")";
			}
		} else if(motionModelDescription.dataUnit === "CENTIMETERS"){
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
				unit = " (" + INCH_LABEL + ")";
			}else {
				unit = " (" + CM_LABEL + ")";
			}
		} else if(motionModelDescription.dataUnit === "DEGREES"){
			unit = " (Degrees)";
		} else if(motionModelDescription.dataUnit === "RADIANS"){
			unit = " (Radians)";
		} else if(motionModelDescription.dataUnit === "KILOMETERS_PER_HOUR"){
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
				unit = " (" + MPH_LABEL + ")";
			}else {
				unit = " (" + KPH_LABEL + ")";
			}
		} else if(motionModelDescription.dataUnit === "METERS_PER_SECOND"){
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
				unit = " (" + YARD_LABEL + " per sec)";
			}else {
				unit = " (" + M_LABEL + " per sec)";
			}
		} else if(motionModelDescription.dataUnit === "CELSIUS"){
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
				unit = " (" + FAHRENHEIT_LABEL + ")";
			}else {
				unit = " (" + CELSIUS_LABEL + ")";
			}
		} else if(motionModelDescription.dataUnit === "KILOGRAMS"){
			if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
				unit = " (" + LBS_LABEL + ")";
			}else {
				unit = " (" + KG_LABEL + ")";
			}
		}else{
			// no unit
		}

		$(motionModelDescriptionsHolder).append(
			"<div>" +
			"<p class='mm-attr-info'><b>" +motionModelDescription.name + unit +  "</b>: "
			+ "<i class='fa fa-info-circle' data-toggle='tooltip' title='" +
			motionModelDescription.description + "'></i></p>" +
			"<p class='mm-attr-info'>" + requiredText + "</p>" +
			"<input id='" + motionModelDescription.name
			+ "' class='motionModelInput' type='" + inputType + "' name='motionModelInput' " + extraAttrs +"><br><br>" +
			"</div>")
	});


	$("#backPluggableMotionModel").click(function(){
		pluggableMotionModelMenu.close()
		openMotionModel();
	});

	let pluggableMotionModelContinue = $("#pluggableMotionModelContinue");
	pluggableMotionModelContinue.off("click");

	pluggableMotionModelContinue.click(function (){
		let hadError = false;
		$('input[type="text"].motionModelInput').each(function () {
			let key = $(this).attr('id');
			let value = $(this).val()
			if(value === '' && required.has(key)){
				hadError = true
			}
			console.log(key + " has value of " + value)
			lpInputs.getattributeNameToValues().set(key, value);
		});
		$('input[type="number"].motionModelInput').each(function () {
			let key = $(this).attr('id');
			let value = $(this).val()
			if(value === '' && required.has(key)){
				hadError = true
			}

			let dataUnit = keyToTypeMap[key];
			if(dataUnit === "KILOMETERS"){
				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
					value = milesToKm(value);
				}
			} else if(dataUnit === "METERS"){
				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
					value = feetToM(value);
				}
			} else if(dataUnit === "CENTIMETERS"){
				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
					value = inToCM(value);
				}
			}else if(dataUnit === "KILOMETERS_PER_HOUR"){
				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
					value = mphToKph(value);
				}
			} else if(dataUnit === "METERS_PER_SECOND"){
				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
					value = yardToMeters(value);
				}
			} else if(dataUnit === "CELSIUS"){
				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
					value = fToCelsius(value);
				}
			} else if(dataUnit === "KILOGRAMS"){
				if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
					value = lbsToKg(value);
				}
			}else{
				// no unit
			}
			
			console.log(key + " has value of " + value)
			lpInputs.getattributeNameToValues().set(key, value);
		});
		$('input[type="checkbox"].motionModelInput').each(function () {
			let key = $(this).attr('id')
			let value = $(this).is(":checked")
			console.log(key + " has value of " + value)
			lpInputs.getattributeNameToValues().set(key, value);
		});

		if(hadError){
			toggleWarning('#pluggableMotionModelInputsWarning', true, "All required values must be entered");
		}else{
			toggleWarning('#pluggableMotionModelInputsWarning', false, "All required values must be entered");

			console.log("called pluggableMotionModelContinue")

			// get geospatial requirement(s)
			lpWrapper.applicableGeospatialInputs = new Set();
			lpWrapper.geospatialDescToRequired = {};

			$.each(motionModelInputs.motionModelGeospatialDescriptions, function(index, motionModelInput){
				lpWrapper.applicableGeospatialInputs.add(motionModelInput.type)
				lpWrapper.geospatialDescToRequired[motionModelInput.type] = motionModelInput.required
			});

			pluggableMotionModelMenu.close()

			if(lpWrapper.applicableGeospatialInputs != null){
				pointMenu.open();
				if(lpWrapper.applicableGeospatialInputs.has(GOAL_POINTS)){
					stateManagement.broadcastUpdate(GOAL_POINTS, false, lpWrapper.geospatialDescToRequired[GOAL_POINTS]);
				}else if(lpWrapper.applicableGeospatialInputs.has(POLYGON_EXCLUSIONS)){
					stateManagement.broadcastUpdate(POLYGON_EXCLUSIONS, false, lpWrapper.geospatialDescToRequired[POLYGON_EXCLUSIONS]);
				}else if(lpWrapper.applicableGeospatialInputs.has(EXCLUSION_ZONE)){
					stateManagement.broadcastUpdate(KNOWN,false, lpWrapper.geospatialDescToRequired[EXCLUSION_ZONE]);
				}else if(lpWrapper.landcoverMetadataEnabled){
					stateManagement.broadcastUpdate(META_LANDCOVER);
				}else{
                    stateManagement.broadcastUpdate(MOVEMENT_SCHEDULE);
                }
			}else{
				console.error("motion model inputs was null")
			}
		}
	});
}


/**
 * Creates a geospatial motion model prompt.
 *
 * @param selectedMotionModel the model that was selected in motion models dialog
 * @param savedFormState
 */
function openGeospatialMotionModelInputs(selectedMotionModel, savedFormState){
	// get geospatial requirement(s)
    let motionModelInputs = motionModelsWithGeospatialAttrs.get(selectedMotionModel);
	lpWrapper.applicableGeospatialInputs = new Set();
	lpWrapper.geospatialDescToRequired = {};

	$.each(motionModelInputs.motionModelGeospatialDescriptions, function(index, motionModelInput){
		lpWrapper.applicableGeospatialInputs.add(motionModelInput.type)
		lpWrapper.geospatialDescToRequired[motionModelInput.type] = motionModelInput.required
	});

	if(lpWrapper.applicableGeospatialInputs != null){
		pointMenu.open();
		if(lpWrapper.applicableGeospatialInputs.has(GOAL_POINTS)){
			stateManagement.broadcastUpdate(GOAL_POINTS, false, lpWrapper.geospatialDescToRequired[GOAL_POINTS]);
		}else if(lpWrapper.applicableGeospatialInputs.has(POLYGON_EXCLUSIONS)){
			stateManagement.broadcastUpdate(POLYGON_EXCLUSIONS, false, lpWrapper.geospatialDescToRequired[POLYGON_EXCLUSIONS]);
		}else if(lpWrapper.applicableGeospatialInputs.has(EXCLUSION_ZONE)){
			stateManagement.broadcastUpdate(KNOWN,false, lpWrapper.geospatialDescToRequired[EXCLUSION_ZONE]);
		}else if(lpWrapper.landcoverMetadataEnabled){
			stateManagement.broadcastUpdate(META_LANDCOVER);
		}else{
            stateManagement.broadcastUpdate(MOVEMENT_SCHEDULE);
        }
	}else{
		console.error("motion model inputs was null")
	}
}

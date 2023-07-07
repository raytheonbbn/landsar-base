/**
 * @Summary
 * Contains stuff directly involved with displaying
 * things on the map, and controlling the map.
 *
 * @author Devon Minor
 */

 const coordinateSystems = {
	DECIMAL_LAT_LON: "Decimal Degrees (DD)",
	DMS_LAT_LON: "Degrees Minutes Seconds (DMS)",
	DEC_MIN_LAT_LON: "Degrees Decimal Minutes (DDM)",
	UTM: "UTM",
	USNG_MGRS: "USNG/MGRS"
}


let coordinateSystem=coordinateSystems.DECIMAL_LAT_LON;

//Instantiates the map and adds a default baselayer.  Uses the appropriate CRS
var map =
	// coordinateSystem==coordinateSystems.USNG_MGRS ?
	// L.map('mapid', {crs: L.CRS.EPSG4326}) :
	L.map('mapid');
map.setView([38.47939, -98.08594], 5);
var baseLayer;
var offlineCacheList = [];
var curSliderDateTime = null;
var curBoundingBoxBounds = null;
var displayTime = "";
//var operationalUse = false;



const oneHourMillis = 3600000;


var request = window.indexedDB.open("windowDatabase", 1);
request.onsuccess = function(event) {
	$(document).ready(function() {
		db = event.target.result;
		db.transaction("mapData").objectStore("mapData").get("selectedMap").onsuccess = function(event) {
			$("#mapType").val(event.target.result.value);
			changeMapType(event.target.result.value);
		};
	});
};


loadOfflineCacheList();



//var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//});
//baseLayer.addTo(map);

//prevents endless map scrolling
var southWest = L.latLng(-89.98155760646617, -180),
	northEast = L.latLng(89.99346179538875, 180);
var bounds = L.latLngBounds(southWest, northEast);
map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});
map.setMinZoom(2);

L.control.scale().addTo(map);

var measurementControl = L.control.measure({
	  position: 'topleft',
	  activeKeyCode: -1
	});

measurementControl.addTo(map);

const mousePosition = L.control.mousePosition();
mousePosition.options.separator=", ";

mousePosition._onMouseMove = function (e) {
	//for USNG/MGRS and UTM we have to override the entire mouseMove event because the leaflet implementation assumes that
	//lat and lon can be formatted separately, but geodesy wants to translate lat and lon at the same time.  therefore we
	//write our own _onMouseMove
	let val;
	if (coordinateSystem === coordinateSystems.USNG_MGRS || coordinateSystem === coordinateSystems.UTM) {
		const translator = new Latlon_Utm_Mgrs(e.latlng.lat, e.latlng.lng);
		if (coordinateSystem === coordinateSystems.USNG_MGRS) {
			val = translator.toUtm().toMgrs();
		} else {
			val = translator.toUtm();
		}
		//TODO we may need to do more formatting of the mgrsValue
	} else {

		let lng = formatLatOrLon(e.latlng.lng, false);
		let lat = formatLatOrLon(e.latlng.lat, true);
		val = lat + this.options.separator + lng;

	}
	let prefixAndValue = this.options.prefix + ' ' + '<span style="font-size:16px">' + val + "</span>";
	this._container.innerHTML = prefixAndValue;
}
mousePosition.addTo(map);
mousePosition.getContainer().style.bottom = '40px';
mousePosition.getContainer().style.left = '0px';
mousePosition.getContainer().style.position = "fixed";



$('#confirmDraw').hide();
$('#addPointAAR').hide();


//mapItems will hold the LostPersonInputsWrappers and SearchInputsWrappers.
var mapItems = [];

//this FeatureGroup holds everything that is drawn on the map
var drawnItems = new L.FeatureGroup();
drawnItems.addTo(map);

function formatLatOrLon(latOrLon, isLat = true) {
	switch (coordinateSystem) {
		case coordinateSystems.DECIMAL_LAT_LON:
			return L.Util.formatNum(latOrLon, mousePosition.options.numDigits) + "&deg;";
			break
		case coordinateSystems.DMS_LAT_LON:
			return deg_to_dms(latOrLon, true);
		case coordinateSystems.DEC_MIN_LAT_LON:
			return deg_to_decimal_minutes(latOrLon, true);
			if(isLat) {
				return deg_to_decimal_minutes(latOrLon, true) + " S";
			}else{
				return deg_to_decimal_minutes(latOrLon, true) + " E";
			}
			break;
		case coordinateSystems.USNG_MGRS:
			console.error("We should not be calling formatLatOrLon in USNG/MGRS mode.")
			break;
		case coordinateSystems.UTM:
			console.error("We should not be calling formatLatOrLon in UTM mode.")
			break;
	}
}

//when called with a list of uids, this function will
//remove the corresponding objects from the map
function clearLayers(uids) {
	if(null != uids && null != drawnItems) {
		if(uids instanceof Set){
			for (const item of uids) {
				console.log(item);
				if(null != item) {
					if (drawnItems.hasLayer(item)) {
						drawnItems.removeLayer(item);
					}
				}else{
					console.log("warning: uuid at position " + i + " was null");
				}
			}
		}else {
			for (var i in uids) {
				if (null != uids[i]) {
					if (drawnItems.hasLayer(uids[i])) {
						drawnItems.removeLayer(uids[i]);
					}
				} else {
					console.log("warning: uuid at position " + i + " was null");
				}
			}
		}


	}else{
		console.log("warning: uids or drawnItems was null");
	}
}

L.rotateImageLayer = function(url, bounds, options) {
    return new L.RotateImageLayer(url, bounds, options);
};
// A quick extension to allow image layer rotation.
L.RotateImageLayer = L.ImageOverlay.extend({
    options: {rotation: 0},
    _animateZoom: function(e){
        L.ImageOverlay.prototype._animateZoom.call(this, e);
        var img = this._image;
        img.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.rotation + 'deg)';
    },
    _reset: function(){
        L.ImageOverlay.prototype._reset.call(this);
        var img = this._image;
        img.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.rotation + 'deg)';
    }
});

// display splash screen
console.log('Checking to see if splash screen should be displayed...');
var showedSplashScreen = sessionStorage.getItem('showedSplashScreen');
if (showedSplashScreen === null) {
    showWarningScreen();
} else {
	layersInit();
}

/**
 * OVERLAY SELECTOR
 * =====================
 *
 * not adapted from Nate's original code from webmap
 * */

var overlays = {};
var curSelected = null;
var slider;
var map;
var baseLayer;

//thresholds of number of pixel per marker on the slider scale, to decide how much space to use in the labels
const SLIDER_TINY_THRESHOLD=1.5;
const SLIDER_SMALL_THRESHOLD=24;
const SLIDER_LARGE_THRESHOLD=31;
//true to enable medium and large mode
const SLIDER_USE_NUMBERS=false;

const sliderModes = {
	SMALL: 'small',
	MED: 'med',
	LARGE: 'large',
	TINY: 'tiny'
};

/**
 * This gets called when the timeline slider is moved. It does not show/hide searches, it adds/removes distributions from the map
 * @param overlaysSelect
 * @param isSliding
 */
function overlaySelectChanged(overlaysSelect, isSliding=false) {
	if (curSelected != null && overlays[curSelected] != null) {
		overlays[curSelected][0].removeFrom(map);
	}

	overlays[overlaysSelect.value][0].addTo(map);

	curSelected = overlaysSelect.value;

	if(isSliding) {
		slider.slider("value", overlaysSelect.selectedIndex + 1);
	}

}

function getLatestMPIDfromLPID(lpiID, doneFunc) {
	$.ajax("/webmap/servlet/?action=getLatestMP&lpiID=" + lpiID).done(
		function( msg ) {
			if (msg == null || msg == undefined|| msg.length == 0) {
				setStatus("Error: Received empty response from server")
				return;
			}

			setStatus("Loading map overlays");


			doneFunc(msg.mpID);

		}
	);
}

function refreshSlider() {
	$('#slider label').remove();
	drawSliderScale();

}

let usngGridLayer;
let usngKMLDoc = null
function loadUSNGGridOverlay() {
	// load all KML if not loaded yet
	if(usngKMLDoc === null || usngKMLDoc === undefined) {
		$.ajax("/webmap/landsar/overlays/usng-grid.kml").done(function( msg ) {
			let parser = new DOMParser();
			usngKMLDoc = parser.parseFromString(msg, "text/xml");
			replaceUSNGOverlay()
		});
	}else{
		replaceUSNGOverlay()
	}
}

/**
 * Show only USNG KMLs in area of view
 */
function replaceUSNGOverlay(){
	if(usngGridLayer !== undefined && usngGridLayer !== null) {
		map.removeLayer(usngGridLayer);
	}
	usngGridLayer = new L.KML(usngKMLDoc, null, "usngGrid")
	map.addLayer(usngGridLayer);
	usngGridLayer.bringToBack();
}

//TODO make just an ajax request, and wait for result from this, elevation legend and landcover before calling updateMapBasedOnLayerSelections
function loadLandcoverOverlay(lpiID) {
	return $.ajax("/webmap/servlet/?action=getLandcoverOverlay&lpiID=" + lpiID).done(function( msg ) {
	    for(var i = 0; i < msg.length; i++) {
	    	var overlay = msg[i];
		    imageBounds = [[overlay.boundingBox.north, overlay.boundingBox.east], [overlay.boundingBox.south, overlay.boundingBox.west]];
			//L.rotateImageLayer(overlay.imageURL, imageBounds, {rotation: 0}).addTo(map);


			var landcoverLayer = L.rotateImageLayer(overlay.imageURL, imageBounds, {rotation: 0});
			landcoverLayer.finderInfo = {finderElementType: "landcover", lpiID: lpiID};
			landcoverLayer.addTo(map);

			if(i == msg.length - 1) {
				map.setView([overlay.boundingBox.north, overlay.boundingBox.east], 10);
			}
		}

		// TODO audit use of 'overlays'. Removing this showed the landcover when we switched LPIs (even when not in
		//  the "Landcover mode").
		//  Overlays usually has timestamp -> png, elevation and landcover pngs. We should fix this and move this elsewhere.
		overlays = {};
		refreshSlider();

		updateMapBasedOnLayerSelections();
	});
}

function loadElevationOverlay(lpiID) {
	$("#elevation-legend-content").empty();
	return $.ajax("/webmap/servlet/?action=getElevationOverlay&lpiID=" + lpiID).done(function( msg ) {
	    for(var i = 0; i < msg.length; i++) {
	    	var overlay = msg[i];
		    imageBounds = [[overlay.boundingBox.north, overlay.boundingBox.east], [overlay.boundingBox.south, overlay.boundingBox.west]];
			//L.rotateImageLayer(overlay.imageURL, imageBounds, {rotation: 0}).addTo(map);


			var elevationLayer = L.rotateImageLayer(overlay.imageURL, imageBounds, {rotation: 0});
			elevationLayer.finderInfo = {finderElementType: "elevation", lpiID: lpiID};
			elevationLayer.addTo(map);

			if(i == msg.length - 1) {
				map.setView([overlay.boundingBox.north, overlay.boundingBox.east], 10);
			}
		}

	    updateMapBasedOnLayerSelections();
	});
}

var lkpOverlay;
function loadLKPOverlay(lpiID) {
	return $.ajax("/webmap/servlet/?action=getLKP&lpiID=" + lpiID).done(function( msg ) {
		if (msg === null || msg === undefined || msg.length === 0) {
			console.error("Received empty message from getLKPOverlay request");
			return;
		}

		if (msg.getElementsByTagName === undefined) {
			//  ** not XML - interpret as string
			console.log("Error on getting lkp overlay");
			console.error(msg);
			setStatus(msg);
			return;
		}

		lkpOverlay = msg;
		map.addLayer(new L.KML(msg, lpiID, LKP));
	});

}

function loadElevationLegend(lpi) {
	if(lpi == null){
		return;
	}
	$("#elevation-legend-content").empty();
	var elevationInformation = lpi.elevationInformation;
	if (elevationInformation != null){
		if(Array.isArray(elevationInformation)) {
			$("#elevation-legend-content").append(
				"<h5 class=\"legend-title\">Elevation (meters)</h5>");
			for (var i = 0; i < elevationInformation.length; i++) {
				$("#elevation-legend-content").append(
					"<div class='elevation-legend-details'>" + "<i style='font-size: 18px; margin-right: 10px; color: " + elevationInformation[i].hex +
					"' class='fas fa-square-full legend-icon'></i>" + elevationInformation[i].min + " - " +
					elevationInformation[i].max + " m.</div>");
			}
			console.log(elevationInformation)
		}
	} else {
		console.error("elevation legend information is not available")
	}
}

function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// landcoverLegendItems should be an Array of LandCoverLegendData Items (see LandCoverLegendData.java), or, for backwards compatibility, LandCoverMetadataItems
function extractLandcoverLegendToContentHolder(landcoverLegendItems){
	$("#landcover-legend-content").append(
		"<h5 class=\"legend-title\">Landcover</h5>")
	for (var i = 0; i < landcoverLegendItems.length; i++) {
		let r = landcoverLegendItems[i].rgbColor[0];
		let g = landcoverLegendItems[i].rgbColor[1];
		let b = landcoverLegendItems[i].rgbColor[2];
		let colorString = rgbToHex(r, g, b);
		$("#landcover-legend-content").append(
			"<div class='landcover-legend-details'>" + "<i style='font-size: 18px; margin-right: 10px; " +
			"color: " + colorString + "' class='fas fa-square-full legend-icon'></i>"
			+ landcoverLegendItems[i].shortDescription + " (" + landcoverLegendItems[i].lcCode + ")</div>");
	}
}

function loadLandcoverLegend(lpi) {
	if(lpi == null){
		return;
	}
	$("#landcover-legend-content").empty();
	console.log("lpi: ", lpi);
	// if the server returned items specifically for the legend (down-selected to only those types included in the Area data for this LPI), use those
	if (lpi.landcoverLegendDataList != null && Array.isArray(lpi.landcoverLegendDataList)){
		extractLandcoverLegendToContentHolder(lpi.landcoverLegendDataList);
	}
	// otherwise, if we have the metadata we sent, use that
	else if (lpi.landcoverMetadata != null && lpi.landcoverMetadata.metaDataItems != null){
		let landcoverMetadataItems = lpi.landcoverMetadata.metaDataItems;
		if(Array.isArray(landcoverMetadataItems)) {
			extractLandcoverLegendToContentHolder(landcoverMetadataItems);
		}
	} else {
		console.error("landcover legend information is not available. LandcoverMetadata: " + lpi.landcoverMetadata);
	}
}



$(window).resize(function () {
	refreshSlider();
});

function drawSliderScale() {
	const slider = $('#slider');
	//fix the layering so we can put our ticks on top of the range bar but under the handle.
	slider.find(".ui-slider-range").css("z-index", 100001);
	slider.find(".ui-slider-handle").css("z-index", 100004);

	let overlayDates = Object.keys(overlays);
	if (overlayDates.length===0){
		return;
	}
	overlayDates.sort();
	const startMoment = moment(overlayDates[0]);
	const endMoment = moment(overlayDates[overlayDates.length - 1]);
	const spanMillis=endMoment.diff(startMoment);
	slider.each(function () {
		// Add labels to slider based on the time range


		//the number of ticks we will have (this number will decrease if we are in tiny mode
		let numTicksIfNotTiny =spanMillis / oneHourMillis;

		const pxPerTick=(slider.width())/numTicksIfNotTiny;
		let scaleMode;
		if (pxPerTick < SLIDER_TINY_THRESHOLD) {
			//one unmarked tick every 10 hrs
			scaleMode = sliderModes.TINY;
		}else if (pxPerTick < SLIDER_SMALL_THRESHOLD || !SLIDER_USE_NUMBERS) {
			//one unmarked tick every hr
			scaleMode = sliderModes.SMALL;
		}else if (pxPerTick < SLIDER_LARGE_THRESHOLD) {
			//one unmarked tick every hr, tersely printed time every 10 hours
			scaleMode = sliderModes.MED;
		}else{
			//one unmarked tick every hr, printed time every 10 hours
			scaleMode = sliderModes.LARGE;
		}


		console.log("timeline slider scale size="+scaleMode+", px="+pxPerTick);

		let incrementMillis;
		if (scaleMode==sliderModes.TINY){
			incrementMillis = oneHourMillis * 10;
		}else{
			incrementMillis = oneHourMillis;
		}

		const numTicks=spanMillis/incrementMillis;
		const percentPerLabel = (1 / numTicks) * 100 + "%";

		for (let timeMillis = startMoment.valueOf(); timeMillis <= endMoment.valueOf(); timeMillis += incrementMillis) {

			// Create a new element and position it correctly
			let formatterMoment = moment(timeMillis);
			let labelText = "|";
			let fontSize = ".4em";
			//I have no idea why we need this but we seem to.
			let marginTop = "-3px";



			const hours = startMoment.diff(formatterMoment, 'hours');
			if (hours % 10 == 0 && hours!=0) {
				switch(scaleMode) {
					case sliderModes.TINY:
						//for tiny slider mode make the ticks big, so they have visual continuity with the 10th ticks in small mode
						fontSize = ".7em";
						//I have no idea why we need this but we seem to.
						marginTop = "-6px";
						break;
					case sliderModes.SMALL:
						// fontWeight="bold";
						//in small mode 10th tick is big
						fontSize = ".7em";
						//I have no idea why we need this but we seem to.
						marginTop = "-6px";

						break;
					case sliderModes.MED:
						labelText = formatterMoment.format("ddHH");
						fontSize = ".7em";//todo test this with text enabled
						break;
					case sliderModes.LARGE:
						labelText = formatterMoment.format("ddHHMM");
						fontSize = ".7em";//todo test this with text enabled
						break;
					default:
					// leave default values for labelText and fontWeight
				}

			} else if ((scaleMode==sliderModes.MED || scaleMode==sliderModes.LARGE) && (hours % 10 == 1 && hours!=1)) {
				//stupid hack to leave space for the 00
				labelText = "";
			}
			let el = $('<label class="slideTick">' + labelText
				+ '</label>')
				.css({
					width: percentPerLabel,
					fontSize: fontSize,
					position: "relative",
					verticalAlign: "top",
					textAlign: "center",
					height: "4px",
					marginTop: marginTop,
					zIndex: 100002
				});

			// Add the element inside #slider
			$("#slider").append(el);
		}
	});


	let firstMarker=true;
	let layerStartTimes=[];
	map.eachLayer(
		function(layer){

			if(layer.finderInfo != undefined && layer.finderInfo.finderElementType == "search") {
				if (layer.finderInfo.lpiID == lpiID) {
					let beginMoment = new moment(layer.finderInfo.begin);
					//Ignore layers before the scenario start.  I suspect these should not exist
					if (!beginMoment.isBefore(startMoment)) {
						console.log("Will add search marker at " + beginMoment);
						layerStartTimes.push(beginMoment);
					}
				}
			}
		}
	);

	layerStartTimes.sort((a, b) => a.valueOf() - b.valueOf());

	let lastLayerBeginMoment=startMoment;
	let lastPercentage = 0;
	layerStartTimes.forEach(
		function(beginMoment){
			if (beginMoment.isSame(lastLayerBeginMoment)){
				return;
			}
			const labelPercentage=(beginMoment.diff(lastLayerBeginMoment)/spanMillis)*100;
			const params = {
				width: labelPercentage+'%',
				fontSize: "12px",
				position: "absolute",
				verticalAlign: "top",
				textAlign: "right",
				height: "4px",
				color: "red",
				marginTop: "-5px",//I have no idea why we need this but we seem to.
				zIndex: 100003,
				top: "0px",
				fontWeight: "bold",
				left: firstMarker ?  "0px" : lastPercentage+'%'
			};
			lastPercentage = lastPercentage + labelPercentage;

			let el = $('<label class="searchMarker">|</label>')
				.css(params);
			$("#slider").append(el);

			lastLayerBeginMoment=beginMoment;
			firstMarker=false;
		}
	);


}

var tempLayer;

function retrieveOverlays(currentLPI, jumpToDate){
	let lpiID = currentLPI.id
	console.log("current LPI ID: " + lpiID);

	return $.ajax("/webmap/servlet/?action=getOverlay&lpiID=" + lpiID)
		.fail(function( msg, status, error ) {
		console.log("Retrieval failed. Message: " + msg + " status: " + status + " error: " + error)
		bootbox.alert("Retrieval of overlay failed: " + error);
		return;
	})
		.done(function( msg ) {
			if (msg == null || msg == undefined|| msg.length == 0) {
				console.log("mission package was null")
				return;
			}

			var overlaysSelect = document.getElementById("overlays");
			var unsortedOverlayDates = [];

			for(var i = 0; i < msg.length; i++) {
				var overlay = msg[i];

				if(overlay.imageURL.endsWith("MotionOnly.png")) {
					continue;
				}

				imageBounds = [[overlay.boundingBox.north, overlay.boundingBox.east], [overlay.boundingBox.south, overlay.boundingBox.west]];
				//L.rotateImageLayer(overlay.imageURL, imageBounds, {rotation: 0}).addTo(map);

				var o = overlays[msg[i].name];
				if(o == null || o == undefined) {
					o = [];
					overlays[msg[i].name] = o;
				}

				var lyr = L.rotateImageLayer(overlay.imageURL, imageBounds, {rotation: 0});
				lyr.finderInfo = {finderElementType: "distribution", name: msg[i].name, lpiID: lpiID, fileName: msg[i].fileName};
				o.push(lyr);

				console.log("mission package layer: " + lyr.finderInfo)

				unsortedOverlayDates.push(msg[i].name);

				/*if(i == msg.length - 1) {
                    //map.setView([overlay.boundingBox.north, overlay.boundingBox.east], 10);
                    map.fitBounds(L.latLngBounds(L.latLng(overlay.boundingBox.north, overlay.boundingBox.east), L.latLng(overlay.boundingBox.south, overlay.boundingBox.west)));
                }*/
			}

			map.fitBounds(curBoundingBoxBounds);

			unsortedOverlayDates.sort(function(a, b) {
				a = new Date(a);
				b = new Date(b);
				return a>b ? -1 : a<b ? 1 : 0;
			});

			$('#overlays').children().remove();

			for(var j = 0; j < unsortedOverlayDates.length; j++) {
				var option = document.createElement("option");
				option.text = unsortedOverlayDates[j];
				overlaysSelect.add(option, overlaysSelect[0]);
			}
			// ** set the first option as the selected one
			overlaysSelect[0].selected =true;

			$( function() {
				var select = $( "#overlays" );
				var max = $('#overlays option').length;
				slider = $('#slider').slider({
					min: 1,
					max: max,
					range: "min",
					value: select[ 0 ].selectedIndex + 1,
					stop: function (event) {
						sliderDateTime.close();
					},
					slide: function( event, ui ) {
						sliderDateTime.open();
						select[ 0 ].selectedIndex = ui.value - 1;

						overlaySelectChanged(overlaysSelect, true);


						var x = ui.handle.getBoundingClientRect().x;
						var y = ui.handle.getBoundingClientRect().y;

						if(x + 440 > window.innerWidth) {
							x = x - 440;
						}

						// ** find the right time zone
						var timezone = getLPITimeZone(lpiID);
						//displayTime = moment(overlaysSelect.value).tz(timezone, true).format("dddd, MMMM Do YYYY, h:mm:ss a") + " " + timezone;
						displayTime = moment.tz(overlaysSelect.value, timezone).format("dddd, MMMM Do YYYY, h:mm:ss a") + " " + timezone;
						sliderDateTime.setLocation([y -70,x]);
						//sliderDateTime.setContent("<span style='font-weight: bold; color: #365483;'>" + new Date(Date.parse(overlaysSelect.value)) + "</span>");
						sliderDateTime.setContent("<span style='font-weight: bold; color: #365483;'>" + displayTime + "</span>");
						//sliderDateTime.setContent(overlaysSelect.value);
						curSliderDateTime = overlaysSelect.value;

						tempLayer = layer;

						updateSearchesAndDistributions(currentLPI);
					}
				});
				drawSliderScale();
				slider[0].style.zIndex = 100000;

			});

			sliderContainer.open();
			slider=$("#slider");
			slider.parent().parent().css("overflow", "hidden");
			slider.parent().css('background', 'transparent');
			$("#slider").show();

			overlaySelectChanged(overlaysSelect);

			// ** TODO: figure out why slider handle doesn't exist for a moment the first time through... (thus the need for the timeout)
			setTimeout(function() {
				var timezone = getLPITimeZone(lpiID);
				displayTime = moment.tz(overlaysSelect.value, timezone).format("dddd, MMMM Do YYYY, h:mm:ss a") + " " + timezone;
				sliderDateTime.setContent("<span style='font-weight: bold; color: #365483;'>" + displayTime + "</span>");


				var handle = $(".ui-slider-handle")[0];

				if(handle != undefined && handle != null) {
					handle.onmouseover = function() {
						var x = $(".ui-slider-handle")[0].getBoundingClientRect().x;
						var y = $(".ui-slider-handle")[0].getBoundingClientRect().y;

						if(x + 440 > window.innerWidth) {
							x = x - 440;
						}

						sliderDateTime.setLocation([y - 70,x]);
						sliderDateTime.open();
					}
					handle.onmouseout = function() {sliderDateTime.close();}
				}
			}, 1500);

			sliderDateTime.setLocation([-1000,-1000]);

			if (currentLPI !== null) {
				var cumProb = currentLPI.cumulativeProbabilityOfDetection * 100;
				if(cumProb === 0) {
					setStatus("Lost person instance loaded.");
				} else {
					setStatus("Lost person instance loaded. Cumulative Probability of Success: " + cumProb.toFixed(2) + "%");
				}
				//bootbox.alert("Lost person instance loaded. Cumulative Probability of Detection: " + cumProb.toFixed(2) + "%")
				//$("#cumProb").css("visibility", "visible");
			} else {
				setStatus("Lost person instance loaded");
			}

			// ** TODO: uncomment below once can check what popover attribute needes to be added to slider div
			//$("#slider").attr('data-content',"Drag here to view heatmaps").data('bs.popover').setContent();

			// ** if we're "refreshing" jump back to the date/time we were at before
			if(jumpToDate != undefined && jumpToDate != null) {
				$("#overlays").val(jumpToDate);
				overlaySelectChanged($("#overlays")[0]);

				// ** update opacity of distros after search request
				map.eachLayer(
					function(layer){
						if(layer.finderInfo != undefined) {
							console.log(layer.finderInfo.finderElementType)
						}
						if(layer.finderInfo != undefined && layer.finderInfo.finderElementType == "distribution") {
							console.log("distribution: ")
							console.log("distribution: " + layer)
							if(layerSettings.distributions) {
								layer.setOpacity(layerSettings.distributionOpacity / 100);// ** set visible
							} else {
								layer.setOpacity(0); // ** set invisible
							}
						}
					}
				);
			}

		});
}


function retrieveLPIShapes(lpiID){
	return $.ajax("/webmap/servlet/?action=handleGetLPI&lpiID=" + lpiID).done(function( msg ) {
		var lpi = JSON.parse(msg[0]);
		drawLPIData(lpi);
	});
}


/**
 * show searches and probability distributions for current timeline time
 * @param currentLPI
 * @param addSearchOnClickListener
 */
function updateSearchesAndDistributions(currentLPI, addSearchOnClickListener=false){
	let lpiID = currentLPI.id;

	map.eachLayer(
		function(layer){
			if(layer.finderInfo !== undefined && layer.finderInfo.finderElementType === "search") {
				if(addSearchOnClickListener) {
					layer.on('click', function (e) {
						showSearchDetails(layer);
					});
				}

				if(layer.finderInfo.lpiID !== lpiID) {
					// ** if this search isn't for the current LPI, hide it
					layer.setStyle({ color: 'rgba(0,255,255,0)'}); // ** set invisible
				} else {

					var searchBegin = new Date(layer.finderInfo.begin);
					var searchEnd = new Date(layer.finderInfo.end);

					let sliderDate = new Date(curSliderDateTime);
					if(curSliderDateTime == null){
						console.log("curr slider date was null")
						sliderDate = new Date(currentLPI.startTime);
					}

					// adjust search time for short searches
					let adjustedSearchTimes = calcSearchShowTime(searchBegin, searchEnd);

					console.log("SLIDER TIME: " + sliderDate)
					console.log("BEGIN TIME: " + searchBegin)
					console.log("END TIME: " + searchEnd)

					if (adjustedSearchTimes[0] <= sliderDate && adjustedSearchTimes[1] >= sliderDate) {
						layer.setStyle({ color: 'rgba(0,255,255,1)'}); // ** set visible
					} else {
						layer.setStyle({ color: 'rgba(0,255,255,0)'}); // ** set invisible
					}
				}
			} else if(layer.finderInfo !== undefined && layer.finderInfo.finderElementType === "distribution") {
				if(layerSettings.distributions) {
					layer.setOpacity(layerSettings.distributionOpacity / 100);// ** set visible
				} else {
					layer.setOpacity(0); // ** set invisible
				}
			}
		}
	);
}

/**
 * draw bounding box, rendezvous points, exclusion zones
 * @param lpi
 */
function drawLPIData(lpi) {
	var boundingBoxBounds = [[lpi.boundingBox.northLatDeg, lpi.boundingBox.eastLonDeg], [lpi.boundingBox.southLatDeg, lpi.boundingBox.westLonDeg]];
	var boundingBoxLayer = L.rectangle(boundingBoxBounds, {color: setColor('blue'), weight:1, fill: false});
	boundingBoxLayer.finderInfo = {lpiID: lpi.id};
	drawnItems.addLayer(boundingBoxLayer);

	curBoundingBoxBounds = L.latLngBounds(L.latLng(boundingBoxBounds[0][0], boundingBoxBounds[0][1]), L.latLng(boundingBoxBounds[1][0], boundingBoxBounds[1][1]));

	for (var i in lpi.rendezvousPoints) {
		var rendezvousLayer = L.circleMarker([toDegrees(lpi.rendezvousPoints[i].latRad), toDegrees(lpi.rendezvousPoints[i].lonRad)], {color: setColor('green')});
		rendezvousLayer.finderInfo = {lpiID: lpi.id};
		drawnItems.addLayer(rendezvousLayer);
	}

	for (var i in lpi.exclusionZones) {
		if (lpi.exclusionZones[i].known == true) {
			var exclusionZoneLayer = L.circle([toDegrees(lpi.exclusionZones[i].pt.latRad), toDegrees(lpi.exclusionZones[i].pt.lonRad)], {radius: lpi.exclusionZones[i].radius, color: setColor("red")});
			exclusionZoneLayer.finderInfo = {lpiID: lpi.id};
			drawnItems.addLayer(exclusionZoneLayer);
		} else {
			var exclusionZoneLayer = L.circle([toDegrees(lpi.exclusionZones[i].pt.latRad), toDegrees(lpi.exclusionZones[i].pt.lonRad)], {radius: lpi.exclusionZones[i].radius, color: setColor("yellow")});
			exclusionZoneLayer.finderInfo = {lpiID: lpi.id};
			drawnItems.addLayer(exclusionZoneLayer);
		}
	}

	for (var i in lpi.polyExclnZones) {
		var vertices = [];
		for (var x in lpi.polyExclnZones[i].vertices) {
			vertices.push([toDegrees(lpi.polyExclnZones[i].vertices[x].latRad), toDegrees(lpi.polyExclnZones[i].vertices[x].lonRad)]);
	    }
		var polyExclLayer = L.polygon(vertices, {color: setColor('red')});
		polyExclLayer.finderInfo = {lpiID: lpi.id};
		drawnItems.addLayer(polyExclLayer);
	}
}

function loadOfflineCacheList() {
	$.ajax("/webmap/servlet/?action=getOfflineTileCacheList")
	.fail(function( msg, status, error ) {
		bootbox.alert("Retrieval of offline tile cache list failed: " + error);
		return;
	})
	.done(function( msg ) {
		if (msg == null || msg == undefined|| msg.length == 0) {
			bootbox.alert("Retrieval of offline tile cache list failed: " + error);
			return;
		}

		offlineCacheList = JSON.parse(msg);

		for(var i = 0; i <offlineCacheList.length; i++) {
			$('#mapType').append('<option value="' + offlineCacheList[i] + '">' + offlineCacheList[i] + '</option>');
		}

		console.log("Loaded offline tile cache list");
		console.log(offlineCacheList);
	});
}

function changeMapType(mapType) {
	if(db == null){
		alert("You may be browsing in incognito mode, which is not supported by LandSAR")
		return
	}
	var transaction = db.transaction(["mapData"], "readwrite");
	var objectStore = transaction.objectStore("mapData");
	var request = objectStore.put({object: "selectedMap", value: $('#mapType').val()});

	var mapType = mapType ? mapType : $('#mapType').val();
	if (baseLayer != undefined) {
		baseLayer.removeFrom(map);
	}

	baseLayer = L.tileLayer();


	switch(mapType) {
		case "mapbox.streets":
			//baseLayer._url = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}";
			baseLayer._url = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
			baseLayer.options.accessToken = 'sk.eyJ1IjoibnNvdWxlIiwiYSI6ImNqb2RjZXJqOTBxeHozcWxlZ3JsY3dwejIifQ.RST-F_VcgkUcACdX1GFt9Q';
			baseLayer.options.tileSize = 512
			baseLayer.options.zoomOffset = -1
			//baseLayer.options.id = "mapbox.streets";
			baseLayer.options.id = "mapbox/streets-v11";
			baseLayer.options.attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
			break;
		case "mapbox.satellite":
			//baseLayer._url = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}";
			baseLayer._url = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
			baseLayer.options.accessToken = 'sk.eyJ1IjoibnNvdWxlIiwiYSI6ImNqb2RjZXJqOTBxeHozcWxlZ3JsY3dwejIifQ.RST-F_VcgkUcACdX1GFt9Q';
			baseLayer.options.tileSize = 512
			baseLayer.options.zoomOffset = -1
			//baseLayer.options.id = "mapbox.satellite";
			baseLayer.options.id = "mapbox/satellite-v9";
			baseLayer.options.attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
			break;
		case "mapbox.outdoors":
			baseLayer._url = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
			baseLayer.options.accessToken = 'sk.eyJ1IjoibnNvdWxlIiwiYSI6ImNqb2RjZXJqOTBxeHozcWxlZ3JsY3dwejIifQ.RST-F_VcgkUcACdX1GFt9Q';
			baseLayer.options.tileSize = 512
			baseLayer.options.zoomOffset = -1
			baseLayer.options.id = "mapbox/outdoors-v11";
			baseLayer.options.attribution = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
			break;
		case "opentopomap":
			baseLayer._url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
			baseLayer.options.maxZoom = 17;
			baseLayer.options.attribution = 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
			break;
		case "esri.delorme":
			baseLayer._url = 'https://server.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer/tile/{z}/{y}/{x}';
			baseLayer.options.attribution = 'Tiles &copy; Esri &mdash; Copyright: &copy;2012 DeLorme';
			baseLayer.options.minZoom = 1;
			baseLayer.options.maxZoom = 11;
			break;
		case "esri.worldImagery":
			baseLayer._url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
			baseLayer.options.attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
			break;
		case "offline.cache":
			baseLayer._url = 'offline_tiles/eastern_mass/{z}/{x}/{y}.png';
			baseLayer.options.attribution = 'Offline data';
			break;
		case "osm":
			baseLayer._url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
			baseLayer.options.attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
			baseLayer.options.maxZoom = 19;
			break;
		default:
			if(offlineCacheList.includes(mapType)) {
				// ** an offline cache was selected
				baseLayer._url = 'offline_tiles/' + mapType + '/{z}/{x}/{y}.png';
				baseLayer.options.attribution = 'Offline data';
				//baseLayer.options.maxZoom = 19; // ** what should this be?
			}
	}

	baseLayer.addTo(map);
}

function showSplashScreen() {
	sessionStorage.setItem('showedSplashScreen', 'true');
	var dialog = bootbox.dialog({
	    title: 'Welcome to LandSAR!',
	    message: "<p>Are you using LandSAR in an operational context, or for testing purposes?</p>",
	    size: 'large',
	    buttons: {
	        testing: {
	            label: "Testing",
	            className: 'btn-info',
	            callback: function(){
                    console.log("Testing mode selected...");
                    sessionStorage.setItem('operationalUse', 'false');
                    getLPIsFromServer();
                    layersInit();
					$('#operationUseText').empty();
					$('#operationUseText').addClass('btn-info');
                    $('#operationUseText').append("<span style='font-weight: bold;'>Mode: Testing</span>");
	            }
	        },
	        operational: {
	            label: "Operational",
	            className: 'btn-warning',
	            callback: function(){
                    console.log("Operational mode selected...");
                    sessionStorage.setItem('operationalUse', 'true');
                    getLPIsFromServer();
                    layersInit();
					$('#operationUseText').empty();
					$('#operationUseText').addClass('btn-warning');
					$('#operationUseText').append("<span style='font-weight: bold;'>Mode: Operational</span>");
	            }
	        }
	    }
	});


}

function showWarningScreen() {
	//if(null != getCookie("warning")){
	//	showSplashScreen();
	//}else {
		var dialog = bootbox.dialog({
			closeButton: false,
			title: '<i id="warningIcon" class="fa fa-exclamation-triangle"></i><p id="warningTitle">Disclaimer</p>',
			message: "<div class='scroller'><p>LandSAR software is beta-version, pre-release code and is not at the level of performance or compatibility of a final product offering. This software may not operate correctly and is provided \"AS IS.\" This software is offered to the user for beta testing, and we request that any problems, \"bugs,\" or ideas for enhancement be sent to the Joint Personnel Recovery Agency (JPRA). Kindly do not distribute this software without JPRA's permission. This software is approved for distribution to U.S. Citizens, who conduct Search and Rescue, and U.S. Government Agencies, and their contractors, due to it being critical technology, as determined on 4/4/2016. Other requests for this software shall be referred to JPRA.</\p>" +
				"\n" +
				"<p>By accepting this disclaimer the user also acknowledges that there are limitations to this software and it should not be applied to search and rescue cases that have lost persons with dementia or autism. LandSAR should also not be applied to cases where lost persons are despondent,  or have psychological, or mental health issues.</p></div>",
			size: 'large',
			buttons: {
				decline: {
					label: "Decline",
					className: 'btn-secondary',
					callback: function () {
						logout();
					}
				},
				confirm: {
					label: "Accept",
					className: 'btn-info',
					callback: function () {
						showSplashScreen();
						setCookie("warning", "true", 365)
					}
				},
			}
		});
		dialog.on("shown.bs.modal", function () {
			dialog.attr("id", "warningDialog");
		});
	//}
}

$('.scroller').on('scroll', chk_scroll);

$( window ).resize(function() {
	if($('.scroller').hasScrollBar()){
		$('#warningDialog > div > div > div.modal-footer').css("display", "none");
	}else{
		$('#warningDialog > div > div > div.modal-footer').css("display", "flex");
	}
});

function chk_scroll(e) {
	var elem = $(e.currentTarget);
	if (elem[0].scrollHeight - elem.scrollTop() <= elem.outerHeight()) {
		console.log("bottom");
		$('#warningDialog > div > div > div.modal-footer').css("display", "flex");
	}
}

function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

(function($) {
	$.fn.hasScrollBar = function() {
		if(null != this) {
			if(this.has(0)) {
				if (null != this.get(0)) {
					if (this.get(0).scrollHeight != null) {
						return this.get(0).scrollHeight > this.height();
					}
				}
			}
		}
	}
})(jQuery);

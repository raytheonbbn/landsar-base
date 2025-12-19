var layerSettings = {
	elevation: false,
	landCover: false,
	samplePaths: true,
	distributions: true,
	distributionOpacity: 50,
	usngGrid: false,
	coordinateSystem: "Decimal Degrees (DD)",
	unitMeasurementSystem: UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
};

function resetLayerSettingsToDefault() {
	console.log("reset layers settings to default called");

	layerSettings.elevation = false
	layerSettings.landCover = false
	layerSettings.samplePaths = true
	layerSettings.distributions = true
	layerSettings.distributionOpacity = 50
	layerSettings.usngGrid = false
	layerSettings.coordinateSystem = "Decimal Degrees (DD)"
	layerSettings.unitMeasurementSystem = UNIT_MEASUREMENT_SYSTEMS.IMPERIAL

	putToCache("layerSettings", layerSettings);

	updateFormFromSettings()
	updateLayerChange()
}

// ** TODO: we need an organized startup routine, waiting for a timer is not ideal
function layersInit() {
	setTimeout(function() {
		updateMapBasedOnLayerSelections();
	}, 2000);
}


function loadLayerSettingsFromCache() {
	console.log("loading layer settings from cache")
	getFromCache("layerSettings", function(event) {
		if(event.target.result !== undefined && event.target.result.value !== undefined && event.target.result.value != null) {
			for (const property in layerSettings) {
				if(event.target.result.value[property] !== undefined && event.target.result.value[property] != null) {
					layerSettings[property] = event.target.result.value[property];
					console.log(layerSettings[property] + " : " + event.target.result.value[property])
				}
			}
		}

		updateFormFromSettings()
		updateLayerChange();
	} );


}

function getLayersHTML() {
	// ** TODO: sync ajax on main thread is deprecated - look into alternative
	return $.ajax({url: "/webmap/landsar/layers.html", async: false}).responseText;
}

function setLayerStateOnForm(name, enabled) {
	document.getElementById(name).checked = enabled;
}

function getLayerStateFromForm(name) {
	return document.getElementById(name).checked;
}

function updateFormFromSettings() {
	setLayerStateOnForm("samplePathsLayerCB", layerSettings.samplePaths);

	//setLayerStateOnForm("elevationLayerCB", layerSettings.elevation);
	//setLayerStateOnForm("landCoverLayerCB", layerSettings.landCover);
	if(layerSettings.elevation){
		$('#visibleLayerSelect').val("elevation");
		loadElevationLegend(getCurrentLPI(getCurrentLPIID()))
	}else if(layerSettings.landCover){
		$('#visibleLayerSelect').val("landcover");
	}else{
		$('#visibleLayerSelect').val("default");
	}

	setLayerStateOnForm("usngGridOverlayCB", layerSettings.usngGrid);
	setLayerStateOnForm("distributionLayerCB", layerSettings.distributions);
	setLayerStateOnForm("unitMeasurementSystem", layerSettings.unitMeasurementSystem)
	setLayerStateOnForm("coordinateSystem", layerSettings.coordinateSystem)

	const coordinateSystemSelection = document.getElementById("coordinateSystem");
	if(layerSettings.coordinateSystem === "Decimal Degrees (DD)") {
		coordinateSystemSelection.selectedIndex = 0;
	}else if(layerSettings.coordinateSystem === "Degrees Minutes Seconds (DMS)") {
		coordinateSystemSelection.selectedIndex = 1;
	}else if(layerSettings.coordinateSystem === "Degrees Decimal Minutes (DDM)") {
		coordinateSystemSelection.selectedIndex = 2;
	}else if(layerSettings.coordinateSystem === "UTM") {
		coordinateSystemSelection.selectedIndex = 3;
	}else if(layerSettings.coordinateSystem === "USNG/MGRS") {
		coordinateSystemSelection.selectedIndex = 4;
	}

	const unitMeasurementSystemSelection = document.getElementById("unitMeasurementSystem");
	if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
		unitMeasurementSystemSelection.selectedIndex = 0;
	}else{
		unitMeasurementSystemSelection.selectedIndex = 1;
	}

	document.getElementById("distributionOpacity").value = layerSettings.distributionOpacity;
}

function updateSettingsFromForm() {
	console.log("update settings from from called");

	layerSettings.samplePaths = getLayerStateFromForm("samplePathsLayerCB");
	layerSettings.distributions = getLayerStateFromForm("distributionLayerCB");
	layerSettings.distributionOpacity = document.getElementById("distributionOpacity").value;
	layerSettings.usngGrid = getLayerStateFromForm("usngGridOverlayCB");

	const coordinateSystemSelection = document.getElementById("coordinateSystem");
	coordinateSystem = coordinateSystemSelection.options[coordinateSystemSelection.selectedIndex].text;
	layerSettings.coordinateSystem = coordinateSystem;

	const unitSystemSelection = document.getElementById("unitMeasurementSystem");
	layerSettings.unitMeasurementSystem = unitSystemSelection.options[unitSystemSelection.selectedIndex].text;
	updateUnitLabelsForForms(layerSettings.unitMeasurementSystem)

	console.log("Selected coordinate system: " + layerSettings.coordinateSystem)
	console.log("Selected unit measurement system: " + layerSettings.unitMeasurementSystem)

	putToCache("layerSettings", layerSettings);
}

function closeLayerSettings() {
	layersMenu.close();
}

function openLayersMenu() {
	updateFormFromSettings();

	//mainMenu.close();
	layersMenu.open();
	layersMenu.setLocation([150,0]);

}

function updateLayerChange() {
	const visibleLayerSelected = $('#visibleLayerSelect').val();
	console.log("update layer change called");
	console.log("visible layer selected: " + visibleLayerSelected);

	if(visibleLayerSelected === "landcover"){
		toggleLegend("landcover", true);
		toggleLegend("elevation", false);

		layerSettings.landCover = true;
		layerSettings.elevation = false;
	}else if(visibleLayerSelected === "elevation"){
		toggleLegend("elevation", true);
		toggleLegend("landcover", false);

		layerSettings.elevation = true;
		layerSettings.landCover = false;
	}else if(visibleLayerSelected === "default"){
		toggleLegend("landcover", false);
		toggleLegend("elevation", false);

		layerSettings.landCover = false;
		layerSettings.elevation = false;
	}

	updateSettingsFromForm();
	updateMapBasedOnLayerSelections();

	if(usngGridLayer !== null && usngGridLayer !== undefined) {
		usngGridLayer.bringToBack();
	}

}

function updateMapBasedOnLayerSelections() {
	console.log("updateMapBasedOnLayerSelections called");

	var lpiID = $("#lostPersonSelect").val();

	map.eachLayer(
	function(layer){
		if(layer.finderInfo !== undefined) {
			if(layer.finderInfo.finderElementType === "usngGrid") {
				var opacity = layerSettings.usngGrid ? 1 : 0;
				if(layer.setOpacity === undefined) {
					layer.setStyle({ color: 'rgba(255,255,255,' + opacity + ')'});
				} else {
					layer.setOpacity(opacity);
				}
			}


			if(layer.finderInfo.lpiID !== lpiID && layer.finderInfo.lpiID != null) {
				// ** if this search isn't for the current LPI, hide it
				if(layer.setOpacity === undefined) {
					layer.setStyle({ color: 'rgba(255,255,255,0)'}); // ** set invisible
				} else {
					layer.setOpacity(0);
				}
			} else {
				// ** otherwise hide/show based on layer visibility settings
				if(layer.finderInfo.finderElementType === "paths") {
					if (layerSettings.samplePaths) {
						layer.setStyle({ color: 'rgba(255,255,255,1)'}); // ** set visible
					} else {
						layer.setStyle({ color: 'rgba(255,255,255,0)'}); // ** set invisible
					}
				} else if(layer.finderInfo.finderElementType === "landcover") {
					if (layerSettings.landCover) {
						layer.setOpacity(1);// ** set visible

						//toggleLegend("landcover", true);
					} else {
						layer.setOpacity(0); // ** set invisible
					}
				} else if(layer.finderInfo.finderElementType === "elevation") {
					if (layerSettings.elevation) {
						layer.setOpacity(1);// ** set visible

						//toggleLegend("elevation", true);
					} else {
						layer.setOpacity(0); // ** set invisible
					}
				} else if(layer.finderInfo.finderElementType === "distribution") {
					if (layerSettings.distributions) {
						layer.setOpacity(layerSettings.distributionOpacity / 100);// ** set visible
					} else {
						layer.setOpacity(0); // ** set invisible
					}
				}
			}
		}
	  }
	);

	if(layerSettings.usngGrid) {
		loadUSNGGridOverlay();
	}else{
		if(usngGridLayer !== undefined && usngGridLayer !== null) {
			map.removeLayer(usngGridLayer);
		}
	}
}

function toggleLegend(legend, toggleOn){
	if(legend === "elevation"){
		if(toggleOn){
			$("#elevation-legend").css("display", "flex");
			$("#elevation-legend-btn-minimize").css("display", "inline-block");
			$("#elevation-legend-content").css("display", "inline-block");
			$("#elevation-legend-btn-minimize").text("-");
			$("#elevation-legend-btn-minimize").css("width", "15px");
		}else{
			$("#elevation-legend").css("display", "none");
			$("#elevation-legend-btn-minimize").css("display", "none");
			$("#elevation-legend-btn-minimize").css("width", "25px");
		}
	}else{
		if(toggleOn){
			$("#landcover-legend").css("display", "flex");
			$("#landcover-legend-btn-minimize").css("display", "inline-block");
			$("#landcover-legend-content").css("display", "inline-block");
			$("#landcover-legend-btn-minimize").text("-");
			$("#landcover-legend-btn-minimize").css("width", "15px");
		}else{
			$("#landcover-legend").css("display", "none");
			$("#landcover-legend-btn-minimize").css("display", "none");
			$("#landcover-legend-btn-minimize").css("width", "25px");
		}
	}
}


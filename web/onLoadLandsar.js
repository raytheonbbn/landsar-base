var operationalUse = null;
var osppreConfig = null;

/** map of motion model name to MotionModelInputs (see motion_model_classes.js) */
var motionModelsWithAttrs = new Map();
var motionModelsWithGeospatialAttrs = new Map();

function getFontSize() {
    let measure= document.createElement('div');
    measure.style.height= '10em';
    document.body.appendChild(measure);
    let size= measure.offsetHeight/10;
    document.body.removeChild(measure);
    return size;
}

function isFontSizeDefault() {
    return getFontSize() === 16;
}

var stateManagement

$(document).ready(function() {
    stateManagement = new StateManagement()

    var operationalUseStr = sessionStorage.getItem('operationalUse');
    if(null != operationalUseStr) {
        if (operationalUseStr === 'true') {
        	operationalUse = true;
            $('#operationUseText').empty();
            $('#operationUseText').addClass('btn-warning');
            $('#operationUseText').append("Mode: Operational");
        }else{
        	operationalUse = false
            $('#operationUseText').empty();
            $('#operationUseText').addClass('btn-info');
            $('#operationUseText').append("Mode: Testing");
        }
    }

    // Remove grabber, close, and resizer from timeline
    $("#slider").closest(".leaflet-control-dialog-inner").find('.leaflet-control-dialog-grabber').remove()

    $("#slider").closest(".leaflet-control-dialog-inner").find('.leaflet-control-dialog-close').remove()


    $("#slider").closest(".leaflet-control-dialog-inner").find('.leaflet-control-dialog-resizer').remove()
    $("#slider").closest(".leaflet-control-dialog-inner").css("padding", "0px");
    $("#slider").closest('.leaflet-control-dialog').css("margin", "0");

    setCookie("loggedIn", true, 0);

    // on map stopped moving listener (only called after having panned or zoomed in and out)
    map.on("moveend", function () {
        // If using USNG Grid, reload cropped KML (that fits screen window)
        if(layerSettings.usngGrid) {
            console.log("map was moved, updating USNG grid overlay");
            if (usngGridLayer !== undefined && usngGridLayer !== null) {
                map.removeLayer(usngGridLayer);
                loadUSNGGridOverlay();
            }
        }
    });

    if(!isFontSizeDefault() && getCookie("fontSizeWarningShown") == null) {
        alert("An incompatible font size has been detected. For the best experience, please use the default font size for your browser.")
        setCookie("fontSizeWarningShown", true, 0)
    }

    loadOsppreConfig();

    /// load default parameters
    loadDefaultLandcoverMetadata();
    loadDefaultLPP();
    loadDefaultWanderingParams();
    loadDefaultGoalOrientedParams();
    loadDefaultSearchParams();
});

function loadOsppreConfig() {
    return $.ajax("/webmap/servlet/?action=getConfig").done(function (msg) {
        if (msg === null || msg === undefined || msg.length === 0) {
            console.log("Received empty message from getConfig request");
            return;
        }
        let config = msg;
        console.log("Received config: " + config);

        // load initial view bounds
        if (config.initialViewBounds != null) {
            let mBounds = L.latLngBounds(L.latLng(config.initialViewBounds.southLatDeg, config.initialViewBounds.westLonDeg),
                L.latLng(config.initialViewBounds.northLatDeg, config.initialViewBounds.eastLonDeg));
            map.fitBounds(mBounds);
        }

        osppreConfig = config;

        if(osppreConfig.showCoreModels != null && !osppreConfig.showCoreModels){
            $("#motionModelSelections").empty();
            $("#ipWaterToggleText").text("Stay out of water")
        }

        loadMotionModelsAttrs();
    });
}

function loadDefaultLandcoverMetadata() {
    return $.ajax("/webmap/servlet/?action=getDefaultLandcover").done(function (landcoverMetadata) {
        if (landcoverMetadata === null || landcoverMetadata === undefined || landcoverMetadata.length === 0) {
            console.log("Received empty message from getDefaultLandcover request");
            return;
        }
        console.log("Received default landcover metadata: " + landcoverMetadata);
        setDefaultMetadata(landcoverMetadata)
    });
}

function loadDefaultLPP(){
    return $.ajax("/webmap/servlet/?action=getDefaultLPP").done(function (defaultLpp) {
        if (defaultLpp === null || defaultLpp === undefined || defaultLpp.length === 0) {
            console.log("Received empty message from getDefaultLPP request");
            return;
        }
        console.log("Received default lpp: " + defaultLpp);
        setDefaultLpp(defaultLpp)
    });
}

function loadDefaultWanderingParams(){
    return $.ajax("/webmap/servlet/?action=getDefaultWanderingParams").done(function (defaultWanderingParams) {
        if (defaultWanderingParams === null || defaultWanderingParams === undefined || defaultWanderingParams.length === 0) {
            console.log("Received empty message from getDefaultWanderingParams request");
            return;
        }
        console.log("Received default wandering params: " + defaultWanderingParams);
        setDefaultWanderingParams(defaultWanderingParams)
    });
}

function loadDefaultGoalOrientedParams(){
    return $.ajax("/webmap/servlet/?action=getDefaultGoalOrientedParams").done(function (defaultGoalOrientedParams) {
        if (defaultGoalOrientedParams === null || defaultGoalOrientedParams === undefined || defaultGoalOrientedParams.length === 0) {
            console.log("Received empty message from getDefaultGoalOrientedParams request");
            return;
        }
        console.log("Received default goal oriented params: " + defaultGoalOrientedParams);
        setDefaultGoalOrientedParams(defaultGoalOrientedParams)
    });
}

function loadDefaultSearchParams(){
    return $.ajax("/webmap/servlet/?action=getDefaultSearchParams").done(function (defaultSearchParams) {
        if (defaultSearchParams === null || defaultSearchParams === undefined || defaultSearchParams.length === 0) {
            console.log("Received empty message from getDefaultSearchParams request");
            return;
        }
        console.log("Received default search params: " + defaultSearchParams);
        setDefaultSearchParams(defaultSearchParams)
    });
}

function loadMotionModelsAttrs(){
    $.ajax("/webmap/servlet/?action=getPluggableMotionModels").done(function (motionModels) {
        $.each(motionModels, function(index, motionModel) {
            let motionModelInputs = new MotionModelInputs();
            motionModelInputs.name = motionModel.name;
            motionModelInputs.stayOutOfWaterEnabled = motionModel.stayOutOfWaterEnabled;
            motionModelInputs.landcoverMetadataEnabled = motionModel.landcoverMetadataEnabled;
            
            if (motionModel.motionModelParameters != null && 
                motionModel.motionModelParameters.length) {
                let motionModelAttrVals = [];
                for (let i=0; i<motionModel.motionModelParameters.length; ++i) {
                    let attr = motionModel.motionModelParameters[i];
                    motionModelAttrVals.push(
                        new MotionModelAttrDescription(attr.name,
                            attr.description,
                            attr.required,
                            attr.type,
                            attr.dataUnit));
                }
                motionModelInputs.motionModelDescriptions = motionModelAttrVals;
                motionModelsWithAttrs.set(motionModel.name,
                    motionModelInputs);
            }

            if (motionModel.motionModelGeospatialDescriptions != null &&
                motionModel.motionModelGeospatialDescriptions.length) {
                let motionModelGeoAttrsVals = [];
                for (let i=0; i<motionModel.motionModelGeospatialDescriptions.length; ++i) {
                    let attr = motionModel.motionModelGeospatialDescriptions[i];
                    motionModelGeoAttrsVals.push(
                        new MotionModelGeospatialDescription(attr.geospatialDataType,
                            attr.required));
                }
                motionModelInputs.motionModelGeospatialDescriptions = motionModelGeoAttrsVals;
                motionModelsWithGeospatialAttrs.set(motionModel.name, motionModelInputs);
            }

            console.log("Motion model info: " + JSON.stringify(motionModelInputs));
            createMotionModelDialogOption(motionModel.name);
        });
    });
}


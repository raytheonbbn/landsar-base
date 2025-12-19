/**
 * @Summary
 * Walks the user through the creating a new Search
 *
 * @author Devon Minor
 */


var swInputs,
    sgParams,
    searchInputs,
    lastSearchForm,
    siWrapper,
    externalSearchInputs;

var searchDetails = {};

var MILLISECONDS_IN_MINUTE = 60000;
var MINUTES_IN_HOUR = 60;

let searchAssetContainer = $('#externalSearchAssetContainer');
var searchAssets

function loadSearchAssets(){
    return $.ajax("/webmap/servlet/?action=handleGetSearchAssets").done(function( msg ) {
        if(msg === null || msg === undefined || msg.length === 0){
            $('#searchAssetOption').hide();
            $("#searchAssetOuterContainer").hide();
            return;
        }
        searchAssets = msg;
        console.log("Available search assets: " + searchAssets)

        // Populate search assets list
        searchAssetContainer.empty();
        for(let i=0; i<msg.length; i++){
            let searchAssetName = msg[i].assetName;
            let assetId = msg[i].assetId;
            searchAssetContainer.append("<input type='radio' name='searchAsset' value='"
                + assetId + "'>" + searchAssetName + "<br>");
        }

        $('#searchAssetOption').show();

        let searchPlatformSelector = $('input[name=searchPlatform]');
        searchPlatformSelector.off()
        searchPlatformSelector.on('input', function() {
            let searchPlatform = searchPlatformSelector.filter(":checked")[0].value
            if(searchPlatform !== "SEARCH_ASSET") {
                $("#searchAssetOuterContainer").hide();
            }else{
                $("#searchAssetOuterContainer").show();
            }
        });
    });
}

function openSearches() {
    if (!isLoggedIn()) {
        if (confirm("Your session expired, would you like to log back in? Press 'cancel' to continue viewing your current session.")) {
            location.reload();
        }
        cancelSearch();
        return;
    }

    stateManagement.setSavedState(false)
    const curLP = document.getElementById("lostPersonSelect").value;
    if (curLP === null || curLP === undefined || curLP === "") {
        alert("No lost person instance has been selected. Please select a lost person instance.");
        return;
    }
    $('#openMainMenu').hide();
    mainMenu.close();
    if (curSliderDateTime === null || curSliderDateTime === undefined || curSliderDateTime === "") {
        curSliderDateTime = $("#overlays")[0].options[0].value;
    }

    // Get Search Assets
    Promise.all(loadSearchAssets()).catch((error) => {
        console.log(error);
        $('#searchAssetOption').hide();
        $("#searchAssetOuterContainer").hide();
    });

    document.getElementById("searchDate").value = curSliderDateTime.slice(0, 16);

    searchForm.open();
    swInputs = new SweepWidthInputs();

    externalSearchInputs = new SearchRequest();

    sgParams = new SearchGenerationParameters();
    searchInputs = new SearchInputs();
    searchInputs.setLpiId(document.getElementById("lostPersonSelect").value);
    siWrapper = new SearchInputsWrapper();
    mapItems.push(siWrapper);

    $("#searchTimezone").text("(" + getLPITimeZone(searchInputs.lpiId) + ")");

}

function cancelSearch() {
    lastSearchForm = "";
    clearLayers([siWrapper.getCompletedSearchUUID()]);
    mapItems.pop();
    swInputs = undefined;
    sgParams = undefined;
    searchInputs = undefined;
    siWrapper = undefined;
    closeSearchForms();
    openMainMenu();
}

function closeSearchForms() {
    searchForm.close();
    footForm.close();
    heliForm.close();
    directForm.close();
    coordinatesForm.close();
}

//called when the user hits continue on the initial (search parameters) page
document.getElementById("spContinue").addEventListener("click", function () {
    if (!checkFormStatus("searchForm", true)) {
        return;
    }

    if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC) {
        $("#elevationUnder500").text("Under " + feetToM(500) + " meters")
        $("#elevationTo1000").text(feetToM(500) + " to " + feetToM(1000) + " meters")
        $("#elevationOver1000").text("Over " + feetToM(1000) + " meters")
    }else{
        $("#elevationUnder500").text("Under 500 feet")
        $("#elevationTo1000").text("500 to 1000 feet")
        $("#elevationOver500").text("Over 1000 feet")
    }

    let timezone = getLPITimeZone(getCurrentLPIID())
    let inputsDate = new Date(moment.tz(getCurrentLPI(getCurrentLPIID()).startTime, timezone).seconds(0).milliseconds(0));
    let searchDate = new Date(moment.tz($('#searchDate').val(), timezone).seconds(0).milliseconds(0));
    if(searchDate.getTime() === inputsDate.getTime()){
        if (confirm("For best results, please set search time to a time after the lost person was reported lost. Would you like to proceed anyways?")) {
            stateManagement.broadcastUpdate(SEARCH_DETAILS)
        }
    }else{
        stateManagement.broadcastUpdate(SEARCH_DETAILS)
    }
});

function newSearchContinue(){
    searchInputs.setIsCompleted(($('input[name=searchType').filter(":checked")[0].value == 'completed') ? true : false);

    ($('input[name=searchType').filter(":checked")[0].value == 'completed') ? null : $('input[id=deContinue]').val("Submit");

    //searchInputs.setTime(new Date($('#searchDate').val()).getTime() / 1000);

    let timezone = getLPITimeZone(getCurrentLPIID())
    let searchDate = new Date(moment.tz($('#searchDate').val(), timezone).seconds(0).milliseconds(0));
    extractSearchInputsAndContinue(searchDate)
}

function extractSearchInputsAndContinue(searchDate){
    let searchPlatformSelector = $('input[name=searchPlatform]');
    let searchPlatform = searchPlatformSelector.filter(":checked")[0].value
    if(searchPlatform !== "SEARCH_ASSET") {
        searchInputs.setTime(searchDate.getTime());

        let SearchPlatform = {
            FOOT: {
                timeOnStationHrs: getDefaultSearchParams()[FOOT_TIME_ON_STATION_PARAM],
                speedKmPerHr: getDefaultSearchParams()[FOOT_SPEED_PARAM]
            },
            HELICOPTER: {
                timeOnStationHrs: getDefaultSearchParams()[HELICOPTER_TIME_ON_STATION_PARAM],
                speedKmPerHr: getDefaultSearchParams()[HELICOPTER_SPEED_PARAM]
            }
        };

        //searchInputs.setTime(new Date($('#searchDate').val()).getTime());
        swInputs.setPlatform($('input[name=searchPlatform]').filter(":checked")[0].value);
        sgParams.setTimeOnStationHrs(SearchPlatform[swInputs.getPlatform()].timeOnStationHrs);
        sgParams.setSpeedKmPerHr(SearchPlatform[swInputs.getPlatform()].speedKmPerHr);

        if (searchPlatformSelector.filter(':checked')[0].value === "FOOT") {
            searchForm.close();
            footForm.open();
        } else if (searchPlatformSelector.filter(':checked')[0].value === "HELICOPTER") {
            searchForm.close();
            heliForm.open();
        }
    }else{
        // Get Search Asset Selection
        let searchAsset = $('input[name=searchAsset]').filter(":checked")[0].value

        externalSearchInputs.setAssetId(searchAsset)
        externalSearchInputs.setLpiId(getCurrentLPIID())
        externalSearchInputs.setSearchId(randUUID())
        externalSearchInputs.setStartTime(searchDate.getTime())

        searchForm.close();

    }
}

//called when the user hits continue on the foot search parameters page
document.getElementById("fsContinue").addEventListener("click", function () {
    if (!checkFormStatus("footForm")) {
        return;
    }
    lastSearchForm = "footForm";
    swInputs.setSensor($('input[name=sensor]').filter(":checked")[0].value);
    swInputs.setCrewSize($('input[name=searchPartySize]').val());
    swInputs.setCrewStatus($('input[name=crewStatus]').filter(":checked")[0].value);
    swInputs.setSeason($('input[name=searchSeason]').filter(":checked")[0].value);
    sgParams.setNumLegs(parseInt(swInputs.getCrewSize()));
    sgParams.setSweepWidthKm(parseFloat(swInputs.computeSweepWidth().toFixed(3)));

    footForm.close();

    stateManagement.broadcastUpdate(SEARCH_FOOT)
});

//called when the user hits continue on the helicopter search parameters page
document.getElementById("hsContinue").addEventListener("click", function () {
    if (!checkFormStatus("heliForm")) {
        return;
    }
    lastSearchForm = "heliForm";
    swInputs.setSensor($('input[name=sensor]').filter(":checked")[0].value);
    sgParams.setOrientationConstrained(($('input[name=searchShape]').filter(":checked")[0].value == 'constrained') ? true : false);

    let elevation = $('input[name=elevation]').filter(":checked")[0].value;
    swInputs.setRWAElevation(elevation);

    swInputs.setCrewStatus($('input[name=crewStatus]').filter(":checked")[0].value);
    swInputs.setSeason($('input[name=searchSeason]').filter(":checked")[0].value);
    sgParams.setSweepWidthKm(parseFloat(swInputs.computeSweepWidth().toFixed(3)));

    heliForm.close();

    stateManagement.broadcastUpdate(SEARCH_HELICOPTER)
});

//called when the user hits continue on the asset search parameters page
document.getElementById("asContinue").addEventListener("click", function () {
    lastSearchForm = "searchForm";
    let sweepWidth = $('input[name=searchSweepWidth]').val();
    if(sweepWidth === ""){
        $('.incompleteText').text("Please enter a valid sweep width");
        return;
    }
    externalSearchInputs.setSweepWidth(sweepWidth)

    let searchDuration = $('input[name=searchDuration]').val();
    if(searchDuration === ""){
        $('.incompleteText').text("Please enter a valid search duration");
        return;
    }
    externalSearchInputs.setDuration(searchDuration)

    let sensorPos = $('input[name=searchSensorProb]').val()
    if(sensorPos === "" || sensorPos < 0 || sensorPos > 1){
        $('.incompleteText').text("Please enter a valid probability between 0 and 1");
        return;
    }

    externalSearchInputs.setSensorPos(sensorPos)

    let speedKmPerHr = $('input[name=speedKmPerHr]').val()
    if(speedKmPerHr === "" || speedKmPerHr < 0){
        $('.incompleteText').text("Please enter positive value for speed");
        return;
    }

    externalSearchInputs.setSpeedKmPerHr(speedKmPerHr)

    $('.incompleteText').text("");


    externalSearchInputs.setAssetId($('input[name=searchAsset]').val())
    assetSearchForm.close();

    // ** request new asset search from server
    requestAssetSearch(externalSearchInputs, curSliderDateTime);
});

//called when the user hits continue or submit on the search generation parameters page
document.getElementById("deContinue").addEventListener("click", function () {
    if (!checkFormStatus("directForm")) {
        return;
    }

    let sweepWidthVal = $('input[name=sweepWidth]').val() // either feet or meters
    let searchSpeedVal = $('input[name=speed]').val(); // either mph or kph

    let sweepWidthKM, searchSpeedKMPerHr

    if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC) {
        sweepWidthKM = sweepWidthVal / 1000; // meters to KM
        searchSpeedKMPerHr = searchSpeedVal
    }else{
        sweepWidthKM = feetToKm(sweepWidthVal);
        searchSpeedKMPerHr = mphToKph(searchSpeedVal);
    }

    sgParams = new SearchGenerationParameters(
        sweepWidthKM,
        $('input[name=timeOnStationHrs]').val(),
        searchSpeedKMPerHr,
        sgParams.getOrientationConstrained(),
        sgParams.getNumLegs()
    );
    searchInputs.setSweepWidthInputs(swInputs);
    searchInputs.setSearchParameters(sgParams);

    // ** check if this for a "completed search" or a "new search"
    if (searchInputs.getIsCompleted()) {
        // **  prompt user to draw seach box
        lastState = COMPLETED;
        showHelperText("Hold down the left mouse button and drag to draw the completed search. You may attempt drawing multiple times.");
        directForm.close();
        siWrapper.setSearchInputs(searchInputs);
        siWrapper = drawItem(COMPLETED, mapItems[mapItems.length - 2], siWrapper);
    } else {
        // ** request new search from server
        requestSearch(searchInputs, curSliderDateTime);
    }
});

//called the user hits submit at the end of creating a search with coordinates
document.getElementById("searchSubmit").addEventListener("click", function () {
    if (!checkFormStatus("coordinatesForm")) {
        return;
    }

    var deg2rad = Math.PI / 180;

    var nwLat = $('input[name=nwLat]').val() * deg2rad;
    var nwLon = $('input[name=nwLng]').val() * deg2rad;
    var seLat = $('input[name=seLat]').val() * deg2rad;
    var seLon = $('input[name=seLng]').val() * deg2rad;

    // ** {"latRad":0.7330382858376184,"lonRad":-1.2391837689159741}
    searchInputs.setCoordinates([{latRad: nwLat, lonRad: nwLon}, {latRad: seLat, lonRad: seLon}]);
    requestSearch(searchInputs, curSliderDateTime);
});

//displays the search generation parameters
function displaySGValues() {
    $('input[name=timeOnStationHrs]').val(sgParams.getTimeOnStationHrs());

    let sweepWidthKM = sgParams.getSweepWidthKm();
    let searchSpeedKMPerHr = sgParams.getSpeedKmPerHr();
    if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC) {
        $('input[name=sweepWidth]').val(sweepWidthKM * 1000); // meters
        $('input[name=speed]').val(searchSpeedKMPerHr);
    }else{
        $('input[name=sweepWidth]').val(kmToFeet(sweepWidthKM));
        $('input[name=speed]').val(kphToMph(searchSpeedKMPerHr));
    }
}

/**
 * Below click event listeners are added to the back
 * buttons in the search menus.
 *
 */

$('#backToMainSearch').click(function () {
    cancelSearch();
    $('.incompleteText').text("");
});

$('.backToPlatform').click(function () {
    footForm.close();
    heliForm.close();
    assetSearchForm.close();
    $('.incompleteText').text("");
    searchInputs.isCompleted = undefined;
    searchInputs.time = undefined;
    swInputs.platform = undefined;
    sgParams.timeOnStationHrs = undefined;
    sgParams.sweepWidthKm = undefined;

    stateManagement.broadcastUpdate(NEW_SEARCH)
});


$('#backToSf').click(function () {
    directForm.close()
    $('.incompleteText').text("");
    swInputs.sensor = undefined;
    swInputs.season = undefined;
    swInputs.crewStatus = undefined;
    swInputs.crewSize = undefined;
    swInputs.rwaElevation = undefined;
    sgParams.numLegs = undefined;
    sgParams.orientationConstrained = undefined;

    externalSearchInputs.lpiId = undefined;
    externalSearchInputs.searchId = undefined;
    externalSearchInputs.startTime = undefined;
    externalSearchInputs.sweepWidth = undefined;
    externalSearchInputs.duration = undefined;
    externalSearchInputs.sensorPos = undefined;
    externalSearchInputs.assetId = undefined;

    if(lastSearchForm === "footForm"){
        stateManagement.broadcastUpdate(SEARCH_DETAILS)
    }else if(lastSearchForm === "heliForm"){
        stateManagement.broadcastUpdate(SEARCH_DETAILS)
    }else{
        stateManagement.broadcastUpdate(SEARCH_ASSET)
    }
    lastSearchForm = "";
});

function requestAssetSearch(searchInputs) {
    let socket = createWebSocket('FINDER/externalSearchApi');
    socket.onopen = function (e) {
        console.log('[open] connection established');
        socket.send(JSON.stringify(searchInputs));
        console.log(JSON.stringify(searchInputs));
        closeSearchForms();
        openMainMenu();
        setStatus("Initiating search request.");

        if (searchInstance !== undefined && searchInstance != null && searchInstance.getCompletedSearchUUID() != null) {
            drawnItems.removeLayer(searchInstance.getCompletedSearchUUID());
        }
    };
    socket.onclose = function (e) {
        if (e.wasClean) {
            console.log('[close] connection closed cleanly, code=' + e.code + ' reason=' + e.reason);
        } else {
            console.log('[close] connection died');
        }
        searchForm.close();
        openMainMenu();
    };
    socket.onerror = function (error) {
        console.log('[error] ${error.message}');
        searchForm.close();
        openMainMenu();
    };
    socket.onmessage = function (msg) {
        console.log(msg.data);
        setStatus(msg.data);

        try {
            if (JSON.parse(msg.data).state === 2) {
                var curLP = document.getElementById("lostPersonSelect").value;
                // ** TODO: figure out where the asyncronous elements of this come in,
                // ** why are the KMZs not yet there the first time through
                //setTimeout(function() {loadSearchDetails(curLP); loadSearchKML(curLP);}, 2000);
                setTimeout(function () {
                    getLPIsFromServer(getCurrentLPI(getCurrentLPIID()).requestId, true, curSliderDateTime);
                }, 2000);
            }
        } catch (ex) {
            console.log("Couldn't parse response message from search web socket");
        }
    };
}

function requestSearch(searchInputs) {
    $("#mainMenuContinueBtn").hide()

    let socket = createWebSocket('FINDER/newSearch');
    socket.onopen = function (e) {
        console.log('[open] connection established');
        socket.send(JSON.stringify(searchInputs));
        console.log(JSON.stringify(searchInputs));
        closeSearchForms();
        openMainMenu();
        setStatus("Initiating search request.");

        if (searchInstance !== undefined && searchInstance != null && searchInstance.getCompletedSearchUUID() != null) {
            drawnItems.removeLayer(searchInstance.getCompletedSearchUUID());
        }
    };
    socket.onclose = function (e) {
        if (e.wasClean) {
            console.log('[close] connection closed cleanly, code=' + e.code + ' reason=' + e.reason);
        } else {
            console.log('[close] connection died');
        }
        searchForm.close();
        openMainMenu();
    };
    socket.onerror = function (error) {
        console.log('[error] ${error.message}');
        searchForm.close();
        openMainMenu();
    };
    socket.onmessage = function (msg) {
        console.log(msg.data);
        setStatus(msg.data);

        try {
            if (JSON.parse(msg.data).state === 2) {
                var curLP = document.getElementById("lostPersonSelect").value;
                // ** TODO: figure out where the asyncronous elements of this come in,
                // ** why are the KMZs not yet there the first time through
                //setTimeout(function() {loadSearchDetails(curLP); loadSearchKML(curLP);}, 2000);
                setTimeout(function () {
                    getLPIsFromServer(getCurrentLPI(getCurrentLPIID()).requestId, true, curSliderDateTime);
                }, 2000);
            }
        } catch (ex) {
            console.log("Couldn't parse response message from search web socket");
        }
    };
}

function loadSearchDetails(lpiID) {
    return $.ajax("/webmap/servlet/?action=getSearchDetails&lpiID=" + lpiID).done(function (msg) {
        if (msg === null || msg === undefined || msg.length === 0) {
            console.log("Received empty message from getSearchDetails request");
            return;
        }

        console.log("Received search details for " + lpiID);
        for (let i = 0; i < msg.length; i++) {
            searchDetails[msg[i].searchId] = msg[i];
        }
    });
}

/**
 * Loads the Search KML
 * @param lpiId UUID of Lost Person Instance
 * @param currentLPI Object current LPI
 * @param searchId UUID of Search
 *
 * @returns Ajax Promise
 */
var kml
function loadSearchKML(lpiId, currentLPI, searchId) {

    return $.ajax("/webmap/servlet/?action=getSearchOverlay&lpiID=" + lpiId + "&searchID=" + searchId).done(function (msg) {
        if (msg === null || msg === undefined || msg.length === 0) {
            console.error("Received empty message from getSearchOverlay request");
            return;
        }

        kml = msg

        map.addLayer(new L.KML(msg, lpiID, "search"));
        updateSearchesAndDistributions(currentLPI, true);
        refreshSlider();
    });
}

/**  calculate search "show time" (at least an hour duration") parameters are Dates
 * for any search that has at least an hour duration, this does nothing. This is an hour duration because
 * most of our timelines have hour increments between the KMZs and we don't want to never show short searches.
 * for any search that doesn't have at least an hour duration, (do something) such that the search has an hour duration
 * returns an array of [starttime, endtime]
 * */
function calcSearchShowTime(starttime, endtime) {
    let diffMilliseconds = endtime.getTime() - starttime.getTime()
    if (diffMilliseconds / MILLISECONDS_IN_MINUTE <= MINUTES_IN_HOUR) {
        // subtract 1/2 hour from the start, add 1/2 hour to the end
        starttime = new Date(starttime.getTime() - (30 * MILLISECONDS_IN_MINUTE));
        endtime = new Date(endtime.getTime() + (30 * MILLISECONDS_IN_MINUTE));
    }
    return [starttime, endtime];

}

function createSearchTableRow(index, label, value) {
    // reuse createTableRow from forms.js
    return createTableRow("searchTableRow", index, label, value);
}

function showSearchDetails(layer) {
    var details = searchDetails[layer.finderInfo.searchID];
    var timeStart = moment.tz(layer.finderInfo.begin, getLPITimeZone(getCurrentLPIID())).format("dddd, MMMM Do YYYY, h:mm:ss a") + " " + getLPITimeZone(getCurrentLPIID());
    var timeEnd = moment.tz(layer.finderInfo.end, getLPITimeZone(getCurrentLPIID())).format("dddd, MMMM Do YYYY, h:mm:ss a") + " " + getLPITimeZone(getCurrentLPIID());


    var table = $('<table>').addClass('table');
    var label = $('<span>').addClass('searchTableLabel');
    table.append(createSearchTableRow(0, "Search", layer.finderInfo.name));
    table.append(createSearchTableRow(0, "LPI Name", getNameFromLPIID(layer.finderInfo.lpiID)));
    table.append(createSearchTableRow(0, "Begin", timeStart));
    table.append(createSearchTableRow(0, "End", timeEnd));
    table.append(createSearchTableRow(0, "Probability of Success for this Search", (round(details["pdThisSearch"] * 100, 2) + "%")));
    table.append(createSearchTableRow(0, "Time on Station", details["searchParameters"]["timeOnStationHrs"] + " hrs"));
    if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
        table.append(createSearchTableRow(0, "Speed", kphToMph(details["searchParameters"]["speedKmPerHr"]) + " miles/hr"));
    }else{
        table.append(createSearchTableRow(0, "Speed", details["searchParameters"]["speedKmPerHr"] + " kilometers/hr"));
    }
    table.append(createSearchTableRow(0, "Orientation Constrained", details["searchParameters"]["orientationConstrained"].toString().toLowerCase().capitalize()));
    if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
        table.append(createSearchTableRow(0, "Sweep Width", kmToFeet(details["searchParameters"]["sweepWidthKm"]) + " feet"));
    }else{
        table.append(createSearchTableRow(0, "Sweep Width", feetToM(kmToFeet(details["searchParameters"]["sweepWidthKm"])) + " meters"));
    }

    let sweepWidthInputs = details["sweepWidthInputs"]
    if(sweepWidthInputs != undefined && sweepWidthInputs != null) {
        let platform = sweepWidthInputs["platform"]
        if (platform != undefined && platform != null) {
            table.append(createSearchTableRow(1, "Platform", platform.toString().toLowerCase().capitalize()));
        }
        let sensor = sweepWidthInputs["sensor"]
        if (sensor != undefined && sensor != null) {
            table.append(createSearchTableRow(1, "Sensor", sensor.toString().toLowerCase().capitalize()));
        }
        let season = sweepWidthInputs["season"]
        if (season != undefined && season != null) {
            table.append(createSearchTableRow(1, "Season", season.toString().toLowerCase().capitalize()));
        }
        let crewStatus = sweepWidthInputs["crewStatus"]
        if (crewStatus != undefined && crewStatus != null) {
            table.append(createSearchTableRow(1, "Crew Status", crewStatus.toString().toLowerCase().capitalize()));
        }
        let crewSize = sweepWidthInputs["crewSize"]
        if (crewSize != undefined && crewSize != null && crewSize > 0) {
            table.append(createSearchTableRow(1, "Crew Size", crewSize));
        }
    }
    var dialog = bootbox.dialog({
        title: 'Search Details',
        message: table,


        size: 'large',
        buttons: {
            cancel: {
                label: "Close",
                className: 'btn-info',
                callback: function () {
                }
            },
            ok: {
                label: "Delete",
                className: 'btn-warning',
                callback: function () {
                    if (layer.finderInfo.searchID == undefined || layer.finderInfo.searchID == null) {
                        console.log("Unable to delete this search, no search ID found");
                    } else {
                        deleteSearch(layer.finderInfo.lpiID, layer.finderInfo.searchID);
                    }
                }
            }
        }
    });
}

function deleteSearch(lpiID, searchID) {
    setStatus("Requesting search deletion. Please wait...");
    console.log('Submitting web sockets request to delete search with LPI ID: ' + lpiID + ' and search ID: ' + searchID);
    let socket = createWebSocket('FINDER/deleteSearch');
    socket.onopen = function (e) {
        console.log('[open] connection established');
        socket.send('{"lpiId": "' + lpiID + '", "searchId": "' + searchID + '"}');
    };
    socket.onclose = function (e) {
        if (e.wasClean) {
            console.log('[close] connection closed cleanly, code=${e.code} reason=${e.reason}');
        } else {
            console.log('[close] connection died');
        }
    };
    socket.onerror = function (error) {
        console.log('[error] ${error.message}');
    };
    socket.onmessage = function (msg) {


        var status = JSON.parse(msg.data);

        if (status.summary.startsWith("Removed search")) {
            status.summary = status.summary + ". Recalculating distributions. Please wait...";
        }

        setStatus(status);

        if (status.state == 2) {
            clearSearchesForLPI(lpiID);
            setTimeout(function () {
                changeActiveLPI($("#overlays").val())
            }, 17000);
        }
    };
}

function clearSearchesForLPI(lpiID) {
    map.eachLayer(
        function (layer) {
            if (layer.finderInfo != undefined) {
                if (layer.finderInfo.lpiID == lpiID && layer.finderInfo.finderElementType == "search") {
                    try {
                        layer.removeFrom(map);
                    } catch (e) {
                        console.log("Unable to remove layer from map");
                        console.log(layer);
                    }
                }
            }
        });
}








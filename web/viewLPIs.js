/**
 *
 * @author Devon Minor
 */

var lpis;

var NO_LPI_MARKER = "NO_LPI_MARKER";

var lpiID = null;

function getLPITimeZone(lpiID) {
	var timezone = null;

	if(lpis != undefined || lpis != null) {
		for(var i = 0; i < lpis.lostPersonInstances.length; i++) {
			if(lpis.lostPersonInstances[i].id == lpiID) {
				timezone = lpis.lostPersonInstances[i].timezone;
			}
		}
	}

	if(timezone == null) {
		console.log("ERROR: Couldn't identify time zone for this LPI!");
		timezone = "US/Eastern";
	}

	return timezone;
}

function isOperationalUse() {
	var opUse = sessionStorage.getItem('operationalUse');
	return opUse != undefined && opUse != null && opUse === "true";
}

function getNextDefaultLPIName() {
	let username = getCookie("username")

	let prefix = (isOperationalUse() ? "" : "Test ") + username.toLowerCase().capitalize() ;

	if(lpis === undefined  || lpis === null) {
		// ** haven't completed loading yet - use random
		return prefix + " " + Math.floor(Math.random() * 1000);
	}

	let countWithPrefix = 0
	let searchedDictionary = new Set()
	let foundInstanceName = false
	for (let i = 0; i < lpis.lostPersonInstances.length; i++) {
		let name = lpis.lostPersonInstances[i].name;
		if(name.startsWith(prefix)){
			foundInstanceName = true;
			let matches = name.match(/\d+$/);
			if (matches) {
				let temp = parseInt(matches[0]);
				if (temp >= countWithPrefix) {
					countWithPrefix = temp + 1
				}
				searchedDictionary.add(name)
			}
		}
	}

	if(foundInstanceName){
		countWithPrefix = 1
	}

	// Loop through names already attempted at creating locally
	let usernames = getCookie("usernameAttempts")
	let countWithPrefix2 = 0
	if(usernames != null){
		usernames = JSON.parse(usernames)
		for(let i=0; i< usernames.length; i++){
			console.log(usernames[i])
			if(usernames[i].startsWith(prefix) && !searchedDictionary.has(username)){
				let matches = usernames[i].match(/\d+$/);
				if (matches) {
					let temp = parseInt(matches[0]);
					if(temp >= countWithPrefix2) {
						countWithPrefix2 += (temp + 1)
					}
				}
			}
		}
	}

	return prefix + (Math.max(countWithPrefix, countWithPrefix2) === 0 ? "" : " " + Math.max(countWithPrefix, countWithPrefix2));
}

function getNameFromLPIID(lpiID) {
	var instances = lpis.lostPersonInstances;
	for(var i = 0; i< instances.length; i++) {
		if(instances[i].id == lpiID) {
			return instances[i].name;
		}
	}

	return "Unknown LPI";
}


$('#backToMainViewLpis').click(function() {
	viewLpisForm.close();
	openMainMenu();
});


function getCurrentLPIID() {
	return document.getElementById("lostPersonSelect").value;
}

/**
 * Get current LPI
 *
 * @param lpiID
 * @returns lpi
 */
function getCurrentLPI(lpiID){
	let lpi = null
	if(lpis !== undefined && lpis !== null) {
		for(let i = 0; i < lpis.lostPersonInstances.length; i++) {
			if(lpis.lostPersonInstances[i].id === lpiID) {
				lpi = lpis.lostPersonInstances[i];
			}
		}
	}else{
		console.error("lost person instance was null")
	}
	return lpi;
}

/**
 * Changes active LPI
 * called when switching LPIs but also when we get search results for the same LPI
 * @param jumpToDate optional jump to date parameter
 */
async function changeActiveLPI(jumpToDate) {
	document.getElementById("loader").classList.add("is-active");

	lpiID = getCurrentLPIID();
	let currentLPI = getCurrentLPI(lpiID);

	// clear all LPIs (and then we'll re-load the one we selected)
	clearOtherLPIs();

	if (lpiID !== NO_LPI_MARKER) {
		// the UI slider knob moves back to the start when we switch (elsewhere in the code - maybe in refreshTimeSlider()),
		// so be consistent with that here. Go back to the start when changing LPIs
		if (jumpToDate === null || jumpToDate === undefined) {
			curSliderDateTime = moment.tz(currentLPI.startTime, getLPITimeZone(lpiID)).format("YYYY-MM-DDTHH:mm:ss.SSS") + " " + getLPITimeZone(lpiID);
		} else {
			curSliderDateTime = jumpToDate
		}

		if(!isLoggedIn()){
			if (confirm("Your session expired, would you like to log back in? Press 'cancel' to continue viewing your current session.")) {
				location.reload();
			}

			document.getElementById("loader").classList.remove("is-active");
			return;
		}

		await Promise.all([loadLKPOverlay(lpiID), retrieveOverlays(currentLPI, jumpToDate), retrieveLPIShapes(currentLPI.id),
			loadSearchDetails(lpiID), loadLandcoverOverlay(lpiID), loadElevationOverlay(lpiID)]).catch((error) => {
			console.error(error);
		});

		/**
		 * Loop through all Search Details,
		 * if Search's LPI UUID matches current LPI,
		 * call Ajax request to load Search KML
		 */
		for (let searchID in searchDetails) {
			if (searchDetails.hasOwnProperty(searchID) && searchDetails[searchID].lpiId === lpiID) {
				await loadSearchKML(lpiID, currentLPI, searchID).catch((error) => {
					console.error(error);
				});
			}
		}

		if (currentLPI.theModel !== STATIONARY) {
			await Promise.all([loadSamplePathsKML(lpiID)]).catch((error) => {
				console.error(error);
			});
		}

		loadElevationLegend(currentLPI);
		loadLandcoverLegend(currentLPI);

		loadLayerSettingsFromCache();

		$("#newSearchBtn").attr("disabled", false);
		$("#aarButton").attr("disabled", false);
	} else {
		$("#newSearchBtn").attr("disabled", true);
		$("#aarButton").attr("disabled", true);
	}

	document.getElementById("loader").classList.remove("is-active");
}

// ** not currently called from anywhere, and not sure if heatmaps get finderInfo set on them,
// ** but this will likely be useful at some point
/**
 * Clears LPI layers not lpiID
 * @param lpiID
 */
function clearOtherLPIs(lpiID) {
	let layers = []
	map.eachLayer(
		function(layer){
			if(layer.finderInfo !== undefined) {
				if(layer.finderInfo.lpiID !== lpiID) {
					layers.push(layer)
				}
			}
		});

	for(let i=0; i<layers.length; i++){
		try {
			map.removeLayer(layers[i])
		} catch (e) {
			console.log("Unable to remove layer from map");
			console.log(layer);
		}
	}
}

function clearLPI(lpiID){
	let layers = []
	map.eachLayer(
		function(layer){
			if(layer.finderInfo !== undefined) {
				if(layer.finderInfo.lpiID === lpiID) {
					layers.push(layer)
				}
			}
		});

	for(let i=0; i<layers.length; i++){
		try {
			map.removeLayer(layers[i])
		} catch (e) {
			console.log("Unable to remove layer from map");
			console.log(layer);
		}
	}
}

function getLPIsFromServer(lpiUUID, isRequestId = false, jumpToTime = null) {
	let socket = createWebSocket('FINDER/viewLostPersonInstances');
    socket.onopen = function(e) {
        console.log('[open] connection established');
        //socket.send(JSON.stringify(lpWrapper.getLostPersonInputs()));
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

        try {
        	lpis = JSON.parse(msg.data);
            // Filter LPI by operational use
            if (sessionStorage.getItem('operationalUse') === 'true') {
                lpis.lostPersonInstances = lpis.lostPersonInstances.filter(function(lpi, i, arr) {
                    // deployment mode 'true' means operational
                    return lpi.deploymentMode;
                });
            } else {
                lpis.lostPersonInstances = lpis.lostPersonInstances.filter(function(lpi, i, arr) {
                    return !lpi.deploymentMode;
                });
            }
        	refreshLPIMenu(lpiUUID, isRequestId, jumpToTime);
        } catch (err) {
        	console.log(err);
        	setStatus("Unable to parse response from server");
        }
    };
}

function refreshLPIMenu(lpiIDorRequestId, isRequestId, jumpToTime= null) {
	var i;
	clearLPISelect();

	if(lpis.lostPersonInstances.length === 0) {
		addLPItoSelect("None available", NO_LPI_MARKER);
	} else {
		addLPItoSelect("Select...", NO_LPI_MARKER);
	}

	var lpisSorted = lpis.lostPersonInstances.sort(function(a,b) {
		return a.name.localeCompare(b.name);
	});

	for(i = 0; i < lpisSorted.length; i++) {
		let selected = (lpiIDorRequestId === lpisSorted[i].id);
		if(isRequestId){
			selected = (lpiIDorRequestId === lpisSorted[i].requestId);
		}
		addLPItoSelect(lpisSorted[i].name, lpisSorted[i].id, selected);
	}

	changeActiveLPI(jumpToTime);
}

function addLPItoSelect(name, id, selected) {
	var sel = document.getElementById('lostPersonSelect');
	var opt = document.createElement('option');
	opt.appendChild( document.createTextNode(name) );
	opt.value = id;
	if(selected !== null && selected  !== undefined && selected === true) {
		opt.selected = true;
	}
	sel.appendChild(opt);
}

function clearLPISelect() {
	var select = document.getElementById("lostPersonSelect");
	var length = select.options.length;
	for (i = 0; i < length; i++) {
		select.removeChild( select.options[0] );
	}
}

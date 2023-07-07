var aarStates = {};

class LocationEstimateWrapper {
    constructor() {
        this.locationEstimate = null;
        this.locationEstimateUUID = null;
    }

    getLocationEstimate() {
        return this.locationEstimate;
    }

    setLocationEstimate(locationEstimate) {
        this.locationEstimate = locationEstimate;
    }

    getLocationEstimateUUID() {
        return this.locationEstimateUUID;
    }

    setLocationEstimateUUID(locationEstimateUUID) {
        this.locationEstimateUUID = locationEstimateUUID;
    }
}

class AARState{
    constructor() {
        this._aarInfo = "";
        this._aarUpFrontInfo = "";
        this._aarSubjectFound = false;
    }

    get aarInfo() {
        return this._aarInfo;
    }

    set aarInfo(value) {
        this._aarInfo = value;
    }

    get aarUpFrontInfo() {
        return this._aarUpFrontInfo;
    }

    set aarUpFrontInfo(value) {
        this._aarUpFrontInfo = value;
    }

    get aarSubjectFound() {
        return this._aarSubjectFound;
    }

    set aarSubjectFound(value) {
        this._aarSubjectFound = value;
    }
}

var aarState = new AARState()

// globals
var locationEstimateWrappers = [];

function onPrecipitationSelectionChanged(id, checked)
{
    console.log('onPrecipitationSelectionChanged');
    if (id === 'precipitation_none' && checked) {
        document.getElementById('precipitation_amount_div').style.display = 'none';
    } else {
        document.getElementById('precipitation_amount_div').style.display = 'inline';
    }
}

function onSubjectFoundSelectChanged(value)
{
    console.log('onSubjectFoundSelectChanged');
    if (value === SubjectFoundMethod.SEARCH_EFFORT) {
        document.getElementById('searchMethodSelectDiv').style.display = 'inline';
    } else {
        document.getElementById('searchMethodSelectDiv').style.display = 'none';
    }
}

function onIPCategoryChanged(id, checked)
{
    console.log('onIPCategoryChanged');
    if (id === "category_outdoorsman") {
        document.getElementById('subcategory_athlete').style.display = 'none';
        document.getElementById('subcategory_altered_mental_state').style.display = 'none';
        document.getElementById('subcategory_outdoorsman').style.display = 'inline';
    } else if (id === "category_athlete") {
        document.getElementById('subcategory_altered_mental_state').style.display = 'none';
        document.getElementById('subcategory_outdoorsman').style.display = 'none';
        document.getElementById('subcategory_athlete').style.display = 'inline';
    } else if (id === "category_altered_mental_state") {
        document.getElementById('subcategory_athlete').style.display = 'none';
        document.getElementById('subcategory_outdoorsman').style.display = 'none';
        document.getElementById('subcategory_altered_mental_state').style.display = 'inline';
    } else {
        document.getElementById('subcategory_athlete').style.display = 'none';
        document.getElementById('subcategory_outdoorsman').style.display = 'none';
        document.getElementById('subcategory_altered_mental_state').style.display = 'none';
    }
}

// ** Displays, validates, and saves up-front lost person information.
// Corresponds to a subset of fields from Table 1
// in the HSR Assessment Document.
function loadAAR_upFrontInfo(savedFormState)
{
    let aar = new AfterActionReport();
    if(savedFormState == null){
        savedFormState = {}
    }
    if(savedFormState.aarInfo != null){
        aar = savedFormState.aarInfo;
    }

    aar.setLpiId(document.getElementById("lostPersonSelect").value);
    let aarUpFrontInfo = new UpFrontLostPersonInfo();
    if(savedFormState.aarUpFrontInfo != null){
        aarUpFrontInfo = savedFormState.aarUpFrontInfo
    }

    var aarContent = $.ajax({url: "/webmap/landsar/aarUpFrontInfo.html", async: false}).responseText;
    $("#aarContent").html(aarContent);

    document.querySelector('#aarContent').scrollIntoView({
        behavior: 'instant'
    });

    if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
        $("#distance_from_point_seen_description").text("Distance in miles to tenth of a mile if possible.\n" +
            "\tEnter 0 for less than 87 yards, and 0.1 for 88-263 yards.")
    }else{
        $("#distance_from_point_seen_description").text("Distance in kilometers to tenth of a kilometer if possible.\n" +
            "\tEnter 0 for less than 80 meters, and 0.1 for 80-240 meters.")
    }

    document.getElementById("errorHeight").style.display = "none";
    document.getElementById("errorGender").style.display = "none";
    document.getElementById("errorSubjectCategory").style.display = "none";
    document.getElementById("errorOutdoorsman").style.display = "none";
    document.getElementById("errorAthlete").style.display = "none";
    document.getElementById("errorMentalState").style.display = "none";
    document.getElementById("errorAge").style.display = "none";

    if (aarStates[AAR_UP_FRONT]){
        $("#aarContent").html(aarStates[AAR_UP_FRONT])
    }

    if(savedFormState.aarUpFrontInfo != null
        && savedFormState.aarUpFrontInfo.getItemsInLoadOther() != null){
        $("#load_other").val(savedFormState.aarUpFrontInfo.getItemsInLoadOther())
    }
    $("#load_other").on('input',function(){
        let val = $(this).val();
        console.log(val)
        if (val === undefined) {
            val = null;
        }
        savedFormState.aarUpFrontInfo = aarUpFrontInfo
        savedFormState.aarUpFrontInfo.setItemsInLoadOther(val)
        stateManagement.setSavedFormState(savedFormState)

    });


    document.getElementById("aarModalLabel").innerHTML =
        "After Action Report for " + getNameFromLPIID(getCurrentLPIID()) + " - Step 1 / 5, LPI Info";

    $("#nextButton").off();
    $("#nextButton").html("Next");
    $("#nextButton").removeClass("btn-success");
    $("#nextButton").addClass("btn-primary");
    $("#nextButton").click(function() {
        var errors = false;
        var filter;
        var val;

        document.getElementById("errorHeight").style.display = "none";
        document.getElementById("errorGender").style.display = "none";
        document.getElementById("errorSubjectCategory").style.display = "none";
        document.getElementById("errorOutdoorsman").style.display = "none";
        document.getElementById("errorAthlete").style.display = "none";
        document.getElementById("errorMentalState").style.display = "none";
        document.getElementById("errorAge").style.display = "none";

        // ** Set height
        filter = $("input[name=lp_height]").filter(":checked");
        if (filter === undefined || filter.length === 0) {
            document.getElementById("errorHeight").style.display = "inline";
            errors = true;
        } else {
            val = (filter[0].value).toUpperCase();
            if (!aarUpFrontInfo.setHeight(val)) {
                document.getElementById("errorHeight").style.display = "inline";
                errors = true;
            }
        }

        // ** Set gender
        filter = $("input[name=gender]").filter(":checked");
        if (filter === undefined || filter.length === 0) {
            document.getElementById("errorGender").style.display = "inline";
            errors = true;
        } else {
            val = (filter[0].value).toUpperCase();
            if (!aarUpFrontInfo.setGender(val)) {
                document.getElementById("errorGender").style.display = "inline";
                errors = true;
            }
        }

        // ** Set items in load
        var itemsInLoad = [];
        $.each($("input[name=load_info]:checked"), function () {
            itemsInLoad.push($(this).val());
        });
        aarUpFrontInfo.setItemsInLoad(itemsInLoad);

        val = $("#load_other").val();
        if (val === undefined) {
            val = null;
        }
        aarUpFrontInfo.setItemsInLoadOther(val);

        // ** Set emotional state
        var emotionalStates = [];
        $.each($("input[name=emotional_state]:checked"), function () {
            emotionalStates.push($(this).val());
        });
        aarUpFrontInfo.setEmotionalStateDescription(emotionalStates)
        if (val === undefined) {
            val = null;
        }
        aarUpFrontInfo.setEmotionalStateOther(val);

        // ** Set subject category and subcategory
        filter = $("input[name=subject_category]").filter(":checked");
        if (filter === undefined || filter.length === 0) {
            document.getElementById("errorSubjectCategory").style.display = "inline";
            errors = true;
        } else {
            val = (filter[0].value).toUpperCase();
            if (!aarUpFrontInfo.setSubjectCategory(val)) {
                document.getElementById("errorSubjectCategory").style.display = "inline";
                errors = true;
            } else {
                if (val === SubjectCategory.OUTDOORSMAN) {
                    filter = $("input[name=subcategory_outdoorsman]").filter(":checked");
                    if (filter === undefined || filter.length === 0) {
                        document.getElementById("errorOutdoorsman").style.display = "inline";
                        errors = true;
                    } else {
                        val = (filter[0].value).toUpperCase();
                        if (!aarUpFrontInfo.setSubcategoryOutdoorsman(val)) {
                            document.getElementById("errorOutdoorsman").style.display = "inline";
                            errors = true;
                        }
                    }
                } else if (val === SubjectCategory.ATHLETE) {
                    filter = $("input[name=subcategory_athlete]").filter(":checked");
                    if (filter === undefined || filter.length === 0) {
                        document.getElementById("errorAthlete").style.display = "inline";
                        errors = true;
                    } else {
                        val = (filter[0].value).toUpperCase();
                        if (!aarUpFrontInfo.setSubcategoryAthlete(val)) {
                            document.getElementById("errorAthlete").style.display = "inline";
                            errors = true;
                        }
                    }
                } else if  (val === SubjectCategory.ALTERED_MENTAL_STATE) {
                    filter = $("input[name=subcategory_altered_mental_state]").filter(":checked");
                    if (filter === undefined || filter.length === 0) {
                        document.getElementById("errorMentalState").style.display = "inline";
                        errors = true;
                    } else {
                        val = (filter[0].value).toUpperCase();
                        if (!aarUpFrontInfo.setSubcategoryAlteredMentalState(val)) {
                            document.getElementById("errorMentalState").style.display = "inline";
                            errors = true;
                        }
                    }
                }
            }
        }

        // ** Set subject age

        filter = $("input[name=lp_age]").filter(":checked");
        if (filter === undefined || filter.length === 0) {
            document.getElementById("errorAge").style.display = "inline";
            errors = true;
        } else {
            val = (filter[0].value).toUpperCase();
            if (!aarUpFrontInfo.setAge(val)) {
                document.getElementById("errorAge").style.display = "inline";
                errors = true;
            }
        }

        if (!errors) {
            aarStates[AAR_UP_FRONT] = cloneHTML($("#aarContent"));
            //loadAAR(aar, aarUpFrontInfo);

            aarState.aarInfo = aar
            aarState.aarUpFrontInfo = aarUpFrontInfo
            stateManagement.setSavedFormState(aarState)
            stateManagement.broadcastUpdate(AAR_INFO)
        }


    });
    $("#prevButton").off();
    $("#cancelButton").off();
    $("#cancelButton").click(function () {
        aarStates[stateManagement.getLastState()] = cloneHTML($("#aarContent"));
        showConfirmCancelLPIModal()
    });

    aarState.aarInfo = aar
    aarState.aarUpFrontInfo = aarUpFrontInfo
    stateManagement.setSavedFormState(aarState)

    updateUnitLabelsForForms(layerSettings.unitMeasurementSystem)
}

// ** Displays, validates, and saves general information for the after action
// report. Corresponds to Table 3 in the HSR Assessment Document.
function loadAAR(aar, aarUpFrontInfo)
{
    console.log(JSON.stringify(aarUpFrontInfo, null, 2));
    var aarContent = $.ajax({url: "/webmap/landsar/aar.html", async: false}).responseText;
    $("#aarContent").html(aarContent);

    document.querySelector('#aarContent').scrollIntoView({
        behavior: 'instant'
    });

    if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL){
        $("#distance_from_point_seen_description").text("Distance in miles to tenth of a mile if possible.\n" +
            "\tEnter 0 for less than 87 yards, and 0.1 for 88-263 yards.")
    }else{
        $("#distance_from_point_seen_description").text("Distance in kilometers to tenth of a kilometer if possible.\n" +
            "\tEnter 0 for less than 80 meters, and 0.1 for 80-240 meters.")
    }

    document.getElementById("errorSubjectFound").style.display = "none";
    document.getElementById("errorSubjectCondition").style.display = "none";
    document.getElementById("errorSubjectResponsive").style.display = "none";
    document.getElementById("errorTotalSearchTime").style.display = "none";
    document.getElementById("errorTotalTimeLost").style.display = "none";
    document.getElementById("errorDistanceFromPLS").style.display = "none";
    document.getElementById("errorPopulationDensity").style.display = "none";
    document.getElementById("errorLocationFound").style.display = "none";
    document.getElementById("errorPrecipitation").style.display = "none";

    // The block below is used to hide blank options from the select menus.
    $.each($("#subjectFoundBySelect > option"), function () {
        if ($(this).val() === undefined || $(this).val() === '') {
            $(this).css("display", "none");
        }
    });
    $.each($("#searchMethodSelect > option"), function () {
        if ($(this).val() === undefined || $(this).val() === '') {
            $(this).css("display", "none");
        }
    });
    // ** END

    document.getElementById("aarModalLabel").innerHTML =
        "After Action Report for " + getNameFromLPIID(getCurrentLPIID()) + " - Step 2 / 5, General AAR Info";

    // Add listener to "subject found" input that disables all irrelevant fields
    // when user indicates that the subject was not found.
    $("input[name=subject_found]").click(function () {
        var filter = $("input[name=subject_found]").filter(":checked");
        var subjectFound = filter[0].value === 'true';
        if (subjectFound) {
            $("input[name=subject_status]").prop("disabled", false);
            $("input[name=subject_responsive]").prop("disabled", false);
            $("input[name=total_time_lost]").prop("disabled", false);
            $("input[name=distance_from_pls]").prop("disabled", false);
            $("input[name=lp_elevation_change]").prop("disabled", false);
            $("input[name=track_offset_yards]").prop("disabled", false);
            $("input[name=lat_found]").prop("disabled", false);
            $("input[name=lon_found]").prop("disabled", false);
            $("select[name=subjectFoundBySelect]").prop("disabled", false);

            var enabledColor = 'black';
            $(".headerText.subjectFound").css('color', enabledColor);
            $(".subjectFound").css('color', enabledColor);
        } else {
            $("input[name=subject_status]").prop("disabled", true);
            $("input[name=subject_responsive]").prop("disabled", true);
            $("input[name=total_time_lost]").prop("disabled", true);
            $("input[name=distance_from_pls]").prop("disabled", true);
            $("input[name=lp_elevation_change]").prop("disabled", true);
            $("input[name=track_offset_yards]").prop("disabled", true);
            $("input[name=lat_found]").prop("disabled", true);
            $("input[name=lon_found]").prop("disabled", true);
            $("select[name=subjectFoundBySelect]").prop("disabled", true);

            var disabledColor = '#A9A9A9';
            $(".headerText.subjectFound").css('color', disabledColor);
            $(".subjectFound").css('color', disabledColor);

        }
    });

    if(aarStates[AAR_INFO]){
        $("#aarContent").html(aarStates[AAR_INFO])

        let aarMotionModelExp = aar.getMotionModelChoiceExplanation();
        console.log("motion model saved " + aarMotionModelExp);
        if(aarMotionModelExp) {
            $("#motion_model").val(aarMotionModelExp);
        }
        let lastTechText = aar.getTechnicalProblemsWithTool();
        if(lastTechText) {
            $("#technical_problems").val(lastTechText);
        }
        let lastAdditionalInfo = aar.getAdditionalToolFeedback();
        if(lastAdditionalInfo) {
            $("#additional_info").val(lastAdditionalInfo);
        }
    }

    $("#nextButton").off();
    $("#nextButton").html("Next");
    $("#nextButton").removeClass("btn-success");
    $("#nextButton").addClass("btn-primary");
    $("#nextButton").click(function() {
        document.getElementById("errorSubjectFound").style.display = "none";
        document.getElementById("errorSubjectCondition").style.display = "none";
        document.getElementById("errorSubjectResponsive").style.display = "none";
        document.getElementById("errorTotalSearchTime").style.display = "none";
        document.getElementById("errorTotalTimeLost").style.display = "none";
        document.getElementById("errorDistanceFromPLS").style.display = "none";
        document.getElementById("errorPopulationDensity").style.display = "none";
        document.getElementById("errorLocationFound").style.display = "none";
        document.getElementById("errorPrecipitation").style.display = "none";
        var errors = false;
        var filter;
        var val;
        var subjectFound = false;
        filter = $("input[name=subject_found]").filter(":checked");
        if (filter === undefined || filter.length === 0) {
            document.getElementById("errorSubjectFound").style.display = "inline";
            errors = true;
        } else {
            // val = new Boolean(filter[0].value); <-- Doesn't work. Wow Javascript. Great job.
            val = filter[0].value === 'true';
            subjectFound = val;
            if (!aar.setSubjectFound(val)) {
                document.getElementById("errorHeight").style.display = "inline";
                errors = true;
            }
        }

        if (subjectFound) {
            filter = $("input[name=subject_status]").filter(":checked");
            if (filter === undefined || filter.length === 0) {
                document.getElementById("errorSubjectCondition").style.display = "inline";
                errors = true;
            } else {
                val = (filter[0].value).toUpperCase();
                if (!aar.setSubjectStatus(val)) {
                    document.getElementById("errorSubjectCondition").style.display = "inline";
                    errors = true;
                }
            }
        } else {
            aar.setSubjectStatus(SubjectStatus.UNKNOWN);
        }

        if (subjectFound) {
            filter = $("input[name=subject_responsive]").filter(":checked");
            if (filter === undefined || filter.length === 0) {
                document.getElementById("errorSubjectResponsive").style.display = "inline";
                errors = true;
            } else {
                val = (filter[0].value).toUpperCase();
                if (!aar.setSubjectResponsiveness(val)) {
                    document.getElementById("errorSubjectResponsive").style.display = "inline";
                    errors = true;
                }
            }
        } else {
            aar.setSubjectResponsiveness(SubjectStatus.UNKNOWN);
        }

        val = $("input[name=total_search_time]").val();
        if (val === undefined || val.length === 0) {
            document.getElementById("errorTotalSearchTime").style.display = "inline";
            errors = true;
        } else {
            if (!aar.setTotalSearchTimeHrs(val)) {
                document.getElementById("errorTotalSearchTime").style.display = "inline";
                errors = true;
            }
        }

        if (subjectFound) {
            val = $("input[name=total_time_lost]").val();
            if (val === undefined || val.length === 0) {
                document.getElementById("errorTotalTimeLost").style.display = "inline";
                errors = true;
            } else {
                if (!aar.setTotalTimeLostHrs(val)) {
                    document.getElementById("errorTotalTimeLost").style.display = "inline";
                    errors = true;
                }
            }
        } else {
            aar.setTotalTimeLostHrs(-1);
        }

        if (subjectFound) {
            val = $("input[name=distance_from_pls]").val();
            if (val === undefined || val.length === 0) {
                document.getElementById("errorDistanceFromPLS").style.display = "inline";
                errors = true;
            } else {
                let valMiles = layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
                    ? parseFloat(val) : kmToMiles(parseFloat(val));
                if (!aar.setDistanceFromPLSMiles(valMiles)) {
                    document.getElementById("errorDistanceFromPLS").style.display = "inline";
                    errors = true;
                }
            }
        } else {
            aar.setDistanceFromPLSMiles(-1);
        }

        // ** Terrain Features
        var terrainFeatures = [];
        $.each($("input[name=terrain_features]:checked"), function () {
            terrainFeatures.push($(this).val());
        });
        aar.setSubjectFoundTerrainFeatures(terrainFeatures);

        if (subjectFound) {
            val = $("input[name=lp_elevation_change]").val();
            if (val === undefined || val.length === 0) {
                val = null;
                aar.setLpElevationChangeFt(val);
            } else {
                let valFeet = layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
                    ? parseFloat(val) : mToFeet(parseFloat(val));
                aar.setLpElevationChangeFt(valFeet);
            }
        } else {
            aar.setLpElevationChangeFt(0);
        }

        if (subjectFound) {
            val = $("input[name=track_offset_yards]").val();
            if (val === undefined || val.length === 0) {
                val = null;
                aar.setTrackOffsetYards(val);
            } else {
                let valYards = layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
                    ? parseFloat(val) : metersToYard(parseFloat(val));
                aar.setTrackOffsetYards(valYards);
            }
        } else {
            aar.setTrackOffsetYards(0);
        }

        // ** Population density
        filter = $("input[name=population_density]").filter(":checked");
        if (filter === undefined || filter.length === 0) {
            document.getElementById("errorPopulationDensity").style.display = "inline";
            errors = true;
        } else {
            val = (filter[0].value).toUpperCase();
            if (!aar.setPopulationDensity(val)) {
                document.getElementById("errorPopulationDensity").style.display = "inline";
                errors = true;
            }
        }

        // ** Location Found
        if (subjectFound) {
            lat_val = $("input[name=lat_found]").val();
            lon_val = $("input[name=lon_found]").val();
            if (lat_val === undefined || lat_val.length === 0 || lon_val === undefined || lon_val.length === 0) {
                document.getElementById("errorLocationFound").style.display = "inline";
                errors = true;
            } else {
                var locationFound = new LatLonGeo;
                locationFound.setLatRad(toRadians(parseFloat(lat_val)));
                locationFound.setLonRad(toRadians(parseFloat(lon_val)));
                if (!aar.setFindCoordinates(locationFound)) {
                    document.getElementById("errorLocationFound").style.display = "inline";
                    errors = true;
                }
            }
        } else {
            aar.setFindCoordinates(null);
        }

        // ** Precipitation
        filter = $("input[name=precipitation_type]").filter(":checked");
        if (filter === undefined || filter.length === 0) {
            document.getElementById("errorPrecipitation").style.display = "inline";
            errors = true;
        } else {
            let precipitation = new Precipitation();
            val = (filter[0].value).toUpperCase();
            if (!precipitation.setPrecipitationType(val)) {
                document.getElementById("errorPrecipitation").style.display = "inline";
                errors = true;
            } else {
                if (val === 'NONE') {
                    precipitation.setPrecipitationInches(0);
                } else {
                    let amountVal = $("input[name=precipitation_amount]").val();
                    if (amountVal === undefined || amountVal.length === 0) {
                        amountVal = null;
                    }
                    let amountInches = layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL
                        ? parseFloat(amountVal) : cmToInches(parseFloat(amountVal));
                    precipitation.setPrecipitationInches(amountInches)
                }
            }
            aar.setPrecipitation(precipitation);
        }

        // ** Temperature
        var low_val = $("input[name=temp_low]").val();
        var high_val = $("input[name=temp_high]").val();
        if (low_val === undefined || low_val.length === 0) {
            low_val = null;
        }
        if (high_val === undefined || high_val.length === 0) {
            high_val = null;
        }
        if(layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.IMPERIAL) {
            aar.setLowTempWhileLostDegrees(parseFloat(low_val));
            aar.setHighTempWhileLostDegrees(parseFloat(high_val));
        }else{
            aar.setLowTempWhileLostDegrees(celsiusToFahrenheit(parseFloat(low_val)));
            aar.setHighTempWhileLostDegrees(celsiusToFahrenheit(parseFloat(high_val)));
        }

        // ** How Found
        if (subjectFound) {
            var howFound = $("#subjectFoundBySelect :selected").val();
            if (howFound === SubjectFoundMethod.SEARCH_EFFORT) {
                howFound = $("#searchMethodSelect :selected").val();
            }
            aar.setSubjectFoundMethod(howFound);
        } else {
            aar.setSubjectFoundMethod(SubjectFoundMethod.NOT_FOUND);
        }

        if(!errors) {
            // ** Additional Information
           extractLoadAARInputs(aar, true, subjectFound, aarUpFrontInfo);
        }
    });
    $("#prevButton").off();
    $("#prevButton").click(function() {
        //extractLoadAARInputs(aar, false)
        aarState.aarInfo = aar
        aarState.aarUpFrontInfo = aarUpFrontInfo
        stateManagement.setSavedFormState(aarState)
        stateManagement.broadcastUpdate(AAR_UP_FRONT)
    });
    $("#cancelButton").off();
    $("#cancelButton").click(function () {
        aarStates[stateManagement.getLastState()] = cloneHTML($("#aarContent"));
        showConfirmCancelLPIModal()
    });

    updateUnitLabelsForForms(layerSettings.unitMeasurementSystem)
}

function extractLoadAARInputs(aar, isNext, subjectFound, aarUpFrontInfo){
    aarStates[AAR_INFO] = cloneHTML($("#aarContent"));
    var val = $("textarea[name=motion_model]").val();
    if (val === undefined) {
        val = null;
    }
    console.log("motion model" + val);
    aar.setMotionModelChoiceExplanation(val);

    val = $("textarea[name=technical_problems]").val();
    if (val === undefined) {
        val = null;
    }
    aar.setTechnicalProblemsWithTool(val);

    val = $("textarea[name=additional_info]").val();
    if (val === undefined) {
        val = null;
    }
    aar.setAdditionalToolFeedback(val);

    aarState.aarInfo = aar

    if(isNext) {
        aarState.aarUpFrontInfo = aarUpFrontInfo
        aarState.aarSubjectFound = subjectFound
        stateManagement.setSavedFormState(aarState)
        stateManagement.broadcastUpdate(AAR_SEARCH)
    }else{
        stateManagement.setSavedFormState(aarState)
        stateManagement.broadcastUpdate(AAR_UP_FRONT)
    }

    updateUnitLabelsForForms(layerSettings.unitMeasurementSystem)
}

function getSearchesInputs(count, skipChecks=false){
    var searchList = [];
    let errors = false;
    for (let i = 0; i < count; ++i) {
        var searchItem = new SearchAfterActionReport;
        var val = $("div[name=search_id_div_" + i + "]").attr("id");
        if (val === null) {
            console.log("Warning: null search id");
        }
        searchItem.setSearchId(val);

        var filter = $("input[name=sweep_width_accuracy_" + i + "]").filter(":checked");
        if (filter === undefined || filter.length === 0) {
            if(!skipChecks) {
                document.getElementById("errorSweepWidthAccuracy_" + i).style.display = "inline";
            }
            errors = true;
        } else {
            val = (filter[0].value).toUpperCase();
            if (!searchItem.setSweepWidthAccuracy(val)) {
                if(!skipChecks) {
                    document.getElementById("errorSweepWidthAccuracy_" + i).style.display = "inline";
                }
                errors = true;
            }
        }

        val = $("textarea[name=details_sweep_width_" + i + "]").val();
        if (val === undefined) {
            val = null;
        }
        searchItem.setSweepWidthAccuracyFreeText(val);

        val = $("input[name=search_length_" + i + "]").val();
        if (val === undefined || val.length === 0) {
            if(!skipChecks) {
                document.getElementById("errorSearchLength_" + i).style.display = "inline";
            }
            errors = true;
        } else {
            if (!searchItem.setSearchTimeHrs(parseFloat(val))) {
                if(!skipChecks) {
                    document.getElementById("errorSearchLength_" + i).style.display = "inline";
                }
                errors = true;
            }
        }

        if (!errors || skipChecks) {
            searchList.push(searchItem);
        }else{
            return null;
        }
    }

    return searchList;
}


// Displays, validates, and saves information about each search conducted.
// Corresponds to Table 3 in the HSR Assessment Document.
function openAARSearchInfo(aar, aarUpFrontInfo, subjectFound)
{
    console.log(JSON.stringify(aar, null, 2));

    var instructions = $.ajax({url: "/webmap/landsar/aarSearchList.html", async: false}).responseText;
    var searchListData = getSearchList();
    var html = instructions + searchListData["html"];
    var count = searchListData["count"];
    $("#aarContent").html(html);


    document.querySelector('#aarContent').scrollIntoView({
        behavior: 'instant'
    });

    for (i = 0; i < count; ++i) {
        document.getElementById("errorSearchLength_" + i).style.display = "none";
        document.getElementById("errorSweepWidthAccuracy_" + i).style.display = "none";
    }

    document.getElementById("aarModalLabel").innerHTML =
        "After Action Report for " + getNameFromLPIID(getCurrentLPIID()) + " - Step 3 / 5, Searches";

    if(aarStates[AAR_SEARCH] ){
        $("#aarContent").html(aarStates[AAR_SEARCH])
        let searchAARs = aar.getSearchAfterActionReports()
        if(searchAARs) {
            for (let i = 0; i < searchAARs.length; ++i) {
                $("textarea[name=details_sweep_width_" + i + "]").val(searchAARs[i].getSweepWidthAccuracyFreeText())
                $("input[name=search_length_" + i + "]").val(searchAARs[i].getSearchTimeHrs())
            }
        }
    }


    $("#nextButton").off();
    $("#nextButton").html("Next");
    $("#nextButton").removeClass("btn-success");
    $("#nextButton").addClass("btn-primary");
    $("#nextButton").click(function() {
        for (i = 0; i < count; ++i) {
            document.getElementById("errorSearchLength_" + i).style.display = "none";
            document.getElementById("errorSweepWidthAccuracy_" + i).style.display = "none";
        }

        let searchList = getSearchesInputs(count)

        if (searchList != null) {
            aar.setSearchAfterActionReports(searchList);
            aarStates[AAR_SEARCH] = cloneHTML($("#aarContent"));
            if (subjectFound) {
                aarState.aarUpFrontInfo = aarUpFrontInfo
                aarState.aarInfo = aar
                stateManagement.setSavedFormState(aarState)
                stateManagement.broadcastUpdate(AAR_LP_FEEDBACK)
            } else {
                aarState.aarUpFrontInfo = aarUpFrontInfo
                aarState.aarInfo = aar
                aarState.aarSubjectFound = subjectFound
                stateManagement.setSavedFormState(aarState)
                stateManagement.broadcastUpdate(SUBMIT_AAR)
            }
        }
    });
    $("#prevButton").off();
    $("#prevButton").click(function() {
        let searchList = getSearchesInputs(count)

        //loadAAR(aar, aarUpFrontInfo);
        aar.setSearchAfterActionReports(searchList);
        aarStates[AAR_SEARCH] = cloneHTML($("#aarContent"));
        if (subjectFound) {
            aarState.aarUpFrontInfo = aarUpFrontInfo
            aarState.aarInfo = aar
            stateManagement.setSavedFormState(aarState)
            stateManagement.broadcastUpdate(AAR_INFO)
        } else {
            aarState.aarUpFrontInfo = aarUpFrontInfo
            aarState.aarInfo = aar
            aarState.aarSubjectFound = subjectFound
            stateManagement.setSavedFormState(aarState)
            stateManagement.broadcastUpdate(AAR_UP_FRONT)
        }


    });
    $("#cancelButton").off();
    $("#cancelButton").click(function () {
        aarStates[stateManagement.getLastState()] = cloneHTML($("#aarContent"));
        showConfirmCancelLPIModal()
    });

    aarState.aarInfo = aar
    aarState.aarUpFrontInfo = aarUpFrontInfo
    aarState.aarSubjectFound = subjectFound
    stateManagement.setSavedFormState(aarState)

    updateUnitLabelsForForms(layerSettings.unitMeasurementSystem)
}

// ** Responsible for rendering each search info item.
// NOTE: There is probably a better way to accomplish this than using raw HTML.
function getSearchList()
{
    var searchList = [];
    var count = 0;
    map.eachLayer(
        function(layer) {
            if (layer.finderInfo !== undefined && layer.finderInfo.finderElementType === "search") {
                if (layer.finderInfo.name === undefined) {
                    console.log('An undefined search. How intriguing!');
                    return;
                }
                var details = searchDetails[layer.finderInfo.searchID];
                console.log(layer.finderInfo.name);
                searchList.push(
                    "<div id='" + layer.finderInfo.searchID + "' name='search_id_div_" + count + "' class='headerText'>" + layer.finderInfo.name + "</div><br>" +
                    "<i>How did the sweep width compare to the actual visibility?</i><br>" +
                    "<div id=\"errorSweepWidthAccuracy_" + count + "\" style=\"display: none;\">" +
                    "<p style=\"color: red;\">Please select a response.</p>" +
                    "</div>" +
                    "<input type='radio' id='sweep_width_xs_" + count + "' name='sweep_width_accuracy_" + count + "' value='MUCH_SMALLER'>" +
                    "<label for='sweep_width_xs_" + count + "'>Much Smaller</label><br>" +
                    "<input type='radio' id='sweep_width_s_" + count + "' name='sweep_width_accuracy_" + count + "' value='SMALLER'>" +
                    "<label for='sweep_width_s_" + count + "'>Smaller</label><br>" +
                    "<input type='radio' id='sweep_width_m_" + count + "' name='sweep_width_accuracy_" + count + "' value='SAME'>" +
                    "<label for='sweep_width_m_" + count + "'>About the same</label><br>" +
                    "<input type='radio' id='sweep_width_l_" + count + "' name='sweep_width_accuracy_" + count + "' value='LARGER'>" +
                    "<label for='sweep_width_l_" + count + "'>Larger</label><br>" +
                    "<input type='radio' id='sweep_width_xl_" + count + "' name='sweep_width_accuracy_" + count + "' value='MUCH_LARGER'>" +
                    "<label for='sweep_width_xl_" + count + "'>Much larger</label><br>" +
                    "<i>Enter any additional notes about the sweep width delta here:</i><br>" +
                    "<textarea class='search_details_sweep_width' id='details_sweep_width_" + count + "' name='details_sweep_width_" + count + "' rows='5' cols='50'></textarea><br>" +
                    "<i>How long did the suggested search take? Enter your answer in <b>hours</b>, using decimal digits if necessary.</i><br>" +
                    "<div id=\"errorSearchLength_" + count + "\" style=\"display: none;\">" +
                    "<p style=\"color: red;\">Please enter a response.</p>" +
                    "</div>" +
                    "<input type='number' step='0.25' id='search_length_" + count + "' min='0' name='search_length_" + count + "'><br>"
                );
                // TODO display information related to a completed search.
                // As of 7/23, we don't support completed searches, so save
                // the implementation for later.

                count = count + 1;
            }
        }
    );
    var html = searchList.join('');


    return {"html": html, "count": count};
}

// ** Displays, validates, and saves feedback from the lost person.
// Corresponds to Table 4 of the HRS Assessment Document.
function openAARLostPersonFeedback(aar, aarUpFrontInfo)
{
    console.log(JSON.stringify(aar, null, 2));
    var aarContent = $.ajax({url: "/webmap/landsar/aarLp.html", async: false}).responseText;
    $("#aarContent").html(aarContent);

    document.querySelector('#aarContent').scrollIntoView({
        behavior: 'instant'
    });

    document.getElementById("aarModalLabel").innerHTML =
        "After Action Report for " + getNameFromLPIID(getCurrentLPIID()) + " - Step 4 / 5, Recovered Person Info";

    if(aarStates[AAR_LP_FEEDBACK]){
        $("#aarContent").html(aarStates[AAR_LP_FEEDBACK])

        let hoursSubjectMobile = aar.getHoursSubjectMobile();
        if(hoursSubjectMobile){
            $("#hoursSubjectMobile").val(hoursSubjectMobile)
        }
        let behaviorWhileLost = aar.getBehaviorWhileLostList();
        if(behaviorWhileLost){
            $("#behaviorWhileLost").val(behaviorWhileLost);
        }
        let behaviorWhileLostOther = aar.getBehaviorWhileLostOther();
        if(behaviorWhileLostOther){
            $("#behavior_other").val(behaviorWhileLostOther);
        }

        let militaryHikingTraining = aar.getMilitaryOrHikingTraining();
        if(militaryHikingTraining){
            $("#militaryHikingTraining").val(militaryHikingTraining)
        }
        let emotionalState = aarUpFrontInfo.getEmotionalStateDescription();
        if(emotionalState){
            $("#emotionalState").val(emotionalState)
        }

        let emotionalStateOther = aarUpFrontInfo.getEmotionalStateOther();
        if(emotionalStateOther){
            $("#emotional_other").val(emotionalStateOther)
        }

        let delta = aar.getDeltaTimeLost();
        if(delta){
            let h = Math.floor(delta / 3600);
            let m = Math.floor(delta % 3600 / 60);

            $("#hoursDelta").val(h)
            $("#minutesDelta").val(m);
        }
    }

    $("#nextButton").off();
    $("#nextButton").html("Next");
    $("#nextButton").removeClass("btn-success");
    $("#nextButton").addClass("btn-primary");
    $("#nextButton").click(function () {
        extractAARLostPersonFeedbackInputs(aar, true, aarUpFrontInfo);
    });
    $("#prevButton").off();
    $("#prevButton").click(function () {
        extractAARLostPersonFeedbackInputs(aar, false, aarUpFrontInfo);

    });
    $("#cancelButton").off();
    $("#cancelButton").click(function () {
        aarStates[stateManagement.getLastState()] = cloneHTML($("#aarContent"));
        showConfirmCancelLPIModal()
    });

    aarState.aarInfo = aar
    aarState.aarUpFrontInfo = aarUpFrontInfo
    stateManagement.setSavedFormState(aarState)

    updateUnitLabelsForForms(layerSettings.unitMeasurementSystem)
}

function extractAARLostPersonFeedbackInputs(aar, isNext, aarUpFrontInfo){
    aarStates[AAR_LP_FEEDBACK] = cloneHTML($("#aarContent"));
    var errors = false;

    var val = $("#hoursSubjectMobile").val();
    if (val === undefined || val === '') {
        val = null;
    }
    aar.setHoursSubjectMobile(val);

    val = $("#behaviorWhileLost").val();
    if (val === undefined) {
        val = null;
    }
    aar.setBehaviorWhileLostList(val);

    val = $("#behavior_other").val();
    if (val === undefined) {
        val = null;
    }
    aar.setBehaviorWhileLostOther(val);

    val = $("#militaryHikingTraining").val();
    if (val === undefined) {
        val = null;
    }
    aar.setMilitaryOrHikingTraining(val);

    val = $("#emotionalState").val();
    if(val === undefined){
        val = null;
    }
    aarUpFrontInfo.setEmotionalStateDescription(val);

    var emotionalOther = $("#emotional_other").val();
    if(emotionalOther === undefined){
        emotionalOther = null;
    }
    aarUpFrontInfo.setEmotionalStateOther(emotionalOther);

    var hoursDelta = $("#hoursDelta").val();
    if (val === undefined) {
        val = null;
    }
    var minutesDelta = $("#minutesDelta").val();
    if (val === undefined || val === '') {
        val = null;
    }
    var delta = null;
    if (hoursDelta !== null && minutesDelta !== null) {
        delta = (hoursDelta * 60 * 60) + (minutesDelta * 60);
    }
    aar.setDeltaTimeLost(delta);

    if (!errors) {
        aarStates[AAR_LP_FEEDBACK] = cloneHTML($("#aarContent"));
        if(isNext) {
            aarState.aarUpFrontInfo = aarUpFrontInfo
            aarState.aarInfo = aar
            stateManagement.setSavedFormState(aarState)
            stateManagement.broadcastUpdate(AAR_DRAW_AAR)
        }else{
            aarState.aarUpFrontInfo = aarUpFrontInfo
            aarState.aarInfo = aar
            aarState.aarSubjectFound = true
            stateManagement.setSavedFormState(aarState)
            stateManagement.broadcastUpdate(AAR_SEARCH)
        }
    }

    aarState.aarInfo = aar
    aarState.aarUpFrontInfo = aarUpFrontInfo
    stateManagement.setSavedFormState(aarState)
}


function drawAAR(aar, aarUpFrontInfo) {
    console.log(JSON.stringify(aar, null, 2));
    $("#slider").hide();
    statusBar.close();
    mainMenu.close();
    $('#openMainMenu').hide();
    // hide the attribution links to prevent user from opening them on
    // this screen.
    $('.leaflet-control-attribution').css('display', 'none');
    pointCounter = 0
    hadIssueWithPoint = new Set()

    showHelperText("Estimate where the lost person went by placing points on the map.");
    if(measurementControl !== undefined && measurementControl !== null) {
        // ** turn off the measurement tool whenever drawing is initiated
        if(measurementControl._measuring) {
            measurementControl._toggleMeasure();
        }
    }
    $('#aarConfirm').show();
    $('#addPointAAR').show();
    $('#addPointAAR').click(function () {
        drawPointAAR(aar, aarUpFrontInfo, 'blue');
    });
    $('#aarConfirm').click(function () {
        $(this).hide();
        $('#addPointAAR').hide();
        $('.leaflet-control-attribution').css('display', 'inline');
        stopDrawing();
        hideHelperText();
        map.closePopup();

        $('#aarModal').modal("show");

        aarState.aarUpFrontInfo = aarUpFrontInfo
        aarState.aarInfo = aar
        aarState.aarSubjectFound = true
        stateManagement.setSavedFormState(aarState)
        stateManagement.broadcastUpdate(SUBMIT_AAR)
    });
    //placeAARConfirmButtonInTopRight("aarConfirmDiv")
    placeAARButton("addPointAARDiv", "aarConfirmDiv");
    drawPointAAR(aar, aarUpFrontInfo, 'blue');

    aarState.aarInfo = aar
    aarState.aarUpFrontInfo = aarUpFrontInfo
    stateManagement.setSavedFormState(aarState)
}

function placeAARButton(aarContainerId, confirmContainerId) {
    lastLayer = null;
    $("#" + aarContainerId).css("top", "15px");
    $("#" + aarContainerId).css("left", window.innerWidth - $("#" + aarContainerId).width() - 40);

}

var aarPointEventListener;
var aarPointCancelListener;

var drawnAARPoints = new L.FeatureGroup();

function drawPointAAR(aar, aarUpFrontInfo, c) {
    var options = {
        color: setColor(c),
        repeatMode: false,
        metric: ['km', 'm'],
        feet: false
    };
    pointDrawer.setOptions(options);
    pointDrawer.enable();

    $("#pointContinue").off()
    document.getElementById("pointCancel").removeEventListener("click", newLPIPointCancelListener)

    // called when the user hits continue in the aar point placement
    aarPointEventListener = function () {
        $(this).hide();
        $('#addPointAAR').hide();
        $('.leaflet-control-attribution').css('display', 'inline');
        stopDrawing();
        hideHelperText();
        map.closePopup();
        aarState.aarUpFrontInfo = aarUpFrontInfo
        aarState.aarInfo = aar
        aarState.aarSubjectFound = true
        stateManagement.setSavedFormState(aarState)
        stateManagement.broadcastUpdate(SUBMIT_AAR)
        $('#aarModal').modal("show");
        pointMenu.close();
    }
    document.getElementById("pointContinue").addEventListener("click", aarPointEventListener);

    aarPointCancelListener = function (){
        cancelAARPointListener()
    }

    document.getElementById("pointCancel").addEventListener("click", aarPointCancelListener);
    return drawCreatedAAR(aar, aarUpFrontInfo);
}

function cancelAARPointListener(){
    aarStates[stateManagement.getLastState()] = cloneHTML($("#aarContent"));
    showConfirmCancelLPIModal()
}

let pointCounter = 0;
function drawCreatedAAR(aar, aarUpFrontInfo) {
    var pointListnersAdded = new Set();

    map.on('draw:created', function (e) {
        var layer = e.layer;
        drawnItems.addLayer(layer);
        drawnAARPoints.addLayer(layer);

        console.log(layer._leaflet_id);
        // Code below based on stackoverflow.com: 'click-inside-leaflet-popup-and-do-javascript'
        // Create an element to hold all text and markup
        var container = $("<div />");
        // Delegate all event handling for container and its contents
        container.on('click', '.confidenceOkButton', function () {
            pointMenu.open();
            document.getElementById("errorConfidenceLevel").style.display = "none";
            console.log(aar);
            console.log(aarUpFrontInfo);

            // Add location and confidence info to aar
            var filter;
            var val;
            var errors = false;

            var estimateWrapper = new LocationEstimateWrapper;
            estimateWrapper.setLocationEstimateUUID(layer._leaflet_id);
            var locationEstimates = aar.getLpiLocationEstimates();
            var estimate = new LocationEstimate;

            // NOTE - If you're supporting alternative coordinate systems,
            // you'll want to ensure that toRadians does the correct conversion.
            var location = new LatLonGeo;
            location.setLatRad(toRadians(layer.getLatLng().lat));
            location.setLonRad(toRadians(layer.getLatLng().lng));
            estimate.setLocation(location);
            console.log(estimate.getLocation());

            filter = $("input[name=confidenceLevel]").filter(":checked");
            if (filter === undefined || filter.length === 0) {
                document.getElementById("errorConfidenceLevel").style.display = "inline";
                errors = true;
            } else {
                val = (filter[0].value).toUpperCase();
                if (!estimate.setConfidence(val)) {
                    document.getElementById("errorConfidenceLevel").style.display = "inline";
                    errors = true;
                }
            }
            console.log(estimate.getConfidence());
            estimateWrapper.setLocationEstimate(estimate);
            if (!errors) {
                // Remove duplicate entries (loop backwards because indices are preserved this way.)
                for (i = locationEstimateWrappers.length-1; i >= 0; --i) {
                    if (locationEstimateWrappers[i].getLocationEstimateUUID() === estimateWrapper.getLocationEstimateUUID()) {
                        locationEstimateWrappers.splice(i, 1);
                    }
                }
                locationEstimateWrappers.push(estimateWrapper);
                locationEstimates = [];
                for (i = 0; i < locationEstimateWrappers.length; ++i) {
                    locationEstimates.push(locationEstimateWrappers[i].getLocationEstimate());
                }
                aar.setLpiLocationEstimates(locationEstimates);
                console.log('Finished with popup');
                map.closePopup();
            }

            // Add listeners to any new points added (not moved)
            if(!pointListnersAdded.has(layer.getLatLng._leaflet_id)) {
                pointListnersAdded.add(layer.getLatLng._leaflet_id)
                pointCounter += 1
                addPointsListeners([layer.getLatLng()], Shapes.POINT, true, layer, aar, aarUpFrontInfo, pointCounter)
            }
        });
        // Insert content into container.
        container.html("<p>How confident are you in this location?</p>" +
                    "<div id=\"errorConfidenceLevel\" style=\"display: none;\">" +
                        "<p style=\"color: red;\">Please select a response.</p>" +
                    "</div>" +
                    "<input type='radio' name='confidenceLevel' id='confidenceLow' value='NOT_VERY_CONFIDENT'>" +
                    "<label for='confidenceLow'>Not very confident</label><br>" +
                    "<input type='radio' name='confidenceLevel' id='confidenceMed' value='SOMEWHAT_CONFIDENT'>" +
                    "<label for='confidenceMed'>Somewhat confident</label><br>" +
                    "<input type='radio' name='confidenceLevel' id='confidenceHigh' value='CONFIDENT'>" +
                    "<label for='confidenceHigh'>Confident</label><br>" +
                    "<input type='button' value='OK' class='confidenceOkButton' id='confidenceOkButton'>");

        layer.bindPopup(container[0],
            {closeButton: false, closeOnClick: false}).openPopup();
        layer.on({
            mousedown: function () {
                map.dragging.disable();
                map.on('mousemove', function (e) {
                    layer.setLatLng(e.latlng);
                });
            }
        });
        map.on('mouseup', function(e) {
            map.removeEventListener('mousemove');
            map.dragging.enable();
        });
    });
}
// END: map display functions

// ** Sends the AAR to the server.
function openAARConfirmAndSubmit(aar, aarUpFrontInfo, subjectFound)
{
    document.getElementById("pointContinue").removeEventListener("click", aarPointEventListener);
    document.getElementById("pointCancel").removeEventListener("click", aarPointCancelListener);
    console.log(JSON.stringify(aar, null, 2));
    // Refresh display
    $("#slider").show();
    statusBar.open();
    mainMenu.open();
    $('#openMainMenu').show();

    var aarContent = $.ajax({url: "/webmap/landsar/aarConfirm.html", async: false}).responseText;
    $("#aarContent").html(aarContent);

    document.getElementById("aarModalLabel").innerHTML =
        "After Action Report for " + getNameFromLPIID(getCurrentLPIID()) + " - Step 5 / 5, Review";

    $("#nextButton").off();
    $("#nextButton").html("Submit");
    $("#nextButton").removeClass("btn-primary");
    $("#nextButton").addClass("btn-success");
    $("#nextButton").click(function () {
        console.log("Submitting aar to server...");

        aarStates = {}

        stateManagement.setSavedState(false)
        $("#mainMenuContinueBtn").hide()

        let socket = createWebSocket('FINDER/afterActionReport');
        socket.onopen = function(e) {
            console.log('[open] connection established');
            console.log('Initiating keep-alive on socket');
            keepAlive(this);
            let aarFull = new AfterActionReportFull();
            aarFull.setAar(aar);
            aarFull.setUpFrontInfo(aarUpFrontInfo);
            console.log(JSON.stringify(aarFull, null, 2));
            socket.send(JSON.stringify(aarFull));

            $('#aarModal').modal("hide");
            removeAARPoints();
        };
        socket.onclose = function(e) {
            if (e.wasClean) {
                console.log('[close] connection closed cleanly, code=${e.code} reason=${e.reason}');
            } else {
                console.log('[close] connection died');
            }
            $('#aarModal').modal("hide");
            removeAARPoints();
        };
        socket.onerror = function(error) {
            console.log('[error] ${error.message}');
            $('#aarModal').modal("hide");
            removeAARPoints();
        };
        socket.onmessage = function(msg) {
            console.log(msg.data);
            setStatus(msg.data);

            if(msg.data !== null && msg.data !== undefined && msg.data.includes("Successfully created AAR" +
                "")) {
                setTimeout(function() {getLPIsFromServer(lpInputs.requestId, true)}, 2000);
            }
        };
    });
    $("#prevButton").off();
    $("#prevButton").click(function () {
        removeAARPoints();
        aar.setLpiLocationEstimates([]);
        if (subjectFound) {
            openAARLostPersonFeedback(aar, aarUpFrontInfo);
        } else {
            openAARSearchInfo(aar, aarUpFrontInfo, subjectFound);
        }
    });
    $("#cancelButton").off();
    $("#cancelButton").click(function () {
        removeAARPoints();
        aarStates = {}
        stateManagement.setSavedState(false)
        openMainMenu()
    });

    restoreLPIPointListener();

    $('#pointContinue').show();
}

function removeAARPoints() {
    for (let i = 0; i < locationEstimateWrappers.length; ++i) {
        drawnItems.removeLayer(locationEstimateWrappers[i].getLocationEstimateUUID());
    }
    locationEstimateWrappers = [];
    document.getElementById("pointContinue").removeEventListener("click", aarPointEventListener);
    document.getElementById("pointCancel").removeEventListener("click", aarPointCancelListener);
}

// add the new lpi point lister back to the point editor menu
function restoreLPIPointListener(){
    $("#pointCancel").off()
    let el2 = document.getElementById('pointCancel'),
        elClone2 = el2.cloneNode(true);
    el2.parentNode.replaceChild(elClone2, el2);
    document.getElementById("pointCancel").addEventListener("click", newLPIPointCancelListener)
}

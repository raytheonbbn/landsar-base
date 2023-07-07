/**
 * This is a process state change for LPI, Searches, and AAR.
 * It records the state and directs to next state in process flow.
 *
 * I/E NEW LPI -> LPP -> Bounding Box -> etc.
 *
 * It also records the last state, any form date (optionally), and process type (LPI, Search, AAR)
 */
class StateManagement {
    constructor() {
        this.savedState = false;
        this.lastState = "";
        this.type = ""; // either LPI, Search, or AAR
        this.savedFormState = null;
    }

    /**
     * Broadcasts update
     * @param state String form name to open (see constants.js)
     * @param skipValidate skip validation that a process has been in progress
     * @param metadata associated with transition
     */
    broadcastUpdate(state, skipValidate=false, metaData){
        if(!isLoggedIn()){
            if (confirm("Your session expired, would you like to log back in? Press 'cancel' to continue viewing your current session.")) {
                location.reload();
            }

            document.getElementById("loader").classList.remove("is-active");
            return;
        }

        if(stateManagement.hadSavedState() && !skipValidate){
            let continueState = true;
            if (confirm("A previous LPI, Search, or AAR is in progress; continue and lose this progress?")) {
                continueState = false;
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
            }
            if(continueState){
                openMainMenu()
                return;
            }
        }

        mainMenu.close();
        console.log(state)
        this.lastState = state
        console.log(this.lastState)

        this.type = LPI

        if (this.lastState === LPP) {
            openNewLpi()
        } else if (this.lastState === LKP) {
            openLKP();
        } else if (this.lastState === RENDEZVOUS) {
            showHelperText("Select any probable destinations for the lost person. You must enter at least one.");
            lpWrapper = drawItem(RENDEZVOUS, lpWrapper);
        } else if (this.lastState === WANDERING_PARAMS || this.lastState === LOST_HIKER) {
            openWanderingParams()
        } else if (this.lastState === GOAL_PARAMS || this.lastState === FLEEING) {
            openGoalParams()
        } else if (this.lastState === META_LANDCOVER || this.lastState === STATIONARY) {
            openMetaForm()
        } else if (this.lastState === KNOWN) {
            lpWrapper = drawItem("known", lpWrapper);

            // is required
            if(metaData === true){
                if(lpWrapper.getKnownExclusionZoneUUIDs().length === 0) {
                    $("#pointContinue").prop("disabled", true);
                }
                showHelperText("Select any areas that the lost person might know to avoid, then click 'Confirm'. You must" +
                    "enter at least one.");

            }else{
                showHelperText("Select any areas that the lost person might know to avoid, then click 'Confirm'.");
            }
        }else if (this.lastState === DISCOVERED) {
            lpWrapper = drawItem(DISCOVERED, lpWrapper);

            // is required
            if(metaData === true){
                if(lpWrapper.getDiscoveredExclusionZoneUUIDs().length === 0) {
                    $("#pointContinue").prop("disabled", true);
                }
                showHelperText("Select any areas that the lost person would likely avoid if encountered, then click 'Confirm'." +
                    " You must enter at least one.");
            }else{
                showHelperText("Select any areas that the lost person would likely avoid if encountered, then click 'Confirm'.");
            }
        } else if (this.lastState === COMPLETED) {
            $('input[name=nwLat]').val(drawnItems._layers[siWrapper.getCompletedSearchUUID()].getLatLngs()[0][1].lat);
            $('input[name=nwLng]').val(drawnItems._layers[siWrapper.getCompletedSearchUUID()].getLatLngs()[0][1].lng);
            $('input[name=seLat]').val(drawnItems._layers[siWrapper.getCompletedSearchUUID()].getLatLngs()[0][3].lat);
            $('input[name=seLng]').val(drawnItems._layers[siWrapper.getCompletedSearchUUID()].getLatLngs()[0][3].lng);
            coordinatesForm.open();
        } else if (this.lastState === MOTION_MODEL) {
            openMotionModel()
        } else if (this.lastState === MOVEMENT_SCHEDULE) {
            openMvmtSched()
        } else if (this.lastState === DRAW_LKP) {
            openDrawLKPShape();
        } else if (this.lastState === BOUNDING_BOX){
            openBoundingBox()
        }else if (this.lastState === NEW_SEARCH){
            openSearches()
            this.type = SEARCH
        }else if (this.lastState === SEARCH_DETAILS){
            newSearchContinue()
            this.type = SEARCH
        }else if (this.lastState === SEARCH_HELICOPTER || this.lastState === SEARCH_FOOT){
            this.type = SEARCH
            displaySGValues();
            directForm.open();
        } else if (this.lastState === SEARCH_ASSET){
            assetSearchForm.open()
        } else if (this.lastState === AAR_UP_FRONT){
            $('#aarModal').modal("show");
            if(this.savedFormState == null){
                loadAAR_upFrontInfo(null)
            }else {
                loadAAR_upFrontInfo(this.savedFormState)
            }
            this.type = AAR
        }else if (this.lastState === AAR_INFO){
            $('#aarModal').modal("show");
            loadAAR(this.savedFormState.aarInfo, this.savedFormState.aarUpFrontInfo)
            this.type = AAR
        }else if (this.lastState === AAR_SEARCH){
            $('#aarModal').modal("show");
            openAARSearchInfo(this.savedFormState.aarInfo, this.savedFormState.aarUpFrontInfo,
                this.savedFormState.aarSubjectFound)
            this.type = AAR
        }else if (this.lastState === AAR_LP_FEEDBACK){
            $('#aarModal').modal("show");
            openAARLostPersonFeedback(this.savedFormState.aarInfo, this.savedFormState.aarUpFrontInfo)
            this.type = AAR
        }else if (this.lastState === AAR_DRAW_AAR){
            $('#aarModal').modal("hide");
            drawAAR(this.savedFormState.aarInfo, this.savedFormState.aarUpFrontInfo)
            this.type = AAR
        }else if(this.lastState === SUBMIT_AAR){
            $('#aarModal').modal("show");
            this.type = AAR
            openAARConfirmAndSubmit(this.savedFormState.aarInfo, this.savedFormState.aarUpFrontInfo,
                this.savedFormState.aarSubjectFound);
        }else if(motionModelsWithAttrs.has(this.lastState)) {
            console.log("selected pluggable motion model with name: " + this.lastState)
            this.setSavedState("motionPlugin")
            openPluggableMotionModelInputs(this.lastState, this.savedFormState);
        }else if(motionModelsWithGeospatialAttrs.has(this.lastState)) {
            console.log("no motion model attrs, displaying geospatial attrs");
            openGeospatialMotionModelInputs(this.lastState, this.savedFormState);
        }else if(this.lastState === GOAL_POINTS){
            pointMenu.open();
            console.log("calling GOAL points")

            lpWrapper = drawItem(GOAL_POINTS, lpWrapper);

            // is required
            if(metaData === true){
                if(lpWrapper.getRendezvousPointUUIDs().size === 0) {
                    $("#pointContinue").prop("disabled", true);
                }
                showHelperText("Select any goal points for the lost person. You must enter at least one.");
            }else{
                showHelperText("Select any goal points for the lost person.");
            }

        }else if(this.lastState === POLYGON_EXCLUSIONS){
            // is required
            if(metaData === true){
                $("#pointContinue").prop( "disabled", true );
                showHelperText("Select any areas that the lost person would know to avoid, then click 'Confirm'. " +
                    "You must enter at least one.");
            }else{
                showHelperText("Select any areas that the lost person would know to avoid, then click 'Confirm'.");
            }

            lpWrapper = drawItem(POLYGON_EXCLUSIONS, lpWrapper);
        }else{
            console.log("Could not determine path. lastState is set to " + this.lastState + ".");
        }

        this.savedState = false;
    }

    /**
     * Restores the last process state
     */
    restoreLastState(){
        this.broadcastUpdate(this.lastState, true)
    }

    /**
     * Record that a process has been saved
     *
     * @param stateSaved Boolean
     */
    setSavedState(stateSaved){
        this.savedState = stateSaved
    }

    /**
     * Sets and form state information
     *
     * @param state (any type, i/e dictionary)
     */
    setSavedFormState(state){
        console.log("last state: " + this.savedFormState)
        console.log("setting state: " + state)
        this.savedFormState = state
    }

    /**
     * Get the last saved state (i/e SEARCH_HELICOPTER, see constants.js)
     *
     * @returns {string} Last State
     */
    getLastState(){
        return this.lastState;
    }

    /**
     * Saved state exists for a process
     *
     * @returns {boolean}
     */
    hadSavedState(){
        return this.savedState;
    }

    /**
     * Get saved state type (LPI, Search, or AAR... see constants.js)
     *
     * @returns {string}
     */
    getSavedStateType(){
        return this.type;
    }
}

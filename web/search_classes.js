/**
 * @Summary
 * Contains all relevant classes to creating a Search including:
 * 		SweepWidthInputs
 * 		SearchGenerationParameters
 * 		SearchInputs
 * 		SearchInputsWrapper
 *
 * Also has some "enumerators" similar to those in ATAK including:
 * 		CrewStatus
 * 		SearchPlatform
 * 		SearchSensor
 * 		RWAElevation
 *
 * @author Devon Minor
 */


const CREW_STATUS_FRESH_FACTOR_PARAM = "Crew Status Factor - Fresh";
const CREW_STATUS_FATIGUED_FACTOR_PARAM = "Crew Status Factor - Fatigued";
const SEARCH_SENSOR_VISUAL_FACTOR_PARAM = "Search Sensor Factor - Visual";
const SEARCH_SENSOR_NIGHT_VISION_FACTOR_PARAM = "Search Sensor Factor - Night Vision";
const SEARCH_SENSOR_FLIR_FACTOR_PARAM = "Search Sensor Factor - FLIR";
const SEARCH_SEASON_SPRING_FACTOR_PARAM = "Search Season Factor - Spring";
const SEARCH_SEASON_SUMMER_FACTOR_PARAM = "Search Season Factor - Summer";
const SEARCH_SEASON_FALL_FACTOR_PARAM = "Search Season Factor - Fall";
const SEARCH_SEASON_WINTER_FACTOR_PARAM = "Search Season Factor - Winter";
const SEARCH_RWA_ELEVATION_UNDER_500_FACTOR_PARAM = "Search RWA Elevation Factor - Under 500";
const SEARCH_RWA_ELEVATION_TO_1000_FACTOR_PARAM = "Search RWA Elevation Factor - To 1000";
const SEARCH_RWA_ELEVATION_OVER_1000_FACTOR_PARAM = "Search RWA Elevation Factor - Over 1000";
const FOOT_TIME_ON_STATION_PARAM = "Foot Time on Station Hrs";
const HELICOPTER_TIME_ON_STATION_PARAM = "Foot Time on Station Hrs";
const FOOT_SPEED_PARAM = "Foot Speed (kph)";
const HELICOPTER_SPEED_PARAM = "Helicopter Speed (kph)";
const BASE_SWEEP_WIDTH_FLIR_PARAM = "Base Sweep Width FLIR";
const BASE_SWEEP_WIDTH_NIGHT_VISION_HELICOPTER_PARAM = "Base Sweep Width Night Vision Helicopter";
const BASE_SWEEP_WIDTH_NIGHT_VISION_FOOT_PARAM = "Base Sweep Width Night Vision Foot";
const BASE_SWEEP_WIDTH_VISUAL_HELICOPTER_PARAM = "Base Sweep Width Visual Helicopter";
const BASE_SWEEP_WIDTH_VISUAL_FOOT_PARAM = "Base Sweep Width Visual Foot";
const BASE_SWEEP_WIDTH_DEFAULT = "Base Sweep Width Default";
class SweepWidthInputs {

    constructor() {
        this.platform;
        this.sensor;
        this.season;
        this.crewStatus;
        this.rwaelevation;
        this.crewSize;
        this["@class"] = "com.metsci.osppre.search.SweepWidthInputs";
        this.lpiId;
    }

    setClass(className) { this["@class"] = className;}

    getClass() { return this["@class"]; }

    setPlatform(platform) { this.platform = platform; }

    getPlatform() { return this.platform; }

    setSensor(sensor) { this.sensor = sensor; }

    getSensor() { return this.sensor; }

    setSeason(season) { this.season = season; }

    getSeason() { return this.season; }

    setCrewStatus(crewStatus) { this.crewStatus = crewStatus; }

    getCrewStatus() { return this.crewStatus; }

    setRWAElevation(rwaElevation) { this.rwaelevation = rwaElevation; }

    getRWAElevation() { return this.rwaelevation; }

    setCrewSize(crewSize) { this.crewSize = crewSize; }

    getCrewSize() { return this.crewSize; }

    computeSweepWidth() {
        let CrewStatus = {
            FRESH: getDefaultSearchParams()[CREW_STATUS_FRESH_FACTOR_PARAM],
            FATIGUED: getDefaultSearchParams()[CREW_STATUS_FATIGUED_FACTOR_PARAM]
        };

        let SearchSeason = {
            SPRING: getDefaultSearchParams()[SEARCH_SEASON_SPRING_FACTOR_PARAM],
            SUMMER: getDefaultSearchParams()[SEARCH_SEASON_SUMMER_FACTOR_PARAM],
            FALL: getDefaultSearchParams()[SEARCH_SEASON_FALL_FACTOR_PARAM],
            WINTER: getDefaultSearchParams()[SEARCH_SEASON_WINTER_FACTOR_PARAM]
        };

        let RWAElevation = {
            UNDER500: getDefaultSearchParams()[SEARCH_RWA_ELEVATION_UNDER_500_FACTOR_PARAM],
            TO_1000: getDefaultSearchParams()[SEARCH_RWA_ELEVATION_TO_1000_FACTOR_PARAM],
            OVER1000: getDefaultSearchParams()[SEARCH_RWA_ELEVATION_OVER_1000_FACTOR_PARAM]
        }

        var adjustmentFactor = 1.0;
        if (this.crewStatus != null) {
            adjustmentFactor *= CrewStatus[this.crewStatus];
        }
        if (this.season != null) {
            adjustmentFactor *= SearchSeason[this.season];
        }
        if (this.rwaelevation != null) {
            adjustmentFactor *= RWAElevation[this.rwaelevation];
        }
        if (this.crewSize > 0) {
            adjustmentFactor *= this.crewSize;
        }
        var baseSweepWidthFt = this.getBaseSweepWidth(this.platform, this.sensor);
        var baseSweepWidth = 3.048E-4 * baseSweepWidthFt;
        console.log("Base sweep width: ");
        console.log(baseSweepWidthFt * adjustmentFactor);
        return baseSweepWidth * adjustmentFactor;
    }

    getBaseSweepWidth(platform, sensor) {
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

        let SearchSensor = {
            VISUAL: getDefaultSearchParams()[SEARCH_SENSOR_VISUAL_FACTOR_PARAM],
            NIGHTVISION: getDefaultSearchParams()[SEARCH_SENSOR_NIGHT_VISION_FACTOR_PARAM],
            FLIR: getDefaultSearchParams()[SEARCH_SENSOR_FLIR_FACTOR_PARAM]
        };

        switch(SearchSensor[sensor]) {
	        case SearchSensor.FLIR:
	            return getDefaultSearchParams()[BASE_SWEEP_WIDTH_FLIR_PARAM];
	        case SearchSensor.NIGHTVISION:
	            if (SearchPlatform.HELICOPTER == SearchPlatform[platform]) {
	                return getDefaultSearchParams()[BASE_SWEEP_WIDTH_NIGHT_VISION_HELICOPTER_PARAM];
	            } else if (SearchPlatform.FOOT == SearchPlatform[platform]) {
	                return getDefaultSearchParams()[BASE_SWEEP_WIDTH_NIGHT_VISION_FOOT_PARAM];
	            }
	        case SearchSensor.VISUAL:
	            if (SearchPlatform.HELICOPTER == SearchPlatform[platform]) {
	                return getDefaultSearchParams()[BASE_SWEEP_WIDTH_VISUAL_HELICOPTER_PARAM];
	            } else if (SearchPlatform.FOOT == SearchPlatform[platform]) {
	                return getDefaultSearchParams()[BASE_SWEEP_WIDTH_VISUAL_FOOT_PARAM];
	            }
	        default:
                return getDefaultSearchParams()[BASE_SWEEP_WIDTH_DEFAULT];
        }
    }

}

class SearchGenerationParameters {
	constructor(sweepWidthKm, timeOnStationHrs, speedKmPerHr, orientationConstrained, numLegs) {
		this.sweepWidthKm = sweepWidthKm;
		this.timeOnStationHrs = timeOnStationHrs;
		this.speedKmPerHr = speedKmPerHr;
		this.orientationConstrained = orientationConstrained;
		this.numLegs = numLegs;
	}

	getSweepWidthKm() { return this.sweepWidthKm; }

    getSweepWidthFeet() { return (this.sweepWidthKm * 3280.84); }

    setSweepWidthKm(sweepWidthKm) { this.sweepWidthKm = sweepWidthKm; }

    getTimeOnStationHrs() { return this.timeOnStationHrs; }

    setTimeOnStationHrs(timeOnStationHrs) { this.timeOnStationHrs = timeOnStationHrs; }

    getSpeedKmPerHr() { return this.speedKmPerHr; }

    setSpeedKmPerHr(speedKmPerHr) { this.speedKmPerHr = speedKmPerHr; }

    getOrientationConstrained() { return this.orientationConstrained; }

    setOrientationConstrained(orientationConstrained) { this.orientationConstrained = orientationConstrained; }

    getNumLegs() { return this.numLegs; }

    setNumLegs(numLegs) { this.numLegs = numLegs; }

}

class SearchInputs {

	constructor() {
		this.time;
		this.name;
		this.searchParameters;
		this.sweepWidthInputs;
		this.isCompleted;
		this.coordinates = [];
		this.lpiID;
	}

	getCoordinates() { return this.coordinates; }

    setCoordinates(coordinates) { this.coordinates = coordinates; }

    getTime() { return this.time; }

    setTime(time) { this.time = time; }

    setSearchParameters(searchParameters) { this.searchParameters = searchParameters; }

    getSearchParameters() { return this.searchParameters; }

    setSweepWidthInputs(sweepWidthInputs) { this.sweepWidthInputs = sweepWidthInputs; }

    getSearchParameters() { return this.searchParameters; }

    setIsCompleted(isCompleted) { this.isCompleted = isCompleted; }

    getIsCompleted() { return this.isCompleted; }

    getSweepWidthInputs() { return this.sweepWidthInputs; }

    getName() { return this.name; }

    setName(name) { this.name = name; }

    getLpiId() { return this.lpiId;}

    setLpiId(id) { this.lpiId = id; }
}

class SearchInputsWrapper {

	constructor() {
		this.uuid = randUUID();
		this.searchInputs;
		this.completedSearchUUID;
	}

	getCompletedSearchUUID() { return this.completedSearchUUID; }

	setCompletedSearchUUID(uid) { this.completedSearchUUID = uid; }

	getSearchInputs() { return this.searchInputs; }

	setSearchInputs(searchInputs) { this.searchInputs = searchInputs; }

}
/** See com.bbn.roger.osppre.api.SearchRequest.java **/
class SearchRequest{
    constructor() {
        this.msgType = "SearchRequest";
        this.lpiId;
        this.searchId;
        this.startTime;
        this.sweepWidth;
        this.duration;
        this.sensorPos;
        this.speedKmPerHr;
        this.assetId;
    }

    getLpiId() {
        return lpiId;
    }
    setLpiId(lpiId) {
        this.lpiId = lpiId;
    }
    getSearchId() {
        return this.searchId;
    }
    setSearchId(searchId){
        this.searchId = searchId;
    }

    setStartTime(time) {
        this.startTime = time;
    }
    getStartTime() {
        return this.startTime;
    }

    getSweepWidth() {
        return this.sweepWidth;
    }
    setSweepWidth(sweepWidth) {
        this.sweepWidth = sweepWidth;
    }
    getDuration() {
        return this.duration;
    }
    setDuration(duration) {
        this.duration = duration;
    }
    getSensorPos() {
        return this.sensorPos;
    }
    setSensorPos(sensorPos) {
        this.sensorPos = sensorPos;
    }

    getAssetId() {
        return this.assetId;
    }

    setAssetId(assetId) {
        this.assetId = assetId;
    }

    setSpeedKmPerHr(speedKmPerHr){
        this.speedKmPerHr = speedKmPerHr;
    }

    getSpeedKmPerHr(){
        return this.speedKmPerHr;
    }
}


































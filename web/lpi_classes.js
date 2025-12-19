/**
 * @Summary
 * Contains all the relevant classes to creating a LPI including:
 * 		LostPersonInputsWrapper
 * 		LostPersonInputs
 * 		IsolatedPersonParameters
 * 		ParachuteDropParameters
 * 		CircleScenarioInputs
 * 		PointScenarioInputs
 * 		PolygonScenarioInputs
 * 		ParachuteDropScenarioInputs
 * 
 * also has the randUUID() function
 * 
 * @author Devon Minor
 */


/**
 * Used by the LostPersonInputsWrapper and SearchInputsWrapper
 * to set a random UUID that can later be referenced to refer
 * to the instance after creation
 */
function randUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

class LostPersonInputsWrapper {
	
	constructor() {
		this.uuid = randUUID();
		this.lostPersonInputs;
		this.lkpType;
		this.mapUUIDS = [];
		this.boundingBoxUUID;
		this.knownExclusionZoneUUIDs = [];
		this.discoveredExclusionZoneUUIDs = [];
		this.polygonalExclusionZoneUUIDs = [];
		this.lkpUUIDs = [];
		this.rendezvousPointUUIDs = new Set();
        this.landcoverMetadataEnabled = true;
        this.stayOutOfWaterEnabled = true;
	}
	
	getLkpType() { return this.lkpType; }
	
	setLkpType(type) { this.lkpType = type; }
	
	getLostPersonInputs() { return this.lostPersonInputs; }
	
	setLostPersonInputs(lostPersonInputs) { this.lostPersonInputs = lostPersonInputs; }

    getLandcoverMetadataEnabled() { return this.landcoverMetadataEnabled; }

    setLandcoverMetadataEnabled(landcoverMetadataEnabled) { this.landcoverMetadataEnabled = landcoverMetadataEnabled; }
    getStayOutOfWaterEnabled() { return this.stayOutOfWaterEnabled; }

    setStayOutOfWaterEnabled(stayOutOfWaterEnabled) { this.stayOutOfWaterEnabled = stayOutOfWaterEnabled; }
	
	getBoundingBoxUUID() { return this.boundingBoxUUID; }
	
	setBoundingBoxUUID(uid) { this.boundingBoxUUID = uid; }

	removeBoundingBoxUUID() { this.boundingBoxUUID = undefined; }

	getKnownExclusionZoneUUIDs() { return this.knownExclusionZoneUUIDs; }
	
	addKnownExclusionZoneUUID(uid) { this.knownExclusionZoneUUIDs.push(uid); }
	
	getDiscoveredExclusionZoneUUIDs() { return this.discoveredExclusionZoneUUIDs; }
	
	addDiscoveredExclusionZoneUUID(uid) { this.discoveredExclusionZoneUUIDs.push(uid); }

	removeDiscoveredExclusionZoneUUID(uid) { this.discoveredExclusionZoneUUIDs.remove(uid); }
	
	getPolyExclusionZoneUUIDs() { return this.polygonalExclusionZoneUUIDs; }
	
	addPolyExclusionZoneUUID(uid) {
		this.polygonalExclusionZoneUUIDs.push(uid); }

	removePolyExclusionZoneUUID(uid) {
		this.polygonalExclusionZoneUUIDs.remove(uid); }
	
	getLkpUUIDs() { return this.lkpUUIDs; }
	
	addLkpUUID(uid) { this.lkpUUIDs.push(uid); }
	
	getRendezvousPointUUIDs() { return this.rendezvousPointUUIDs; }
	
	addRendezvousPointUUID(uid) { this.rendezvousPointUUIDs.add(uid); }

	removeRendezvousPointUUID(uid) { this.rendezvousPointUUIDs.delete(uid); }
	
	getMapItemUUIDs() {
		this.mapUUIDS = [];
		this.mapUUIDS = this.mapUUIDS.concat(this.boundingBoxUUID,
					 this.knownExclusionZoneUUIDs,
					 this.discoveredExclusionZoneUUIDs,
					 this.polygonalExclusionZoneUUIDs,
					 this.lkpUUIDs);
		for(let key of this.getRendezvousPointUUIDs()){
			this.mapUUIDS.push(key);
		}
		return this.mapUUIDS;
	}

	removeAllShapeUUIDs(){
		this.lkpType = undefined;
		this.mapUUIDS = [];
		this.boundingBoxUUID = undefined;
		this.knownExclusionZoneUUIDs = [];
		this.discoveredExclusionZoneUUIDs = [];
		this.polygonalExclusionZoneUUIDs = [];
		this.lkpUUIDs = [];
		this.rendezvousPointUUIDs = new Set();
	}

}

var randomSeed = 0
function setRandomSeed(seed){
	randomSeed = seed;
}
function getRandomSeed(){
	return randomSeed;
}

class LostPersonInputs {

	constructor(boundingBox, ipp, moveSchedule, name, polyExclnZones, rendezvousPoints, searchInterval, startTime,
				theModel, exclusionZones, timezone, deploymentMode, stayOutOfWater, goalOrientedParams, landcoverMeta,
				requestId, attributeNameToValues) {
		this.boundingBox = boundingBox ? boundingBox : [];
		this.ipp = ipp ? ipp : null;
		this.moveSchedule = moveSchedule ? moveSchedule : null;
		this.name = name ? name : null;
		this.polyExclnZones = polyExclnZones ? polyExclnZones : [];
		this.rendezvousPoints = rendezvousPoints ? rendezvousPoints : [];
		this.searchInterval = searchInterval ? searchInterval : 1.0;
		this.startTime = startTime ? startTime : null;
		this.theModel = theModel ? theModel : null;
		this.exclusionZones = exclusionZones ? exclusionZones : [];
		this.timezone = timezone;
		this.stayOutOfWater = stayOutOfWater;
    	this.deploymentMode = deploymentMode;
		this.goalOrientedParams = goalOrientedParams;
		this.landcoverMetadata = landcoverMeta;
		this.randomSeed = randomSeed
		this.requestId = requestId;
		this.attributeNameToValues = attributeNameToValues;
	}

	setRequestId(requestId){
		this.requestId = requestId;
	}

	getRequestId(){
		return this.requestId;
	}
	
	setBoundingBox(box) {
		let lon1 = box.eastLonDeg;
		let lat1 = box.northLatDeg;
		let lat2 = box.southLatDeg;
		let lon2 = box.westLonDeg;

		box.eastLonDeg = Math.max(lon1, lon2)
		box.westLonDeg = Math.min(lon1, lon2)
		box.northLatDeg = Math.max(lat1, lat2)
		box.southLatDeg = Math.min(lat1, lat2)

		this.boundingBox = box;
	}
	
	getBoundingBox() { return this.boundingBox; }
	
	setIpp(ipp) { this.ipp = ipp; }
	
	getIpp() { return this.ipp; }
	
	setMoveSchedule(schedule) { this.moveSchedule = schedule; }
	
	getMoveSchedule() { return this.moveSchedule; }
	
	setName(name) { this.name = name; }
	
	getName() { return this.name; }
	
	setPolyExclnZones(poly) { this.polyExclnZones = poly; }
	
	getPolyExclnZones() { return this.polyExclnZones; }
	
	setRendezvousPoints(points) { this.rendezvousPoints = points; }
	
	getRendezvousPoints() { return this.rendezvousPoints; }
	
	setStartTime(time) { this.startTime = time; }
	
	getStartTime() { return this.startTime; }
	
	setSearchInterval(interval) { this.searchInterval = interval; }
	
	getSearchInterval() { return this.searchInterval; }
	
	setModel(model) { this.theModel = model; }
	
	getModel() { return this.theModel; }
	
	setCenter(center) { this.centerPt = center; }
	
	getCenter() { return this.centerPt; }
	
	setRadius(radius) { this.radiusM = radius; }
	
	getRadius() { return this.radiusM; }
	
	setExclusionZones(zones) { this.exclusionZones = zones; }
	
	getExclusionZones() { return this.exclusionZones; }

  setDeploymentMode(mode) { this.deploymentMode = mode; }

  getDeploymentMode() { return this.deploymentMode; }

	getTimezone(){
		return this.timezone;
	}

	setTimezone(timezone){
		this.timezone = timezone;
	}

	// boolean value
	setStayOutOfWater(toggle){
		this.stayOutOfWater = toggle;
	}

	getStayOutOfWater(){
		return this.stayOutOfWater;
	}

	getGoalOrientedParams() {
		return this.goalOrientedParams;
	}

	setGoalOrientedParams(goalParameters) {
		this.goalOrientedParams = goalParameters;
	}

	setLandcoverMetadata(landcoverMetadata) {
		this.landcoverMetadata = landcoverMetadata;
	}

	getLandcoverMetadata(){
		return this.landcoverMetadata;
	}

	setRandomSeed(seed) {
		this.randomSeed = seed;
	}

	getRandomSeed(){
		return this.randomSeed;
	}

	getattributeNameToValues() {
		return this.attributeNameToValues;
	}

	setattributeNameToValues(value) {
		this.attributeNameToValues = value;
	}
}

class IsolatedPersonParameters {
	constructor(wtgKg, loadKg, maxStealthSpeed, maximumDuration, baseResourceLevel, exhaustionLevel, maxResourceLevel, recoveryLevel, initialResourceLevel, k, l, m) {
		//this.baseSoa = 0.001388888888888889;
		this.wgtKg = wtgKg;
		this.loadKg = loadKg;
		this.maxStealthSpeed = maxStealthSpeed;
		this.maximumDuration = maximumDuration;
		this.baseResourceLevel = baseResourceLevel;
		this.exhaustionLevel = exhaustionLevel;
		this.maxResourceLevel = maxResourceLevel;
		this.recoveryLevel = recoveryLevel;
		this.initialResourceLevel = initialResourceLevel;
        this.wanderingParameters = new WanderingParameters();
	}

    getWanderingParameters() {
        return this.wanderingParameters;
    }

    setWanderingParameters(wanderingParameters) {
        this.wanderingParameters = wanderingParameters;
    }

	setMinBaseSoa(minBaseSoa) {
		this.minBaseSoa = minBaseSoa;
	}

	setMaxBaseSoa(maxBaseSoa) {
		this.maxBaseSoa = maxBaseSoa;
	}

	getMinBaseSoa() {
		return minBaseSoa;
	}

	getMaxBaseSoa() {
		return maxBaseSoa;
	}
}

const DISTANCE_INCREMENT_METERS_DEFAULT_PARAM_NAME = "Distance increment (m)";
const NUMBER_SEGMENTS_DEFAULT_PARAM_NAME = "Number of segments";
const NUMBER_OPTIONS_DEFAULT_PARAM_NAME = "Number options (paths) considered";
const COURSE_STD_DEFAULT_PARAM_NAME = "Course change stdev (deg)";
class WanderingParameters {
    constructor(incrementDistMeters, maxDistance, numberPathsConsidered, courseChangeSigmaDegrees) {
        this[DISTANCE_INCREMENT_METERS_DEFAULT_PARAM_NAME] = incrementDistMeters;

		// Round to the nearest integer.
		this[NUMBER_SEGMENTS_DEFAULT_PARAM_NAME] = Math.floor((maxDistance * 1000) / incrementDistMeters);
		if (this[NUMBER_SEGMENTS_DEFAULT_PARAM_NAME] < 1) {
			this[NUMBER_SEGMENTS_DEFAULT_PARAM_NAME] = 1;
		}

        this[NUMBER_OPTIONS_DEFAULT_PARAM_NAME] = numberPathsConsidered;
        this[COURSE_STD_DEFAULT_PARAM_NAME] = courseChangeSigmaDegrees;
    }
}

const MAXIMUM_TURN_ANGLE_DEFAULT_PARAM = "Maximum turn angle (deg)";
const MINIMUM_TURN_ANGLE_DEFAULT_PARAM = "Minimum turn angle (deg)";
const MAXIMUM_LEG_LENGTH_DEFAULT_PARAM = "Maximum leg length (m)";
const AWARENESS_RADIUS_DEFAULT_PARAM = "Awareness radius (m)";
const MOVE_RADIUS_DEFAULT_PARAM = "Move radius (m)";
class GoalParameters {
	constructor(awarenessRadius, moveRadius, minTurnAngle, maxTurnAngle, maxLegLength) {
		this[AWARENESS_RADIUS_DEFAULT_PARAM] = awarenessRadius;
		this[MOVE_RADIUS_DEFAULT_PARAM] = moveRadius;
		this[MINIMUM_TURN_ANGLE_DEFAULT_PARAM] = minTurnAngle;
		this[MAXIMUM_TURN_ANGLE_DEFAULT_PARAM] = maxTurnAngle;
		this[MAXIMUM_LEG_LENGTH_DEFAULT_PARAM] = maxLegLength;
	}
}

NLCDB = "National Land Cover Data Base";

class LandCoverMetaData {
	constructor(metaDataItems) {
		this.metaDataItems = metaDataItems;
	}

	getName() {
		return name;
	}

	setName(name) {
		this.name = name;
	}

	addMetaDataItem(metaDataItem) {
		this.metaDataItems.push(metaDataItem)
	}

}

function setDefaultMetadata(landcoverDefaultMetaJson){
	this.metaData = new LandCoverMetaData([]);
	this.metaData.setName(landcoverDefaultMetaJson.name);

	console.log("Setting default metadata: " + this.metaData.getName())

	for(let i=0; i<landcoverDefaultMetaJson.metaDataItems.length; i++){
		let item = landcoverDefaultMetaJson.metaDataItems[i];
		this.metaData.addMetaDataItem(
			new LandCoverMetaDataItem(item.lcCode,
				item.shortDescription,
				item.soaFactor,
				item.cost,
				item.terrainResourceParameter,
				item.rgbColor[0],
				item.rgbColor[1],
				item.rgbColor[2],
				item.detailedDescription))

		console.log(item.lcCode + ", " + item.shortDescription)
	}
}

function getDefaultMetadata() {
	return this.metaData;
}

function setDefaultLpp(defaultLpp){
	this.defaultLpp = defaultLpp;
}

function getDefaultLpp(){
	return this.defaultLpp;
}

function setDefaultWanderingParams(defaultWanderingParams){
	this.defaultWanderingParams = defaultWanderingParams;
}

function getDefaultWanderingParams(){
	return this.defaultWanderingParams;
}

function setDefaultGoalOrientedParams(defaultGoalOrientedParams){
	this.defaultGoalOrientedParams = defaultGoalOrientedParams;
}

function getDefaultGoalOrientedParams(){
	return this.defaultGoalOrientedParams;
}

function setDefaultSearchParams(defaultFootSearchParams){
	this.defaultSearchParams = defaultFootSearchParams;
}

function getDefaultSearchParams(){
	return this.defaultSearchParams;
}

class ParachuteDropParameters {
	constructor(firstBailoutPt, lastBailoutPt, pos2SigUncertMeters, altitudeFeet, windSpeedKts, windDirNavDeg) {
		this.firstBailoutPt = firstBailoutPt;
		this.lastBailoutPt = lastBailoutPt;
		this.pos2SigUncertMeters = pos2SigUncertMeters;
		this.altitudeFeet = altitudeFeet;
		this.windSpeedKts = windSpeedKts;
		this.windDirNavDeg = windDirNavDeg;
	}
	getFirstBailoutPt() { return this.firstBailoutPt; }
	
	getLastBailoutPt() { return this.lastBailoutPt; }
	
	getPos2SigUncertMeters() { return this.pos2SigUncertMeters; }
	
	getAltitudeFeet() { return this.altitudeFeet; }
	
	getWindSpeedKts() { return this.windSpeedKts; }
	
	getWindDirNavDeg() { return this.windDirNavDeg; }
}

class LandCoverMetaDataItem{
	constructor(lcCode, shortDescription,
	soaFactor, cost, terrainResourceParameter,
	red, green, blue,
	detailedDescription) {
		this.lcCode = lcCode;
		this.cost = cost;
		this.soaFactor = soaFactor;
		this.shortDescription = shortDescription;
		this.rgbColor = [red, green, blue]
		this.detailedDescription = detailedDescription;
		this.terrainResourceParameter = terrainResourceParameter;
	}

	getLcCode() {
		return this.lcCode;
	}

	getCost() {
		return this.cost;
	}

	getSoaFactor() {
		return this.soaFactor;
	}

	getShortDescription() {
		return this.shortDescription;
	}

//	public Color getColor() {
//		return color;
//	}

	getRgbColor() {
		return this.rgbColor;
	}

	getDetailedDescription() {
		return this.detailedDescription;
	}

	getTerrainResourceParameter() {
		return this.terrainResourceParameter;
	}
}

class CircleScenarioInputs extends LostPersonInputs {
	constructor(boundingBox, ipp, moveSchedule, name, polyExclnZones, rendezvousPoints, searchInterval, startTime, theModel, exclusionZones, centerPt, radiusM, timezone, deploymentMode, stayOutOfWater, goalOrientedParams, landcoverMetaData, requestId, attributeNameToValues) {
		super(boundingBox, ipp, moveSchedule, name, polyExclnZones, rendezvousPoints, searchInterval, startTime, theModel, exclusionZones, timezone, deploymentMode, stayOutOfWater, goalOrientedParams, landcoverMetaData, requestId, attributeNameToValues);
		this.centerPt = centerPt;
		this.radiusM = radiusM;
		this["@class"] = "com.metsci.osppre.api.ScenarioInputs$CircularScenarioInputs";
	}
}

class PointScenarioInputs extends LostPersonInputs {
	constructor(boundingBox, ipp, moveSchedule, name, polyExclnZones, rendezvousPoints, searchInterval, startTime, theModel, exclusionZones, listPts, timezone, deploymentMode, stayOutOfWater, goalOrientedParams, landcoverMetaData, requestId, attributeNameToValues) {
		super(boundingBox, ipp, moveSchedule, name, polyExclnZones, rendezvousPoints, searchInterval, startTime, theModel, exclusionZones, timezone, deploymentMode, stayOutOfWater, goalOrientedParams, landcoverMetaData, requestId, attributeNameToValues);
		this.listPoints = listPts;
		this["@class"] = "com.metsci.osppre.api.ScenarioInputs$PointScenarioInputs";
	}
}

class PolygonScenarioInputs extends LostPersonInputs {
	constructor(boundingBox, ipp, moveSchedule, name, polyExclnZones, rendezvousPoints, searchInterval, startTime, theModel, exclusionZones, polygonPts, timezone, deploymentMode, stayOutOfWater, goalOrientedParams, landcoverMetaData, requestId, attributeNameToValues) {
		super(boundingBox, ipp, moveSchedule, name, polyExclnZones, rendezvousPoints, searchInterval, startTime, theModel, exclusionZones, timezone, deploymentMode, stayOutOfWater, goalOrientedParams, landcoverMetaData, requestId, attributeNameToValues);
		this.polygonPoints = polygonPts;
		this["@class"] = "com.metsci.osppre.api.ScenarioInputs$PolygonScenarioInputs";
	}
}

class ParachuteDropScenarioInputs extends LostPersonInputs {
	constructor(boundingBox, ipp, moveSchedule, name, polyExclnZones, rendezvousPoints, searchInterval, startTime, theModel, exclusionZones, firstBailoutPt, lastBailoutPt, pos2SigUncertMeters, altitudeFeet, windSpeedKts, windDirNavDeg, timezone, deploymentMode, stayOutOfWater, goalOrientedParams, landcoverMetaData, requestId, attributeNameToValues) {
		super(boundingBox, ipp, moveSchedule, name, polyExclnZones, rendezvousPoints, searchInterval, startTime, theModel, exclusionZones, timezone, deploymentMode, stayOutOfWater, goalOrientedParams, landcoverMetaData, requestId, attributeNameToValues);
		this.firstBailoutPt = firstBailoutPt;
		this.lastBailoutPt = lastBailoutPt;
		this.pos2SigUncertMeters = pos2SigUncertMeters;
		this.altitudeFeet = altitudeFeet;
		this.windSpeedKts = windSpeedKts;
		this.windDirNavDeg = windDirNavDeg;
		this["@class"] = "com.metsci.osppre.api.ScenarioInputs$ParachuteDropInputs";
	}
}



















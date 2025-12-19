/**
* @Summary This file contains all the classes related to storing After
* Action Report data on the client side.
*
* @author Benjamin Toll
*/

class AfterActionReportFull {
    aar;
    upFrontInfo;

    constructor() {
        this.aar = null;
        this.upFrontInfo = null;
    }

    setAar(aar) {
        this.aar = aar;
    }

    getAar() {
        return this.aar;
    }

    setUpFrontInfo(upFrontInfo) {
        this.upFrontInfo = upFrontInfo;
    }

    getUpFrontInfo() {
        return this.upFrontInfo;
    }
}

const SubjectStatus = {
    UNINJURED: 'UNINJURED',
    INJURED: 'INJURED',
    DECEASED: 'DECEASED',
    UNKNOWN: 'UNKNOWN'
}

const SubjectResponsiveness = {
    RESPONSIVE: 'RESPONSIVE',
    UNRESPONSIVE: 'UNRESPONSIVE',
    UNKNOWN: 'UNKNOWN'
}

const TerrainFeature = {
    RIDGE: 'RIDGE',
    VALLEY: 'VALLEY',
    STREAM_DRAINAGE: 'STREAM_DRAINAGE',
    BUILDING: 'BUILDING',
    OUT_BUILDING: 'OUT_BUILDING',
    ROAD: 'ROAD',
    TRAIL: 'TRAIL',
    RAILROAD: 'RAILROAD',
    OTHER_LINEAR_FEATURE: 'OTHER_LINEAR_FEATURE',
    SWAMP: 'SWAMP',
    YARD: 'YARD',
    WOODS: 'WOODS',
    BRUSH_SHRUBS: 'BRUSH_SHRUBS',
    BARE_EARTH: 'BARE_EARTH',
    GRASS_FIELD: 'GRASS_FIELD',
    TUNDRA: 'TUNDRA',
    FIELD_PADDOCK: 'FIELD_PADDOCK',
    OPEN_PLAIN: 'OPEN_PLAIN',
    DESERT: 'DESERT',
    UNDER_WATER: 'UNDER_WATER'
}

const PopulationDensity = {
    URBAN: 'URBAN',
    SUBURBAN: 'SUBURBAN',
    RURAL: 'RURAL',
    WILDERNESS: 'WILDERNESS'
}

const PrecipitationType = {
    NONE: 'NONE',
    SNOW: 'SNOW',
    RAIN: 'RAIN',
    SLEET: 'SLEET'
}

const SubjectFoundMethod = {
    SELF_RECOVERED: 'SELF_RECOVERED',
    FAMILY_FRIENDS: 'FAMILY_FRIENDS',
    INVESTIGATIVE: 'INVESTIGATIVE',
    SEARCH_EFFORT: 'SEARCH_EFFORT',
    SEARCH_EFFORT_HASTY_TEAM: 'SEARCH_EFFORT_HASTY_TEAM',
    SEARCH_EFFORT_AIR_SCENT_DOG: 'SEARCH_EFFORT_AIR_SCENT_DOG',
    SEARCH_EFFORT_TRACKING_TRAILING_DOG: 'SEARCH_EFFORT_TRACKING_TRAILING_DOG',
    SEARCH_EFFORT_CADAVER: 'SEARCH_EFFORT_CADAVER',
    SEARCH_EFFORT_DOG: 'SEARCH_EFFORT_DOG',
    SEARCH_EFFORT_DISASTER_DOG: 'SEARCH_EFFORT_DISASTER_DOG',
    SEARCH_EFFORT_ATTRACTION: 'SEARCH_EFFORT_ATTRACTION',
    SEARCH_EFFORT_CLOSED_GRID: 'SEARCH_EFFORT_CLOSED_GRID',
    SEARCH_EFFORT_OPEN_GRID: 'SEARCH_EFFORT_OPEN_GRID',
    SEARCH_EFFORT_CONFINEMENT: 'SEARCH_EFFORT_CONFINEMENT',
    SEARCH_EFFORT_FIXED_WING: 'SEARCH_EFFORT_FIXED_WING',
    SEARCH_EFFORT_HELICOPTER: 'SEARCH_EFFORT_HELICOPTER',
    SEARCH_EFFORT_HORSEBACK: 'SEARCH_EFFORT_HORSEBACK',
    SEARCH_EFFORT_MOTORCYCLE: 'SEARCH_EFFORT_MOTORCYCLE',
    SEARCH_EFFORT_MOUNTAIN_BIKE: 'SEARCH_EFFORT_MOUNTAIN_BIKE',
    SEARCH_EFFORT_ATV: 'SEARCH_EFFORT_ATV',
    SEARCH_EFFORT_DIVER: 'SEARCH_EFFORT_DIVER',
    SEARCH_EFFORT_BOAT: 'SEARCH_EFFORT_BOAT',
    SEARCH_EFFORT_RAFT: 'SEARCH_EFFORT_RAFT',
    SEARCH_EFFORT_SNOWMOBILE: 'SEARCH_EFFORT_SNOWMOBILE',
    SEARCH_EFFORT_MANTRACKERS: 'SEARCH_EFFORT_MANTRACKERS',
    SEARCH_EFFORT_VEHICLE: 'SEARCH_EFFORT_VEHICLE',
    SEARCH_EFFORT_OTHER: 'SEARCH_EFFORT_OTHER',
    NOT_FOUND: 'NOT_FOUND'
}

const EmotionalStateDescription = {
    CALM: "CALM",
    PANICKED: "PANICKED",
    HOLDING_TOGETHER_SOMEWHAT: "HOLDING_TOGETHER_SOMEWHAT"
}

const BehaviorWhileLost = {
    RUNNING: "RUNNING",
    WALKING: "WALKING",
    APPROACHING: "APPROACHING",
    EVADING: "EVADING",
    TAKING_SHELTER: "TAKING_SHELTER"
}

class LatLonGeo {
    constructor() {
        this.latRad;
        this.lonRad;
    }

    getLatRad() {
        return this.latRad;
    }

    setLatRad(latRad) {
        this.latRad = latRad;
    }

    getLonRad() {
        return this.lonRad;
    }

    setLonRad(lonRad) {
        this.lonRad = lonRad;
    }
}

const LocationEstimateConfidence = {
    NOT_VERY_CONFIDENT: 'NOT_VERY_CONFIDENT',
    SOMEWHAT_CONFIDENT: 'SOMEWHAT_CONFIDENT',
    CONFIDENT: 'CONFIDENT'
}

class LocationEstimate {
    constructor() {
        this.location; // should be LatLonGeo
        this.confidence; // should be double
    }

    getLocation() {
        return this.location;
    }

    setLocation(location) {
        this.location = location;
        return true;
    }

    getConfidence() {
        return this.confidence;
    }

    setConfidence(confidence) {
        this.confidence = confidence;
        return true;
    }
}


class Precipitation {
    constructor() {
        this.precipitationInches; // should be double
        this.precipitationType; // should be PrecipitationType
    }

    getPrecipitationInches() {
        return this.precipitationInches;
    }

    setPrecipitationInches(precipitationInches) {
        this.precipitationInches = precipitationInches;
    }

    getPrecipitationType() {
        return this.precipitationType;
    }

    setPrecipitationType(precipitationType) {
        this.precipitationType = precipitationType;
        return true;
    }
}

class AfterActionReport {
    constructor() {
        this.lpiId = null;
        this.subjectFound = null;
        this.subjectStatus = null;
        this.subjectResponsiveness = null;
        this.totalSearchTimeHrs = null;
        this.totalTimeLostHrs = null;
        this.distanceFromPLSMiles = null;
        this.subjectFoundTerrainFeatures = null;
        this.lpElevationChangeFt = null;
        this.trackOffsetYards = null;
        this.populationDensity = null;
        this.findCoordinates = null;
        this.precipitation = null;
        this.highTempWhileLostDegrees = null;
        this.lowTempWhileLostDegrees = null;
        this.subjectFoundMethod = null;
        this.technicalProblemsWithTool = null;
        this.motionModelChoiceExplanation = null;
        this.searchAfterActionReports = null;
        this.additionalToolFeedback = null;
        this.hoursSubjectMobile = null;
        this.lpiLocationEstimates = [];
        this.behaviorWhileLostOther = null;
        this.militaryOrHikingTraining = null;
        this.deltaTimeLost = null;
        this.behaviorWhileLostList = [];
    }

    getLpiId() {
        return this.lpiId;
    }

    setLpiId(lpiId) {
        this.lpiId = lpiId;
        return true;
    }

    getSubjectFound() {
        return this.subjectFound;
    }

    setSubjectFound(subjectFound) {
        this.subjectFound = subjectFound;
        return true;
    }

    getSubjectStatus() {
        return this.subjectStatus;
    }

    setSubjectStatus(subjectStatus) {
        this.subjectStatus = subjectStatus;
        return true;
    }

    getSubjectResponsiveness() {
        return this.subjectResponsiveness;
    }

    setSubjectResponsiveness(subjectResponsiveness) {
        this.subjectResponsiveness = subjectResponsiveness;
        return true;
    }

    getTotalSearchTimeHrs(totalSearchTimeHrs) {
        return this.totalSearchTimeHrs;
    }

    setTotalSearchTimeHrs(totalSearchTimeHrs) {
        this.totalSearchTimeHrs = totalSearchTimeHrs;
        return true;
    }

    getTotalTimeLostHrs() {
        return this.totalTimeLostHrs;
    }

    setTotalTimeLostHrs(totalTimeLostHrs) {
        this.totalTimeLostHrs = totalTimeLostHrs;
        return true;
    }

    getDistanceFromPLSMiles() {
        return this.distanceFromPLSMiles;
    }

    setDistanceFromPLSMiles(distanceFromPLSMiles) {
        this.distanceFromPLSMiles = distanceFromPLSMiles;
        return true;
    }

    getSubjectFoundTerrainFeatures() {
        return this.subjectFoundTerrainFeatures;
    }

    setSubjectFoundTerrainFeatures(subjectFoundTerrainFeatures) {
        this.subjectFoundTerrainFeatures = subjectFoundTerrainFeatures;
        return true;
    }

    getLpElevationChangeFt() {
        return this.lpElevationChangeFt;
    }

    setLpElevationChangeFt(lpElevationChangeFt) {
        this.lpElevationChangeFt = lpElevationChangeFt;
        return true;
    }

    getTrackOffsetYards() {
        return this.trackOffsetYards;
    }

    setTrackOffsetYards(trackOffsetYards) {
        this.trackOffsetYards = trackOffsetYards;
        return true;
    }

    getPopulationDensity() {
        return this.populationDensity;
    }

    setPopulationDensity(populationDensity) {
        this.populationDensity = populationDensity;
        return true;
    }

    getFindCoordinates() {
        return this.findCoordinates;
    }

    setFindCoordinates(findCoordinates) {
        this.findCoordinates = findCoordinates;
        return true;
    }

    getPrecipitation() {
        return this.precipitation;
    }

    setPrecipitation(precipitation) {
        this.precipitation = precipitation;
        return true;
    }

    getPrecipitationInches() {
        return this.precipitationInches;
    }

    setPrecipitationInches(precipitationInches) {
        this.precipitationInches = precipitationInches;
    }

    getHighTempWhileLostDegrees() {
        return this.highTempWhileLostDegrees;
    }

    setHighTempWhileLostDegrees(highTempWhileLostDegrees) {
        this.highTempWhileLostDegrees = highTempWhileLostDegrees;
        return true;
    }

    getLowTempWhileLostDegrees() {
        return this.lowTempWhileLostDegrees;
    }

    setLowTempWhileLostDegrees(lowTempWhileLostDegrees) {
        this.lowTempWhileLostDegrees = lowTempWhileLostDegrees;
        return true;
    }

    getSubjectFoundMethod() {
        return this.subjectFoundMethod;
    }

    setSubjectFoundMethod(subjectFoundMethod) {
        this.subjectFoundMethod = subjectFoundMethod;
        return true;
    }

    getTechnicalProblemsWithTool() {
        return this.technicalProblemsWithTool;
    }

    setTechnicalProblemsWithTool(technicalProblemsWithTool) {
        this.technicalProblemsWithTool = technicalProblemsWithTool;
        return true;
    }

    getMotionModelChoiceExplanation() {
        return this.motionModelChoiceExplanation;
    }

    setMotionModelChoiceExplanation(motionModelChoiceExplanation) {
        this.motionModelChoiceExplanation = motionModelChoiceExplanation;
        return true;
    }

    getSearchAfterActionReports() {
        return this.searchAfterActionReports;
    }

    setSearchAfterActionReports(searchAfterActionReports) {
        this.searchAfterActionReports = searchAfterActionReports;
        return true;
    }

    getAdditionalToolFeedback() {
        return this.additionalToolFeedback;
    }

    setAdditionalToolFeedback(additionalToolFeedback) {
        this.additionalToolFeedback = additionalToolFeedback;
        return true;
    }

    getHoursSubjectMobile() {
        return this.hoursSubjectMobile;
    }

    setHoursSubjectMobile(hoursSubjectMobile) {
        this.hoursSubjectMobile = hoursSubjectMobile;
        return true;
    }

    getLpiLocationEstimates() {
        return this.lpiLocationEstimates;
    }

    setLpiLocationEstimates(lpiLocationEstimates) {
        this.lpiLocationEstimates = lpiLocationEstimates;
        return true;
    }

    getBehaviorWhileLostList() {
        return this.behaviorWhileLostList;
    }

    setBehaviorWhileLostList(behaviorWhileLostList) {
        this.behaviorWhileLostList = behaviorWhileLostList;

        let ret = true;
        if(Array.isArray(behaviorWhileLostList)){
            let i;
            for(i=0; i<behaviorWhileLostList.length; i++){
                switch(behaviorWhileLostList[i]){
                    case BehaviorWhileLost.APPROACHING:
                    case BehaviorWhileLost.EVADING:
                    case BehaviorWhileLost.RUNNING:
                    case BehaviorWhileLost.WALKING:
                    case BehaviorWhileLost.TAKING_SHELTER:
                        break;
                    default:
                        ret = false;
                        console.log("behvior while lost category : " + behaviorWhileLostList[i]);
                }
            }
        }else{
            ret = false;
        }

        if(ret){
            this.behaviorWhileLostList = behaviorWhileLostList;
        }

        return ret;
    }

    getBehaviorWhileLostOther() {
        return this.behaviorWhileLostOther;
    }

    setBehaviorWhileLostOther(behaviorWhileLost) {
        this.behaviorWhileLostOther = behaviorWhileLost;
        return true;
    }

    getMilitaryOrHikingTraining() {
        return this.militaryOrHikingTraining;
    }

    setMilitaryOrHikingTraining(militaryOrHikingTraining) {
        this.militaryOrHikingTraining = militaryOrHikingTraining;
        return true;
    }

    getDeltaTimeLost() {
        return this.deltaTimeLost;
    }

    setDeltaTimeLost(deltaTimeLost) {
        this.deltaTimeLost = deltaTimeLost;
        return true;
    }
}

const SweepWidthAccuracy = {
    MUCH_SMALLER: 'MUCH_SMALLER',
    SMALLER: 'SMALLER',
    SAME: 'SAME',
    LARGER: 'LARGER',
    MUCH_LARGER: 'MUCH_LARGER'
}

class SearchAfterActionReport {
    constructor() {
        this.searchId = null;
        this.sweepWidthAccuracy = null;
        this.searchTimeHrs = null;
        this.completedSearchRationale = null;
        this.sweepWidthAccuracyFreeText = null;
    }

    getSearchId() {
        return this.searchId;
    }

    setSearchId(searchId) {
        this.searchId = searchId;
        return true;
    }

    getSweepWidthAccuracy() {
        return this.sweepWidthAccuracy;
    }

    setSweepWidthAccuracy(sweepWidthAccuracy) {
        this.sweepWidthAccuracy = sweepWidthAccuracy;
        return true;
    }

    getSweepWidthAccuracyFreeText() {
        return this.sweepWidthAccuracyFreeText;
    }

    setSweepWidthAccuracyFreeText(sweepWidthAccuracyFreeText) {
        this.sweepWidthAccuracyFreeText = sweepWidthAccuracyFreeText;
        return true;
    }

    getSearchTimeHrs() {
        return this.searchTimeHrs;
    }

    setSearchTimeHrs(searchTimeHrs) {
        this.searchTimeHrs = searchTimeHrs;
        return true;
    }

    getCompletedSearchRationale() {
        return this.completedSearchRationale;
    }

    setCompletedSearchRationale(completedSearchRationale) {
        this.completedSearchRationale = completedSearchRationale;
        return true;
    }
}

const HeightCategory = {
    UNDER_FOUR: 'UNDER_FOUR',
    FOUR_TO_FIVE: 'FOUR_TO_FIVE',
    FIVE_TO_SIX: 'FIVE_TO_SIX',
    OVER_SIX: 'OVER_SIX'
}

const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER'
}

const ItemsInLoad = {
    COMPASS: 'COMPASS',
    FOOD: 'FOOD',
    MAP: 'MAP',
    CELL_PHONE: 'CELL_PHONE',
    FLASHLIGHT: 'FLASHLIGHT',
    COLD_GEAR: 'COLD_GEAR',
    CAMPING_HIKING_GEAR: 'CAMPING_HIKING_GEAR',
    OTHER: 'OTHER',
    FLARES: 'FLARES',
    WHISTLE: "WHISTLE"
}

const SubjectCategory = {
    OUTDOORSMAN: 'OUTDOORSMAN',
    ATHLETE: 'ATHLETE',
    ALTERED_MENTAL_STATE: 'ALTERED_MENTAL_STATE',
    CHILD: 'CHILD',
    FLEEING: 'FLEEING',
    OTHER: 'OTHER'
}

const Outdoorsman = {
    HIKER: 'HIKER',
    HUNTER: 'HUNTER',
    MUSHROOM_PICKER: 'MUSHROOM_PICKER'
}

const Athlete = {
    MOUNTAIN_BIKER: 'MOUNTAIN_BIKER',
    ALPINE_SKIER: 'ALPINE_SKIER',
    NORDIC_SKIER: 'NORDIC_SKIER',
    SNOWBOARDER: 'SNOWBOARDER',
    HORSEBACK_RIDER: 'HORSEBACK_RIDER'
}

const AlteredMentalState = {
    ALZHEIMERS: 'ALZHEIMERS',
    DEMENTIA: 'DEMENTIA',
    INTELLECTUAL_DISABILITY: 'INTELLECTUAL_DISABILITY',
    PSYCHOTIC: 'PSYCHOTIC',
    DESPONDENT: 'DESPONDENT',
    AUTISM: 'AUTISM',
    INTOXICATION: 'INTOXICATION',
    HEAD_INJURY: 'HEAD_INJURY',
    CHILD: 'CHILD',
    FLEEING: 'FLEEING',
    OTHER: 'OTHER'
}

const Age = {
    UNDER_FOUR: 'UNDER_FOUR',
    FOUR_TO_SIX: 'FOUR_TO_SIX',
    SEVEN_TO_NINE: 'SEVEN_TO_NINE',
    TEN_TO_TWELVE: 'TEN_TO_TWELVE',
    THIRTEEN_TO_FIFTEEN: 'THIRTEEN_TO_FIFTEEN',
    SIXTEEN_TO_EIGHTEEN: 'SIXTEEN_TO_EIGHTEEN',
    NINETEEN_TO_TWENTYONE: 'NINETEEN_TO_TWENTYONE',
    TWENTYTWO_TO_TWENTYFIVE: 'TWENTYTWO_TO_TWENTYFIVE',
    TWENTYSIX_TO_TWENTYNINE: 'TWENTYSIX_TO_TWENTYNINE',
    THIRTY_TO_THIRTYFOUR: 'THIRTY_TO_THIRTYFOUR',
    THIRTYFIVE_TO_THIRTYNINE: 'THIRTYFIVE_TO_THIRTYNINE',
    FORTY_TO_FORTYFOUR: 'FORTY_TO_FORTYFOUR',
    FORTYFIVE_TO_FORTYNINE: 'FORTYFIVE_TO_FORTYNINE',
    FIFTY_TO_FIFTYFOUR: 'FIFTY_TO_FIFTYFOUR',
    FIFTYFIVE_TO_FIFTYNINE: 'FIFTYFIVE_TO_FIFTYNINE',
    SIXTY_TO_SIXTYFOUR: 'SIXTY_TO_SIXTYFOUR',
    SIXTYFIVE_TO_SIXTYNINE: 'SIXTYFIVE_TO_SIXTYNINE',
    SEVENTY_TO_SEVENTYFOUR: 'SEVENTY_TO_SEVENTYFOUR',
    SEVENTYFIVE_TO_SEVENTYNINE: 'SEVENTYFIVE_TO_SEVENTYNINE',
    EIGHTY_PLUS: 'EIGHTY_PLUS'
}

class UpFrontLostPersonInfo {
    constructor() {
        this.height;
        this.gender;
        this.itemsInLoad;
        this.subjectCategory;
        this.subcategoryOutdoorsman;
        this.subcategoryAthlete;
        this.subcategoryAlteredMentalState;
        this.age;
        this.itemsInLoadOther;
        this.emotionalStateDescription = [];
        this.emotionalStateOther = null;
    }

    getHeight() {
        return this.height;
    }

    setHeight(height) {
        let ret = false;
        switch (height) {
            case HeightCategory.UNDER_FOUR:
            case HeightCategory.FOUR_TO_FIVE:
            case HeightCategory.FIVE_TO_SIX:
            case HeightCategory.OVER_SIX:
                this.height = layerSettings.unitMeasurementSystem === UNIT_MEASUREMENT_SYSTEMS.METRIC
                    ? height : feetToM(height);
                ret = true;
                break;
            default:
                console.log("Invalid height: " + height);
        }
        return ret;
    }

    getGender() {
        return this.gender;
    }

    setGender(gender) {
        var ret = false;
        switch (gender) {
            case Gender.MALE:
            case Gender.FEMALE:
            case Gender.OTHER:
                this.gender = gender;
                ret = true;
                break;
            default:
                console.log("Invalid gender: " + gender);
        }
        return ret;
    }

    getItemsInLoad() {
        return this.itemsInLoad;
    }

    setItemsInLoad(itemsInLoad) {
        let ret = true;
        if(Array.isArray(ItemsInLoad)){
            let i;
            for(i=0; i<ItemsInLoad.length; i++){
                switch(ItemsInLoad[i]){
                    case ItemsInLoad.CAMPING_HIKING_GEAR:
                    case ItemsInLoad.CELL_PHONE:
                    case ItemsInLoad.COLD_GEAR:
                    case ItemsInLoad.COMPASS:
                    case ItemsInLoad.FOOD:
                    case ItemsInLoad.MAP:
                    case ItemsInLoad.FLASHLIGHT:
                    case ItemsInLoad.FLARES:
                    case ItemsInLoad.WHISTLE:
                    case ItemsInLoad.OTHER:
                        break;
                    default:
                        ret = false;
                        console.log("Invalid item in load category: " + itemsInLoad);
                }
            }
        }else{
            ret = false;
        }

        if(ret){
            this.itemsInLoad = itemsInLoad;
        }

        return ret;
    }

    setItemsInLoadOther(itemsInLoadOther) {
        var ret = true;
        this.itemsInLoadOther = itemsInLoadOther;

        return ret;
    }

    getItemsInLoadOther(){
        return this.itemsInLoadOther;
    }

    getSubjectCategory() {
        return this.subjectCategory;
    }

    setSubjectCategory(subjectCategory) {
        var ret = false;
        switch (subjectCategory) {
            case SubjectCategory.OUTDOORSMAN:
            case SubjectCategory.ATHLETE:
            case SubjectCategory.ALTERED_MENTAL_STATE:
            case SubjectCategory.CHILD:
            case SubjectCategory.FLEEING:
            case SubjectCategory.OTHER:
                this.subjectCategory = subjectCategory;
                ret = true;
                break;
            default:
                console.log("Invalid subject category: " + subjectCategory);
        }
        return ret;
    }

    getSubcategoryOutdoorsman() {
        return this.subcategoryOutdoorsman;
    }

    setSubcategoryOutdoorsman(subcategoryOutdoorsman) {
        var ret = false;
        switch (subcategoryOutdoorsman) {
            case Outdoorsman.HIKER:
            case Outdoorsman.HUNTER:
            case Outdoorsman.MUSHROOM_PICKER:
                this.subcategoryOutdoorsman = subcategoryOutdoorsman;
                ret = true;
                break;
            default:
                console.log("Invalid subcategory: " + subcategoryOutdoorsman);
        }
        return ret;
    }

    getSubcategoryAthlete() {
        return this.subcategoryAthlete;
    }

    setSubcategoryAthlete(subcategoryAthlete) {
        var ret = false;
        switch (subcategoryAthlete) {
            case Athlete.MOUNTAIN_BIKER:
            case Athlete.ALPINE_SKIER:
            case Athlete.NORDIC_SKIER:
            case Athlete.SNOWBOARDER:
            case Athlete.HORSEBACK_RIDER:
                this.subcategoryAthlete = subcategoryAthlete;
                ret = true;
                break;
            default:
                console.log("Invalid subcategory: " + subcategoryAthlete);
        }
        return ret;
    }

    getSubcategoryAlteredMentalState() {
        return this.subcategoryAlteredMentalState;
    }

    setSubcategoryAlteredMentalState(subcategoryAlteredMentalState) {
        let ret = false;
        switch (subcategoryAlteredMentalState) {
            case AlteredMentalState.ALZHEIMERS:
            case AlteredMentalState.DEMENTIA:
            case AlteredMentalState.INTELLECTUAL_DISABILITY:
            case AlteredMentalState.PSYCHOTIC:
            case AlteredMentalState.DESPONDENT:
            case AlteredMentalState.AUTISM:
            case AlteredMentalState.INTOXICATION:
            case AlteredMentalState.HEAD_INJURY:
            case AlteredMentalState.CHILD:
            case AlteredMentalState.FLEEING:
            case AlteredMentalState.OTHER:
                this.subcategoryAlteredMentalState = subcategoryAlteredMentalState;
                ret = true;
                break;
            default:
                console.log("Invalid subcategory: " + subcategoryAlteredMentalState);
        }
        return ret;
    }

    getAge() {
        return this.age;
    }

    setAge(age) {
        let ret = false;
        switch (age) {
            case Age.UNDER_FOUR:
            case Age.FOUR_TO_SIX:
            case Age.SEVEN_TO_NINE:
            case Age.TEN_TO_TWELVE:
            case Age.THIRTEEN_TO_FIFTEEN:
            case Age.SIXTEEN_TO_EIGHTEEN:
            case Age.NINETEEN_TO_TWENTYONE:
            case Age.TWENTYTWO_TO_TWENTYFIVE:
            case Age.TWENTYSIX_TO_TWENTYNINE:
            case Age.THIRTY_TO_THIRTYFOUR:
            case Age.THIRTYFIVE_TO_THIRTYNINE:
            case Age.FORTY_TO_FORTYFOUR:
            case Age.FORTYFIVE_TO_FORTYNINE:
            case Age.FIFTY_TO_FIFTYFOUR:
            case Age.FIFTYFIVE_TO_FIFTYNINE:
            case Age.SIXTY_TO_SIXTYFOUR:
            case Age.SIXTYFIVE_TO_SIXTYNINE:
            case Age.SEVENTY_TO_SEVENTYFOUR:
            case Age.SEVENTYFIVE_TO_SEVENTYNINE:
            case Age.EIGHTY_PLUS:
                this.age = age;
                ret = true;
                break;
            default:
                console.log("Invalid age: " + age);
        }
        return ret;
    }

    getEmotionalStateDescription() {
        return this.emotionalStateDescription;
    }

    setEmotionalStateDescription(emotionalStateDescriptionList) {
        let ret = true;
        if(Array.isArray(emotionalStateDescriptionList)){
            let i;
            for(i=0; i<emotionalStateDescriptionList.length; i++){
                switch(emotionalStateDescriptionList[i]){
                    case EmotionalStateDescription.CALM:
                    case EmotionalStateDescription.HOLDING_TOGETHER_SOMEWHAT:
                    case EmotionalStateDescription.PANICKED:
                        break;
                    default:
                        ret = false;
                        console.log("Invalid emotional state description category : " + emotionalStateDescriptionList[i]);
                }
            }
        }else{
            ret = false;
        }

        if(ret){
            this.emotionalStateDescription = emotionalStateDescriptionList;
        }

        return ret;
    }

    getEmotionalStateOther() {
        return this.emotionalStateOther;
    }

    setEmotionalStateOther(value) {
        this.emotionalStateOther = value;
    }
}

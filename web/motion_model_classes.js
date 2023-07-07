const GEOSPATIAL_DATATYPE = {
    EXCLUSION_ZONE: "EXCLUSION_ZONE",
    POLYGON_EXCLUSIONS: "POLYGON_EXCLUSIONS",
    GOAL_POINTS: "GOAL_POINTS",
    WAY_POINTS: "WAY_POINTS",
}

class MotionModelGeospatialDescription{
    _type = null;
    _required = null;

    /**
     *
     * @param type GEOSPATIAL_DATATYPE
     * @param required boolean
     */
    constructor(type, required) {
        this._type = type;
        this._required = required;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get required() {
        return this._required;
    }

    set required(value) {
        this._required = value;
    }
}

/**
 * Motion Model Attribute Description
 *
 * attribute description for a motion model
 */
class MotionModelAttrDescription {
    _name = null;
    _description = null;
    _required = null;
    _type = null;
    _dataUnit = null;

    constructor(name, description, required, type, dataUnit) {
        this._name = name;
        this._description = description;
        this._required = required;
        this._dataUnit = dataUnit;
        this._type = type;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
    }

    get required() {
        return this._required;
    }

    set required(value) {
        this._required = value;
    }

    get dataUnit() {
        return this._dataUnit;
    }

    set dataUnit(value) {
        this._dataUnit = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
}


/**
 * Motion Model Attribute Inputs
 *
 * includes inputs for a motion model
 */
class MotionModelInputs{
    _name = null;
    _motionModelDescriptions = [];
    _motionModelGeospatialDescriptions = [];
    _landcoverMetadataEnabled = true;
    _stayOutOfWaterEnabled = true;

    constructor(name, motionModelDescriptions, motionModelGeospatialDescriptions,
            landcoverMetadataEnabled, stayOutOfWaterEnabled) {
        this._name = name;
        this._motionModelDescriptions = motionModelDescriptions;
        this._motionModelGeospatialDescriptions = motionModelGeospatialDescriptions;
        this._landcoverMetadataEnabled = landcoverMetadataEnabled;
        this._stayOutOfWaterEnabled = stayOutOfWaterEnabled;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get motionModelDescriptions() {
        return this._motionModelDescriptions;
    }

    set motionModelDescriptions(value) {
        this._motionModelDescriptions = value;
    }

    get motionModelGeospatialDescriptions() {
        return this._motionModelGeospatialDescriptions;
    }

    set motionModelGeospatialDescriptions(value) {
        this._motionModelGeospatialDescriptions = value;
    }

    get landcoverMetadataEnabled() {
        return this._landcoverMetadataEnabled;
    }

    set landcoverMetadataEnabled(value) {
        this._landcoverMetadataEnabled = value;
    }

    get stayOutOfWaterEnabled() {
        return this._stayOutOfWaterEnabled;
    }

    set stayOutOfWaterEnabled(value) {
        this._stayOutOfWaterEnabled = value;
    }
}

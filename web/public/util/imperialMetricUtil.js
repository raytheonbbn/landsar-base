const UNIT_MEASUREMENT_SYSTEMS = {
    IMPERIAL: "Imperial (US)",
    METRIC: "Metric",
}

// Taken from https://www.unitconverters.net/
const LB_KG_CONV_RATIO = 2.2046226218;
const KM_TO_MPH_RATIO = 0.6213711922;
const KM_TO_FEET_RATIO = 3280.839895;
const M_TO_FEET_RATIO = 3.280839895;
const KM_TO_MILES_RATIO = 0.6213711922;
const METERS_PER_MSEC_KPH_RATIO = 3600;
const METERS_PER_MSEC_MPH_RATIO = 2236.9362921;
const YARD_TO_METER_RATIO = 0.9144;
const INCHES_TO_CENTIMETERS_RATIO = 2.54;
const CELSIUS_TO_FAHRENHEIT_CONST = 32;
const MPH_TO_M_PER_SEC_CONST = 0.44704;
const KPH_TO_M_PER_SEC_CONST = 0.277778

const PRECISION_ROUND_DECIMAL_PLACES = 3

// see lbsOrKgUnit CSS class
const LBS_LABEL = "lbs"
const KG_LABEL = "kg"

// see mphOrKphUnits CSS class
const MPH_LABEL = "mph"
const KPH_LABEL = "kph"

// see feetOrKMUnits CSS class
const FEET_LABEL = "feet"
const KM_LABEL = "km"

// see metersOrFeetUnits CSS class
const M_LABEL = "meters"

// metersOrYardsUnits
const YARD_LABEL = "yards"

// see milesOrKMUnits CSS class
const MILE_LABEL = "mi"

// see inchesOrCMUnits CSS class
const INCH_LABEL = "inches"
const CM_LABEL = "cm"

// see celsiusOrFahrenheitUnits CSS class
const CELSIUS_LABEL = "Celsius"
const FAHRENHEIT_LABEL = "Fahrenheit"

const MILES_TO_FEET_RATIO = 5280;
const KM_M_RATIO = 1000;

mphToKph = function (mphVal) {
    return round(mphVal / KM_TO_MPH_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

kphToMph = function (kphVal) {
    return round(kphVal * KM_TO_MPH_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

lbsToKg = function (lbsVal) {
    return round(lbsVal / LB_KG_CONV_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

kgToLbs = function (kgVal) {
    return round(kgVal * LB_KG_CONV_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

kmToFeet = function (kmVal) {
    return round(kmVal * KM_TO_FEET_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

feetToKm = function (feetVal) {
    return round(feetVal / KM_TO_FEET_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

mToFeet = function (mVal) {
    return round(mVal * M_TO_FEET_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

feetToM = function (feetVal) {
    return round(feetVal / M_TO_FEET_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

kmToMiles = function (kmVal) {
    return round(kmVal * KM_TO_MILES_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

milesToKm = function (milesVal) {
    return round(milesVal / KM_TO_MILES_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

milesToFeet = function (milesVal) {
    return round(milesVal * MILES_TO_FEET_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

kmToMeters = function (kmVal) {
    return round(kmVal * KM_M_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

metersPerMsecToKPH = function(metersPerMsec){
    return round(metersPerMsec * METERS_PER_MSEC_KPH_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

metersPerMsecToMPH = function (metersPerMsec){
    return round(metersPerMsec * METERS_PER_MSEC_MPH_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

yardToMeters = function (yardVal){
    return round(yardVal * YARD_TO_METER_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

metersToYard = function (metersVal){
    return round(metersVal / YARD_TO_METER_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

cmToInches = function (cmVal){
    return round(cmVal / INCHES_TO_CENTIMETERS_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

inToCM = function (inVal){
    return round(inVal * INCHES_TO_CENTIMETERS_RATIO, PRECISION_ROUND_DECIMAL_PLACES);
}

celsiusToFahrenheit = function (celsius){
    return round((celsius * 9 / 5) + CELSIUS_TO_FAHRENHEIT_CONST, PRECISION_ROUND_DECIMAL_PLACES)
}

fToCelsius = function (f){
    return round(((f - 32) * 5 / 9), PRECISION_ROUND_DECIMAL_PLACES)
}

mphToMetersPerSec = function(milesPerHVal){
    return round(milesPerHVal * MPH_TO_M_PER_SEC_CONST, PRECISION_ROUND_DECIMAL_PLACES)
}

kphToMetersPerSec = function(kmPerHVal){
    return round(kmPerHVal * KPH_TO_M_PER_SEC_CONST, PRECISION_ROUND_DECIMAL_PLACES)
}
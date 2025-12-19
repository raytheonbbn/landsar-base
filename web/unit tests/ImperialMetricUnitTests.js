/**
 * To run these tests, run UnitTests.html in web browser
 */

QUnit.test( "equal test", function( assert ) {

    // mph to kph
    assert.deepEqual(mphToKph(1),
        1.609);
    assert.deepEqual(mphToKph(26.3),
        42.326)
    assert.deepEqual(mphToKph(-26.3),
        -42.326)
    assert.deepEqual(mphToKph(0),
        0)

    // kph to mph
    assert.deepEqual(kphToMph(1),
        0.621);
    assert.deepEqual(kphToMph(26.3),
        16.342)
    assert.deepEqual(kphToMph(-26.3),
        -16.342)
    assert.deepEqual(kphToMph(0),
        0)

    // lbs to kg
    assert.deepEqual(lbsToKg(1),
        0.454);
    assert.deepEqual(lbsToKg(26.3),
        11.929)
    assert.deepEqual(lbsToKg(-26.3),
        -11.929)
    assert.deepEqual(lbsToKg(0),
        0)

    // kg to lbs
    assert.deepEqual(kgToLbs(1),
        2.205);
    assert.deepEqual(kgToLbs(26.3),
        57.982)
    assert.deepEqual(kgToLbs(-26.3),
        -57.982)
    assert.deepEqual(kgToLbs(0),
        0)

    // km to feet
    assert.deepEqual(kmToFeet(1),
        3280.84);
    assert.deepEqual(kmToFeet(26.3),
        86286.089)
    assert.deepEqual(kmToFeet(-26.3),
        -86286.089)
    assert.deepEqual(kmToFeet(0),
        0)

    // feet to km
    assert.deepEqual(feetToKm(1),
        0);
    assert.deepEqual(feetToKm(26.3),
        0.008)
    assert.deepEqual(feetToKm(-26.3),
        -0.008)
    assert.deepEqual(feetToKm(0),
        0)

    // meters to feet
    assert.deepEqual(mToFeet(1),
        3.281);
    assert.deepEqual(mToFeet(26.3),
        86.286)
    assert.deepEqual(mToFeet(-26.3),
        -86.286)
    assert.deepEqual(mToFeet(0),
        0)

    // feet to meters
    assert.deepEqual(feetToM(1),
        0.305);
    assert.deepEqual(feetToM(26.3),
        8.016)
    assert.deepEqual(feetToM(-26.3),
        -8.016)
    assert.deepEqual(feetToM(0),
        0)

    // km to miles
    assert.deepEqual(kmToMiles(1),
        0.621);
    assert.deepEqual(kmToMiles(26.3),
        16.342)
    assert.deepEqual(kmToMiles(-26.3),
        -16.342)
    assert.deepEqual(kmToMiles(0),
        0)

    // miles to km
    assert.deepEqual(milesToKm(1),
        1.609);
    assert.deepEqual(milesToKm(26.3),
        42.326)
    assert.deepEqual(milesToKm(-26.3),
        -42.326)
    assert.deepEqual(milesToKm(0),
        0)

    // meters per msec to KPH
    assert.deepEqual(metersPerMsecToKPH(1),
        3600);
    assert.deepEqual(metersPerMsecToKPH(26.3),
        94680)
    assert.deepEqual(metersPerMsecToKPH(-26.3),
        -94680)
    assert.deepEqual(metersPerMsecToKPH(0),
        0)

    // meters per msec to MPH
    assert.deepEqual(metersPerMsecToMPH(1),
        2236.936);
    assert.deepEqual(metersPerMsecToMPH(26.3),
        58831.424)
    assert.deepEqual(metersPerMsecToMPH(-26.3),
        -58831.424)
    assert.deepEqual(metersPerMsecToMPH(0),
        0)

    // yard to meters
    assert.deepEqual(yardToMeters(1),
        0.914);
    assert.deepEqual(yardToMeters(26.3),
        24.049)
    assert.deepEqual(yardToMeters(-26.3),
        -24.049)
    assert.deepEqual(yardToMeters(0),
        0)

    // meters to yards
    assert.deepEqual(metersToYard(1),
        1.094);
    assert.deepEqual(metersToYard(26.3),
        28.762)
    assert.deepEqual(metersToYard(-26.3),
        -28.762)
    assert.deepEqual(metersToYard(0),
        0)

    // cm to inches
    assert.deepEqual(cmToInches(1),
        0.394);
    assert.deepEqual(cmToInches(26.3),
        10.354)
    assert.deepEqual(cmToInches(-26.3),
        -10.354)
    assert.deepEqual(cmToInches(0),
        0)

    // celsius to fahrenheit
    assert.deepEqual(celsiusToFahrenheit(1),
        33.8);
    assert.deepEqual(celsiusToFahrenheit(26.3),
        79.34)
    assert.deepEqual(celsiusToFahrenheit(-26.3),
        -15.34)
    assert.deepEqual(celsiusToFahrenheit(0),
        32)

    // mph to m per sec
    assert.deepEqual(mphToMetersPerSec(1),
        0.447);
    assert.deepEqual(mphToMetersPerSec(26.3),
        11.757)
    assert.deepEqual(mphToMetersPerSec(-26.3),
        -11.757)
    assert.deepEqual(mphToMetersPerSec(0),
        0)

    // kph to m per sec
    assert.deepEqual(kphToMetersPerSec(1),
        0.278);
    assert.deepEqual(kphToMetersPerSec(26.3),
        7.306)
    assert.deepEqual(kphToMetersPerSec(-26.3),
        -7.306)
    assert.deepEqual(kphToMetersPerSec(0),
        0)

    // miles to feet
    assert.deepEqual(milesToFeet(1),
        5280);
    assert.deepEqual(milesToFeet(26.3),
        138864)
    assert.deepEqual(milesToFeet(-26.3),
        -138864)
    assert.deepEqual(milesToFeet(0),
        0)

    // km to meters
    assert.deepEqual(kmToMeters(1),
        1000);
    assert.deepEqual(kmToMeters(26.3),
        26300)
    assert.deepEqual(kmToMeters(-26.3),
        -26300)
    assert.deepEqual(kmToMeters(0),
        0)

});

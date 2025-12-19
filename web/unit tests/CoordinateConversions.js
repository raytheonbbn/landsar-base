/**
 * To run these tests, run UnitTests.html in web browser
 */

function testDMSConversion(lat, lon) {
    lon_values = deg_to_dms(lon, false);
    lon_degrees = lon_values[0];
    lon_minutes = lon_values[1];
    lon_seconds = lon_values[2];

    lat_values = deg_to_dms(lat, false);
    lat_degrees = lat_values[0];
    lat_minutes = lat_values[1];
    lat_seconds = lat_values[2];

    return [dms_to_dd(lat_degrees, lat_minutes, lat_seconds),
        dms_to_dd(lon_degrees, lon_minutes, lon_seconds)]
}

function testDDMConversion(lat, lon) {
    lon_values = deg_to_decimal_minutes(lon, false);
    lon_degrees = lon_values[0];
    lon_minutes = lon_values[1];

    lat_values = deg_to_decimal_minutes(lat, false);
    lat_degrees = lat_values[0];
    lat_minutes = lat_values[1];

    return [ddm_to_dd(lat_degrees, lat_minutes),
        ddm_to_dd(lon_degrees, lon_minutes)]
}

function testUTMConversion(lat, lon) {
    coordinate = new Latlon_Utm_Mgrs(lat, lon).toUtm();

    return[coordinate.toLatLon().lat, coordinate.toLatLon().lng];
}

function testUSNG_MGRSConversion(lat, lon) {
    coordinate = new Latlon_Utm_Mgrs(lat, lon).toUtm().toMgrs();

    return[coordinate.toUtm().toLatLon().lat, coordinate.toUtm().toLatLon().lng];
}
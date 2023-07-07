/* from https://stackoverflow.com/questions/5786025/decimal-degrees-to-degrees-minutes-and-seconds-in-javascript
This is the pseudocode you need to follow:
 * It's a modified version from
 * http://en.wikipedia.org/wiki/Geographic_coordinate_conversion#Conversion_from_Decimal_Degree_to_DMS

function deg_to_dms ( degfloat )
   Compute degrees, minutes and seconds:
   deg ← integerpart ( degfloat )
   minfloat ← 60 * ( degfloat - deg )
   min ← integerpart ( minfloat )
   secfloat ← 60 * ( minfloat - min )
   Round seconds to desired accuracy:
   secfloat ← round( secfloat, digits )
   After rounding, the seconds might become 60. These two
   if-tests are not necessary if no rounding is done.
   if secfloat = 60
      min ← min + 1
      secfloat ← 0
   end if
   if min = 60
      deg ← deg + 1
      min ← 0
   end if
   Return output:
   return ( deg, min, secfloat )
end function
*/

function deg_to_dms (deg, returnAsFormattedString) {
    let mult = 1;
    if (deg < 0){
        mult = -1;
        deg = Math.abs(deg);
    }
    var d = Math.floor (deg);
    var minfloat = (deg-d)*60;
    var m = Math.floor(minfloat);
    var secfloat = (minfloat-m)*60;
    var s = Math.round(secfloat);
    // After rounding, the seconds might become 60. These two
    // if-tests are not necessary if no rounding is done.
    if (s===60) {
        m++;
        s=0;
    }
    if (m===60) {
        d++;
        m=0;
    }
    d = mult * d;

    if(returnAsFormattedString) {
        return ("" + d + "&deg;" + m + "'" + s + "\"");
    }else{
        return [d, m, s];
    }
}


function dms_to_dd(degrees, minutes, seconds) {
    let mult = 1;
    if (degrees < 0){
        mult = -1;
        degrees = Math.abs(degrees);
    }
    var val = degrees + minutes / 60 + seconds / 3600;
    // distribute the negative, if necessary
    return mult * Math.round(10000 * val) / 10000
}


function deg_to_decimal_minutes (deg, returnAsFormattedString) {
    let mult = 1;
    if (deg < 0){
        mult = -1;
        deg = Math.abs(deg);
    }
    var d = Math.floor (deg);
    var m = (deg-d)*60;
    // var m = Math.floor(minfloat);
    m=m.toFixed(4);
    // After rounding, the seconds might become 60. These two
    // if-tests are not necessary if no rounding is done.
    if (m>=60) {
        d++;
        m-=60;
    }
    // distribute the negative, if necessary
    d = mult*d;
    
    if(returnAsFormattedString) {
        return ("" + d + "&deg;" + m + "'");
    }else{
        return [d, m];
    }
}


function ddm_to_dd(degrees, minutes) {
    let mult = 1;
    if (degrees < 0){
        mult = -1;
        degrees = Math.abs(degrees);
    }
    // distribute the negative, if necessary
    return mult * (degrees + minutes / 60)
}

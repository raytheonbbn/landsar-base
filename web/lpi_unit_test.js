/*

bkalashi 3/23/2020

*/

minTime =  Math.pow(10, 1000);

function lpiSearchTimeUnitTest(){
    // get the last LPI created
    var lpi1 = lpis.lostPersonInstances[lpis.lostPersonInstances.length - 1];

    $.ajax("/webmap/servlet/?action=getSearchDetails&lpiID=" + lpi1.id).done(function( msg ) {
        if (msg == null || msg == undefined|| msg.length == 0) {
            console.log("Received empty message from getSearchDetails request");
            return;
        }

        console.log("Received search details for " + lpi1.id);
        console.log(msg);

        for(var i = 0; i < msg.length; i++) {
            searchDetails[msg[i].searchId] = msg[i];
            if(msg[i].time < minTime){
                minTime = msg[i].time;
                console.log("yes");
            }
            console.log(msg[i].time);
        }

        var time1 = new Date(lpi1.startTime);

        map.eachLayer(
            function (layer) {
                if (layer.finderInfo != undefined && layer.finderInfo.finderElementType == "search") {
                    if (layer.finderInfo.lpiID === lpi1.id) {
                        // ** otherwise show it if it is within the time range that is currently displayed
                        var beginDate = new Date(layer.finderInfo.begin);
                        var endDate = new Date(layer.finderInfo.end);

                        time2 = beginDate;
                    }
                }
            }
        );

        console.log("layer.finderInfo.begin: " + time2);
        console.log("time from getSearchDetails ajax request: " + new Date(minTime));
        console.log("lpi start time: " + time1);

        if(new Date(minTime) === time1){
            console.log("Passed!");
        }else{
            console.log("Failed!")
        }
    });


}

lpiSearchTimeUnitTest();
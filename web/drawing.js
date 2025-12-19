/**
 * @Summary
 * Contains the function calls used for drawing
 *
 * @author Devon Minor
 */


var lpInstance;
var searchInstance;
var item;

var lastLayer = null;

var MAX_BOUNDING_BOX_SIZE = 10000000000; // ** in square meters... This should allow 100km x 100km boxes

//instantiates these object listeners to be used globally
var pointDrawer = new L.Draw.CircleMarker(map);
var circleDrawer = new L.Draw.Circle(map);
var polylineDrawer = new L.Draw.Polyline(map);
var rectangleDrawer = new L.Draw.Rectangle(map);
var polygonDrawer = new L.Draw.Polygon(map);
var shapeFinished = false;

var layer;
var numberOfNonShapePointsDrawn = 0;

var completedPoints = false;

const Shapes = {
    POINT: "Point",
    CIRCLE: "Circle",
    POLYGON: "Polygon",
    POLYGONS: "Polygons",
    BOUNDING_BOX: "Bounding Box"
};

var pointDrawn = false;

function onDraw(e) {
    $("#pointContinue").prop( "disabled", false);

    if (numberOfNonShapePointsDrawn === 0) {
        $('#lkpPointContentHolder').empty();
        $('#lkpPointContentHolder').append("<br>");
    }
    showEditPointWarning(false)
    $('#pointContinue').prop('disabled', false);

    layer = e.layer;
    shapeFinished = true;

    console.log("draw created")

    if (item === BOUNDING_BOX) {
        if (lpInstance.getBoundingBoxUUID() != null) {
            drawnItems.removeLayer(lpInstance.getBoundingBoxUUID());
            lpInstance.setBoundingBoxUUID(null);
        }

        try {
            if (L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]) > MAX_BOUNDING_BOX_SIZE) {
                pointMenu.close();
                bootbox.alert("Bounding box too large, please confine area to be less than " + (MAX_BOUNDING_BOX_SIZE / 1000000) + " square kilometers");
                return;
            }
        } catch (exception) {

        }

        drawnItems.addLayer(layer);
        lpInstance.setBoundingBoxUUID(layer._leaflet_id);

        lpInputs.setBoundingBox(returnBoundingBox());

        pointMenu.open();

        addPointsListeners(layer.getLatLngs()[0], Shapes.BOUNDING_BOX, false, layer)
        completedPoints = true
        //placeConfirmButton(layer);
    } else if (item === "circleLKP" && containsPoints(drawnItems._layers[lpInstance.getBoundingBoxUUID()].getLatLngs()[0], circleToPolygon(layer.getLatLng(), layer.getRadius()))) {
        if (lpInstance.getLkpUUIDs() != null && lpInstance.getLkpUUIDs().length > 0) {
            drawnItems.removeLayer(lpInstance.getLkpUUIDs());
            lpInstance.lkpUUIDs.pop();
        }

        drawnItems.addLayer(layer);
        lpInstance.addLkpUUID(layer._leaflet_id);

        completedPoints = true;

        pointMenu.open();

        addPointsListeners([layer.getLatLng()], Shapes.CIRCLE, false, layer, item)
    } else if (item === "parachuteLKP" && containsPoints(drawnItems._layers[lpInstance.getBoundingBoxUUID()].getLatLngs()[0], layer.getLatLngs())) {
        if (lpInstance.getLkpUUIDs() != null && lpInstance.getLkpUUIDs().length > 0) {
            drawnItems.removeLayer(lpInstance.getLkpUUIDs());
            lpInstance.lkpUUIDs.pop();
        }
        drawnItems.addLayer(layer);
        lpInstance.addLkpUUID(layer._leaflet_id);

        //placeConfirmButton(layer);

        completedPoints = true;

        pointMenu.open();
        addPointsListeners([layer.getLatLng()]);

    } else if (item === "polygonLKP" && containsPoints(drawnItems._layers[lpInstance.getBoundingBoxUUID()].getLatLngs()[0], layer.getLatLngs()[0])) {

        if (lpInstance.getLkpUUIDs() != null && lpInstance.getLkpUUIDs().length > 0) {
            drawnItems.removeLayer(lpInstance.getLkpUUIDs());
            lpInstance.lkpUUIDs.pop();
        }
        drawnItems.addLayer(layer);
        lpInstance.addLkpUUID(layer._leaflet_id);

        completedPoints = true;

        pointMenu.open();

        addPointsListeners(layer.getLatLngs()[0], Shapes.POLYGON, false, layer, item)
    } else if (item === "pointLKP" && containsPoints(drawnItems._layers[lpInstance.getBoundingBoxUUID()].getLatLngs()[0], [layer.getLatLng()])) {

        if (lpInstance.getLkpUUIDs() != null && lpInstance.getLkpUUIDs().length > 0) {
            drawnItems.removeLayer(lpInstance.getLkpUUIDs());
            lpInstance.lkpUUIDs.pop();
        }

        drawnItems.addLayer(layer);
        lpInstance.addLkpUUID(layer._leaflet_id);

        console.log("lat: " + layer.getLatLng().lat);
        console.log("lon: " + layer.getLatLng().lng);

        pointMenu.open();

        addPointsListeners([layer.getLatLng()], Shapes.POINT, false, layer, item)
        completedPoints = true;
        //placeConfirmButton(layer);
    } else if ((item === RENDEZVOUS || item === GOAL_POINTS) && containsPoints(drawnItems._layers[lpInstance.getBoundingBoxUUID()].getLatLngs()[0], [layer.getLatLng()])) {
        drawnItems.addLayer(layer);
        lpInstance.addRendezvousPointUUID(layer._leaflet_id);
        //placeConfirmButton(layer);
        completedPoints = true;
        addPointsListeners([layer.getLatLng()], Shapes.POINT, true, layer, item, layer._leaflet_id)

        pointMenu.open();

    } else if ((item === "known") && containsPoints(drawnItems._layers[lpInstance.getBoundingBoxUUID()].getLatLngs()[0], circleToPolygon(layer.getLatLng(), layer.getRadius()))) {
        drawnItems.addLayer(layer);
        lpInstance.addKnownExclusionZoneUUID(layer._leaflet_id);
        //placeConfirmButton(layer);
        completedPoints = true;
        addPointsListeners([layer.getLatLng()], Shapes.CIRCLE, true, layer, item, layer._leaflet_id)

        pointMenu.open();

    } else if ((item === "knownPoly" || item === POLYGON_EXCLUSIONS) && containsPoints(drawnItems._layers[lpInstance.getBoundingBoxUUID()].getLatLngs()[0], layer.getLatLngs()[0])) {
        drawnItems.addLayer(layer);
        lpInstance.addPolyExclusionZoneUUID(layer._leaflet_id);
        //placeConfirmButton(layer);
        completedPoints = true;
        addPointsListeners(layer.getLatLngs()[0], Shapes.POLYGONS, false, layer, item, layer._leaflet_id)

        pointMenu.open();

    } else if (item === DISCOVERED && containsPoints(drawnItems._layers[lpInstance.getBoundingBoxUUID()].getLatLngs()[0], circleToPolygon(layer.getLatLng(), layer.getRadius()))) {
        drawnItems.addLayer(layer);
        lpInstance.addDiscoveredExclusionZoneUUID(layer._leaflet_id);
        completedPoints = true;
        addPointsListeners([layer.getLatLng()], Shapes.CIRCLE, true, layer, item, layer._leaflet_id)

        pointMenu.open();

    }
        //else if (item == COMPLETED && containsPoints(drawnItems._layers[lpInstance.getBoundingBoxUUID()].getLatLngs()[0], layer.getLatLngs()[0])) {
        // ** TODO: need to fix this - we're not appropriately populating lpInstance
        // ** TODO: it's  pushed into mapItems, but only if we create it directly before the search, and even then we're not accessing it right
    // ** TODO: we need to populate lpInstance whenever we load or create an LPI
    else if (item === COMPLETED) {
        if (searchInstance.getCompletedSearchUUID() != null)
            drawnItems.removeLayer(searchInstance.getCompletedSearchUUID());
        drawnItems.addLayer(layer);
        searchInstance.setCompletedSearchUUID(layer._leaflet_id);
        searchInstance.getSearchInputs().setCoordinates([layer.getLatLngs()[1], layer.getLatLngs()[3]]);
        placeConfirmButton(layer);
        pointMenu.open()
    } else {
        console.log("Not adding layer to LostPersonInstance");
        shapeFinished = false;

        showEditPointWarning(true, 'Please draw in bounding box');
        $('#pointContinue').prop('disabled', true);
        pointMenu.open()
    }

}

map.on('draw:canceled', function () {
    cancelDrawing()

    // This handles a weird case when the user hits escape while drawing and it escapes both the current drawing,
    // and the next drawing. To fix this, we detect when the escape button was released, then continue with processing
    // back button
    $(document).on('keyup', function cancelEvent(event) {
        if (event.key === "Escape") {
            $(this).off('keyup');
            //cancelNewLpi();
            $('.backPoint').click();
            pointDrawn = false;
        }
    });

});

function cancelDrawing(){
    console.log("called cancel")
    $("#confirmDraw").hide();
    stopDrawing();
    hideHelperText();
}

var hadIssueWithPoint = new Set();

/**
 * When passed the name of the item you want drawn
 * and the wrapper, this function calls one of the
 * below drawers to allow the user to begin drawing.
 *
 * @param    item
 * @param    lpInstance
 * @param    searchInstance
 *
 * @returns (the instance of what you want drawn)
 */
function drawItem(item, lpInstance, searchInstance) {
    console.log("draw item: " + item)
    completedPoints = false;
    numberOfNonShapePointsDrawn = 0;
    shapeFinished = false;
    if (measurementControl != undefined && measurementControl != null) {
        // ** turn off the measurement tool whenever drawing is initiated
        if (measurementControl._measuring) {
            measurementControl._toggleMeasure();
        }
    }
    this.item = item;
    this.lpInstance = lpInstance;
    this.searchInstance = searchInstance;
    switch (item) {
        case BOUNDING_BOX:
            return drawRectangle();
        case "circleLKP":
            return drawCircle('orange');
        case "polygonLKP":
            return drawPolygon('orange');
        case "parachuteLKP":
            return drawLine('orange');
        case "pointLKP":
            return drawPoint('orange');
        case RENDEZVOUS:
        case GOAL_POINTS:
            return drawPoint('green');
        case "known":
            return drawCircle('red');
        case "knownPoly":
        case POLYGON_EXCLUSIONS:
            return drawPolygon('red');
        case DISCOVERED:
            return drawCircle('yellow');
        case COMPLETED:
            return drawRectangle('blue');
        default:
            console.log("Can not draw " + item);
            return (item === COMPLETED ? searchInstance : lpInstance);
    }
}

function drawPolygon(c) {
    var options = {
        repeatMode: true,
        allowIntersection: false,
        drawError: {
            message: 'You can\'t draw that!'
        },
        shapeOptions: {
            color: setColor(c)
        },
        metric: ['km', 'm'],
        feet: false,
        fill: true
    };
    polygonDrawer.setOptions(options);
    polygonDrawer.enable();
    return drawCreated();
}

function drawRectangle(c) {
    var options = {
        repeatMode: true,
        shapeOptions: {
            color: setColor(c),
            fill: false
        },
        metric: ['km', 'm'],
        showLength: true,
        feet: false
    };
    rectangleDrawer.setOptions(options);
    rectangleDrawer.enable();
    return drawCreated();
}

function drawLine(c) {
    var options = {
        repeatMode: true,
        shapeOptions: {
            color: setColor(c)
        },
        maxPoints: 2,
        metric: ['km', 'm'],
        feet: false
    };
    polylineDrawer.setOptions(options);
    polylineDrawer.enable();
    return drawCreated();
}

function drawCircle(c) {
    var options = {
        shapeOptions: {
            color: setColor(c)
        },
        repeatMode: true,
        metric: ['km', 'm'],
        feet: false
    };
    circleDrawer.setOptions(options);
    circleDrawer.enable();
    return drawCreated();
}

function drawPoint(c) {
    var options = {
        color: setColor(c),
        repeatMode: true,
        metric: ['km', 'm'],
        feet: false
    };

    pointDrawer.setOptions(options);
    pointDrawer.enable();

    return drawCreated();
}

function setColor(color) {
    switch (color) {
        case "orange":
            return "#FF851B";
        case "green":
            return "#39b500";
        case "white":
            return "#969595";
        case "red":
            return "#ed0e0e";
        case "yellow":
            return "#ffe20a";
        case "blue":
            return "#1370eb";
        default:
            return "#969595";
    }
}

// ** if the map is zoomed and the Confirm button is visible, redraw it next to the last place it was next to
map.on('zoomend', function () {
    placeConfirmButton();
});

/**
 * Place the confirm button near the newly created layer
 * @param layer the layer that was just placed on the map
 */
function placeConfirmButton(layer) {
    //$('#confirmDraw').show();

    var bounds;

    if (layer == undefined) {
        if (lastLayer != null) {
            layer = lastLayer;
        } else {
            return;
        }
    }

    if (layer.getBounds == undefined) {
        bounds = map.latLngToContainerPoint(layer.getLatLng());
    } else {
        bounds = map.latLngToContainerPoint(layer.getBounds().getSouthWest());
    }
    $("#confirmBtnDiv").css("top", bounds.y);
    $("#confirmBtnDiv").css("left", bounds.x);

    lastLayer = layer;
}

function placeConfirmButtonInTopRight() {
    lastLayer = null;
    $("#confirmBtnDiv").css("top", "15px");
    $("#confirmBtnDiv").css("left", window.innerWidth - $("#confirmBtnDiv").width() - 20);

    //  ** animate enlarging and shrinking the button to call attention to its placement
    $("#confirmBtnDiv").animate({fontSize: "16px"});
    $("#confirmBtnDiv").animate({fontSize: "20px"});
    $("#confirmBtnDiv").animate({fontSize: "16px"});
    $("#confirmBtnDiv").animate({fontSize: "20px"});
    $("#confirmBtnDiv").animate({fontSize: "16px"});
}

class Point {
    constructor(lat, lng) {
        this.lat = lat;
        this.lng = lng;
    }
}

/**
 * This is the final step in drawing.
 * When the user has drawn something, it checks to see if
 * what the user has drawn is valid. If valid, the object
 * is added to the map and the _leaflet_id is added to the
 * appropriate wrapper.
 *
 * @returns (the instance of what you want drawn)
 */
function drawCreated() {
    $('#pointContinue').prop('disabled', false);

    shapeFinished = true;

    map.on('draw:created', onDraw);
    return (item === COMPLETED ? searchInstance : lpInstance);
}

/**
 * This method checks if a point is valid and possibly updates other points. For example, when drawing a bounding box,
 * editing one point will update the point laterally or vertically to it.
 *
 * This method is called in two cases:
 * 1. When editing a point - in this case the points are validated AND updated
 * 2. When hitting confirm button - in this case the points are simply validated
 *
 * @param aar
 * @param aarUpFrontInfo
 * @param index of point
 * @param m_layer
 * @param boundingBox
 * @param points
 * @param drawing_item
 * @param coordinateSystem
 * @param lpiPointLat list of attributes for lat
 * @param lpiPointLon list of attributes for lon
 */
function checkPoint(aar, aarUpFrontInfo, index, m_layer, boundingBox, points, drawing_item, coordinateSystem, lpiPointLat, lpiPointLon, item, id) {
    let point = points[index]

    let degree1, degree2, minute1,
        minute2, second1, second2,
        zone, band, rowLetter,
        columnLetter, easting, northing,
        translator,
        degree1Val, degree2Val, minute1Val,
        minute2Val, second1Val, second2Val,
        gridZone, mIdentifier

    // remove last warning for point
    if (hadIssueWithPoint.has(index)) {
        hadIssueWithPoint.delete(index)
    }

    hadIssueWithPoint = new Set()
    showEditPointWarning(false)
    $('#pointContinue').prop('disabled', false);

    switch (coordinateSystem) {
        case coordinateSystems.DECIMAL_LAT_LON:
            var lat = $(lpiPointLat).val();
            var lon = $(lpiPointLon).val();

            if (lat != null && lon != null) {
                if (lat < -90 || lat > 90) {
                    hadIssueWithPoint.add(index)
                    showEditPointWarning(true, 'Please enter valid lat (range -90 to 90)')
                    $('#pointContinue').prop('disabled', true);
                } else if (lon < -180 || lon > 180) {
                    hadIssueWithPoint.add(index)
                    showEditPointWarning(true, 'Please enter valid lon (range -180 to 180)')
                    $('#pointContinue').prop('disabled', true);
                } else {
                    if (drawing_item === Shapes.POLYGON || drawing_item === Shapes.BOUNDING_BOX) {
                        var m_points = m_layer.getLatLngs()[0]
                        m_points[index].lat = lat
                        m_points[index].lng = lon
                        m_layer.setLatLngs(m_points)
                    } else {
                        m_layer.setLatLng(new L.LatLng(lat, lon))
                    }


                    /*
                        If shape is a bounding box, updates to lat should apply to lat on same x axis.
                        Likewise for lon. This way we can keep rectangular shape. Note: Shape is always
                        drawn from button left to bottom right in circular function, regardless of where
                        the initial point was started.
                     */
                    if (drawing_item === Shapes.BOUNDING_BOX) {
                        // bottom left vertex
                        if (index === 0) {
                            points[3].lat = point.lat
                            points[1].lng = point.lng

                            $("#addPointInput3 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput1 > input.lpiPointLon").val(point.lng)
                        }

                        // top left vertex
                        else if (index === 1) {
                            points[2].lat = point.lat
                            points[0].lng = point.lng

                            $("#addPointInput2 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput0 > input.lpiPointLon").val(point.lng)
                        }

                        // top right vertex
                        else if (index === 2) {
                            points[1].lat = point.lat
                            points[3].lng = point.lng

                            $("#addPointInput1 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput3 > input.lpiPointLon").val(point.lng)
                        }

                        // bottom right vertex
                        else if (index === 3) {
                            points[0].lat = point.lat
                            points[2].lng = point.lng

                            $("#addPointInput0 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput2 > input.lpiPointLon").val(point.lng)
                        }

                        var boundingObj = {};
                        boundingObj.eastLonDeg = points[1].lng // bottom left lng
                        boundingObj.northLatDeg = points[3].lat // bottom left lat
                        boundingObj.southLatDeg = points[1].lat // top right lat
                        boundingObj.westLonDeg = points[3].lng // top right lng
                        lpInputs.setBoundingBox(boundingObj);

                        console.log("bounding box: " + boundingObj)


                        // If shape is not bounding box, make sure shape is contained in bounding box
                    } else if (lat < boundingBox.southLatDeg || lat > boundingBox.northLatDeg
                        || lon < boundingBox.westLonDeg || lon > boundingBox.eastLonDeg) {
                        hadIssueWithPoint.add(index)
                        showEditPointWarning(true, 'Please draw in bounding box');
                        $('#pointContinue').prop('disabled', true);

                        if(item === RENDEZVOUS){
                            lpInputs.removeRendezvousPointUUID(id)
                            lpInputs.addRendezvousPointUUID(m_layer._leaflet_id)
                        }else if(item === "known"){
                            lpInstance.removePolyExclusionZoneUUID(id)
                            lpInstance.addPolyExclusionZoneUUID(m_layer._leaflet_id);
                        }else if(item === DISCOVERED){
                            lpInstance.removeDiscoveredExclusionZoneUUID(id)
                            lpInstance.addDiscoveredExclusionZoneUUID(m_layer._leaflet_id);
                        }
                    }

                    if (layer != null) {
                        layer.redraw();
                    }
                }
            }

            break;
        case coordinateSystems.DMS_LAT_LON:
            degree1 = lpiPointLat[0]
            minute1 = lpiPointLat[1]
            second1 = lpiPointLat[2]

            degree2 = lpiPointLon[0]
            minute2 = lpiPointLon[1]
            second2 = lpiPointLon[2]


            degree1Val = parseFloat(degree1.val())
            minute1Val = parseFloat(minute1.val())
            second1Val = parseFloat(second1.val())

            degree2Val = parseFloat(degree2.val())
            minute2Val = parseFloat(minute2.val())
            second2Val = parseFloat(second2.val())

            if (degree1Val < -90 || degree1Val > 90) {
                showEditPointWarning(true, 'Please enter valid latitude degree (range -90 to 90)')
                hadIssueWithPoint.add(index)
                $('#pointContinue').prop('disabled', true);
            } else if (degree2Val < -180 || degree2Val > 180) {
                showEditPointWarning(true, 'Please enter valid longitude degree (range -180 to 180)')
                hadIssueWithPoint.add(index)
                $('#pointContinue').prop('disabled', true);
            } else if (minute1Val < 0 || minute1Val > 59
                || minute2Val < 0 || minute2Val > 59) {
                showEditPointWarning(true, 'Please enter valid minute (range 0 to 59)')
                hadIssueWithPoint.add(index)
                $('#pointContinue').prop('disabled', true);
            } else if (second1Val < 0 || second1Val > 59
                || second2Val < 0 || second2Val > 59) {
                showEditPointWarning(true, 'Please enter valid second (range 0 to 59)')
                hadIssueWithPoint.add(index)
                $('#pointContinue').prop('disabled', true);
            } else {
                var lat = dms_to_dd(degree1Val,
                    minute1Val,
                    second1Val)

                var lon = dms_to_dd(degree2Val,
                    minute2Val,
                    second2Val)

                if (lat !== null && lon !== null) {
                    if (drawing_item === Shapes.POLYGON || drawing_item === Shapes.BOUNDING_BOX) {
                        var m_points = m_layer.getLatLngs()[0]
                        m_points[index].lat = lat
                        m_points[index].lng = lon
                        m_layer.setLatLngs(m_points)
                    } else {
                        m_layer.setLatLng(new L.LatLng(lat, lon))
                    }


                    /*
                        If shape is a bounding box, updates to lat should apply to lat on same x axis.
                        Likewise for lon. This way we can keep rectangular shape. Note: Shape is always
                        drawn from button left to bottom right in circular function, regardless of where
                        the initial point was started.
                    */
                    if (drawing_item === Shapes.BOUNDING_BOX) {
                        // bottom left vertex
                        if (index === 0) {
                            points[3].lat = point.lat
                            points[1].lng = point.lng

                            $("#addPointInput3 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput1 > input.lpiPointLon").val(point.lng)
                        }

                        // top left vertex
                        else if (index === 1) {
                            points[2].lat = point.lat
                            points[0].lng = point.lng

                            $("#addPointInput2 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput0 > input.lpiPointLon").val(point.lng)
                        }

                        // top right vertex
                        else if (index === 2) {
                            points[1].lat = point.lat
                            points[3].lng = point.lng

                            $("#addPointInput1 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput3 > input.lpiPointLon").val(point.lng)
                        }

                        // bottom right vertex
                        else if (index === 3) {
                            points[0].lat = point.lat
                            points[2].lng = point.lng

                            $("#addPointInput0 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput2 > input.lpiPointLon").val(point.lng)
                        }

                        var boundingObj = {};
                        boundingObj.eastLonDeg = points[1].lng // bottom left lng
                        boundingObj.northLatDeg = points[3].lat // bottom left lat
                        boundingObj.southLatDeg = points[1].lat // top right lat
                        boundingObj.westLonDeg = points[3].lng // top right lng
                        lpInputs.setBoundingBox(boundingObj);

                        // If shape is not bounding box, make sure shape is contained in bounding box
                    } else if (lat < boundingBox.southLatDeg || lat > boundingBox.northLatDeg
                        || lon < boundingBox.westLonDeg || lon > boundingBox.eastLonDeg) {
                        showEditPointWarning(true, 'Please draw in bounding box');
                        hadIssueWithPoint.add(index)
                        $('#pointContinue').prop('disabled', true);
                    }
                }

                if (layer != null) {
                    layer.redraw();
                }
            }
            break;
        case coordinateSystems.DEC_MIN_LAT_LON:
            degree1 = lpiPointLat[0]
            minute1 = lpiPointLat[1]

            degree2 = lpiPointLon[0]
            minute2 = lpiPointLon[1]

            degree1Val = parseFloat(degree1.val())
            minute1Val = parseFloat(minute1.val())

            degree2Val = parseFloat(degree2.val())
            minute2Val = parseFloat(minute2.val())

            if (degree1Val < -90 || degree1Val > 90) {
                showEditPointWarning(true, 'Please enter valid latitude degree (range -90 to 90)')
                hadIssueWithPoint.add(index)
                $('#pointContinue').prop('disabled', true);
            } else if (degree2Val < -180 || degree2Val > 180) {
                showEditPointWarning(true, 'Please enter valid longitude degree (range -180 to 180)')
                hadIssueWithPoint.add(index)
                $('#pointContinue').prop('disabled', true);
            } else if (minute1Val < 0 || minute1Val > 59
                || minute2Val < 0 || minute2Val > 59) {
                showEditPointWarning(true, 'Please enter valid minute (range 0 to 59)')
                hadIssueWithPoint.add(index)
                $('#pointContinue').prop('disabled', true);
            } else {
                var lat = ddm_to_dd(degree1Val,
                    minute1Val)

                var lon = ddm_to_dd(degree2Val,
                    minute2Val)

                if (lat !== null && lon !== null) {
                    if (drawing_item === Shapes.POLYGON || drawing_item === Shapes.BOUNDING_BOX) {
                        var m_points = m_layer.getLatLngs()[0]
                        m_points[index].lat = lat
                        m_points[index].lng = lon
                        m_layer.setLatLngs(m_points)
                    } else {
                        m_layer.setLatLng(new L.LatLng(lat, lon))
                    }


                    /*
                        If shape is a bounding box, updates to lat should apply to lat on same x axis.
                        Likewise for lon. This way we can keep rectangular shape. Note: Shape is always
                        drawn from button left to bottom right in circular function, regardless of where
                        the initial point was started.
                    */
                    if (drawing_item === Shapes.BOUNDING_BOX) {
                        // bottom left vertex
                        if (index === 0) {
                            points[3].lat = point.lat
                            points[1].lng = point.lng

                            $("#addPointInput3 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput1 > input.lpiPointLon").val(point.lng)
                        }

                        // top left vertex
                        else if (index === 1) {
                            points[2].lat = point.lat
                            points[0].lng = point.lng

                            $("#addPointInput2 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput0 > input.lpiPointLon").val(point.lng)
                        }

                        // top right vertex
                        else if (index === 2) {
                            points[1].lat = point.lat
                            points[3].lng = point.lng

                            $("#addPointInput1 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput3 > input.lpiPointLon").val(point.lng)
                        }

                        // bottom right vertex
                        else if (index === 3) {
                            points[0].lat = point.lat
                            points[2].lng = point.lng

                            $("#addPointInput0 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput2 > input.lpiPointLon").val(point.lng)
                        }

                        var boundingObj = {};
                        boundingObj.eastLonDeg = points[1].lng // bottom left lng
                        boundingObj.northLatDeg = points[3].lat // bottom left lat
                        boundingObj.southLatDeg = points[1].lat // top right lat
                        boundingObj.westLonDeg = points[3].lng // top right lng
                        lpInputs.setBoundingBox(boundingObj);


                        // If shape is not bounding box, make sure shape is contained in bounding box
                    } else if (lat < boundingBox.southLatDeg || lat > boundingBox.northLatDeg
                        || lon < boundingBox.westLonDeg || lon > boundingBox.eastLonDeg) {
                        showEditPointWarning(true, 'Please draw in bounding box');
                        hadIssueWithPoint.add(index)
                        $('#pointContinue').prop('disabled', true);
                    }

                    if (layer != null) {
                        layer.redraw();
                    }
                }
            }
            break;
        case coordinateSystems.UTM:
            zone = lpiPointLat[0]
            easting = lpiPointLat[1]
            northing = lpiPointLat[2]

            try {
                translator = new Utm(parseInt(zone.val()), 'N', Math.round(parseFloat(easting.val())), Math.round(parseFloat(northing.val())))

                var latLong = translator.toLatLon()

                lat = latLong.lat
                lon = latLong.lng

                if (lat != null && lon != null) {

                    var m_points

                    if (drawing_item === Shapes.POLYGON || drawing_item === Shapes.BOUNDING_BOX) {
                        m_points = m_layer.getLatLngs()[0]
                        m_points[index].lat = lat
                        m_points[index].lng = lon
                        m_layer.setLatLngs(m_points)
                    } else {
                        m_layer.setLatLng(new L.LatLng(lat, lon))
                    }


                    /*
                        If shape is a bounding box, updates to lat should apply to lat on same x axis.
                        Likewise for lon. This way we can keep rectangular shape. Note: Shape is always
                        drawn from button left to bottom right in circular function, regardless of where
                        the initial point was started.
                    */
                    if (drawing_item === Shapes.BOUNDING_BOX) {
                        // bottom left vertex
                        if (index === 0) {
                            points[3].lat = point.lat
                            points[1].lng = point.lng

                            $("#addPointInput3 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput1 > input.lpiPointLon").val(point.lng)
                        }

                        // top left vertex
                        else if (index === 1) {
                            points[2].lat = point.lat
                            points[0].lng = point.lng

                            $("#addPointInput2 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput0 > input.lpiPointLon").val(point.lng)
                        }

                        // top right vertex
                        else if (index === 2) {
                            points[1].lat = point.lat
                            points[3].lng = point.lng

                            $("#addPointInput1 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput3 > input.lpiPointLon").val(point.lng)
                        }

                        // bottom right vertex
                        else if (index === 3) {
                            points[0].lat = point.lat
                            points[2].lng = point.lng

                            $("#addPointInput0 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput2 > input.lpiPointLon").val(point.lng)
                        }


                        var boundingObj = {};
                        boundingObj.eastLonDeg = points[1].lng // bottom left lng
                        boundingObj.northLatDeg = points[3].lat // bottom left lat
                        boundingObj.southLatDeg = points[1].lat // top right lat
                        boundingObj.westLonDeg = points[3].lng // top right lng
                        lpInputs.setBoundingBox(boundingObj);


                        // If shape is not bounding box, make sure shape is contained in bounding box
                    } else if (lat < boundingBox.southLatDeg || lat > boundingBox.northLatDeg
                        || lon < boundingBox.westLonDeg || lon > boundingBox.eastLonDeg) {
                        showEditPointWarning(true, 'Please draw in bounding box');
                        hadIssueWithPoint.add(index)
                        $('#pointContinue').prop('disabled', true);
                    }

                    if (layer != null) {
                        layer.redraw();
                    }

                }

            } catch (err) {
                showEditPointWarning(true, "Warning: " + err.message)
                hadIssueWithPoint.add(index)
                $('#pointContinue').prop('disabled', true);
            }
            break;
        case coordinateSystems.USNG_MGRS:
            gridZone = lpiPointLat[0]
            mIdentifier = lpiPointLat[1]
            easting = lpiPointLat[2]
            northing = lpiPointLat[3]

            zone = gridZone.val().replace(/(^\d+)(.+$)/i, '$1');
            band = gridZone.val().replace(/[0-9]/g, '');

            columnLetter = mIdentifier.val().charAt(0)
            rowLetter = mIdentifier.val().charAt(1)

            try {

                translator = new Mgrs(parseInt(zone), band, columnLetter, rowLetter,
                    Math.round(parseFloat(easting.val())), Math.round(parseFloat(northing.val())))


                var latLong = translator.toUtm().toLatLon()

                lat = latLong.lat
                lon = latLong.lng

                if (lat != null && lon != null) {
                    var m_points

                    if (drawing_item === Shapes.POLYGON || drawing_item === Shapes.BOUNDING_BOX) {
                        m_points = m_layer.getLatLngs()[0]
                        m_points[index].lat = lat
                        m_points[index].lng = lon
                        m_layer.setLatLngs(m_points)
                    } else {
                        m_layer.setLatLng(new L.LatLng(lat, lon))
                    }


                    /*
                        If shape is a bounding box, updates to lat should apply to lat on same x axis.
                        Likewise for lon. This way we can keep rectangular shape. Note: Shape is always
                        drawn from button left to bottom right in circular function, regardless of where
                        the initial point was started.
                    */
                    if (drawing_item === Shapes.BOUNDING_BOX) {
                        // bottom left vertex
                        if (index === 0) {
                            points[3].lat = point.lat
                            points[1].lng = point.lng

                            $("#addPointInput3 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput1 > input.lpiPointLon").val(point.lng)
                        }

                        // top left vertex
                        else if (index === 1) {
                            points[2].lat = point.lat
                            points[0].lng = point.lng

                            $("#addPointInput2 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput0 > input.lpiPointLon").val(point.lng)
                        }

                        // top right vertex
                        else if (index === 2) {
                            points[1].lat = point.lat
                            points[3].lng = point.lng

                            $("#addPointInput1 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput3 > input.lpiPointLon").val(point.lng)
                        }

                        // bottom right vertex
                        else if (index === 3) {
                            points[0].lat = point.lat
                            points[2].lng = point.lng

                            $("#addPointInput0 > input.lpiPointLat").val(point.lat)
                            $("#addPointInput2 > input.lpiPointLon").val(point.lng)
                        }

                        var boundingObj = {};
                        boundingObj.eastLonDeg = points[1].lng // bottom left lng
                        boundingObj.northLatDeg = points[3].lat // bottom left lat
                        boundingObj.southLatDeg = points[1].lat // top right lat
                        boundingObj.westLonDeg = points[3].lng // top right lng
                        lpInputs.setBoundingBox(boundingObj);
                        // If shape is not bounding box, make sure shape is contained in bounding box

                    } else if (lat < boundingBox.southLatDeg || lat > boundingBox.northLatDeg
                        || lon < boundingBox.westLonDeg || lon > boundingBox.eastLonDeg) {
                        showEditPointWarning(true, 'Please draw in bounding box');
                        hadIssueWithPoint.add(index)
                        $('#pointContinue').prop('disabled', true);
                    }

                    if (layer != null) {
                        layer.redraw();
                    }

                }
            } catch (err) {
                showEditPointWarning(true, "Warning: " + err.message)
                hadIssueWithPoint.add(index)
                $('#pointContinue').prop('disabled', true);
            }

            break;

    }

    if(drawing_item === Shapes.POLYGON) {
        for (let i = 0; i < points.length; i++) {
            console.log(m_layer.getLatLngs())
            lat = m_layer.getLatLngs()[0][i].lat
            lon = m_layer.getLatLngs()[0][i].lng
            if (lat < boundingBox.southLatDeg || lat > boundingBox.northLatDeg
                || lon < boundingBox.westLonDeg || lon > boundingBox.eastLonDeg) {
                hadIssueWithPoint.add(index)
                showEditPointWarning(true, 'Please draw in bounding box');
                $('#pointContinue').prop('disabled', true);
            }
        }
    }

    for(let i=0; i<returnRendezvousPts().length; i++)
    {
        lat = toDegrees(returnRendezvousPts()[i].latRad)
        lon = toDegrees(returnRendezvousPts()[i].lonRad)
        if (lat < boundingBox.southLatDeg || lat > boundingBox.northLatDeg
            || lon < boundingBox.westLonDeg || lon > boundingBox.eastLonDeg) {
            hadIssueWithPoint.add(index)
            showEditPointWarning(true, 'Please draw in bounding box');
            $('#pointContinue').prop('disabled', true);
        }
    }

    for(let i=0; i<returnExclusionZones().length; i++)
    {
        lat = toDegrees(returnExclusionZones()[i].pt.latRad)
        lon = toDegrees(returnExclusionZones()[i].pt.lonRad)
        if (lat < boundingBox.southLatDeg || lat > boundingBox.northLatDeg
            || lon < boundingBox.westLonDeg || lon > boundingBox.eastLonDeg) {
            hadIssueWithPoint.add(index)
            showEditPointWarning(true, 'Please draw in bounding box');
            $('#pointContinue').prop('disabled', true);
        }
    }
}

/*function confirmPoints(aar, aarUpFrontInfo) {
    if (hadIssueWithPoint.size === 0) {
        if (aar != null) {
            $('#addPointAAR').hide();
            $('.leaflet-control-attribution').css('display', 'inline');
            stopDrawing();
            hideHelperText();
            map.closePopup();
            openAARConfirmAndSubmit(aar, aarUpFrontInfo, true);
            $('#aarModal').modal("show");
            pointMenu.close();
        } else if (shapeFinished) {
            stopDrawing();
            hideHelperText();
            console.log("calling broadcast update")
            stateManagement.broadcastUpdate();

            if (completedPoints) {
                pointMenu.close();
                completedPoints = false
                $("#pointContinue").off()
                hadIssueWithPoint = new Set()
            }
            $('#confirmDraw').hide();
        } else {
            alert("Please finish drawing shape");
        }
    }
}*/

/*
	adds coordinate listener for drawn point
	index starts at 0 and proceeds to N - 1
	amount of shape points
 */
function addPointsListeners(points, drawing_item, isIndividualDrawingItems = false, m_layer,
                            aar = null, aarUpFrontInfo = null, item, id) {
    /*
       If drawing multiple shapes, do not clear the coordinates container. This allows
       presenting inputs for drawing multiple shapes (IE rendezvous points)
     */
    if (isIndividualDrawingItems) {
        numberOfNonShapePointsDrawn += 1
    } else {
        $('#lkpPointContentHolder').empty();
    }

    for (let index = 0; index < points.length; index++) {
        (function (index) {
            let point = points[index]

            /*
                This handles a unique case for drawing multiple shapes,
                in which case we call this method (addPointListeners) for each
                shape drawn (so index should equal number of points drawn - 1)
             */
            if (isIndividualDrawingItems) {
                index = numberOfNonShapePointsDrawn - 1
            }

            $("#lkpPointContentHolder").append(addPointInput(index, point.lat.toFixed(3), point.lng.toFixed(3), drawing_item));

            let lpiPointLat, lpiPointLon,
                degree1, degree2, minute1,
                minute2, second1, second2,
                zone, easting, northing,
                gridZone, mIdentifier

            let boundingBox = returnBoundingBox();
            let pointContinue = $("#pointContinue");

            switch (coordinateSystem) {
                case coordinateSystems.DECIMAL_LAT_LON:
                    lpiPointLat = $("#addPointInput" + index + " > input.lpiPointLat");
                    lpiPointLon = $("#addPointInput" + index + " > input.lpiPointLon");

                    // Point edit listener
                    $(lpiPointLat)
                        .add($(lpiPointLon))
                        .on('input', function () {
                            checkPoint(aar, aarUpFrontInfo, index, m_layer, boundingBox, points, drawing_item, coordinateSystems.DECIMAL_LAT_LON, lpiPointLat, lpiPointLon, item, id)
                        });


                    break
                case coordinateSystems.DMS_LAT_LON:
                    // degree, minute, second
                    lpiPointLat = [$("#addPointInput" + index + " input.lpiPointDegree"),
                        $("#addPointInput" + index + " input.lpiPointMinute"),
                        $("#addPointInput" + index + " input.lpiPointSecond")]

                    lpiPointLon = [$("#addPointInput" + index + " input.lpiPointDegree2"),
                        $("#addPointInput" + index + " input.lpiPointMinute2"),
                        $("#addPointInput" + index + " input.lpiPointSecond2")]

                    degree1 = lpiPointLat[0]
                    minute1 = lpiPointLat[1]
                    second1 = lpiPointLat[2]

                    degree2 = lpiPointLon[0]
                    minute2 = lpiPointLon[1]
                    second2 = lpiPointLon[2]

                    $(degree1)
                        .add(degree2)
                        .add(minute1)
                        .add(minute2)
                        .add(second1)
                        .add(second2)
                        .on('input', function () {
                            if (degree1.val() != null && degree2.val() != null &&
                                minute1.val() != null && minute2.val() != null &&
                                second1.val() != null && second2.val() != null) {

                                checkPoint(aar, aarUpFrontInfo, index, m_layer, boundingBox, points, drawing_item, coordinateSystems.DMS_LAT_LON, lpiPointLat, lpiPointLon, item)
                            }
                        });
                    break;
                case coordinateSystems.DEC_MIN_LAT_LON:
                    // degree, minute
                    lpiPointLat = [$("#addPointInput" + index + " input.lpiPointDegree"),
                        $("#addPointInput" + index + " input.lpiPointMinute")]

                    lpiPointLon = [$("#addPointInput" + index + " input.lpiPointDegree2"),
                        $("#addPointInput" + index + " input.lpiPointMinute2")]

                    degree1 = lpiPointLat[0]
                    minute1 = lpiPointLat[1]

                    degree2 = lpiPointLon[0]
                    minute2 = lpiPointLon[1]

                    $(degree1)
                        .add(degree2)
                        .add(minute1)
                        .add(minute2)
                        .on('input', function () {
                            if (degree1.val() != null && degree2.val() != null &&
                                minute1.val() != null && minute2.val() != null) {
                                checkPoint(aar, aarUpFrontInfo, index, m_layer, boundingBox, points, drawing_item, coordinateSystems.DEC_MIN_LAT_LON, lpiPointLat, lpiPointLon, item)
                            }
                        });
                    break;
                case coordinateSystems.UTM:
                    // zone, easting, northing
                    lpiPointLat = [$("#addPointInput" + index + " input.lpiPointZone"),
                        $("#addPointInput" + index + " input.lpiPointEasting"),
                        $("#addPointInput" + index + " input.lpiPointNorthing")]

                    zone = lpiPointLat[0]
                    easting = lpiPointLat[1]
                    northing = lpiPointLat[2]

                    $(zone)
                        .add(easting)
                        .add(northing)
                        .on('input', function () {
                            if (zone.val() != null && easting.val() != null &&
                                northing.val() != null) {

                                checkPoint(aar, aarUpFrontInfo, index, m_layer, boundingBox, points, drawing_item, coordinateSystems.UTM, lpiPointLat, lpiPointLon, item)
                            }
                        });
                    break;

                case coordinateSystems.USNG_MGRS:
                    // zone, band, n100k, e100k, easting, northing
                    lpiPointLat = [$("#addPointInput" + index + " input.gridZoneDesignator"),
                        $("#addPointInput" + index + " input.mIdentifier"),
                        $("#addPointInput" + index + " input.lpiPointEasting"),
                        $("#addPointInput" + index + " input.lpiPointNorthing")]

                    gridZone = lpiPointLat[0]
                    mIdentifier = lpiPointLat[1]
                    easting = lpiPointLat[2]
                    northing = lpiPointLat[3]

                    $(gridZone)
                        .add(mIdentifier)
                        .add(easting)
                        .add(northing)
                        .on('input', function () {
                            if (gridZone.val() != null && mIdentifier.val() != null &&
                                easting.val() != null && northing.val()) {

                                checkPoint(aar, aarUpFrontInfo, index, m_layer, boundingBox, points, drawing_item, coordinateSystems.USNG_MGRS, lpiPointLat, lpiPointLon, item)
                            }
                        });
                    break;
            }
        })(index)
    }
}

//called when the user hits the "Confirm" button after
//completing a draw
function stopDrawing() {
    $('#lkpPointContentHolder').empty();
    $('#lkpPointContentHolder').append("<br>");

    map.removeEventListener("draw:created", onDraw);

    if (pointDrawer._enabled)
        pointDrawer.disable();
    if (circleDrawer._enabled)
        circleDrawer.disable();
    if (polygonDrawer._enabled)
        polygonDrawer.disable();
    if (polylineDrawer._enabled)
        polylineDrawer.disable();
    if (rectangleDrawer._enabled)
        rectangleDrawer.disable();

    pointDrawn = false;
}

/**
 * @param    boundingBox
 * @param    points
 * @returns    (a boolean corresponding to whether all points fall inside the boundingBox)
 */
function containsPoints(boundingBox, points) {
    var allInside = 0;
    let minLat = Math.min(boundingBox[1].lat, boundingBox[3].lat)
    let maxLat = Math.max(boundingBox[1].lat, boundingBox[3].lat)
    let minLng = Math.min(boundingBox[1].lng, boundingBox[3].lng)
    let maxLng = Math.max(boundingBox[1].lng, boundingBox[3].lng)
    for (var i in points) {
        var numInside = 0;
        if (points[i].lat < maxLat)
            numInside++;
        if (points[i].lat > minLat)
            numInside++;
        if (points[i].lng > minLng)
            numInside++;
        if (points[i].lng < maxLng)
            numInside++;
        numInside = numInside / 4;
        allInside += numInside;
    }
    return (allInside / points.length) === 1.0;
}

/**
 * THE FOUR BELOW FUNCTIONS USE ADAPTED CODE SOURCED FROM THE
 * CIRCLE-TO-POLYGON GITHUB FOUND AT THIS LINK:
 * https://github.com/gabzim/circle-to-polygon
 *
 *
 * Their purpose is to get a subset of points on the circle
 *
 * */
function toRadians(angleInDegrees) {
    return angleInDegrees * Math.PI / 180;
}

function toDegrees(angleInRadians) {
    return angleInRadians * 180 / Math.PI;
}

function offset(c1, distance, bearing) {
    var lat1 = toRadians(c1.lat);
    var lon1 = toRadians(c1.lng);
    var dByR = distance / 6378137; // distance divided by 6378137 (radius of the earth)
    var lat = Math.asin(
        Math.sin(lat1) * Math.cos(dByR) +
        Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing));
    var lon = lon1 + Math.atan2(
        Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
        Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat));
    return {lat: toDegrees(lat), lng: toDegrees(lon)};
}

function circleToPolygon(center, radius) {
    var n = 32; // numberOfSegments the circle should be divided into
    var flatCoordinates = [];
    var coordinates = [];
    for (var i = 0; i < n; ++i) {
        flatCoordinates.push(offset(center, radius, 2 * Math.PI * i / n));
    }
    return flatCoordinates;
}

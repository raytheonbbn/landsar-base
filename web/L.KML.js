/*!
	Copyright (c) 2011-2015, Pavel Shramov, Bruno Bergot - MIT licence
*/

L.KML = L.FeatureGroup.extend({

	initialize: function (kml, lpiID, finderElementType) {
		this._kml = kml;
		this._layers = {};

		if (kml) {
			this.addKML(kml, lpiID, finderElementType);
		}
	},

	addKML: function (xml, lpiID, finderElementType) {
		var layers = L.KML.parseKML(xml, lpiID, finderElementType);
		if (!layers || !layers.length) return;
		for (var i = 0; i < layers.length; i++) {
			this.fire('addlayer', {
				layer: layers[i]
			});
			if(finderElementType === LKP){
				try {
					layers[i].setStyle({
						color: setColor("black"),
						fill: 0,
					});
				} catch (err){
					// the pointLKP doesn't let you set its style with setStyle
					// - we get "Uncaught TypeError: layers[i].setStyle is not a function"
					console.log("Unable to set style on lkp layer");
				}
			}
			this.addLayer(layers[i]);
		}
		this.latLngs = L.KML.getLatLngs(xml);
		this.fire('loaded');
	},

	latLngs: [],
});

L.Util.extend(L.KML, {
	mFinderElement: undefined,
	parseKML: function (xml, lpiID, finderElementType) {
		let style = this.parseStyles(xml);
		this.parseStyleMap(xml, style);
		let el = xml.getElementsByTagName('Folder');
		let layers = [], l;
		for (let i = 0; i < el.length; i++) {
			if (!this._check_folder(el[i])) { continue; }
			l = this.parseFolder(el[i], style, finderElementType);

			if (l) {
				layers.push(l);
			}
		}
		el = xml.getElementsByTagName('Placemark');
		this.mFinderElement = finderElementType

		for (let j = 0; j < el.length; j++) {
			if (!this._check_folder(el[j])) { continue; }
			l = this.parsePlacemark(el[j], xml, style, {}, finderElementType);
			if (l) {
				l.finderInfo = {lpiID: lpiID, finderElementType: finderElementType};
				try {
					let name = el[j].getElementsByTagName("name")[0].textContent;

					let searchID = undefined;
					let searchIDNodes = el[j].getElementsByTagName("searchID");
					if(searchIDNodes.length > 0) {
						searchID = searchIDNodes[0].textContent;
					}
					let begin = el[j].getElementsByTagName("TimeSpan")[0].getElementsByTagName("begin")[0].textContent;
					let end = el[j].getElementsByTagName("TimeSpan")[0].getElementsByTagName("end")[0].textContent;

					l.finderInfo.name = name;
					l.finderInfo.begin = begin;
					l.finderInfo.end = end;
					l.finderInfo.searchID = searchID;
				} catch (e) {}
				layers.push(l);
			}
		}
		el = xml.getElementsByTagName('GroundOverlay');
		for (let k = 0; k < el.length; k++) {
			l = this.parseGroundOverlay(el[k]);
			if (l) { layers.push(l); }
		}
		return layers;
	},

	// Return false if e's first parent Folder is not [folder]
	// - returns true if no parent Folders
	_check_folder: function (e, folder) {
		e = e.parentNode;
		while (e && e.tagName !== 'Folder')
		{
			e = e.parentNode;
		}
		return !e || e === folder;
	},

	parseStyles: function (xml) {
		var styles = {};
		var sl = xml.getElementsByTagName('Style');
		for (var i=0, len=sl.length; i<len; i++) {
			var style = this.parseStyle(sl[i]);
			if (style) {
				var styleName = '#' + style.id;
				styles[styleName] = style;
			}
		}
		return styles;
	},

	parseStyle: function (xml) {
		var style = {}, poptions = {}, ioptions = {}, el, id;

		var attributes = {color: true, width: true, Icon: true, href: true, hotSpot: true};

		function _parse (xml) {
			var options = {};
			for (var i = 0; i < xml.childNodes.length; i++) {
				var e = xml.childNodes[i];
				var key = e.tagName;
				if (!attributes[key]) { continue; }
				if (key === 'hotSpot')
				{
					for (var j = 0; j < e.attributes.length; j++) {
						options[e.attributes[j].name] = e.attributes[j].nodeValue;
					}
				} else {
					var value = e.childNodes[0].nodeValue;
					if (key === 'color') {
						options.opacity = parseInt(value.substring(0, 2), 16) / 255.0;
						options.color = '#' + value.substring(6, 8) + value.substring(4, 6) + value.substring(2, 4);
					} else if (key === 'width') {
						options.weight = parseInt(value);
					} else if (key === 'Icon') {
						ioptions = _parse(e);
						if (ioptions.href) { options.href = ioptions.href; }
					} else if (key === 'href') {
						options.href = value;
					}
				}
			}
			return options;
		}

		el = xml.getElementsByTagName('LineStyle');
		if (el && el[0]) { style = _parse(el[0]); }
		el = xml.getElementsByTagName('PolyStyle');
		if (el && el[0]) { poptions = _parse(el[0]); }
		if (poptions.color) { style.fillColor = poptions.color; }
		if (poptions.opacity) { style.fillOpacity = poptions.opacity; }
		el = xml.getElementsByTagName('IconStyle');
		if (el && el[0]) { ioptions = _parse(el[0]); }
		if (ioptions.href) {
			style.icon = new L.KMLIcon({
				iconUrl: ioptions.href,
				shadowUrl: null,
				anchorRef: {x: ioptions.x, y: ioptions.y},
				anchorType:	{x: ioptions.xunits, y: ioptions.yunits}
			});
		}

		id = xml.getAttribute('id');
		if (id && style) {
			style.id = id;
		}

		return style;
	},

	parseStyleMap: function (xml, existingStyles) {
		var sl = xml.getElementsByTagName('StyleMap');

		for (var i = 0; i < sl.length; i++) {
			var e = sl[i], el;
			var smKey, smStyleUrl;

			el = e.getElementsByTagName('key');
			if (el && el[0]) { smKey = el[0].textContent; }
			el = e.getElementsByTagName('styleUrl');
			if (el && el[0]) { smStyleUrl = el[0].textContent; }

			if (smKey === 'normal')
			{
				existingStyles['#' + e.getAttribute('id')] = existingStyles[smStyleUrl];
			}
		}

		return;
	},

	parseFolder: function (xml, style, finderElementType) {
		var el, layers = [], l;
		el = xml.getElementsByTagName('Folder');
		for (let i = 0; i < el.length; i++) {
			if (!this._check_folder(el[i], xml)) { continue; }
			l = this.parseFolder(el[i], style);
			if (l) { layers.push(l); }
		}
		el = xml.getElementsByTagName('Placemark');
		for (let j = 0; j < el.length; j++) {
			if (!this._check_folder(el[j], xml)) { continue; }
			l = this.parsePlacemark(el[j], xml, style, {}, finderElementType);
			if (l) {
				layers.push(l);
			}
		}

		let bounds = map.getBounds();
		el = xml.getElementsByTagName('S_utmzone');


		for (let j = 0; j < el.length; j++) {
			if (!this._check_folder(el[j], xml)) { continue; }
			l = this.parsePlacemark(el[j], xml, style, {}, finderElementType);
			if (l) {
				l.setStyle({
					weight: 1,
					fillColor: '#1b3489',
					className: 'utm'
				});
				l.finderInfo = {finderElementType: finderElementType};

				// check fully contains
				if(bounds.contains(l.getBounds()) || l.getBounds().contains(bounds.getCenter())) {
					layers.push(l);
				}else

				// check north bounds
				if(bounds.getNorth() > l.getBounds().getSouth() && bounds.getNorth() < l.getBounds().getNorth()){
					// check northwest bounds
					if(bounds.getWest() < l.getBounds().getEast() && bounds.getWest() > l.getBounds().getWest()){
						layers.push(l);
					}

					// contains
					if(bounds.getWest() < l.getBounds().getWest() && bounds.getEast() > l.getBounds().getEast()){
						layers.push(l);
					}

					// check northeast bounds
					if(bounds.getEast() > l.getBounds().getWest() && bounds.getEast() < l.getBounds().getEast()){
						layers.push(l);
					}
				}else

				// check south bounds
				if(bounds.getSouth() > l.getBounds().getSouth() && bounds.getSouth() < l.getBounds().getNorth()){
					// check southwest bounds
					if(bounds.getWest() < l.getBounds().getEast() && bounds.getWest() > l.getBounds().getWest()){
						layers.push(l);
					}

					// contains
					if(bounds.getWest() < l.getBounds().getWest() && bounds.getEast() > l.getBounds().getEast()){
						layers.push(l);
					}

					// check southeast bounds
					if(bounds.getEast() > l.getBounds().getWest() && bounds.getEast() < l.getBounds().getEast()){
						layers.push(l);
					}
				}else

					// check west bounds
				if(bounds.getWest() < l.getBounds().getEast() && bounds.getWest() > l.getBounds().getWest()){
					// check southwest bounds
					if(bounds.getNorth() > l.getBounds().getNorth() && bounds.getSouth() < l.getBounds().getSouth()){
						layers.push(l);
					}
				}else

					// check east bounds
				if(bounds.getEast() > l.getBounds().getWest() && bounds.getEast() < l.getBounds().getEast()){
					// check southwest bounds
					if(bounds.getNorth() > l.getBounds().getNorth() && bounds.getSouth() < l.getBounds().getSouth()){
						layers.push(l);
					}
				}

			}
		}

		el = xml.getElementsByTagName('GroundOverlay');
		for (var k = 0; k < el.length; k++) {
			if (!this._check_folder(el[k], xml)) { continue; }
			l = this.parseGroundOverlay(el[k]);
			if (l) { layers.push(l); }
		}
		if (!layers.length) { return; }
		if (layers.length === 1) { return layers[0]; }
		return new L.FeatureGroup(layers);
	},

	parsePlacemark: function (place, xml, style, options, finderElementType) {
		var h, i, j, k, el, il, opts = options || {};

		el = place.getElementsByTagName('styleUrl');
		for (i = 0; i < el.length; i++) {
			var url = el[i].childNodes[0].nodeValue;
			for (var a in style[url]) {
				opts[a] = style[url][a];
			}
		}

		il = place.getElementsByTagName('Style')[0];
		if (il) {
			var inlineStyle = this.parseStyle(place);
			if (inlineStyle) {
				for (k in inlineStyle) {
					opts[k] = inlineStyle[k];
				}
			}
		}

		var name, descr = '';
		el = place.getElementsByTagName('name');
		if (el.length && el[0].childNodes.length) {
			name = el[0].childNodes[0].nodeValue;
		}

		// ** handle UTM grid row info
		wasUTM = false
		var extra = null;
		el = place.getElementsByTagName('ROW_');
		if (el.length && el[0].childNodes.length) {
			extra = el[0].childNodes[0].nodeValue;
			wasUTM = true
		}
		name = name + (extra == null ? "" : " " + extra);

		if(name !== null && name !== undefined && name !== "" && name !== "undefined") {
			opts.name = name;
		}

		var layers = [];
		var multi = ['MultiGeometry', 'MultiTrack', 'gx:MultiTrack'];
		for (h in multi) {
			el = place.getElementsByTagName(multi[h]);
			for (i = 0; i < el.length; i++) {
				var layer = this.parsePlacemark(el[i], xml, style, opts, finderElementType);
				if(wasUTM) {
					layer.setStyle({
						className: 'utm'
					})
				}
				layers.push(layer);
			}
		}



		var parse = ['LineString', 'Polygon', 'Point', 'Track', 'gx:Track'];
		for (j in parse) {
			var tag = parse[j];
			el = place.getElementsByTagName(tag);
			for (i = 0; i < el.length; i++) {
				var l = this['parse' + tag.replace(/gx:/, '')](el[i], xml, opts, finderElementType);
				if (l) {
					// ** these functions can send back a single item, or multiple
					if(Array.isArray(l)) {
						for(var q = 0; q < l.length; q++) {
							l.finderInfo = {finderElementType: finderElementType};
							layers.push(l[q]);
						}
					} else {
						l.finderInfo = {finderElementType: finderElementType};
						layers.push(l);
					}
				}
			}
		}

		if (!layers.length) {
			return;
		}
		var layer = layers[0];
		if (layers.length > 1) {
			layer = new L.FeatureGroup(layers);
		}


		el = place.getElementsByTagName('description');
		for (i = 0; i < el.length; i++) {
			for (j = 0; j < el[i].childNodes.length; j++) {
				descr = descr + el[i].childNodes[j].nodeValue;
			}
		}

		/*if (name) {
			layer.on('add', function () {
				layer.bindPopup('<h2>' + name + '</h2>' + descr, { className: 'kml-popup'});
			});
		}*/

		if(!descr.startsWith("Search")){
			descr = ""
		}

		return layer;
	},

	parseCoords: function (xml) {
		var el = xml.getElementsByTagName('coordinates');
		return this._read_coords(el[0]);
	},

	parseLineString: function (line, xml, options) {
		var coords = this.parseCoords(line);
		if (!coords.length) { return; }
		return new L.Polyline(coords, options);
	},

	parseTrack: function (line, xml, options) {
		var el = xml.getElementsByTagName('gx:coord');
		if (el.length === 0) { el = xml.getElementsByTagName('coord'); }
		var coords = [];
		for (var j = 0; j < el.length; j++) {
			coords = coords.concat(this._read_gxcoords(el[j]));
		}
		if (!coords.length) { return; }
		return new L.Polyline(coords, options);
	},

	parsePoint: function (line, xml, options) {
		var el = line.getElementsByTagName('coordinates');
		if (!el.length) {
			return;
		}

		if(this.mFinderElement !== undefined && this.mFinderElement === LKP) {
			let ll = el[0].childNodes[0].nodeValue.split(',');
			let lkpPoint = L.circleMarker([ll[1], ll[0]], {color: setColor('black')});
			lkpPoint.finderInfo = {lpiID: getCurrentLPIID()};
			drawnItems.addLayer(lkpPoint);
			return;
		}

		var ll = el[0].childNodes[0].nodeValue.split(',');
		return new L.KMLMarker(new L.LatLng(ll[1], ll[0]), options);
	},

	parsePolygon: function (line, xml, options) {
		var el, polys = [], inner = [], i, coords;
		el = line.getElementsByTagName('outerBoundaryIs');
		for (i = 0; i < el.length; i++) {
			coords = this.parseCoords(el[i]);
			if (coords) {
				polys.push(coords);
			}
		}
		el = line.getElementsByTagName('innerBoundaryIs');
		for (i = 0; i < el.length; i++) {
			coords = this.parseCoords(el[i]);
			if (coords) {
				inner.push(coords);
			}
		}
		if (!polys.length) {
			return;
		}
		if (options.fillColor) {
			options.fill = true;
		}

		var poly;
		if (polys.length === 1) {
			poly = new L.Polygon(polys.concat(inner), options);
		} else {
			poly = new L.MultiPolygon(polys, options);
		}

		var center = poly.getBounds().getCenter();

		var label = options.name
		if(options.name !== undefined && options.name.startsWith("Search")){
			label = ""
		}


		if(label !== undefined) {
			let marker = new L.Marker(center, {
				icon: new L.DivIcon({
					className: 'my-div-icon',
					html: '<span class="my-div-span">' + label + '</span>'
				})
			});

			return [poly, marker];
		}else{
			return[poly];
		}
	},

	getLatLngs: function (xml) {
		var el = xml.getElementsByTagName('coordinates');
		var coords = [];
		for (var j = 0; j < el.length; j++) {
			// text might span many childNodes
			coords = coords.concat(this._read_coords(el[j]));
		}
		return coords;
	},

	_read_coords: function (el) {
		var text = '', coords = [], i;
		for (i = 0; i < el.childNodes.length; i++) {
			text = text + el.childNodes[i].nodeValue;
		}
		text = text.split(/[\s\n]+/);
		for (i = 0; i < text.length; i++) {
			var ll = text[i].split(',');
			if (ll.length < 2) {
				continue;
			}
			coords.push(new L.LatLng(ll[1], ll[0]));
		}
		return coords;
	},

	_read_gxcoords: function (el) {
		var text = '', coords = [];
		text = el.firstChild.nodeValue.split(' ');
		coords.push(new L.LatLng(text[1], text[0]));
		return coords;
	},

	parseGroundOverlay: function (xml) {
		var latlonbox = xml.getElementsByTagName('LatLonBox')[0];
		var bounds = new L.LatLngBounds(
			[
				latlonbox.getElementsByTagName('south')[0].childNodes[0].nodeValue,
				latlonbox.getElementsByTagName('west')[0].childNodes[0].nodeValue
			],
			[
				latlonbox.getElementsByTagName('north')[0].childNodes[0].nodeValue,
				latlonbox.getElementsByTagName('east')[0].childNodes[0].nodeValue
			]
		);
		var attributes = {Icon: true, href: true, color: true};
		function _parse (xml) {
			var options = {}, ioptions = {};
			for (var i = 0; i < xml.childNodes.length; i++) {
				var e = xml.childNodes[i];
				var key = e.tagName;
				if (!attributes[key]) { continue; }
				var value = e.childNodes[0].nodeValue;
				if (key === 'Icon') {
					ioptions = _parse(e);
					if (ioptions.href) { options.href = ioptions.href; }
				} else if (key === 'href') {
					options.href = value;
				} else if (key === 'color') {
					options.opacity = parseInt(value.substring(0, 2), 16) / 255.0;
					options.color = '#' + value.substring(6, 8) + value.substring(4, 6) + value.substring(2, 4);
				}
			}
			return options;
		}
		var options = {};
		options = _parse(xml);
		if (latlonbox.getElementsByTagName('rotation')[0] !== undefined) {
			var rotation = latlonbox.getElementsByTagName('rotation')[0].childNodes[0].nodeValue;
			options.rotation = parseFloat(rotation);
		}
		return new L.RotatedImageOverlay(options.href, bounds, {opacity: options.opacity, angle: options.rotation});
	}

});

L.KMLIcon = L.Icon.extend({
	options: {
		iconSize: [32, 32],
		iconAnchor: [16, 16],
	},
	_setIconStyles: function (img, name) {
		L.Icon.prototype._setIconStyles.apply(this, [img, name]);
		if( img.complete ) {
			this.applyCustomStyles( img )
		} else {
			img.onload = this.applyCustomStyles.bind(this,img)
		}

	},
	applyCustomStyles: function(img) {
		var options = this.options;
		this.options.popupAnchor = [0,(-0.83*img.height)];
		if (options.anchorType.x === 'fraction')
			img.style.marginLeft = (-options.anchorRef.x * img.width) + 'px';
		if (options.anchorType.y === 'fraction')
			img.style.marginTop  = ((-(1 - options.anchorRef.y) * img.height) + 1) + 'px';
		if (options.anchorType.x === 'pixels')
			img.style.marginLeft = (-options.anchorRef.x) + 'px';
		if (options.anchorType.y === 'pixels')
			img.style.marginTop  = (options.anchorRef.y - img.height + 1) + 'px';
	}
});


L.KMLMarker = L.Marker.extend({
	options: {
		icon: new L.KMLIcon.Default()
	}
});


// Inspired by https://github.com/bbecquet/Leaflet.PolylineDecorator/tree/master/src
L.RotatedImageOverlay = L.ImageOverlay.extend({
	options: {
		angle: 0
	},
	_reset: function () {
		L.ImageOverlay.prototype._reset.call(this);
		this._rotate();
	},
	_animateZoom: function (e) {
		L.ImageOverlay.prototype._animateZoom.call(this, e);
		this._rotate();
	},
	_rotate: function () {
        if (L.DomUtil.TRANSFORM) {
            // use the CSS transform rule if available
            this._image.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
        } else if (L.Browser.ie) {
            // fallback for IE6, IE7, IE8
            var rad = this.options.angle * (Math.PI / 180),
                costheta = Math.cos(rad),
                sintheta = Math.sin(rad);
            this._image.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
                costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
        }
	},
	getBounds: function () {
		return this._bounds;
	}
});

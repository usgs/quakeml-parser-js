/* global define */
define([], function () {
	'use strict';

	/**
	 * Convert an object to an array if needed.
	 *
	 * @param obj {Any}
	 * @return {Array}
	 *         if obj is an Object, either
	 *           obj, if obj is already an array,
	 *           otherwise, [obj]
	 *         otherwise, [].
	 */
	function _array(obj) {
		if (typeof obj === 'object' && obj !== null) {
			if (obj instanceof Array) {
				return obj;
			} else {
				return [obj];
			}
		}
		return [];
	}

	/**
	 * Build a lookup index for objects, based on (unique) property value.
	 *
	 * For Example:
	 *     _index([{id: 'a'}, {id: 'b'}], 'id')
	 * would return
	 *    {
	 *      'a': {id: 'a'},
	 *      'b': {id: 'b'}
	 *    }
	 *
	 * @param objs {Array<Object>}
	 *        objects to index
	 * @param key {String}
	 *        property to index.
	 * @param index {Object}
	 *        optional, existing index to extend.
	 * @return {Object} indexed data.
	 */
	function _index (objs, key, index) {
		var obj,
		    i,
		    len;
		index = index || {};
		if (objs) {
			for (i = 0, len = objs.length; i < len; i++) {
				obj = objs[i];
				index[obj[key]] = obj;
			}
		}
		return index;
	}

	/**
	 * Get a chained property from an object safely.
	 *
	 * For example: _get(obj, 'key1', 'key2')
	 * would return obj.key1.key2 if that property exists, otherwise null.
	 *
	 * @param obj {Object}
	 *        the object to access.
	 * @param varargs {String}
	 *        a variable number of properties to access.
	 * @return the property, or null if obj is not an object or does not
	 *         have the property specified in varargs.
	 */
	function _get (obj /*, varargs */) {
		var i,
		    len,
		    value,
		    arg;
		value = obj;
		for (i = 1, len = arguments.length; i < len; i++) {
			arg = arguments[i];
			if (!arg || !value) {
				return null;
			}
			value = value[arg];
		}
		if (typeof value === 'undefined') {
			return null;
		}
		return value;
	}

	/**
	 * Convert simple xml to a json object.
	 * Does not work well for mixed content (text/elements).
	 */
	function xmlToJson (xml) {
		// based on http://davidwalsh.name/convert-xml-json
		var obj = {},
		    children = [],
		    attrs,
		    attr,
		    nodes,
		    node,
		    nodeName,
		    nodeValue,
		    i,
		    len;

		if (xml.nodeType === 3) {
			return xml.nodeValue;
		}

		if (xml.nodeType === 1) {
			attrs = xml.attributes;
			for (i = 0, len = attrs.length; i < len; i++) {
				attr = attrs.item(i);
				obj[attr.nodeName] = attr.nodeValue;
			}
		}

		if (xml.hasChildNodes()) {
			nodes = xml.childNodes;
			for(i = 0, len = nodes.length; i < len; i++) {
				node = nodes.item(i);
				nodeName = node.nodeName;
				nodeValue = xmlToJson(node);
				children.push(nodeValue);
				if (typeof(obj[nodeName]) === 'undefined') {
					obj[nodeName] = nodeValue;
				} else {
					if (typeof(obj[nodeName].push) === 'undefined') {
						obj[nodeName] = [obj[nodeName]];
					}
					obj[nodeName].push(nodeValue);
				}
			}
		}

		// clean up '#text' nodes
		if (children.length === 1 && obj['#text']) {
			return obj['#text'];
		} else if (obj['#text']) {
			delete obj['#text'];
		}

		return obj;
	}



	/**
	 * Create a new Quakeml object.
	 *
	 * @param options {Object}
	 * @param options.xml {String|XMLDocument}
	 *        quakeml xml to parse.
	 *        If a string, options.xml is parsed using DOMParser.
	 * @param options.eventElement {String}
	 *        Default 'event'.
	 *        The event element inside eventParameters to find.
	 *        The first matching element is parsed during _initialize.
	 */
	var Quakeml = function (options) {
		this._options = options;
		this._initialize();
	};


	/**
	 * Initialize the quakeml object.
	 */
	Quakeml.prototype._initialize = function () {
		var options = this._options,
		    eventElement = options.eventElement || 'event',
		    xml,
		    json,
		    quakeml,
		    eventParameters,
		    ev;

		xml = options.xml;
		if (typeof xml === 'string') {
			xml = new DOMParser().parseFromString(xml, 'text/xml');
		}
		json = xmlToJson(xml);
		quakeml = json['q:quakeml'];
		eventParameters = quakeml.eventParameters;
		ev = _array(eventParameters[eventElement]);
		if (ev.length === 0) {
			throw new Error('Event element ' + eventElement + ' not found');
		}

		this._quakeml = quakeml;
		this._updated = _get(eventParameters, 'creationInfo', 'creationTime');
		this._event = this._parseEvent(ev[0]);
	};


	/**
	 * Parse one quakeml event from an event parameters.
	 *
	 * @param ev {Element}
	 *        quakeml event element.
	 * @return {Object} parsed quakeml as object with these keys:
	 *         'event' {Element} the unmodified ev parameter
	 *         'author' {String} the event author
	 *         'catalog' {String} the event catalog
	 *         'origins' {Array<Object>} parsed origins
	 *         'magnitudes' {Array<Object>} parsed magnitudes
	 *         'preferredOriginID' {String} id of the preferred origin.
	 *         'preferredMagnitudeID' {String} if of the preferred magnitude.
	 */
	Quakeml.prototype._parseEvent = function (ev) {
		var preferredOriginID,
		    preferredMagnitudeID,
		    eventAuthor,
		    eventCatalog,
		    originIndex,
		    magnitudeIndex,
		    pickIndex,
		    amplitudeIndex,
		    stationMagnitudeIndex,
		    arrivalByPickIDIndex,
		    origins,
		    magnitudes;

		preferredOriginID = ev.preferredOriginID;
		preferredMagnitudeID = ev.preferredMagnitudeID;

		eventAuthor = ev['catalog:dataSource'];
		eventCatalog = ev['catalog:eventSource'];

		originIndex = _index(ev.origin, 'publicID');
		magnitudeIndex = _index(ev.magnitude, 'publicID');
		pickIndex = _index(ev.pick, 'publicID');
		amplitudeIndex = _index(ev.amplitude, 'publicID');
		stationMagnitudeIndex = _index(ev.stationMagnitude, 'publicID');
		arrivalByPickIDIndex = {};

		// parse origins and arrivals
		origins = [];
		_array(ev.origin).forEach(function (origin) {
			var o,
			    originAuthor,
			    arrivals;

			originAuthor = _get(origin, 'creationInfo', 'agencyID') || eventAuthor;
			arrivals = [];
			_array(origin.arrival).forEach(function (arrival) {
				var pickID = arrival.pickID;
				arrivals.push({
					'pick': _get(pickIndex, pickID),
					'arrival': arrival
				});
				// update index for magnitudes.
				// done this way in case a magnitude doesn't have an originID,
				// but references picks with arrivals in another origin.
				if (pickID) {
					arrivalByPickIDIndex[pickID] = arrival;
				}
			});
			o = {
				'id': origin.publicID,
				'origin': origin,
				'author': originAuthor,
				'arrivals': arrivals
			};
			// insert preferred origin at front of list
			if (o.publicID === preferredOriginID) {
				origins.splice(0, 0, o);
			} else {
				origins.push(o);
			}
		});

		// parse magnitudes and amplitudes
		magnitudes = [];
		_array(ev.magnitude).forEach(function (magnitude) {
			var m,
			    magnitudeAuthor,
			    contributions;

			magnitudeAuthor = _get(magnitude, 'creationInfo', 'agencyID') ||
					eventAuthor;
			contributions = [];
			_array(magnitude.stationMagnitudeContribution).
					forEach(function (contribution) {
				var stationMagnitudeID,
				    stationMagnitude,
				    amplitude,
				    waveformID,
				    arrival;
				stationMagnitudeID = contribution.stationMagnitudeID;
				stationMagnitude = stationMagnitudeIndex[stationMagnitudeID];
				amplitude = _get(amplitudeIndex,
						_get(stationMagnitude, 'amplitudeID'));
				waveformID = _get(amplitude, 'waveformID') ||
						_get(stationMagnitude, 'waveformID');
				// using a global arrivalByPickID index,
				// need to change if multiple origin arrivals reference the same pickID
				arrival = _get(arrivalByPickIDIndex, _get(amplitude, 'pickID'));

				contributions.push({
					'contribution': contribution,
					'stationMagnitude': stationMagnitude,
					'amplitude': amplitude,
					'waveformID': waveformID,
					'arrival': arrival
				});
			});
			m = {
				'id': magnitude.publicID,
				'magnitude': magnitude,
				'author': magnitudeAuthor,
				'contributions': contributions
			};
			// insert preferred magnitude at front of list
			if (m.publicID === preferredMagnitudeID) {
				magnitudes.splice(0, 0, m);
			} else {
				magnitudes.push(m);
			}
		});

		return {
			'event': ev,
			'author': eventAuthor,
			'catalog': eventCatalog,
			'origins': origins,
			'magnitudes': magnitudes,
			'preferredOriginID': preferredOriginID,
			'preferredMagnitudeID': preferredMagnitudeID
		};
	};

	/**
	 * @return {String} iso8601 timestamp when quakeml message was updated.
	 */
	Quakeml.prototype.getUpdated = function () {
		return this._updated;
	};

	/**
	 * @return {Element} event element from quakeml message.
	 */
	Quakeml.prototype.getEvent = function () {
		return this._event;
	};

	/**
	 * @return {Array<Object>} origins parsed from event element.
	 */
	Quakeml.prototype.getOrigins = function () {
		return this._event.origins;
	};

	/**
	 * @return {Array<Object>} magnitudes parsed from event element.
	 */
	Quakeml.prototype.getMagnitudes = function () {
		return this._event.magnitudes;
	};


	return Quakeml;
});

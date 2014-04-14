/* global define */
define([], function () {
	'use strict';

	/**
	 * Copy properties from source objects onto dest.
	 *
	 * @param dest {Object}
	 *        destination for copied properties.
	 * @param varargs {Object, ...}
	 *        source objects, processed in argument order from left to right.
	 *        all properties are copied from the source object to dest.
	 * @return {Object} dest, after copying source object properties.
	 */
	var _extend = function (dest /*, varargs */) {
		var src,
		    i,
		    key;
		for (i = 1; i < arguments.length; i++) {
			src = arguments[i];
			if (typeof src === 'object' && src !== null) {
				for (key in src) {
					dest[key] = src[key];
				}
			}
		}
		return dest;
	};

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
	var _array = function (obj) {
		if (Array.isArray(obj)) {
			return obj;
		} else if (typeof obj === 'object' && obj !== null) {
			return [obj];
		} else {
			return [];
		}
	};

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
	var _index = function (objs, key, index) {
		var obj,
		    i,
		    len;
		index = index || {};
		if (objs) {
			if (!Array.isArray(objs)) {
				objs = [objs];
			}
			for (i = 0, len = objs.length; i < len; i++) {
				obj = objs[i];
				index[obj[key]] = obj;
			}
		}
		return index;
	};


	/**
	 * Construct a new Quakeml Event.
	 *
	 * @param ev {Element}
	 *        Quakeml event(like) element
	 */
	var QuakemlEvent = function (ev) {
		this._ev = ev;
		this._initialize();
	};

	/**
	 * @return {Object} quakeml event element as json object.
	 */
	QuakemlEvent.prototype.getEvent = function () {
		return this._ev;
	};

	/**
	 * @return {Array<Object>} origins parsed from event.
	 */
	QuakemlEvent.prototype.getOrigins = function () {
		return this._origins;
	};

	/**
	 * @return {Array<Object>} magnitudes parsed from event.
	 */
	QuakemlEvent.prototype.getMagnitudes = function () {
		return this._magnitudes;
	};


	/**
	 * Initialize this event, by parsing origins and magnitudes.
	 */
	QuakemlEvent.prototype._initialize = function () {
		var ev = this._ev;

		this._author = ev['catalog:dataSource'];
		this._catalog = ev['catalog:eventSource'];
		this._preferredOriginID = ev.preferredOriginID || null;
		this._preferredMagnitudeID = ev.preferredMagnitudeID || null;

		this._pickIndex = _index(ev.pick, 'publicID');
		this._amplitudeIndex = _index(ev.amplitude, 'publicID');
		this._stationMagnitudeIndex = _index(ev.stationMagnitude, 'publicID');

		this._origins = this._parseOrigins(_array(ev.origin));
		this._magnitudes = this._parseMagnitudes(_array(ev.magnitude));
	};

	/**
	 * Parse an array of origin elements.
	 *
	 * @param origins {Array<Element>}
	 *        array of quakeml origin elements.
	 * @return {Array<Object>} parsed origin objects.
	 */
	QuakemlEvent.prototype._parseOrigins = function (origins) {
		var parsed = [],
		    preferredOriginID = this._preferredOriginID,
		    origin,
		    o;
		for (o = 0; o < origins.length; o++) {
			origin = _extend({}, origins[o]);
			origin.isPreferred = (preferredOriginID === origin.publicID);
			origin.arrivals = this._parseArrivals(_array(origin.arrival));
			delete origin.arrival;
			if (origin.isPreferred) {
				parsed.unshift(origin);
			} else {
				parsed.push(origin);
			}
		}
		return parsed;
	};

	/**
	 * Parse an array of arrival elements.
	 *
	 * @param arrivals {Array<Element>}
	 *        array of quakeml arrival elements.
	 * @return {Array<Object>} parsed arrival objects.
	 */
	QuakemlEvent.prototype._parseArrivals = function (arrivals) {
		var parsed = [],
		    pickIndex = this._pickIndex,
		    arrival,
		    a;
		for (a = 0; a < arrivals.length; a++) {
			arrival = _extend({}, arrivals[a]);
			if (typeof arrival.pickID === 'string') {
				arrival.pick = pickIndex[arrival.pickID] || null;
			} else {
				arrival.pick = null;
			}
			parsed.push(arrival);
		}
		return parsed;
	};

	/**
	 * Parse and array of magnitude elements.
	 *
	 * @param magnitudes {Array<Element>}
	 *        array of quakeml magnitude elements.
	 * @return {Array<Object>} parsed magnitude objects.
	 */
	QuakemlEvent.prototype._parseMagnitudes = function (magnitudes) {
		var parsed = [],
		    preferredMagnitudeID = this._preferredMagnitudeID,
		    magnitude,
		    m;
		for (m = 0; m < magnitudes.length; m++) {
			magnitude = _extend({}, magnitudes[m]);
			magnitude.isPreferred = (preferredMagnitudeID === magnitude.publicID);
			magnitude.contributions = this._parseMagnitudeContributions(
					_array(magnitude.stationMagnitudeContribution));
			delete magnitude.stationMagnitudeContribution;
			if (magnitude.isPreferred) {
				parsed.unshift(magnitude);
			} else {
				parsed.push(magnitude);
			}
		}
		return parsed;
	};

	/**
	 * Parse an array of stationMagnitudeContribution elements.
	 *
	 * @param contributions {Array<Element>}
	 *        array of quakeml stationMagnitudeContribution elements.
	 * @return {Array<Object>} parsed stationMagnitudeContribution objects.
	 */
	QuakemlEvent.prototype._parseMagnitudeContributions =
			function (contributions) {
		var parsed = [],
		    stationMagnitudeIndex = this._stationMagnitudeIndex,
		    amplitudeIndex = this._amplitudeIndex,
		    contribution,
		    stationMagnitude,
		    c;
		for (c = 0; c < contributions.length; c++) {
			contribution = _extend({}, contributions[c]);
			stationMagnitude = _extend({},
					stationMagnitudeIndex[contribution.stationMagnitudeID]);
			contribution.stationMagnitude = stationMagnitude;
			if (typeof stationMagnitude.amplitudeID === 'string') {
				stationMagnitude.amplitude = _extend({},
						amplitudeIndex[stationMagnitude.amplitudeID]);
			}
			parsed.push(contribution);
		}
		return parsed;
	};


	return QuakemlEvent;
});
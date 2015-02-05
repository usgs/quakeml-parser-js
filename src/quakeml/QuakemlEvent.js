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
  var _this,
      _initialize,

      _amplitudeIndex,
      _catalog,
      _ev,
      _magnitudes,
      _origins,
      _preferredOriginID,
      _preferredMagnitudeID,
      _pickIndex,
      _stationMagnitudeIndex,

      _parseOrigins,
      _parseArrivals,
      _parseMagnitudes,
      _parseMagnitudeContributions;


  _this = Object.create({});

  /**
   * Initialize this event, by parsing origins and magnitudes.
   */
  _initialize = function () {
    _ev = ev;
    _catalog = _ev['catalog:eventSource'];
    _preferredOriginID = _ev.preferredOriginID || null;
    _preferredMagnitudeID = _ev.preferredMagnitudeID || null;

    _pickIndex = _index(_ev.pick, 'publicID');
    _amplitudeIndex = _index(_ev.amplitude, 'publicID');
    _stationMagnitudeIndex = _index(_ev.stationMagnitude, 'publicID');

    _origins = _parseOrigins(_array(_ev.origin));
    _magnitudes = _parseMagnitudes(_array(_ev.magnitude));
    ev = null;
  };

  /**
   * Parse an array of origin elements.
   *
   * @param origins {Array<Element>}
   *        array of quakeml origin elements.
   * @return {Array<Object>} parsed origin objects.
   */
  _parseOrigins = function (origins) {
    var parsed = [],
        preferredOriginID = _preferredOriginID,
        origin,
        o;
    for (o = 0; o < origins.length; o++) {
      origin = _extend({}, origins[o]);
      origin.isPreferred = (preferredOriginID === origin.publicID);
      origin.arrivals = _parseArrivals(_array(origin.arrival));
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
  _parseArrivals = function (arrivals) {
    var parsed = [],
        pickIndex = _pickIndex,
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
  _parseMagnitudes = function (magnitudes) {
    var parsed = [],
        preferredMagnitudeID = _preferredMagnitudeID,
        magnitude,
        m;
    for (m = 0; m < magnitudes.length; m++) {
      magnitude = _extend({}, magnitudes[m]);
      magnitude.isPreferred = (preferredMagnitudeID === magnitude.publicID);
      magnitude.contributions = _parseMagnitudeContributions(
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
  _parseMagnitudeContributions = function (contributions) {
    var parsed = [],
        stationMagnitudeIndex = _stationMagnitudeIndex,
        amplitudeIndex = _amplitudeIndex,
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

  /**
   * @return {Object} quakeml event element as json object.
   */
  _this.getEvent = function () {
    return _ev;
  };

  /**
   * @return {Array<Object>} origins parsed from event.
   */
  _this.getOrigins = function () {
    return _origins;
  };

  /**
   * @return {Array<Object>} magnitudes parsed from event.
   */
  _this.getMagnitudes = function () {
    return _magnitudes;
  };

  _initialize();
  return _this;

};

module.exports = QuakemlEvent;

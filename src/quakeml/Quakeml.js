'use strict';

var XmlUtil = require('quakeml/XmlUtil'),
    QuakemlEvent = require('quakeml/QuakemlEvent');


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
  var _this,
      _initialize,

      _event,
      _updated,
      _quakeml;


  _this = Object.create({});

  /**
   * Initialize the quakeml object.
   */
  _initialize = function (options) {
    var ev,
        eventElement = options.eventElement || 'event',
        eventParameters,
        json,
        quakeml;

    json = XmlUtil.xmlToJson(options.xml);
    quakeml = json['q:quakeml'];
    eventParameters = quakeml.eventParameters;
    ev = eventParameters[eventElement];
    if (typeof ev === 'undefined') {
      throw new Error('Event element ' + eventElement + ' not found');
    }

    _quakeml = quakeml;
    _updated = eventParameters.creationInfo.creationTime;
    _event = QuakemlEvent((Array.isArray(ev) ? ev[0] : ev), eventParameters);
  };


  /**
   * @return {Array<Object>} magnitudes parsed from event element.
   */
  _this.getMagnitudes = function () {
    return _event.getMagnitudes();
  };

  /**
   * @return {Array<Object>} origins parsed from event element.
   */
  _this.getOrigins = function () {
    return _event.getOrigins();
  };

  /**
   * @return {Element} event element from quakeml message.
   */
  _this.getQuakemlEvent = function () {
    return _event.getEvent();
  };

    /**
   * @return {String} iso8601 timestamp when quakeml message was updated.
   */
  _this.getUpdated = function () {
    return _updated;
  };

  _initialize(options);
  options=null;
  return _this;

};


module.exports = Quakeml;

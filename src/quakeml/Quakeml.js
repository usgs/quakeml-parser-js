/* global define */
define([
	'./XmlUtil',
	'./QuakemlEvent'
], function (
	XmlUtil,
	QuakemlEvent
) {
	'use strict';


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
		    json,
		    quakeml,
		    eventParameters,
		    ev;

		json = XmlUtil.xmlToJson(options.xml);
		quakeml = json['q:quakeml'];
		eventParameters = quakeml.eventParameters;
		ev = eventParameters[eventElement];
		if (typeof ev === 'undefined') {
			throw new Error('Event element ' + eventElement + ' not found');
		}

		this._quakeml = quakeml;
		this._updated = eventParameters.creationInfo.creationTime;
		this._event = new QuakemlEvent((Array.isArray(ev) ? ev[0] : ev));
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
		return this._event.getOrigins();
	};

	/**
	 * @return {Array<Object>} magnitudes parsed from event element.
	 */
	Quakeml.prototype.getMagnitudes = function () {
		return this._event.getMagnitudes();
	};


	return Quakeml;
});

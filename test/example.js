'use strict';

require.config({
	baseUrl: '..'
});

require([
	'quakeml/Quakeml'
], function (
	Quakeml
) {

	var url = 'quakeml/usc000p11f_phase-data.xml',
	    xhr,
	    el;

	url = 'quakeml/ci15481673_phase-data.xml';

	/**
	 * Output object properties.
	 *
	 * Properties are only output if they are
	 * - not an object
	 * - an object with a property "value".
	 */
	var showObject = function (obj) {
		var buf = [],
		    key,
		    value;
		// output obj properties as rows in table
		buf.push('<table><tbody>');
		for (key in obj) {
			value = obj[key];
			if (typeof value === 'object') {
				if (value === null || !value.hasOwnProperty('value')) {
					continue;
				}
				value = value.value;
			}
			buf.push('<tr><th scope="row">', key, '</th><td>', value, '</td></tr>');
		}
		buf.push('</tbody></table>');
		return buf.join('');
	};

	/**
	 * Show one origin.
	 *
	 * @param o {Object}
	 *        an origin object as parsed by Quakeml.
	 * @return {String} html markup.
	 */
	var showOrigin = function (o) {
		var buf = [],
		    origin = o.origin,
		    arrivals = o.arrivals;
		buf.push('<section class="origin">',
				'<header><h2>', o.id, '</h2></header>');
		// output origin properties
		buf.push(showObject(origin));
		// output origin arrivals
		if (arrivals.length === 0) {
			buf.push('<p>No arrivals contributed for this origin</p>');
		} else {
			buf.push(
					'<h3>Phase Arrival Times</h3>',
					'<table>',
					'<thead><tr>',
						'<th>',
							'<abbr title="Network Station Channel Location">NSCL</abbr>',
						'</th>',
						'<th>Distance</th>',
						'<th>Azimuth</th>',
						'<th>Phase</th>',
						'<th>Arrival Time</th>',
						'<th>Status</th>',
						'<th>Residual</th>',
						'<th>Weight</th>',
					'</tr></thead>',
					'<tbody>');
			arrivals.forEach(function (a) {
				var arrival = a.arrival,
				    pick = a.pick,
				    station = pick.waveformID;
				buf.push(
						'<tr>',
							'<td>',
								station.networkCode,
								' ', station.stationCode,
								' ', station.channelCode,
								' ', station.locationCode,
							'</td>',
							'<td>', arrival.distance, '&deg;</td>',
							'<td>', arrival.azimuth, '&deg;</td>',
							'<td>', arrival.phase, '</td>',
							'<td>', pick.time.value, '</td>',
							'<td>', pick.evaluationMode, '</td>',
							'<td>', arrival.timeResidual, '</td>',
							'<td>', arrival.timeWeight, '</td>',
						'</tr>');
			});
			buf.push('</tbody></table>');
		}
		buf.push('</section>');
		return buf.join('');
	};

	var showMagnitude = function (m) {
		var buf = [],
		    magnitude = m.magnitude,
		    contributions = m.contributions;
		buf.push('<section class="magnitude">',
				'<header><h2>', m.id, '</h2></header>');
		// output magnitude properties
		buf.push(showObject(magnitude));
		// output magnitude amplitudes
		if (contributions.length === 0) {
			buf.push('<p>No amplitudes contributed for this magnitude</p>');
		} else {
			buf.push(
					'<h3>Magnitude Parameters</h3>',
					'<table>',
					'<thead><tr>',
						'<th>',
							'<abbr title="Network Station Channel Location">NSCL</abbr>',
						'</th>',
						'<th>Distance</th>',
						'<th>Azimuth</th>',
						'<th>Type</th>',
						'<th>Amplitude</th>',
						'<th>Period</th>',
						'<th>Status</th>',
						'<th>Magnitude</th>',
						'<th>Weight</th>',
					'</tr></thead>',
					'<tbody>');
			contributions.forEach(function (c) {
				var contribution = c.contribution,
				    stationMagnitude = c.stationMagnitude,
				    amplitude = c.amplitude,
				    arrival = c.arrival,
				    station = stationMagnitude.waveformID || amplitude.waveformID,
				    distance = '-',
				    azimuth = '-',
				    amp = '-',
				    period = '-',
				    status = '-';
				if (arrival) {
					distance = arrival.distance + '&deg;';
					azimuth = arrival.azimuth + '&deg;';
				}
				if (amplitude) {
					if (amplitude.genericAmplitude) {
						amp = amplitude.genericAmplitude.value + amplitude.unit;
					}
					if (amplitude.period) {
						period = amplitude.period.value + 's';
					}
					status = amplitude.evaluationMode;
				}
				buf.push(
						'<tr>',
							'<td>',
								station.networkCode,
								' ', station.stationCode,
								' ', station.channelCode,
								' ', station.locationCode,
							'</td>',
							'<td>', distance, '</td>',
							'<td>', azimuth, '</td>',
							'<td>', stationMagnitude.type, '</td>',
							'<td>', amp, '</td>',
							'<td>', period, '</td>',
							'<td>', status, '</td>',
							'<td>', stationMagnitude.mag.value, '</td>',
							'<td>', contribution.weight, '</td>',
						'</tr>');
			});
			buf.push('</tbody></table>');
		}
		buf.push('</section>');
		return buf.join('');
	};


	// request, parse, and display, quakeml
	el = document.querySelector('#quakeml-example');
	el.innerHTML = 'Loading...';
	xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onload = function () {
		var quakeml = new Quakeml({xml: xhr.responseXML}),
		    buf = [];
		// link to original message
		buf.push('<p><a href="', url, '" target="_blank">',
				'Original Quakeml Message',
				'</a></p>');
		// list origins
		buf.push('<div class="origins">');
		quakeml.getOrigins().forEach(function (o) {
			buf.push(showOrigin(o));
		});
		buf.push('</div>');
		// list magnitudes
		buf.push('<div class="magnitudes">');
		quakeml.getMagnitudes().forEach(function (m) {
			buf.push(showMagnitude(m));
		});
		buf.push('</div>');
		// insert into page
		el.innerHTML = buf.join('');
	};
	xhr.onerror = function (e) {
		el.innerHTML = 'Error loading quakeml: ' + e.message;
	};
	xhr.send();
});

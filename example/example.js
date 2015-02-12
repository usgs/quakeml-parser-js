'use strict';

var Quakeml = require('quakeml/Quakeml');

var url = 'data/ci15481673_phase-data.xml',
    xhr,
    el;

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
var showOrigin = function (origin) {
  var buf = [],
      arrivals = origin.arrivals,
      arrival,
      pick,
      station,
      a;
  buf.push('<section class="origin">',
      '<header><h2>', origin.publicID, '</h2></header>');
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
    for (a = 0; a < arrivals.length; a++) {
      arrival = arrivals[a];
      pick = arrival.pick;
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
    }
    buf.push('</tbody></table>');
  }
  buf.push('</section>');
  return buf.join('');
};

var showMagnitude = function (magnitude) {
  var buf = [],
      contributions = magnitude.contributions,
      contribution,
      stationMagnitude,
      amplitude,
      station,
      amp,
      period,
      status,
      c;
  buf.push('<section class="magnitude">',
      '<header><h2>', magnitude.publicID, '</h2></header>');
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
          '<th>Type</th>',
          '<th>Magnitude</th>',
          '<th>Amplitude</th>',
          '<th>Period</th>',
          '<th>Status</th>',
          '<th>Weight</th>',
        '</tr></thead>',
        '<tbody>');
    for (c = 0; c < contributions.length; c++) {
      contribution = contributions[c];
      stationMagnitude = contribution.stationMagnitude;
      amplitude = stationMagnitude.amplitude || {};
      station = stationMagnitude.waveformID || amplitude.waveformID;

      amp = '-';
      period = '-';
      status = '-';
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
            '<td>', stationMagnitude.type, '</td>',
            '<td>', stationMagnitude.mag.value, '</td>',
            '<td>', amp, '</td>',
            '<td>', period, '</td>',
            '<td>', status, '</td>',
            '<td>', contribution.weight, '</td>',
          '</tr>');
    }
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
  var quakeml = Quakeml({xml: xhr.responseXML}),
      buf = [],
      origins,
      o,
      magnitudes,
      m;
  // link to original message
  buf.push('<p><a href="', url, '" target="_blank">',
      'Original Quakeml Message',
      '</a></p>');
  // list origins
  buf.push('<div class="origins">');
  origins = quakeml.getOrigins();
  for (o = 0; o < origins.length; o++) {
    buf.push(showOrigin(origins[o]));
  }
  buf.push('</div>');
  // list magnitudes
  buf.push('<div class="magnitudes">');
  magnitudes = quakeml.getMagnitudes();
  for (m = 0; m < magnitudes.length; m++) {
    buf.push(showMagnitude(magnitudes[m]));
  }
  buf.push('</div>');
  // insert into page
  el.innerHTML = buf.join('');
};
xhr.onerror = function (e) {
  el.innerHTML = 'Error loading quakeml: ' + e.message;
};
xhr.send();

/* global define, describe, it, before */
define([
	'chai',

	'quakeml/Quakeml'
], function (
	chai,

	Quakeml
) {
	'use strict';
	var expect = chai.expect;


	var xhrGet = function(url, success, error) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function () {
			success(this);
		};
		xhr.onerror = function (err) {
			error(err);
		};
		xhr.open('GET', url, true);
		xhr.send();
	};


	describe('Unit tests for the "Quakeml" class', function () {

		describe('origin', function () {
			var quakeml = null;

			before(function (done) {
				xhrGet(
					'quakeml/usc000nwtr_origin.xml',
					function (xhr) {
						quakeml = new Quakeml({xml:xhr.responseXML});
						done();
					},
					function (err) {
						done(err);
					}
				);
			});

			it('parses origins', function () {
				var origins = quakeml.getOrigins(),
				    origin;
				expect(origins).to.not.equal(null);
				expect(origins.length).to.equal(1);
				origin = origins[0];
				expect(origin.isPreferred).to.equal(true);
				expect(origin.time.value).to.equal('2014-03-30T12:34:42.060Z');
				expect(origin.latitude.value).to.equal('44.7728');
				expect(origin.longitude.value).to.equal('-110.6598');
			});

			it('parses magnitudes', function () {
				var magnitude = quakeml.getMagnitudes()[0];
				expect(magnitude.mag.value).to.equal('4.8');
				expect(magnitude.type).to.equal('mb');
			});
		});

		describe('phase', function () {
			var quakeml = null;

			before(function (done) {
				xhrGet(
					'quakeml/usc000p11f_phase-data.xml',
					function (xhr) {
						quakeml = new Quakeml({xml:xhr.responseXML});
						done();
					},
					function (err) {
						done(err);
					}
				);
			});

			it('preferred origin is first in array', function () {
				var ev = quakeml.getEvent(),
				    origins = quakeml.getOrigins(),
				    i;
				expect(origins[0].isPreferred).to.equal(true);
				expect(origins[0].publicID).to.equal(ev._preferredOriginID);
				expect(origins.length > 1).to.equal(true);
				for (i = 1; i < origins.length; i++) {
					expect(origins[i].isPreferred).to.equal(false);
				}
			});

			it('adds pick to origin arrivals', function () {
				var origin = quakeml.getOrigins()[0],
				    arrival = origin.arrivals[0];

				expect(arrival.publicID).to.equal('quakeml:us.anss.org/arrival/c000p11f/us_2989_bpid-12003728798');
				expect(arrival.pickID).to.equal('quakeml:us.anss.org/pick/c000p11f/us_2989_bpid-12003728798');
				expect(arrival.pick.publicID).to.equal(arrival.pickID);
				expect(arrival.pick.time.value).to.equal('2014-04-02T16:14:10.73Z');
			});

			it('preferred magnitude is first in array', function () {
				var ev = quakeml.getEvent(),
				    magnitudes = quakeml.getMagnitudes(),
				    i;
				expect(magnitudes[0].isPreferred).to.equal(true);
				expect(magnitudes[0].publicID).to.equal(ev._preferredMagnitudeID);
				expect(magnitudes.length > 1).to.equal(true);
				for (i = 1; i < magnitudes.length; i++) {
					expect(magnitudes[i].isPreferred).to.equal(false);
				}
			});

			it('adds amplitude to magnitude contributions', function () {
				var magnitude = quakeml.getMagnitudes()[1],
				    contribution = magnitude.contributions[0],
				    stationMagnitude = contribution.stationMagnitude,
				    amplitude = stationMagnitude.amplitude;

				expect(contribution.weight).to.equal('1.00');
				expect(contribution.stationMagnitudeID).to.equal('quakeml:us.anss.org/stationmagnitude/ta_109c_bhz_--/mb');
				expect(stationMagnitude.publicID).to.equal(contribution.stationMagnitudeID);
				expect(stationMagnitude.mag.value).to.equal('5.65');
				expect(stationMagnitude.type).to.equal('mb');
				expect(stationMagnitude.amplitudeID).to.equal('quakeml:us.anss.org/amp/ta_109c_bhz_--/mb');
				expect(amplitude.publicID).to.equal(stationMagnitude.amplitudeID);
				expect(amplitude.genericAmplitude.value).to.equal('1.716e-007');
				expect(amplitude.type).to.equal('AMB');
				expect(amplitude.unit).to.equal('m');
				expect(amplitude.period.value).to.equal('1.2500');
			});
		});

	});

});

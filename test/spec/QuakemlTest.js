
/* global define, describe, it, before */
define([
	'chai',

	'Quakeml'
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
				expect(quakeml.getOrigins()).to.not.equal(null);
			});

			it('parses magnitudes', function () {
				expect(quakeml.getMagnitudes()).to.not.equal(null);
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

			it('parses preferred origin', function () {
				expect(quakeml.getOrigins()[0]).to.not.equal(null);
			});

			it('parses origin arrivals', function () {
				expect(quakeml.getOrigins()[0].arrivals.length).to.not.equal(0);
			});

			it('parses magnitude contributions', function () {
				expect(quakeml.getMagnitudes()[0].contributions.length).to.not.equal(0);
			});

		});

	});

});

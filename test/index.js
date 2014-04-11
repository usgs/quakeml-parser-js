'use strict';

if (typeof Array.prototype.forEach === 'undefined') {
	// for phantomjs
	Array.prototype.forEach = function (callback) {
		var i, len;
		for (i = 0, len = this.length; i < len; i++) {
			callback(this[i], i, this);
		}
	};
}


require.config({
	baseUrl: '..',
	paths: {
		mocha: 'mocha/mocha',
		chai: 'chai/chai'
	},
	shim: {
		mocha: {
			exports: 'mocha'
		},
		chai: {
			deps: ['mocha'],
			exports: 'chai'
		}
	}
});

require([
	'mocha',
], function (
	mocha
) {

	mocha.setup('bdd');

	// Add each test class here as they are implemented
	require([
		'spec/XmlUtilTest',
		'spec/QuakemlTest'
	], function () {
		if (window.mochaPhantomJS) {
			window.mochaPhantomJS.run();
		} else {
			mocha.run();
		}
	});
});

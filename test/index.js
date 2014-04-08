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
		chai: 'chai/chai',
		Quakeml: 'quakeml/Quakeml'
	},
	shim: {
		mocha: {
			exports: 'mocha'
		},
		chai: {
			deps: ['mocha'],
			exports: 'chai'
		}
	},
	packages: [
		{
			name: 'quakeml',
			main: 'Quakeml'
		}
	]
});

require([
	'mocha',
], function (
	mocha
) {

	mocha.setup('bdd');

	// Add each test class here as they are implemented
	require([
		'spec/QuakemlTest'
	], function () {
		if (window.mochaPhantomJS) {
			window.mochaPhantomJS.run();
		} else {
			mocha.run();
		}
	});
});

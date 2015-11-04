'use strict';

var config = require('./config');

var browserify = {
  options: {
    browserifyOptions: {
      debug: true,
      paths: [
        process.cwd() + '/' + config.src
      ]
    }
  },

  // source bundles
  source: {
    src: [],
    dest: config.build + '/' + config.src + '/quakeml-parser.js',
    options: {
      alias: [
        './src/quakeml/Quakeml.js:quakeml/Quakeml'
      ]
    }
  },

  test: {
    src: config.test + '/test.js',
    dest: config.build + '/' + config.test + '/test.js',
    options: {
      external: [
        'quakeml/Quakeml'
      ]
    }
  }
};

module.exports = browserify;

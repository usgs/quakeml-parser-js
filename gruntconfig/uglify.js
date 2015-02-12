'use strict';

var config = require('./config');

var uglify = {
  dist: {
    src:config.build + '/' + config.src + '/quakeml-parser.js',
    dest:config.dist + '/quakeml-parser.js'
  }
};

module.exports = uglify;

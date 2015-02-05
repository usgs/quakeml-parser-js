'use strict';

var config = require('./config');

var uglify = {
  dist: {
    files: {}
  }
};

uglify.dist.files[config.dist + '/quakeml-parser.js'] = [
  config.build + '/' + config.src + '/quakeml-parser.js'
];

module.exports = uglify;

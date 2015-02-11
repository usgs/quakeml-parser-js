'use strict';

var config = require('./config');

var uglify = {
  dist: {
    src:config.dist + '/quakeml-parser.js',
    dest:config.build + '/' + config.src + '/quakeml-parser.js'
  }
};

// uglify.dist.files[config.dist + '/quakeml-parser.js'] = [
//   config.build + '/' + config.src + '/quakeml-parser.js'
// ];

module.exports = uglify;

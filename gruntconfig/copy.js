'use strict';

var config = require('./config');

var copy = {

  test: {
    expand: true,
    cwd: config.test,
    src: ['**/*.html'],
    dest: config.build + '/' + config.test
  }

};

module.exports = copy;

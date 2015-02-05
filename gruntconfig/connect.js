'use strict';

var config = require('./config');

var connect = {
  options: {
    hostname: '*'
  },
  dev: {
    options: {
      base: [
        config.build + '/' + config.src,
        config.example,
        'resources'
      ],
      livereload: true,
      open: 'http://localhost:8000/example.html',
      port: 8000
    }
  },
  test: {
    options: {
      base: [
        config.build + '/' + config.src,
        config.build + '/' + config.test,
        'resources',
        'node_modules'
      ],
      open: 'http://localhost:8001/test.html',
      port: 8001
    }
  },
  dist: {
    options: {
      base: [
        config.dist,
        config.example,
        'resources',
        'node_modules'
      ],
      keepalive: true,
      open: 'http://localhost:8002/example.html',
      port: 8002
    }
  }
};

module.exports = connect;

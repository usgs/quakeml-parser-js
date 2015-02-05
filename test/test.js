/* global mocha */

// PhantomJS is missing native bind support,
//     https://github.com/ariya/phantomjs/issues/10522
// Polyfill from:
//     https://developer.mozilla.org
//         /en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
  'use strict';
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5 internal IsCallable
      throw new TypeError('object to be bound is not callable');
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        FNOP = function () {},
        fBound;

    fBound = function () {
      return fToBind.apply(
          (this instanceof FNOP && oThis ? this : oThis),
          aArgs.concat(Array.prototype.slice.call(arguments)));
    };

    FNOP.prototype = this.prototype;
    fBound.prototype = new FNOP();

    return fBound;
  };
}

if (typeof Array.prototype.forEach === 'undefined') {
  // for phantomjs
  Array.prototype.forEach = function (callback) {
    'use strict';
    var i, len;
    for (i = 0, len = this.length; i < len; i++) {
      callback(this[i], i, this);
    }
  };
}


(function () {
  'use strict';
  mocha.ui('bdd');
  mocha.reporter('html');

  require('./spec/XmlUtilTest');
  require('./spec/QuakemlTest');

  if (window.mochaPhantomJS) {
    window.mochaPhantomJS.run();
  } else {
    mocha.run();
  }
})(this);

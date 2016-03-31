/* global chai, describe, it */
'use strict';
var XmlUtil = require('quakeml/XmlUtil'),
    expect = chai.expect;

describe('XmlUtil unit tests', function () {

  describe('xmlToJson', function () {

    it('parses xml strings', function () {
      var xmlString = '<el><child1>value1</child1></el>',
          json = XmlUtil.xmlToJson(xmlString);

      expect(json.el.child1).to.equal('value1');
    });

    it('uses array if multiple elements have the same name', function () {
      var xmlString,
          json;

      xmlString = '<el>' +
          '<child1>value1</child1>' +
          '<child1>value2</child1>' +
          '</el>';
      json = XmlUtil.xmlToJson(xmlString);
      expect(Array.isArray(json.el.child1)).to.equal(true);
      expect(json.el.child1[0]).to.equal('value1');
      expect(json.el.child1[1]).to.equal('value2');
    });

    it('handles elements with attributes _and_ content', function () {
      var xmlString,
          json;

      xmlString = '<el>' +
          '<child1 attr1="value1">content</child1>' +
          '</el>';
      json = XmlUtil.xmlToJson(xmlString);
      expect(json.el.child1.attr1).to.equal('value1');
      expect(json.el.child1['#text']).to.equal('content');
    });
  });

});

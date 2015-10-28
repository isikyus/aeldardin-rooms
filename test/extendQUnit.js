// Extra assertions for qUnit

"use strict";

define([
  'QUnit'
],
function(QUnit) {
  // Check if actual and expected have the same elements, regardless of order.
  // Assumes they are both arrays.
  QUnit.assert.unorderedEqual = function(actual, expected, message) {
    var actualStrings = actual.map(function(value) { return JSON.stringify(value); });
    actualStrings.sort();

    var expectedStrings = actual.map(function(value) { return JSON.stringify(value); });
    expectedStrings.sort();

    this.deepEqual(actualStrings, expectedStrings, message);
  };
});
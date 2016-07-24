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

  // Assert that one string includes another.
  QUnit.assert.hasSubstring = function(haystack, needle, message) {
    this.notStrictEqual(haystack.indexOf(needle), -1, message);
  };

  // The reverse; assert a string _doesn't_ include another string.
  QUnit.assert.hasNoSubstring = function(haystack, needle, message) {
    this.strictEqual(haystack.indexOf(needle), -1, message);
  };
});
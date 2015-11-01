// Sets up the testing environment and loads modules.
// See http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests

"use strict";

require.config({
    paths: {
        'QUnit': 'lib/qunit-1.19.0'
    },
    shim: {
       'QUnit': {
           exports: 'QUnit',
           init: function() {
               QUnit.config.autoload = false;
               QUnit.config.autostart = false;
           }
       }
    }
});

require([
  'QUnit',
  'test/model',
  'test/changes',
  'test/extendQUnit'
],
function(QUnit, modelTests, changeTests) {

  modelTests.run();
  changeTests.run();

  QUnit.load();
  QUnit.start();
});
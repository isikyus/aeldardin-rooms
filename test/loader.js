// Sets up the testing environment and loads modules.
// See http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests

"use strict";

require.config({
    paths: {
        'QUnit': 'vendor/qunit-1.19.0',
        'jquery': 'vendor/jquery',
        'handlebars': 'vendor/handlebars',
        'text': 'vendor/text',
        'redux': 'vendor/redux'
    },
    shim: {
       'QUnit': {
           exports: 'QUnit',
           init: function() {
               QUnit.config.autoload = false;
               QUnit.config.autostart = false;
           }
       },
       'redux': {
         exports: 'Redux'
       }
    }
});

require([
  'QUnit',
  'test/reducer/map',
  'test/reducer/rooms_and_doors',
  'test/reducer/action',
  'test/reducer/selection',
  'test/html_ui',
  'test/canvas_ui',
  'test/extendQUnit'
],
function(QUnit, mapTests, roomAndDoorTests, actionTests, selectionTests, htmlUiTests, canvasUiTests) {

  mapTests.run();
  roomAndDoorTests.run();
  actionTests.run();
  selectionTests.run();
  htmlUiTests.run();
  canvasUiTests.run();

  QUnit.load();
  QUnit.start();
});

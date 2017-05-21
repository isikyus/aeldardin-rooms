// Sets up the testing environment and loads modules.
// See http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests

"use strict";

require.config({
    paths: {
        'QUnit': 'vendor/qunit-1.19.0',
        'jquery': 'vendor/jquery',
        'handlebars': 'vendor/handlebars',
        'text': 'vendor/text'
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
  'test/action_model',
  'test/selection_model',
  'test/html_ui',
  'test/canvas_ui',
  'test/extendQUnit'
],
function(QUnit, modelTests, changeTests, actionTests, selectionTests, htmlUiTests, canvasUiTests) {

  modelTests.run();
  changeTests.run();
  actionTests.run();
  selectionTests.run();
  htmlUiTests.run();
  canvasUiTests.run();

  QUnit.load();
  QUnit.start();
});

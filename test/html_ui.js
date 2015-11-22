// Integration tests, using the plain HTML UI (as opposed to canvas).

"use strict";
define([
  'QUnit',
  'map_controller'
],
function(QUnit, MapController) {
  var run = function() {
    QUnit.module('HTML UI');

    test('deleting rooms', function(assert) {
      var mapDiv = $('#test-map');
      var controller = new MapController(mapDiv.find('canvas')[0]);

      // Create a simple three-room map.
      var rooms = [
        { id: 0, x: 0, y: 0, width: 3, height: 2, wall_features: [] },
        { id: 1, x: 0, y: 2, width: 3, height: 2, wall_features: [] },
        { id: 2, x: 3, y: 0, width: 2, height: 4, wall_features: [] },
      ];
      controller.model.map.setRooms(rooms);

      // Select two rooms, and delete them once they are selected.
      var selectRooms = function() {
        mapDiv.find('#select_room_0').click();
        mapDiv.find('#select_room_2').click();
      };
      var deleteRooms = function() {
        mapDiv.find('#delete_selection').click();
      }
      selectRooms();
      deleteRooms();

      // Confirm that only the third room remains.
      assert.equal(mapDiv.find('#room_0').length, 0, 'Should delete room 0');
      assert.equal(mapDiv.find('#room_1').length, 1, 'Should leave room 1');
      assert.equal(mapDiv.find('#room_2').length, 0, 'Should delete room 2');
    });
  };
  return { run : run }
});
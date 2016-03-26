// Integration tests, using the canvas UI.

"use strict";
define([
  'QUnit',
  'map_controller',
  'hit_regions'
],
function(QUnit, MapController, hitRegions) {

  // Copy of variable in canvas_renderer. TODO: make the renderer's scale public.
  var scale = 50;

  var run = function() {
    QUnit.module('Canvas UI');

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

      var regions = hitRegions(mapDiv.find('canvas'));

      // Select two rooms, and delete them once they are selected.
      var selectRooms = function() {

        // 1.5, 1.5 is within Room 0.
        regions._fire('click', 1.5 * scale, 1.5 * scale);

        // 3.5, 2 is within Room 2.
        regions._fire('click', 3.5 * scale, 2 * scale);
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
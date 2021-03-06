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
        { id: 0, x: 0, y: 0, width: 3, height: 2 },
        { id: 1, x: 0, y: 2, width: 3, height: 2 },
        { id: 2, x: 3, y: 0, width: 2, height: 4 },
      ];
      rooms.forEach(function(room) {
        controller.store.dispatch({
          type: 'map.rooms.add',
          payload: room
        });
      });

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
      // TODO: shouldn't depend on an unrelated UI.
      assert.equal(mapDiv.find('#room_0').length, 0, 'Should delete room 0');
      assert.equal(mapDiv.find('#room_1').length, 1, 'Should leave room 1');
      assert.equal(mapDiv.find('#room_2').length, 0, 'Should delete room 2');
    });

    test('adding rooms', function(assert) {
      var mapDiv = $('#test-map');
      var controller = new MapController(mapDiv.find('canvas')[0]);

      // TODO: make this part of common setup code.
      var regions = hitRegions(mapDiv.find('canvas'));

      // TODO: extract these to separate tests.
      // Create a room with exact coordinates.
      var createExactRoom = function() {
        regions._fire('mousedown', 1 * scale, 1 * scale);
        regions._fire('mouseup', 2 * scale, 4 * scale);
      };

      // Create a room with inexact coordinates, to test rounding
      var createInexactRoom = function() {
        regions._fire('mousedown', 2.1 * scale, 0.9 * scale);
        regions._fire('mouseup', 2.7 * scale, 3.4 * scale);
      };

      // Create a room by moving the mouse left and up (should reverse origin and final corners).
      var createRoomMovingLeftAndUp = function() {
        regions._fire('mousedown', 3 * scale, 4 * scale);
        regions._fire('mouseup', 2 * scale, 3 * scale);
      };

      createExactRoom();
      createInexactRoom();
      createRoomMovingLeftAndUp();

      var rooms = controller.store.getState().map.state.rooms;
      assert.equal(rooms[0].x, 1);
      assert.equal(rooms[0].y, 1);
      assert.equal(rooms[0].width, 1);
      assert.equal(rooms[0].height, 3);

      assert.equal(rooms[1].x, 2);
      assert.equal(rooms[1].y, 1);
      assert.equal(rooms[1].width, 1);
      assert.equal(rooms[1].height, 2);

      assert.equal(rooms[2].x, 2);
      assert.equal(rooms[2].y, 3);
      assert.equal(rooms[2].width, 1);
      assert.equal(rooms[2].height, 1);
    });

    test('cancelling a room by moving out of the map', function(assert) {
      var mapDiv = $('#test-map');
      var controller = new MapController(mapDiv.find('canvas')[0]);
      var store = controller.store;

      // TODO: make this part of common setup code.
      var regions = hitRegions(mapDiv.find('canvas'));

      // Start creating a room, and check initial state.
      regions._fire('mousedown', 1 * scale, 1 * scale);
      assert.deepEqual(
        store.getState().map.pending.action.payload,
        { x: 1, y : 1, width: 0, height: 0}
      );

      regions._fire('mouseleave', 0, 0);
      assert.equal(store.getState().map.pending.action, null);

      assert.deepEqual(store.getState().map.state.rooms, []);
    });
  };
  return { run : run }
});

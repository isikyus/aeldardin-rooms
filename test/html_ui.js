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
        { id: 0, x: 0, y: 0, width: 3, height: 2, wallFeatures: [] },
        { id: 1, x: 0, y: 2, width: 3, height: 2, wallFeatures: [] },
        { id: 2, x: 3, y: 0, width: 2, height: 4, wallFeatures: [] },
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

    QUnit.module('Adding rooms');

    test('creates the room', function(assert) {
      // TODO: extract to helper
      var mapDiv = $('#test-map');
      var controller = new MapController(mapDiv.find('canvas')[0]);

      controller.model.map.setRooms([]);

      // Fill in the form to create a new room.
      var defineNewRoom = function() {
        mapDiv.find('#add_room').click();
        mapDiv.find('#new-room-x').val(1);
        mapDiv.find('#new-room-y').val(3);
        mapDiv.find('#new-room-width').val(5);

        // Fire a change event so the listener updates the model state.
        mapDiv.find('#new-room-height').val(3).change();
      };

      // Actually create the room.
      var createRoom = function() {
        mapDiv.find('#submit-add-room').click();
      };

      defineNewRoom();
      createRoom();

      var newRoomDiv = mapDiv.find('.room').first();
      assert.equal(newRoomDiv.length, 1, 'Should create a details block for that room');
      assert.equal(newRoomDiv.find('.edit-room').data('room-key'), 1, 'gives the new room a key of 1');

      // One square is five feet; the code works in squares, but the user sees text in feet.
      assert.ok(newRoomDiv.text().indexOf('25 feet east-to-west') !== -1, 'includes correct width');
      assert.ok(newRoomDiv.text().indexOf('15 feet north-to-south') !== -1, 'includes correct height');

    });
  };
  return { run : run }
});
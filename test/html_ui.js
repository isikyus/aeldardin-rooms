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

    test('deleting doors', function(assert) {
      var mapDiv = $('#test-map');
      var controller = new MapController(mapDiv.find('canvas')[0]);
      var map = controller.model.map;

      // Create a simple map.
      var rooms = [
        { id: 0, x: 0, y: 0, width: 3, height: 2, wallFeatures: [] },
        { id: 1, x: 0, y: 2, width: 3, height: 2, wallFeatures: [] },
        { id: 2, x: 3, y: 0, width: 2, height: 4, wallFeatures: [] },
      ];
      map.setRooms(rooms);

      // Add some doors.
      var southDoorId = map.addDoor(0, 1, 'south');
      var northDoorId = map.addDoor(2, 2, 'north');
      var eastDoorId = map.addDoor(2, 2, 'east');

      // Select two of those doors, and delete them.
      mapDiv.find('#select_door_' + southDoorId).click();
      mapDiv.find('#select_door_' + eastDoorId).click();
      mapDiv.find('#delete_selection').click();

      // Confirm that only the third door remains.
      assert.deepEqual(mapDiv.find('#room_0_data .exits li').length, 0, 'Should delete the southwards door');

      var roomOneExits = mapDiv.find('#room_1_data .exits');
      assert.deepEqual(roomOneExits.find('#door_' + eastDoorId).length, 0, 'Should delete the door leading west');
      assert.deepEqual(roomOneExits.find('#door_' + northDoorId).length, 1, 'Should keep the door north to the other room');
    });

    QUnit.module('HTML UI -- Adding rooms');

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
      assert.hasSubstring(newRoomDiv.text(), '25 feet east-to-west', 'includes correct width');
      assert.hasSubstring(newRoomDiv.text(), '15 feet north-to-south', 'includes correct height');

    });

    QUnit.module('HTML UI -- Adding doors');

    test('adding a door joining two rooms', function(assert) {
      var mapDiv = $('#test-map');
      var controller = new MapController(mapDiv.find('canvas')[0]);
      var map = controller.model.map;

      // Create a simple map.
      var rooms = [
        { id: 0, x: 3, y: 0, width: 4, height: 2, wallFeatures: [] },
        { id: 1, x: 5, y: 2, width: 2, height: 2, wallFeatures: [] },
      ];
      map.setRooms(rooms);

      // Open the add-door form, and pick a direction.
      mapDiv.find('#room_0_data .js-add_door').click();
      mapDiv.find('#door-direction').val('south');

      // Check the available locations make sense.
      // TODO: write a separate test for door position names.
      var positionOptions = mapDiv.find('select#door-x').find('option');
      assert.strictEqual(positionOptions.find('[value=3]').text(), 'East corner (to nowhere)');
      assert.strictEqual(positionOptions.last('[value=4]').text(), '5 feet from east (to nowhere)');
      assert.strictEqual(positionOptions.last('[value=5]').text(), '5 feet from west (to Room 2)');
      assert.strictEqual(positionOptions.last('[value=6]').text(), 'West corner (to Room 2)');

      // Choose a location and create the door.
      mapDiv.find('select#door-x').val(5);
      mapDiv.find('#submit-add-door').click();

      // Check the door was created correctly.
      var newDoorDiv = mapDiv.find('#room_0_data #door_0');
      assert.equal(newDoorDiv.length, 1, 'Should create a details block for that door');
      assert.hasSubstring(newDoorDiv.text(), 'in the south wall', 'Should get location right');
      assert.strictEqual(newDoorDiv.find('li a[href=#room_0]').text(), 'Room 1', 'Should get destination right');
    });
  };
  return { run : run }
});
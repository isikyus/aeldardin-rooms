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
        { id: 0, x: 0, y: 0, width: 3, height: 2 },
        { id: 1, x: 0, y: 2, width: 3, height: 2 },
        { id: 2, x: 3, y: 0, width: 2, height: 4 },
      ];

      // TODO: probably there's an easier way to load a known state.
      rooms.forEach(function(room) {
        controller.model.store.dispatch({
          type: 'map.rooms.add',
          payload: room
        });
      });


      // Select two rooms, and delete them once they are selected.
      var selectRooms = function() {
        mapDiv.find('#room_0_data .select-room input').click();
        mapDiv.find('#room_2_data .select-room input').click();
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
        { id: 0, x: 0, y: 0, width: 3, height: 2 },
        { id: 1, x: 0, y: 2, width: 3, height: 2 },
        { id: 2, x: 3, y: 0, width: 2, height: 4 },
      ];

      // TODO: probably there's an easier way to load a known state.
      rooms.forEach(function(room) {
        controller.model.store.dispatch({
          type: 'map.rooms.add',
          payload: room
        });
      });

      // Add some doors.
      var addDoor = function(model, x, y, direction) {
        model.store.dispatch({
          type: 'map.doors.add',
          payload: {
            x: x,
            y: y,
            direction: direction
          }
        });

        var doors = model.store.getState().map.doors;
        return doors[doors.length - 1].id;
      };
      var southDoorId = addDoor(controller.model, 0, 1, 'south');
      var northDoorId = addDoor(controller.model, 2, 2, 'north');
      var eastDoorId = addDoor(controller.model, 2, 2, 'east');

      // Select two of those doors, and delete them.
      mapDiv.find('#door_' + southDoorId + ' input').click();
      mapDiv.find('#door_' + eastDoorId + ' input').click();
      mapDiv.find('#delete_selection').click();

      // Confirm that only the third door remains.
      var roomZeroExits = mapDiv.find('#room_0_data .exits');
      assert.equal(roomZeroExits.find('#door_' + southDoorId).length, 0, 'Should delete the southwards door');
      assert.equal(roomZeroExits.find('#door_' + northDoorId).length, 1, 'Should keep the door north from the other room');

      var roomOneExits = mapDiv.find('#room_1_data .exits');
      assert.equal(roomOneExits.find('#door_' + eastDoorId).length, 0, 'Should delete the door leading west');
      assert.equal(roomOneExits.find('#door_' + northDoorId).length, 1, 'Should keep the door north to the other room');
    });

    QUnit.module('HTML UI -- Adding rooms');

    test('creates the room', function(assert) {
      // TODO: extract to helper
      var mapDiv = $('#test-map');
      var controller = new MapController(mapDiv.find('canvas')[0]);

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

      // One square is five feet; the code works in squares, but the user sees text in feet.
      assert.hasSubstring(newRoomDiv.text(), '25 feet east-to-west', 'includes correct width');
      assert.hasSubstring(newRoomDiv.text(), '15 feet north-to-south', 'includes correct height');

    });

    QUnit.module('HTML UI -- Adding doors');

    test('adding a door not connected to anything', function(assert) {
      var mapDiv = $('#test-map');
      var controller = new MapController(mapDiv.find('canvas')[0]);
      var map = controller.model.map;

      controller.model.store.dispatch({
          type: 'map.rooms.add',
          payload: { id: 0, x: 0, y: 0, width: 1, height: 1, }
      });

      // Open the add-door form, and pick a direction.
      mapDiv.find('#room_0_data .js-add_door').click();
      mapDiv.find('#new-door-direction').val('north').trigger('change');

      // Choose a location and create the door.
      mapDiv.find('select#new-door-position').val(0).trigger('change');
      mapDiv.find('#submit-add-door').click();

      // Check the door was created correctly.
      map = controller.model.store.getState().map;
      assert.equal(map.doors.length, 1, 'Should add a door to the map');
      assert.equal(map.doors[0].x, 0, 'Should set X coordinate correctly');
      assert.equal(map.doors[0].y, 0, 'Should set Y coordinate correctly');

      var newDoorBlock = mapDiv.find('#room_0_data #door_0');
      assert.equal(newDoorBlock.length, 1, 'Should create a details block for that door');
      assert.hasSubstring(newDoorBlock.text(), 'in the north wall.', 'Should get location right');
    });

    test('adding a door joining two rooms', function(assert) {
      var mapDiv = $('#test-map');
      var controller = new MapController(mapDiv.find('canvas')[0]);
      var map = controller.model.map;

      // Create a simple map.
      var rooms = [
        { id: 0, x: 3, y: 0, width: 4, height: 2, },
        { id: 1, x: 5, y: 2, width: 2, height: 2 },
      ];

      // TODO: probably there's an easier way to load a known state.
      rooms.forEach(function(room) {
        controller.model.store.dispatch({
          type: 'map.rooms.add',
          payload: room
        });
      });

      // Open the add-door form, and pick a direction.
      mapDiv.find('#room_0_data .js-add_door').click();
      mapDiv.find('#new-door-direction').val('south').trigger('change');

      // Check the available locations make sense.
      // TODO: write a separate test for door position names.
      var $positionSelect = mapDiv.find('select#new-door-position');
      assert.strictEqual($positionSelect.find('[value=3]').text(), '0 feet from west');
      assert.strictEqual($positionSelect.find('[value=4]').text(), '5 feet from west');
      assert.strictEqual($positionSelect.find('[value=5]').text(), '10 feet from west');
      assert.strictEqual($positionSelect.find('[value=6]').text(), '15 feet from west');

      // Choose a location and create the door.
      var doorX = 5;
      mapDiv.find('select#new-door-position').val(doorX).trigger('change');
      mapDiv.find('#submit-add-door').click();

      // Check the door was created correctly.
      map = controller.model.store.getState().map;
      assert.equal(map.doors.length, 1, 'Should add a door to the map');
      assert.equal(map.doors[0].x, doorX, 'Should set X coordinate correctly');
      assert.equal(map.doors[0].y, rooms[0].y + rooms[0].height - 1, 'Should set Y coordinate correctly');

      var newDoorBlock = mapDiv.find('#room_0_data #door_0');
      assert.equal(newDoorBlock.length, 1, 'Should create a details block for that door');
      assert.hasSubstring(newDoorBlock.text(), 'in the south wall', 'Should get location right');
      assert.strictEqual(newDoorBlock.find('a[href=#room_1]').text(), 'Room 2', 'Should get destination right');
    });
  };
  return { run : run }
});

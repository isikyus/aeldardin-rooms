// Tests for applying updates to the model.

"use strict";
define([
  'QUnit',
  'map_model',
  'room'
],
function(QUnit, MapModel, Room) {
  var run = function() {

    QUnit.module('Rooms');

    test("removing a room", function(assert) {
      var roomData = [
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3}
      ];
      var map = undefined;

      roomData.forEach(function(room) {
        map = MapModel.reduce(map, {
          type: 'map.addRoom',
          payload: room
        });
      });

      var result = MapModel.reduce(map, {
        type: 'map.removeRooms',
        payload: {
          roomIds: [1]
        }
      });

      assert.strictEqual(result.rooms.length, 1, 'Removes only the given room');

      var remainingRoom = result.rooms[0];
      assert.strictEqual(remainingRoom.id, 0);
      assert.strictEqual(remainingRoom.key, 1);
      assert.strictEqual(remainingRoom.x, 10);
      assert.strictEqual(remainingRoom.y, 5);
      assert.strictEqual(remainingRoom.width, 4);
      assert.strictEqual(remainingRoom.height, 2);
    });


    test("removing a room that doesn't exist", function(assert) {
      var map = MapModel.reduce(undefined, {
        type: 'map.addRoom',
        payload: {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2}
      });

      var result = MapModel.reduce(map, {
        type: 'map.removeRooms',
        payload: {
          roomIds: [1]
        }
      });

      assert.strictEqual(result.rooms.length, 1, 'Does not actually remove a room');

      var unchangedRoom = result.rooms[0];
      assert.strictEqual(unchangedRoom.id, 0, 'Leaves ID unchanged');
      assert.strictEqual(unchangedRoom.key, 1, 'Leaves key unchanged');
      assert.strictEqual(unchangedRoom.x, 10, 'Does not change X coordinates');
      assert.strictEqual(unchangedRoom.y, 5, 'Does not change Y coordinates');
      assert.strictEqual(unchangedRoom.width, 4, 'Does not change widths');
      assert.strictEqual(unchangedRoom.height, 2, 'Does not change heights');
    });


    QUnit.module('Doors');

    test('adding a door', function(assert) {
      var roomData = [
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3}
      ];
      var map = undefined;

      roomData.forEach(function(room) {
        map = MapModel.reduce(map, {
          type: 'map.addRoom',
          payload: room
        });
      });

      var result = MapModel.reduce(map, {
        type: 'map.addDoor',
        payload: { x: 11, y: 7, direction: 'north' }
      });

      var newDoor = result.doors[0];
      assert.strictEqual(newDoor.id, 0, 'Sets door ID');
      assert.strictEqual(newDoor.x, 11);
      assert.strictEqual(newDoor.y, 7);
      assert.strictEqual(newDoor.direction, 'north');
    });

    test('adding doors in all directions', function(assert) {
      var roomData = [
        {id: 0, key: 1, x: 2, y: 0, width: 2, height: 2},
        {id: 1, key: 2, x: 0, y: 2, width: 2, height: 2},
        {id: 2, key: 3, x: 2, y: 2, width: 2, height: 2},
        {id: 3, key: 4, x: 4, y: 2, width: 2, height: 2},
        {id: 4, key: 5, x: 2, y: 4, width: 2, height: 2}
      ];
      var map = undefined;

      roomData.forEach(function(room) {
        map = MapModel.reduce(map, {
          type: 'map.addRoom',
          payload: room
        });
      });

      // Test all four door directions.
      var doorData = [
        { x: 2, y: 2, direction: 'north' },
        { x: 2, y: 3, direction: 'east' },
        { x: 3, y: 2, direction: 'west' },
        { x: 3, y: 3, direction: 'south' },
      ]
      doorData.forEach(function(door) {
        map = MapModel.reduce(map, {
          type: 'map.addDoor',
          payload: door
        });
      });

      var newDoorIds = map.doors.map(function(door) { return door.id; });
      assert.deepEqual(newDoorIds, [0, 1, 2, 3], 'Allocates door IDs in succession');

      assert.deepEqual(map.doors,
        [
          { id: newDoorIds[0], x : 2, y: 2, direction: 'north', style: 'door' },
          { id: newDoorIds[1], x : 2, y: 3, direction: 'east', style: 'door' },
          { id: newDoorIds[2], x : 3, y: 2, direction: 'west', style: 'door' },
          { id: newDoorIds[3], x : 3, y: 3, direction: 'south', style: 'door' }
        ]
      );
    });

    test('adding a door with no containing room', function(assert) {
      var roomData = [
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3}
      ];
      var map = undefined;

      roomData.forEach(function(room) {
        map = MapModel.reduce(map, {
          type: 'map.addRoom',
          payload: room
        });
      });

      var result = MapModel.reduce(map, {
        type: 'map.addDoor',
        payload: {
          x: 5,
          y: 7,
          direction: 'north'
        }
      });

      assert.deepEqual(result.doors,
        [
          { id: 0, x : 5, y: 7, direction: 'north', style: 'door' }
        ]
      );
    });

    test('removing a door', function(assert) {
      var doorId = 10;
      var door = {id: doorId, x : 11, y: 7, direction: 'north', style: 'door'};
      var otherDoor = {id: doorId + 1, x : 10, y: 6, direction: 'south', style: 'door'};
      var map = {
        rooms: [
          { id: 0, key: 1, x: 10, y: 5, width: 4, height: 2 },
          { id: 1, key: 2, x: 10, y: 7, width: 2, height: 3 }
        ],
        doors: [door, otherDoor]
      };

      var result = MapModel.reduce(map, {
        type: "map.removeDoors",
        payload: {
          doorIds: [doorId]
        }
      });

      assert.deepEqual(result.doors, [otherDoor], "Removes only the given door");
    });

    test("removing a door that doesn't exist", function(assert) {
      var doorId = 10;
      var door = {id: doorId, x : 11, y: 7, direction: 'north', style: 'door'};
      var map = {
        rooms: [
          { id: 0, key: 1, x: 10, y: 5, width: 4, height: 2 },
          { id: 1, key: 2, x: 10, y: 7, width: 2, height: 3 }
        ],
        doors: [door]
      };

      var result = MapModel.reduce(map, {
        type: "map.removeDoors",
        payload: {
          doorIds: [doorId + 1]
        }
      });

      assert.deepEqual(result.doors, [door], "Does not remove any doors");
    });
  };
  return { run : run }
});

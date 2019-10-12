// Tests for the map model.

"use strict";
define([
  'QUnit',
  'redux',
  'map_model',
  'room'
],
function(QUnit, Redux, MapModel, Room) {
  var run = function() {

    // TODO: probably no longer necessary.
    test('adding rooms', function(assert) {
      var roomData = [
        { key: 'A', x: -2, y:  0, width: 1, height: 2 },
        { key: 'B', x:  2, y: -2, width: 4, height: 1 }
      ];

      var map = undefined;

      roomData.forEach(function(room) {
        map = MapModel.reduce(map, {
          type: 'map.rooms.add',
          payload: room
        });
      });

      assert.strictEqual(map.rooms[0].x, roomData[0].x);
      assert.strictEqual(map.rooms[0].y, roomData[0].y);
      assert.strictEqual(map.rooms[0].width, roomData[0].width);
      assert.strictEqual(map.rooms[0].height, roomData[0].height);

      assert.strictEqual(map.rooms[1].x, roomData[1].x);
      assert.strictEqual(map.rooms[1].y, roomData[1].y);
      assert.strictEqual(map.rooms[1].width, roomData[1].width);
      assert.strictEqual(map.rooms[1].height, roomData[1].height);

      assert.notEqual(map.rooms[0].id, map.rooms[1].id);

      assert.deepEqual(map.doors, []);
    });

    test('tracking room keys', function(assert) {
      var roomData = [
        { key: 'A', x: -2, y:  0, width: 1, height: 2 },
        { key: 'B', x:  2, y: -2, width: 4, height: 1 }
      ];

      var map = undefined;

      roomData.forEach(function(room) {
        map = MapModel.reduce(map, {
          type: 'map.rooms.add',
          payload: room
        });
      });

      assert.strictEqual(map.rooms[0].key, roomData[0].key);
      assert.strictEqual(map.rooms[1].key, roomData[1].key);
    });

    test('getting wall details', function(assert) {
      var room = { key: 'A', x: -2, y:  0, width: 1, height: 2 }
      var walls = Room.walls(room);

      assert.strictEqual(walls.north.perpendicularAxis, 'y');
      assert.strictEqual(walls.north.parallelAxis, 'x');
      assert.strictEqual(walls.north.position, room.y);
      assert.strictEqual(walls.north.start, room.x);
      assert.strictEqual(walls.north.length, room.width);
      assert.strictEqual(walls.north.runsFrom, 'west');

      assert.strictEqual(walls.south.perpendicularAxis, 'y');
      assert.strictEqual(walls.south.parallelAxis, 'x');
      assert.strictEqual(walls.south.position, room.y + room.height);
      assert.strictEqual(walls.south.start, room.x);
      assert.strictEqual(walls.south.length, room.width);
      assert.strictEqual(walls.south.runsFrom, 'west');

      assert.strictEqual(walls.west.perpendicularAxis, 'x');
      assert.strictEqual(walls.west.parallelAxis, 'y');
      assert.strictEqual(walls.west.position, room.x);
      assert.strictEqual(walls.west.start, room.y);
      assert.strictEqual(walls.west.length, room.height);
      assert.strictEqual(walls.west.runsFrom, 'north');

      assert.strictEqual(walls.east.perpendicularAxis, 'x');
      assert.strictEqual(walls.east.parallelAxis, 'y');
      assert.strictEqual(walls.east.position, room.x + room.width);
      assert.strictEqual(walls.east.start, room.y);
      assert.strictEqual(walls.east.length, room.height);
      assert.strictEqual(walls.east.runsFrom, 'north');
    });

//     test('adding doors', function(assert) {
//       assert.fail('Not yet tested');
//       
//       assert.unorderedEqual(model.getDoors(), [westToCentre, centreToNorth,
//                                               centreToWest, eastToSoutheast,
//                                               eastToCentre, southToCentre],
//                                               'Includes all defined doors');
//     });

    QUnit.module('Exits');
    test('south', function(assert) {

      var door = { direction: 'south', x: 0, y: 1 };
      var north = { id: 0, x: 0, y: 0, width: 2, height: 2 };
      var south = { id: 1, x: 0, y: 2, width: 2, height: 2 };
      var map = {
        rooms: [north, south],
        doors: [door]
      };

      var exits = MapModel.exits(map);
      assert.deepEqual(exits[north.id], [{ door: door, room: south }]);
      assert.deepEqual(exits[south.id], [{ door: door, room: north }]);
    });
    test('north', function(assert) {

      var door = { direction: 'north', x: 1, y: 2 };
      var north = { id: 0, x: 0, y: 0, width: 2, height: 2 };
      var south = { id: 1, x: 0, y: 2, width: 2, height: 2 };
      var map = {
        rooms: [north, south],
        doors: [door]
      };

      var exits = MapModel.exits(map);
      assert.deepEqual(exits[north.id], [{ door: door, room: south }]);
      assert.deepEqual(exits[south.id], [{ door: door, room: north }]);
    });
    test('east', function(assert) {

      var door = { direction: 'east', x: 1, y: 1 };
      var west = { id: 0, x: 0, y: 0, width: 2, height: 2 };
      var east = { id: 1, x: 2, y: 0, width: 2, height: 2 };
      var map = {
        rooms: [east, west],
        doors: [door]
      };

      var exits = MapModel.exits(map);
      assert.deepEqual(exits[east.id], [{ door: door, room: west }]);
      assert.deepEqual(exits[west.id], [{ door: door, room: east }]);
    });
    test('west', function(assert) {

      var door = { direction: 'west', x: 2, y: 1 };
      var west = { id: 0, x: 0, y: 0, width: 2, height: 2 };
      var east = { id: 1, x: 2, y: 0, width: 2, height: 2 };
      var map = {
        rooms: [east, west],
        doors: [door]
      };

      var exits = MapModel.exits(map);
      assert.deepEqual(exits[east.id], [{ door: door, room: west }]);
      assert.deepEqual(exits[west.id], [{ door: door, room: east }]);
    });

    test('multiple exits', function(assert) {
      // Rooms arranged in a cross, with various connections (represented by <, >, ^, v):
      // (O is the origin)
      //
      //    +--+
      //  O |  |
      //    |  |
      // +--+-^+--+
      // |  >  <  |
      // |  <  |  |
      // +--+^-+-v+
      // |  |  |  |
      // |  |  |  |
      // +--+--+--+
      //
      // The coordinates of a door are for the square it's in,
      // and the direction specifies
      // which side of that square it appears on.
      var westToCentre = { direction: 'east', x: 1, y: 2 };
      var centreToNorth = { direction: 'north', x: 3, y: 2 };
      var centreToWest = { direction: 'west', x: 2, y: 3 };
      var eastToCentre = { direction: 'west', x: 4, y: 2 };
      var eastToSoutheast = { direction: 'south', x: 5, y: 3 };
      var southToCentre = { direction: 'north', x: 2, y: 4 };

      var north = { id: 0, x:  2, y: 0, width: 2, height: 2 };
      var west = { id: 1, x:  0, y: 2, width: 2, height: 2 };
      var centre = { id: 2, x: 2, y: 2, width: 2, height: 2 };
      var east = { id: 3, x: 4, y: 2, width: 2, height: 2 };
      var southwest = { id: 4, x: 0, y: 4, width: 2, height: 2 };
      var south = { id: 5, x: 2, y: 4, width: 2, height: 2 };
      var southeast = { id: 6, x: 4, y: 4, width: 2, height: 2 };
      var map = {
        rooms: [north, south, east, west, centre, southeast, southwest],
        doors: [westToCentre, centreToNorth, centreToWest, eastToSoutheast, eastToCentre, southToCentre]
      };

      var exits = MapModel.exits(map);

      assert.unorderedEqual(exits[centre.id], [
        { door: centreToNorth, room: north },
        { door: centreToWest, room: west },
        { door: westToCentre, room: west },
        { door: eastToCentre, room: east },
        { door: southToCentre, room: south },
      ], 'Centre north, south, east, and twice to the west');

      assert.unorderedEqual(exits[east.id], [
        { door: eastToCentre, room: centre },
        { door: eastToSoutheast, room: southeast }
      ], 'East connects to centre and southeast');
      assert.deepEqual(exits[southeast.id], [
        { door: eastToSoutheast, room: east }
      ], 'Southeast connects to east only');

      assert.unorderedEqual(exits[west.id], [
        { door: westToCentre, room: centre },
        { door: centreToWest, room: centre }
      ], 'West connects to centre, twice');
      assert.deepEqual(exits[south.id], [
        { door: southToCentre, room: centre }
      ], 'South connects to centre only');
      assert.deepEqual(exits[north.id], [
        { door: centreToNorth, room: centre }
      ], 'North connects to centre only');
      assert.deepEqual(exits[southwest.id], [
        // Nothing
      ], 'Southwest is not connected to anything');
    });
  };
  return { run : run }
});

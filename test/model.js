// Tests for the map model.

"use strict";
define([
  'QUnit',
  'map_model'
],
function(QUnit, MapModel) {
  var run = function() {
    test('storing list of rooms', function(assert) {
      var roomData = [
        { key: 'A', x: -2, y:  0, width: 1, height: 2, wallFeatures : [] },
        { key: 'B', x:  2, y: -2, width: 4, height: 1, wallFeatures : [] }
      ];

      var model = new MapModel();

      assert.expect(13);
      model.addRoomsListener(function(_rooms) {
        assert.ok(true, "Fires change events.");
      });

      model.setRooms(roomData);

      assert.strictEqual(model.rooms[0].x, roomData[0].x);
      assert.strictEqual(model.rooms[0].y, roomData[0].y);
      assert.strictEqual(model.rooms[0].width, roomData[0].width);
      assert.strictEqual(model.rooms[0].height, roomData[0].height);
      assert.deepEqual(model.rooms[0].wallFeatures, []);

      // Keys currently aren't preserved, but they should be.
      assert.strictEqual(model.rooms[0].key, roomData[0].key);

      assert.strictEqual(model.rooms[1].x, roomData[1].x);
      assert.strictEqual(model.rooms[1].y, roomData[1].y);
      assert.strictEqual(model.rooms[1].width, roomData[1].width);
      assert.strictEqual(model.rooms[1].height, roomData[1].height);
      assert.deepEqual(model.rooms[1].wallFeatures, []);
      assert.strictEqual(model.rooms[1].key, roomData[1].key);
    });

    test('getting wall details', function(assert) {
      var roomData = [
        { key: 'A', x: -2, y:  0, width: 1, height: 2, wallFeatures : [] }
      ];
      var model = new MapModel();
      model.setRooms(roomData);

      var room = model.getRooms()[0];
      var walls = room.getWalls();

      assert.strictEqual(walls.north.perpendicularAxis, 'y');
      assert.strictEqual(walls.north.parallelAxis, 'x');
      assert.strictEqual(walls.north.position, room.y);
      assert.strictEqual(walls.north.start, room.x);
      assert.strictEqual(walls.north.length, room.width);
      assert.strictEqual(walls.north.runsFrom, 'east');

      assert.strictEqual(walls.south.perpendicularAxis, 'y');
      assert.strictEqual(walls.south.parallelAxis, 'x');
      assert.strictEqual(walls.south.position, room.y + room.height);
      assert.strictEqual(walls.south.start, room.x);
      assert.strictEqual(walls.south.length, room.width);
      assert.strictEqual(walls.south.runsFrom, 'east');

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

    QUnit.module('Exits');
    test('south', function(assert) {

      var door = { direction: 'south', x: 0, y: 1 };
      var north = { x: 0, y: 0, width: 2, height: 2, wallFeatures : [door] };
      var south = { x: 0, y: 2, width: 2, height: 2, wallFeatures : [] };
      var roomData = [];

      var model = new MapModel();
      model.setRooms([north, south]);

      // Reset north and south to refer to the Room objects, so equality checking works.
      north = model.getRooms()[0];
      south = model.getRooms()[1];

      assert.deepEqual(model.exits(north), [{ door: door, room: south }]);
      assert.deepEqual(model.exits(south), [{ door: door, room: north }]);
      assert.deepEqual(model.getDoors(), [door]);
    });
    test('north', function(assert) {

      var door = { direction: 'north', x: 1, y: 2 };
      var north = { x: 0, y: 0, width: 2, height: 2, wallFeatures : [] };
      var south = { x: 0, y: 2, width: 2, height: 2, wallFeatures : [door] };

      var model = new MapModel();
      model.setRooms([north, south]);

      // Reset north and south to refer to the Room objects, so equality checking works.
      north = model.getRooms()[0];
      south = model.getRooms()[1];

      assert.deepEqual(model.exits(north), [{ door: door, room: south }]);
      assert.deepEqual(model.exits(south), [{ door: door, room: north }]);
      assert.deepEqual(model.getDoors(), [door]);
    });
    test('east', function(assert) {

      var door = { direction: 'east', x: 1, y: 1 };
      var west = { x: 0, y: 0, width: 2, height: 2, wallFeatures : [door] };
      var east = { x: 2, y: 0, width: 2, height: 2, wallFeatures : [] };

      var model = new MapModel();
      model.setRooms([west, east]);

      // Reset east and west to refer to the Room objects, so equality checking works.
      west = model.getRooms()[0];
      east = model.getRooms()[1];

      assert.deepEqual(model.exits(west), [{ door: door, room: east }]);
      assert.deepEqual(model.exits(east), [{ door: door, room: west }]);
      assert.deepEqual(model.getDoors(), [door]);
    });
    test('west', function(assert) {

      var door = { direction: 'west', x: 2, y: 1 };
      var west = { x: 0, y: 0, width: 2, height: 2, wallFeatures : [] };
      var east = { x: 2, y: 0, width: 2, height: 2, wallFeatures : [door] };

      var model = new MapModel();
      model.setRooms([east, west]);

      // Reset east and west to refer to the Room objects, so equality checking works.
      east = model.getRooms()[0];
      west = model.getRooms()[1];

      assert.deepEqual(model.exits(west), [{ door: door, room: east }]);
      assert.deepEqual(model.exits(east), [{ door: door, room: west }]);
      assert.deepEqual(model.getDoors(), [door]);
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

      var north = { x:  2, y: 0, width: 2, height: 2, wallFeatures: [] };
      var west = { x:  0, y: 2, width: 2, height: 2, wallFeatures : [westToCentre] };
      var centre = { x: 2, y: 2, width: 2, height: 2, wallFeatures : [centreToNorth, centreToWest] };
      var east = { x: 4, y: 2, width: 2, height: 2, wallFeatures : [eastToSoutheast, eastToCentre] };
      var southwest = { x: 0, y: 4, width: 2, height: 2, wallFeatures : [] };
      var south = { x: 2, y: 4, width: 2, height: 2, wallFeatures : [southToCentre] };
      var southeast = { x: 4, y: 4, width: 2, height: 2, wallFeatures : [] };

      var model = new MapModel();
      model.setRooms([north, south, east, west, centre, southeast, southwest]);

      // Point our variables at the Room objects so equality works.
      north = model.getRooms()[0];
      south = model.getRooms()[1];
      east = model.getRooms()[2];
      west = model.getRooms()[3];
      centre = model.getRooms()[4];
      southeast = model.getRooms()[5];
      southwest = model.getRooms()[6];

      assert.unorderedEqual(model.getDoors(), [westToCentre, centreToNorth,
                                              centreToWest, eastToSoutheast,
                                              eastToCentre, southToCentre],
                                              'Includes all defined doors');

      assert.unorderedEqual(model.exits(centre), [
        { door: centreToNorth, room: north },
        { door: centreToWest, room: west },
        { door: westToCentre, room: west },
        { door: eastToCentre, room: east },
        { door: southToCentre, room: south },
      ], 'Centre north, south, east, and twice to the west');

      assert.unorderedEqual(model.exits(east), [
        { door: eastToCentre, room: centre },
        { door: eastToSoutheast, room: southeast }
      ], 'East connects to centre and southeast');
      assert.deepEqual(model.exits(southeast), [
        { door: eastToSoutheast, room: east }
      ], 'Southeast connects to east only');

      assert.unorderedEqual(model.exits(west), [
        { door: westToCentre, room: centre },
        { door: centreToWest, room: centre }
      ], 'West connects to centre, twice');
      assert.deepEqual(model.exits(south), [
        { door: southToCentre, room: centre }
      ], 'South connects to centre only');
      assert.deepEqual(model.exits(north), [
        { door: centreToNorth, room: centre }
      ], 'North connects to centre only');
      assert.deepEqual(model.exits(southwest), [
        // Nothing
      ], 'Southwest is not connected to anything');
    });
  };
  return { run : run }
});
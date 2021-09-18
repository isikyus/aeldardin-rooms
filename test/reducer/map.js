// Tests for the map model.

"use strict";
define([
  'QUnit',
  'redux',
  'reducer/map',
  'room'
],
function(QUnit, Redux, Map, Room) {
  var run = function() {

    // TODO: probably no longer necessary.
    test('adding rooms', function(assert) {
      var roomData = [
        { key: 'A', x: -2, y:  0, width: 1, height: 2 },
        { key: 'B', x:  2, y: -2, width: 4, height: 1 }
      ];

      var map = undefined;

      roomData.forEach(function(room) {
        map = Map.reduce(map, {
          type: 'map.rooms.add',
          payload: room
        });
      });

      // TODO: do we still need to do map.rooms for things like this?
      assert.deepEqual(map.rooms.points, [
        { x: -2, y: 0, edge: 0 }, // 0
        { x: -1, y: 0, edge: 2 }, // 1
        { x: -1, y: 2, edge: 4 }, // 2
        { x: -2, y: 2, edge: 6 }, // 3

        { x: 2, y: -2, edge: 8 }, // 4
        { x: 6, y: -2, edge: 10 }, // 5
        { x: 6, y: -1, edge: 12 }, // 6
        { x: 2, y: -1, edge: 14 }  // 7
      ]);

      assert.deepEqual(map.rooms.edges, [
        { from: 0, to: 1, onRight: 0, opposite: 1, next: 2, cw: 7 },  // 0
        { from: 1, to: 0, onRight: -1, opposite: 0, next: 7, cw: 2 }, // 1
        { from: 1, to: 2, onRight: 0, opposite: 3, next: 4, cw: 1 },  // 2
        { from: 2, to: 1, onRight: -1, opposite: 2, next: 1, cw: 4 }, // 3
        { from: 2, to: 3, onRight: 0, opposite: 5, next: 6, cw: 3 },  // 4
        { from: 3, to: 2, onRight: -1, opposite: 4, next: 3, cw: 6 }, // 5
        { from: 3, to: 0, onRight: 0, opposite: 7, next: 0, cw: 5 },  // 6
        { from: 0, to: 3, onRight: -1, opposite: 6, next: 5, cw: 0 }, // 7

        { from: 4, to: 5, onRight: 1, opposite: 9, next: 10, cw: 15 },   // 8
        { from: 5, to: 4, onRight: -1, opposite: 8, next: 15, cw: 10 },  // 9
        { from: 5, to: 6, onRight: 1, opposite: 11, next: 12, cw: 9 },   // 10
        { from: 6, to: 5, onRight: -1, opposite: 10, next: 9, cw: 12 },  // 11
        { from: 6, to: 7, onRight: 1, opposite: 13, next: 14, cw: 11 },  // 12
        { from: 7, to: 6, onRight: -1, opposite: 12, next: 11, cw: 14 }, // 13
        { from: 7, to: 4, onRight: 1, opposite: 15, next: 8, cw: 13 },   // 14
        { from: 4, to: 7, onRight: -1, opposite: 14, next: 13, cw: 8 }   // 15
      ]);

      assert.deepEqual(map.rooms.rooms[0].edgeLoops, [0]);
      assert.deepEqual(map.rooms.rooms[1].edgeLoops, [8]);
      assert.deepEqual(map.rooms.nonRoom.edgeLoops [1, 9])

      assert.deepEqual(map.doors, []);
    });

    test('tracking room keys', function(assert) {
      var roomData = [
          { key: 'A', x: -2, y:  0, width: 1, height: 2 },
          { key: 'B', x:  2, y: -2, width: 4, height: 1 }
        ],
        map;

      roomData.forEach(function(room) {
        map = Map.reduce(map, {
          type: 'map.rooms.add',
          payload: room
        });
      });

      assert.strictEqual(map.rooms.rooms[0].key, roomData[0].key);
      assert.strictEqual(map.rooms.rooms[1].key, roomData[1].key);
    });

    test('getting wall details', function(assert) {
      var map = Map.reduce(undefined, {
        type: 'map.rooms.add',
        payload: { key: 'A', x: -2, y:  0, width: 1, height: 2 }
      })
      var walls = Room.walls(map, 0);

      assert.deepEqual(walls, [
        { startX: -2, startY: 0, endX: -1, endY: 0, id: 0 },
        { startX: -1, startY: 0, endX: -1, endY: 2, id: 2 },
        { startX: -1, startY: 2, endX: -2, endY: 2, id: 4 },
        { startX: -2, startY: 2, endX: -2, endY: 0, id: 6 }
      ]);
    });

    QUnit.module('Exits');
    test('south', function(assert) {
      var map;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { id: 0, x: 0, y: 0, width: 2, height: 2 }});
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { id: 1, x: 0, y: 2, width: 2, height: 2 }});

      // Assumption: walls IDs are assigned clockwise from top left.
      assert.deepEqual(Room.walls(map, 0)[2], { startX: 2, startY: 2, endX: 0, endY: 2, id: 4 });

      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: 4, position: 1 }});

      var exits = Map.exits(map);

      // TODO: give coordinates of the door itself, not the square it's in.
      assert.deepEqual(exits[0], [{ door: {bearing: 180, x: 1, y: 1}, room: 1 }]);
      assert.deepEqual(exits[1], [{ door: {bearing: 180, x: 1, y: 1}, room: 0 }]);
    });
    test('north', function(assert) {

      var map = undefined;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { id: 0, x: 0, y: 0, width: 2, height: 2 }});
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { id: 1, x: 0, y: 2, width: 2, height: 2 }});

      // Assumption: walls IDs are assigned clockwise from top left.
      assert.deepEqual(Room.walls(map, 1)[0], { startX: 0, startY: 2, endX: 2, endY: 2, id: 8 });

      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: 8, position: 1 }});

      var exits = Map.exits(map);
      assert.deepEqual(exits[0], [{ door: {bearing: 0, x: 0, y: 2}, room: 1 }]);
      assert.deepEqual(exits[1], [{ door: {bearing: 0, x: 0, y: 2}, room: 0 }]);
    });
    test('east', function(assert) {

      var map = undefined;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { id: 0, x: 0, y: 0, width: 2, height: 2 }});
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { id: 1, x: 2, y: 0, width: 2, height: 2 }});

      // Assumption: walls IDs are assigned clockwise from top left.
      assert.deepEqual(Room.walls(map, 0)[1], { startX: 2, startY: 0, endX: 2, endY: 2, id: 2 });

      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: 2, position: 1 }});

      var exits = Map.exits(map);
      assert.deepEqual(exits[0], [{ door: {bearing: 90, x: 1, y: 1}, room: 1 }]);
      assert.deepEqual(exits[1], [{ door: {bearing: 90, x: 1, y: 1}, room: 0 }]);
    });
    test('west', function(assert) {

      var map = undefined;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { id: 0, x: 0, y: 0, width: 2, height: 2 }});
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { id: 1, x: 2, y: 0, width: 2, height: 2 }});

      // Assumption: walls IDs are assigned clockwise from top left.
      assert.deepEqual(Room.walls(map, 1)[3], { startX: 2, startY: 2, endX: 2, endY: 0, id: 14 });

      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: 14, position: 1 }});

      var exits = Map.exits(map);
      assert.deepEqual(exits[0], [{ door: {bearing: 270, x: 2, y: 0}, room: 1 }]);
      assert.deepEqual(exits[1], [{ door: {bearing: 270, x: 2, y: 0}, room: 0 }]);
    });

    test('multiple exits', function(assert) {
      // Rooms arranged in a cross, with various connections (represented by <, >, ^, v):
      // (O is the origin; numbers are room IDs)
      //
      //    +--+
      //  O |0 |
      //    |  |
      // +--+-^+--+
      // |1 >  < 3|
      // |  < 2|  |
      // +--+^-+-v+
      // |4 |5 |6 |
      // |  |  |  |
      // +--+--+--+
      //
      var map = undefined;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { x: 2, y: 0, width: 2, height: 2 }});
      var north = 0;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { x: 0, y: 2, width: 2, height: 2 }});
      var west = 1;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { x: 2, y: 2, width: 2, height: 2 }});
      var centre = 2;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { x: 4, y: 2, width: 2, height: 2 }});
      var east = 3;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { x: 0, y: 4, width: 2, height: 2 }});
      var southwest = 4;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { x: 2, y: 4, width: 2, height: 2 }});
      var south = 5;
      map = Map.reduce(map, {type: 'map.rooms.add', payload: { x: 4, y: 4, width: 2, height: 2 }});
      var southeast = 6;


      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: Room.walls(map.rooms[east])[1].id, position: 0 }});
      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: Room.walls(map.rooms[centre])[0].id, position: 1 }});
      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: Room.walls(map.rooms[centre])[3].id, position: 0 }});
      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: Room.walls(map.rooms[west])[3].id, position: 1 }});
      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: Room.walls(map.rooms[west])[2].id, position: 0 }});
      map = Map.reduce(map, {type: 'map.doors.add', payload: { wallId: Room.walls(map.rooms[south])[0].id, position: 0 }});

      // The coordinates of a door are for the square it's in,
      // and the direction specifies
      // which side of that square it appears on.
      // TODO: should be coordinates of the door itself now.
      var westToCentre = { bearing: 90, x: 1, y: 2 };
      var centreToNorth = { bearing: 0, x: 3, y: 2 };
      var centreToWest = { bearing: 270, x: 2, y: 3 };
      var eastToCentre = { bearing: 270, x: 4, y: 2 };
      var eastToSoutheast = { bearing: 180, x: 5, y: 3 };
      var southToCentre = { bearing: 0, x: 2, y: 4 };

      var exits = Map.exits(map);

      assert.unorderedEqual(exits[centre], [
        { door: centreToNorth, room: north },
        { door: centreToWest, room: west },
        { door: westToCentre, room: west },
        { door: eastToCentre, room: east },
        { door: southToCentre, room: south },
      ], 'Centre north, south, east, and twice to the west');

      assert.unorderedEqual(exits[east], [
        { door: eastToCentre, room: centre },
        { door: eastToSoutheast, room: southeast }
      ], 'East connects to centre and southeast');
      assert.deepEqual(exits[southeast], [
        { door: eastToSoutheast, room: east }
      ], 'Southeast connects to east only');

      assert.unorderedEqual(exits[west], [
        { door: westToCentre, room: centre },
        { door: centreToWest, room: centre }
      ], 'West connects to centre, twice');
      assert.deepEqual(exits[south], [
        { door: southToCentre, room: centre }
      ], 'South connects to centre only');
      assert.deepEqual(exits[north], [
        { door: centreToNorth, room: centre }
      ], 'North connects to centre only');
      assert.deepEqual(exits[southwest], [
        // Nothing
      ], 'Southwest is not connected to anything');
    });
  };
  return { run : run }
});

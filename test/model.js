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

      assert.expect(2);
      model.addRoomsListener(function(_rooms) {
        assert.ok(true, "Fires change events.");
      });

      model.setRooms(roomData);

      assert.equal(roomData, model.rooms);
    });

    QUnit.module('Exits');
    test('south', function(assert) {

      var door = { direction: 'south', x: 0, y: 1 };
      var north = { x: 0, y: 0, width: 2, height: 2, wallFeatures : [door] };
      var south = { x: 0, y: 2, width: 2, height: 2, wallFeatures : [] };
      var roomData = [];

      var model = new MapModel();
      model.setRooms([north, south]);

      assert.deepEqual(model.exits(north), [{ door: door, room: south }]);
      assert.deepEqual(model.exits(south), [{ door: door, room: north }]);
    });
    test('north', function(assert) {

      var door = { direction: 'north', x: 1, y: 2 };
      var north = { x: 0, y: 0, width: 2, height: 2, wallFeatures : [] };
      var south = { x: 0, y: 2, width: 2, height: 2, wallFeatures : [door] };

      var model = new MapModel();
      model.setRooms([north, south]);

      assert.deepEqual(model.exits(north), [{ door: door, room: south }]);
      assert.deepEqual(model.exits(south), [{ door: door, room: north }]);
    });
    test('east', function(assert) {

      var door = { direction: 'east', x: 1, y: 1 };
      var west = { x: 0, y: 0, width: 2, height: 2, wallFeatures : [door] };
      var east = { x: 2, y: 0, width: 2, height: 2, wallFeatures : [] };

      var model = new MapModel();
      model.setRooms([west, east]);

      assert.deepEqual(model.exits(west), [{ door: door, room: east }]);
      assert.deepEqual(model.exits(east), [{ door: door, room: west }]);
    });
    test('west', function(assert) {

      var door = { direction: 'west', x: 2, y: 1 };
      var west = { x: 0, y: 0, width: 2, height: 2, wallFeatures : [] };
      var east = { x: 2, y: 0, width: 2, height: 2, wallFeatures : [door] };

      var model = new MapModel();
      model.setRooms([east, west]);

      assert.deepEqual(model.exits(west), [{ door: door, room: east }]);
      assert.deepEqual(model.exits(east), [{ door: door, room: west }]);
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
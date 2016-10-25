// Tests for applying updates to the model.

"use strict";
define([
  'QUnit',
  'map_model'
],
function(QUnit, MapModel) {
  var run = function() {

    QUnit.module('Rooms');

    test('adding a room', function(assert) {
      var model = new MapModel();
      model.setRooms([]);

      assert.expect(3);
      model.addRoomsListener(function(_rooms) {
        assert.ok(true, 'Fires change events');
      });

      var id = model.addRoom(10, 5, 4, 2);
      assert.strictEqual(id, 0, 'Returns room id on success');

      assert.deepEqual(model.getRooms(), [{x: 10, y: 5, width: 4, height: 2, id: id, key: id + 1, wallFeatures: []}]);
    });

    test("removing a room", function(assert) {
      var model = new MapModel();
      model.setRooms([
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3}
      ]);

      assert.expect(3);
      model.addRoomsListener(function(_rooms) {
        assert.ok(true, 'Fires change events');
      });

      var result = model.removeRoom(model.getRooms()[1]);
      assert.deepEqual(result, {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3, wallFeatures: []}, 'Returns removed room on success');

      assert.deepEqual(model.getRooms(), [
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2, wallFeatures: []}
      ]);
    });

    test("removing a room that doesn't exist", function(assert) {
      var model = new MapModel();
      model.setRooms([{id: 0, key: 1, x: 10, y: 5, width: 4, height: 2}]);

      assert.expect(2);
      model.addRoomsListener(function(_rooms) {
        assert.ok(false, "Doesn't fire events if a change fails.");
      });

      // Same data, but not the same object.
      var result = model.removeRoom({key: 1, x: 10, y: 5, width: 4, height: 2, wallFeatures: []});
      assert.notOk(result, 'Returns false on failure');

      assert.deepEqual(model.getRooms(), [{id: 0, key: 1, x: 10, y: 5, width: 4, height: 2, wallFeatures: []}]);
    });


    QUnit.module('Doors');

    test('adding a door', function(assert) {
      var model = new MapModel();
      model.setRooms([
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3}
      ]);

      assert.expect(3);
      model.addRoomsListener(function(_rooms) {
        assert.ok(true, 'Fires change events');
      });

      var newDoorId = model.addDoor(11, 7, 'north');
      assert.strictEqual(newDoorId, 0, 'Returns door id on success');

      assert.deepEqual(model.getRooms()[1],
        {
          id: 1, key: 2, x: 10, y: 7, width: 2, height: 3,
          wallFeatures: [
            {id: newDoorId, x : 11, y: 7, direction: 'north', style: 'door'}
          ]
        }
      );
    });

    test('adding doors in all directions', function(assert) {
      var model = new MapModel();

      // A cross-shaped map:
      //   0
      // 1 2 3
      //   4
      model.setRooms([
        {id: 0, key: 1, x: 2, y: 0, width: 2, height: 2},
        {id: 1, key: 2, x: 0, y: 2, width: 2, height: 2},
        {id: 2, key: 3, x: 2, y: 2, width: 2, height: 2},
        {id: 3, key: 4, x: 4, y: 2, width: 2, height: 2},
        {id: 4, key: 5, x: 2, y: 4, width: 2, height: 2}
      ]);

      // Test all four door directions.
      var newDoorIds = [
        model.addDoor(2, 2, 'north'),
        model.addDoor(2, 3, 'east'),
        model.addDoor(3, 2, 'west'),
        model.addDoor(3, 3, 'south')
      ];
      assert.deepEqual(newDoorIds, [0, 1, 2, 3], 'Allocates door IDs in succession');

      assert.deepEqual(model.getRooms()[2].wallFeatures,
        [
          { id: newDoorIds[0], x : 2, y: 2, direction: 'north', style: 'door' },
          { id: newDoorIds[1], x : 2, y: 3, direction: 'east', style: 'door' },
          { id: newDoorIds[2], x : 3, y: 2, direction: 'west', style: 'door' },
          { id: newDoorIds[3], x : 3, y: 3, direction: 'south', style: 'door' }
        ]
      );
    });

    test('setting ID of new doors', function(assert) {
      var model = new MapModel();
      model.setRooms([
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3}
      ]);

      var firstDoorId = model.addDoor(11, 7, 'north');
      var secondDoorId = model.addDoor(10, 6, 'south');
      var thirdDoorId = model.addDoor(13, 5, 'west');

      assert.strictEqual(firstDoorId, 0, 'Allocates ID 0 when no existing doors');
      assert.deepEqual([secondDoorId, thirdDoorId], [1, 2], 'Allocates successive IDs for successive doors');

      assert.deepEqual(model.getRooms()[0],
        {
          id: 0, key: 1, x: 10, y: 5, width: 4, height: 2,
          wallFeatures: [
            {id: secondDoorId, x : 10, y: 6, direction: 'south', style: 'door'},
            {id: thirdDoorId, x : 13, y: 5, direction: 'west', style: 'door'},
          ]
        }
      );
      assert.deepEqual(model.getRooms()[1],
        {
          id: 1, key: 2, x: 10, y: 7, width: 2, height: 3,
          wallFeatures: [
            {id: firstDoorId, x : 11, y: 7, direction: 'north', style: 'door'}
          ]
        }
      );
    });

    test('adding a door with no containing room', function(assert) {
      var model = new MapModel();
      model.setRooms([
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3}
      ]);

      assert.expect(2);
      model.addRoomsListener(function(_rooms) {
        assert.ok(false, "Doesn't fire events if a change fails.");
      });

      var result = model.addDoor(5, 7, 'north');
      assert.strictEqual(result, false, 'Returns false on failure');

      assert.deepEqual(model.getRooms(),[
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2, wallFeatures: []},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3, wallFeatures: []}
      ]);
    });

    test('removing a door', function(assert) {
      var doorId = 10;
      var door = {id: doorId, x : 11, y: 7, direction: 'north', style: 'door'};
      var otherDoor = {id: doorId + 1, x : 10, y: 6, direction: 'south', style: 'door'};
      var model = new MapModel();
      model.setRooms([
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2, wallFeatures: [otherDoor]},
        {
          id: 1, key: 2, x: 10, y: 7, width: 2, height: 3,
          wallFeatures: [door]
        }
      ]);

      assert.expect(4);
      model.addRoomsListener(function(_rooms) {
        assert.ok(true, 'Fires change events');
      });

      var result = model.removeDoor(doorId);
      assert.strictEqual(result, door, 'Returns door object on success');

      assert.deepEqual(model.getRooms()[0].wallFeatures, [otherDoor], "Doesn't remove other doors");
      assert.deepEqual(model.getRooms()[1].wallFeatures, []);
    });

    test("removing a door that doens't exist", function(assert) {
      var doorId = 10;
      var otherDoor = {id: doorId + 1, x : 10, y: 6, direction: 'south', style: 'door'};
      var model = new MapModel();
      model.setRooms([
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3, wallFeatures: [otherDoor]}
      ]);

      assert.expect(3);
      model.addRoomsListener(function(_rooms) {
        assert.ok(false, "Doesn't fire events if a change fails.");
      });

      var result = model.removeDoor(doorId);
      assert.strictEqual(result, false, 'Returns false on failure');

      assert.deepEqual(model.getRooms()[0].wallFeatures, [], "Doesn't remove other doors");
      assert.deepEqual(model.getRooms()[1].wallFeatures, [otherDoor]);
    });
  };
  return { run : run }
});
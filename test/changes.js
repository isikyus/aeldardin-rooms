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
      var model = new MapModel();
      model.setRooms([
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {
          id: 1, key: 2, x: 10, y: 7, width: 2, height: 3,
          wallFeatures: [
            {id: doorId, x : 11, y: 7, direction: 'north', style: 'door'}
          ]
        }
      ]);

      assert.expect(3);
      model.addRoomsListener(function(_rooms) {
        assert.ok(true, 'Fires change events');
      });

      var result = model.removeDoor(doorId);
      assert.strictEqual(result, doorId, 'Returns door id on success');

      assert.deepEqual(model.getRooms()[1].wallFeatures, []);
    });

    test("removing a door that doens't exist", function(assert) {
      var doorId = 10;
      var model = new MapModel();
      model.setRooms([
        {id: 0, key: 1, x: 10, y: 5, width: 4, height: 2},
        {id: 1, key: 2, x: 10, y: 7, width: 2, height: 3}
      ]);

      assert.expect(2);
      model.addRoomsListener(function(_rooms) {
        assert.ok(false, "Doesn't fire events if a change fails.");
      });

      var result = model.removeDoor(doorId);
      assert.notOk(result, 'Returns false on failure');

      assert.deepEqual(model.getRooms()[0].wallFeatures, []);
      assert.deepEqual(model.getRooms()[1].wallFeatures, []);
    });
  };
  return { run : run }
});
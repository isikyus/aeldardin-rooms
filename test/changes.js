// Tests for applying updates to the model.

"use strict";
define([
  'QUnit',
  'map_model'
],
function(QUnit, MapModel) {
  var run = function() {

    QUnit.module('Modifications');

    test('adding a room', function(assert) {
      var model = new MapModel();
      model.setRooms([]);

      assert.expect(3);
      model.addRoomsListener(function(_rooms) {
        assert.ok(true, 'Fires change events');
      });

      var key = model.addRoom(10, 5, 4, 2);
      assert.strictEqual(key, 1, 'Returns room key on success');

      assert.deepEqual(model.getRooms(), [{x: 10, y: 5, width: 4, height: 2, key: key}]);
    });

    test("removing a room", function(assert) {
      var model = new MapModel();
      model.setRooms([
        {key: 1, x: 10, y: 5, width: 4, height: 2},
        {key: 2, x: 10, y: 7, width: 2, height: 3}
      ]);

      assert.expect(3);
      model.addRoomsListener(function(_rooms) {
        assert.ok(true, 'Fires change events');
      });

      var result = model.removeRoom(model.getRooms()[1]);
      assert.deepEqual(result, {key: 2, x: 10, y: 7, width: 2, height: 3}, 'Returns removed room on success');

      assert.deepEqual(model.getRooms(), [
        {key: 1, x: 10, y: 5, width: 4, height: 2}
      ]);
    });

    test("removing a room that doesn't exist", function(assert) {
      var model = new MapModel();
      model.setRooms([{key: 1, x: 10, y: 5, width: 4, height: 2}]);

      assert.expect(2);
      model.addRoomsListener(function(_rooms) {
        assert.ok(false, "Doesn't fire events if a change fails.");
      });

      // Same data, but not the same object.
      var result = model.removeRoom({key: 1, x: 10, y: 5, width: 4, height: 2});
      assert.notOk(result, 'Returns false on failure');

      assert.deepEqual(model.getRooms(), [{key: 1, x: 10, y: 5, width: 4, height: 2}]);
    });
  };
  return { run : run }
});
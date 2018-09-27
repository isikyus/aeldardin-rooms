// Tests for the selection model.

"use strict";
define([
  'QUnit',
  'selection_model'
],
function(QUnit, SelectionModel) {
  var run = function() {
    QUnit.module('Selection');

    test('selecting a room', function(assert) {
      var initial = 'initial selection';
      var model = new SelectionModel();
      model.select(initial);

      // The model shouldn't care what type of object we're selecting.
      var room = { a: 'room' };

      assert.expect(4);
      model.addListener(function(_selection) {
        assert.ok(true, "Fires change events on select.");
      });

      var result = model.select(room);
      assert.ok(result);

      assert.ok(model.isSelected(initial));
      assert.ok(model.isSelected(room));
    });
    test('selecting an already-selected room', function(assert) {
      var initial = 'initial selection';
      var model = new SelectionModel();
      model.select(initial);

      assert.expect(2);
      model.addListener(function(_selection) {
        assert.ok(false, "Doesn't fire events when selecting what's already selected.");
      });

      var result = model.select(initial);
      assert.notOk(result);

      assert.ok(model.isSelected(initial));
    });
    test('deselecting a room', function(assert) {
      var initial = 'initial selection';
      var model = new SelectionModel();
      model.select(initial);

      assert.expect(3);
      model.addListener(function(_selection) {
        assert.ok(true, "Fires change events on deselect.");
      });

      var result = model.deselect(initial);
      assert.ok(result);

      assert.notOk(model.isSelected(initial));
    });
    test("deselecting a room that isn't selected", function(assert) {
      var initial = 'initial selection';
      var model = new SelectionModel();
      model.select(initial);

      assert.expect(2);
      model.addListener(function(_selection) {
        assert.ok(false, "Doesn't fire events on failed remove");
      });

      var result = model.deselect('something else');
      assert.notOk(result);

      assert.ok(model.isSelected(initial));
    });


    QUnit.module('Selection (via Redux)');

    test('selecting a room', function(assert) {
      var initial = 17;
      var model = SelectionModel.reduce(null, 'selection.clear');
      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'room',
          id: initial
        }
      });

      var newSelection = 3;
      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'room',
          id: newSelection
        }
      });

      assert.unorderedEqual(SelectionModel.selectedIds(model, 'room'),
                            [initial, newSelection]);
    });
    test('selecting an already-selected room', function(assert) {
      var initial = 17;
      var model = SelectionModel.reduce(null, 'selection.clear');
      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'room',
          id: initial
        }
      });

      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'room',
          id: initial
        }
      });

      assert.unorderedEqual(SelectionModel.selectedIds(model, 'room'),
                            [initial]);
    });
    test('deselecting a room', function(assert) {
      var initial = 17;
      var model = SelectionModel.reduce(null, 'selection.clear');
      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'room',
          id: initial
        }
      });

      var toRemove = 33;
      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'room',
          id: toRemove
        }
      });

      assert.unorderedEqual(SelectionModel.selectedIds(model, 'room'),
                            [initial, toRemove]);

      var result = SelectionModel.reduce(model, {
        type: 'selection.deselect',
        payload: {
          type: 'room',
          id: toRemove
        }
      });

      assert.unorderedEqual(SelectionModel.selectedIds(model, 'room'), 
                            [initial]);
    });
    test("deselecting a room that isn't selected", function(assert) {
      var initial = 17;
      var model = SelectionModel.reduce(null, 'selection.clear');
      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'room',
          id: initial
        }
      });

      var toNotRemove = 33;
      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'room',
          id: toNotRemove
        }
      });

      assert.unorderedEqual(SelectionModel.selectedIds(model, 'room'),
                   [initial, toNotRemove]);

      var result = SelectionModel.reduce(model, {
        type: 'selection.deselect',
        payload: {
          type: 'room',
          id: toNotRemove
        }
      });

      assert.unorderedEqual(SelectionModel.selectedIds(model, 'room'),
                            [initial, toNotRemove]);
    });

    test('selecting a door', function(assert) {
      var initial = 17;
      var model = SelectionModel.reduce(null, 'selection.clear');
      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'door',
          id: initial
        }
      });

      var newSelection = 3;
      model = SelectionModel.reduce(model, {
        type: 'selection.select',
        payload: {
          type: 'door',
          id: newSelection
        }
      });

      assert.unorderedEqual(SelectionModel.selectedIds(model, 'door'),
                            [initial, newSelection]);
    });
  };
  return { run : run };
});

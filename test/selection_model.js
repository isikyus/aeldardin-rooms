// Tests for the selection model.

"use strict";
define([
  'QUnit',
  'selection_model'
],
function(QUnit, SelectionModel) {
  var run = function() {

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

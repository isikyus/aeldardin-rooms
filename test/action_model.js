// Tests for the "action model".

"use strict";
define([
  'QUnit',
  'action_model'
],
function(QUnit, ActionModel) {
  var run = function() {

    QUnit.module('Actions generally');

    test("initial state", function(assert) {
      var baseReducer = function(s, a) {
        return s || 'initial';
      }

      var reducer = ActionModel.wrapReducer(baseReducer);
      var state = reducer(null, 'NO-OP')

      assert.strictEqual(state.state, 'initial', 'Newly created models have initial state of inner reducer');
      assert.deepEqual(state.pending, {
        action: null,
        state: null,
      }, 'Newly created models come without action data');
    });

    test('passes action through to child reducer if it does not affect the model', function(assert) {
      var initialState = {
        state: {
          word: 'test'
        },
        pending: {
          action: null,
          state: null
        }
      };

      assert.expect(5);
      var baseReducer = function(state, action) {
        assert.equal(action.type, 'base.append');
        assert.equal(action.payload, '+Z');

        return {
          word: state.word + action.payload
        };
      };

      var reducer = ActionModel.wrapReducer(baseReducer);
      var state = reducer(initialState, {type: 'base.append', payload: '+Z'});

      assert.strictEqual(state.state.word, 'test+Z');
      assert.strictEqual(state.pending.action, null);
      assert.strictEqual(state.pending.state, null);
    });

    QUnit.module('Staging action data');

    test ('calculates changes to current state', function(assert) {
      var pendingAction = 'word.edit';
      var oldState = { word : 'value' };
      var pending = {
        action: null,
        state: null
      };
      var existingModel = {
        state: oldState,
        pending: pending
      };

      var change = {
        type: 'action.stage',
        payload: {
          action: 'base.append',
          payload: '+Z'
        }
      };

      assert.expect(4);
      var baseReducer = function(state, action) {
        assert.equal(action.action, 'base.append');
        assert.equal(action.payload, '+Z');

        return {
          word: state.word + action.payload
        };
      };
      var model = ActionModel.wrapReducer(baseReducer)(existingModel, change);

      assert.strictEqual(model.pending.action, change.payload);
      assert.strictEqual(model.pending.state.word, 'value+Z');
    });

    QUnit.module('Finishing actions');

    test('copies updates back to main state', function(assert) {
      var pendingAction = 'word.edit';
      var oldState = { word : 'value' };

      var existingModel = {
        state: oldState,
        pending: {
          action: {
            type: pendingAction,
            payload: 'newValue'
          },
          state: { word: 'newValue' }
        }
      };

      var change = { type: 'action.finish' };

      var model = ActionModel.wrapReducer((s, a) => s)(existingModel, change);

      assert.strictEqual(model.pending.action, null);
      assert.strictEqual(model.pending.state, null);
      assert.strictEqual(model.state.word, 'newValue');
    });
  };
  return { run : run };
});

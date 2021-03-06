// Tests for the action reducer (for state of half-completed changes).

"use strict";
define([
  'QUnit',
  'reducer/action'
],
function(QUnit, Action) {
  var run = function() {

    QUnit.module('Actions generally');

    test("initial state", function(assert) {
      var baseReducer = function(s, a) {
        return s || 'initial';
      }

      var reducer = Action.wrapReducer(baseReducer);
      var state = reducer(undefined, 'NO-OP')

      assert.strictEqual(state.state, 'initial', 'Newly created models have initial state of inner reducer');
      assert.deepEqual(state.pending, {
        action: null,
        state: undefined,
      }, 'Newly created models come without action data');
    });

    test('passes action through to child reducer if it is not addressed to us', function(assert) {
      var initialState = {
        state: {
          word: 'test'
        },
        pending: {
          action: null,
          state: undefined
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

      var reducer = Action.wrapReducer(baseReducer);
      var state = reducer(initialState, {type: 'base.append', payload: '+Z'});

      assert.strictEqual(state.state.word, 'test+Z');
      assert.strictEqual(state.pending.action, null);
      assert.strictEqual(state.pending.state, undefined);
    });

    QUnit.module('Staging action data');

    test ('calculates changes to current state', function(assert) {
      var pendingAction = 'word.edit';
      var oldState = { word : 'value' };
      var pending = {
        action: null,
        state: undefined
      };
      var existing = {
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
      var reducer = Action.wrapReducer(baseReducer)(existing, change);

      assert.strictEqual(reducer.pending.action, change.payload);
      assert.strictEqual(reducer.pending.state.word, 'value+Z');
    });

    QUnit.module('Finishing actions');

    test('action.finish applies update to main state', function(assert) {
      var pendingAction = 'word.edit';
      var oldState = { word : 'value' };

      var existing = {
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

      var reducer = Action.wrapReducer((s, a) => s)(existing, change);

      assert.strictEqual(reducer.pending.action, null);
      assert.strictEqual(reducer.pending.state, undefined);
      assert.strictEqual(reducer.state.word, 'newValue');
    });

    test('action.cancel forgets pending updates', function(assert) {
      var pendingAction = 'word.edit';
      var oldState = { word : 'value' };

      var existing = {
        state: oldState,
        pending: {
          action: {
            type: pendingAction,
            payload: 'newValue'
          },
          state: { word: 'newValue' }
        }
      };

      var change = { type: 'action.cancel' };

      var reducer = Action.wrapReducer((s, a) => s)(existing, change);

      assert.strictEqual(reducer.pending.action, null);
      assert.strictEqual(reducer.pending.state, undefined);
      assert.strictEqual(reducer.state.word, 'value');
    });
  };
  return { run : run };
});

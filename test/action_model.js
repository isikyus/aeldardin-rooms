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
      var model = new ActionModel();
      assert.equal(model.action, null, 'Newly created models are not in the middle of an action');
      assert.equal(model.actionData, null, 'Newly created models come without action data');
    });

    test("initial state (via Redux)", function(assert) {
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

    test('passes action through to child reducer if it does not affect the model (via Redux)', function(assert) {
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

    QUnit.module('Starting actions');

    test('copies current state (via Redux)', function(assert) {
      var action = 'map.rooms.add';
      var oldState = { key : 'value' };

      var model = ActionModel.wrapReducer((s, a) => s)({
        state: oldState,
        pending: {
          action: null,
          state: null,
        }
      }, {
        type: 'action.start',
        payload: { action }
      });

      assert.strictEqual(model.pending.action, action);
      assert.strictEqual(model.pending.state, oldState);
    });

    test('clears any existing state (via Redux)', function(assert) {
      var action = 'map.rooms.add';
      var oldState = { key : 'value' };
      var pending = {
        action: 'map.doors.delete',
        state: { other: 'thing' }
      };
      var existingModel = {
        state: oldState,
        pending: pending
      };

      var action = 'map.rooms.add';
      var model = ActionModel.wrapReducer((s, a) => s)(existingModel, {
        type: 'action.start',
        payload: {
          action
        }
      });

      assert.strictEqual(model.pending.action, action);
      assert.strictEqual(model.pending.state, oldState);
    });

    test("updates state", function(assert) {
      var model = new ActionModel();
      var newAction = 'an_action';
      var newData = { key : 'value' };

      assert.expect(5);
      model.addListener(function(event, state, data) {
        assert.equal(event, 'start');
        assert.equal(state, newAction, 'reports new action');
        assert.equal(data, newData, 'reports new action data');
      });

      model.start(newAction, newData);

      assert.equal(model.action, newAction, 'stores new action');
      assert.equal(model.actionData, newData, 'stores new data');
    });
    test("cancels any existing action", function(assert) {
      var model = new ActionModel();
      var oldAction = 'previous_action';
      var oldData = { age : 'old' };
      var newAction = 'an_action';
      var newData = { key : 'value' };

      model.start(oldAction, oldData);

      assert.expect(4);
      var callCount = 0;
      model.addListener(function(event, state, _data) {
        callCount += 1;
        if (callCount == 1) {
          assert.equal(event, 'cancel');
          assert.equal(state, oldAction, 'cancels old action on starting new one');
        } else {
          assert.equal(event, 'start');
          assert.equal(state, newAction, 'reports new action');
        }
      });

      model.start(newAction);
    });

    QUnit.module('Updating action data');

    test ('applies changes (via Redux)', function(assert) {
      var pendingAction = 'word.edit';
      var oldState = { word : 'value' };
      var pending = {
        action: pendingAction,
        state: { word: 'newValue' }
      };
      var existingModel = {
        state: oldState,
        pending: pending
      };

      var change = {
        type: 'action.update',
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

      assert.strictEqual(model.pending.action, pendingAction);
      assert.strictEqual(model.pending.state.word, 'newValue+Z');
    });

    test("updating action data", function(assert) {
      var model = new ActionModel();
      var action = 'an_action';
      var oldData = { age : 'old' };
      var newData = { key : 'value' };

      model.start(action, oldData);

      assert.expect(4);
      model.addListener(function(event, state, data) {
        assert.equal(event, 'update');
        assert.equal(state, action, 'reports same action as before');
        assert.equal(data, newData, 'reports new data');
      });

      model.update(newData);

      assert.equal(model.actionData, newData, 'stores new data');
    });

    QUnit.module('Finishing actions');

    test('copies updates back to main state (via Redux)', function(assert) {
      var pendingAction = 'word.edit';
      var oldState = { word : 'value' };

      var existingModel = {
        state: oldState,
        pending: {
          action: pendingAction,
          state: { word: 'newValue' }
        }
      };

      var change = { type: 'action.finish' };

      var model = ActionModel.wrapReducer((s, a) => s)(existingModel, change);

      assert.strictEqual(model.pending.action, null);
      assert.strictEqual(model.pending.state, null);
      assert.strictEqual(model.state.word, 'newValue');
    });

    test("finishing an action", function(assert) {
      var model = new ActionModel();
      var action = 'an_action';
      var newData = { key : 'value' };

      model.start(action, newData);

      assert.expect(5);
      model.addListener(function(event, state, data) {
        assert.equal(event, 'finish');
        assert.equal(state, action, 'reports finished action');
        assert.equal(data, newData, 'includes data from finished action');
      });

      model.finish();

      assert.equal(model.action, null, 'clears old action');
      assert.equal(model.actionData, null, 'clears data from old action');
    });
    test("cancelling an action", function(assert) {
      var model = new ActionModel();
      var action = 'an_action';
      var newData = { key : 'value' };

      model.start(action, newData);

      assert.expect(5);
      model.addListener(function(event, state, data) {
        assert.equal(event, 'cancel');
        assert.equal(state, action, 'reports finished action');
        assert.equal(data, newData, 'includes data from finished action');
      });

      model.cancel();

      assert.equal(model.action, null, 'clears old action');
      assert.equal(model.actionData, null, 'clears data from old action');
    });
  };
  return { run : run };
});

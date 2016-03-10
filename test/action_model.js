// Tests for the "action model".

"use strict";
define([
  'QUnit',
  'action_model'
],
function(QUnit, ActionModel) {
  var run = function() {

    test("initial state", function(assert) {
      var model = new ActionModel();
      assert.equal(model.action, null, 'Newly created models are not in the middle of an action');
      assert.equal(model.actionData, null, 'Newly created models come without action data');
    });

    QUnit.module('Starting actions');
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
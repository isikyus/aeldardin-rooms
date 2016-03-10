define([
  'jquery'
],
function($) {
  // "Action model" -- tracks intermediate states of complex user actions (e.g. adding rooms).
  // Future work: also track past states, so we can support undo.

  var ActionModel = function() {
    this.listeners = [];
    this.action = null;
    this.actionData = null;
  };

  ActionModel.prototype = {
    start : function(action, initialState) {
      if (this.action !== null) {
        this.cancel();
      }

      this.action = action;
      this.actionData = initialState;
      this.fireActionChanged('start', this.action, this.actionData);
    },
    update : function(newState) {
      this.actionData = newState;
      this.fireActionChanged('update', this.action, this.actionData);
    },
    finish : function() { this._end('finish'); },
    cancel : function() { this._end('cancel'); },

    // Used to implement finish() and cancel();
    _end : function(eventName) {
      var oldAction = this.action;
      var oldData = this.actionData;
      this.action = null;
      this.actionData = null;
      this.fireActionChanged(eventName, oldAction, oldData);
    },

    // TODO: use proper JS properties for this.
    //getAction : function() {
    //  return this.action;
    //},
    //getActionData : function() {
    //  return this.actionData;
    //},

    // TODO: abstract out this listener code that I've copied into each model.
    addListener : function (listener) {
      this.listeners.push(listener);
    },
    fireActionChanged : function(event, action, data) {
      $.each(this.listeners, function(_index, listener) {
        console.log(event + ': ' + action);
        listener(event, action, data);
      });
    }
  };

  return ActionModel;
});
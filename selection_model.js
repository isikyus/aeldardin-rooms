define([
  'jquery'
],
function($) {
  // Simple selection model -- basically a set that supports event listeners.

  var SelectionModel = function() {
    this.store = {};
    this.listeners = [];
  };

  SelectionModel.prototype = {
    select : function(item) {
      if (item in this.store) {
        return false;
      } else {
        this.store[item] = true;
        this.fireChanged();
        return true;
      }
    },
    deselect : function(item) {
      if (item in this.store) {
        delete this.store[item];
        this.fireChanged();
        return true;
      } else {
        return false;
      }
    },
    isSelected : function(item) {
      return item in this.store;
    },
    addListener : function (listener) {
      this.listeners.push(listener);
    },
    fireChanged : function() {
      var self = this;
      $.each(this.listeners, function(_index, listener) {
        listener(self);
      });
    }
  };

  return SelectionModel;
});
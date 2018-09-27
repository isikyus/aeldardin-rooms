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

  SelectionModel.reduce = function(state, action) {

    // Array of "selection" objects, each of which holds
    // the type and ID of the thing selected.
    var initialState = [];
    state = state || initialState;

    switch(action.type) {

      case 'selection.select':

        // Assume data.payload is the ID of the thing selected.
        var selection = {
          selectedId: action.payload.id,
          objectType: action.payload.type
        };
        return state.concat(selection);

      case 'selection.deselect':

        // Assume data.payload is the ID of the thing selected.
        return state.filter(function(selection) {
          return selection.selectedId !== action.payload.id ||
                  selection.objectType !== action.payload.type;
        });

      case 'selection.clear':
        return [];

      default:
        return state;
    }
  };

  /**
   * Extract the selected IDs of the given type of object
   * from the Redux selection state.
   */
  SelectionModel.selectedIds = function(state, type) {
    return state.filter(function(selection) {
      return selection.objectType == type;
    }).map(function(selection) {
      return selection.selectedId;
    });
  };

  return SelectionModel;
});

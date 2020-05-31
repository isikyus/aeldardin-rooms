define([],
function() {

  var reduce = function(state, action) {

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
  var selectedIds = function(state, type) {
    return state.filter(function(selection) {
      return selection.objectType === type;
    }).map(function(selection) {
      return selection.selectedId;
    });
  };

  /**
   * Check if a given object is selected
   */
  var isSelected = function(state, type, id) {
    return selectedIds(state, type).includes(id);
  };

  return {
    selectedIds: selectedIds,
    isSelected: isSelected,
    reduce: reduce
  };
});

define([
  'jquery'
],
function($) {
  // "Action model" -- tracks intermediate states of complex user actions (e.g. adding rooms).
  // Future work: also track past states, so we can support undo.

  var ActionModel = {};

  // Default values when there's no action in progress.
  // `action` defaults to `null` as it's deliberately blank, not indeterminate.
  var NO_ACTION = {
    action: null,
    state: undefined
  }

  // Build a reducer that stores the intermediate state of the action
  // separately from the main "finished" state managed by the main
  // reducer.
  ActionModel.wrapReducer = function(baseReducer) {
    return function(state, action) {

      // Set initial state
      state = state || {
        state: undefined,
        pending: NO_ACTION
      };

      switch(action.type) {
        case 'action.stage':
          return {
            state: state.state,
            pending: {
              action: action.payload,
              state: baseReducer(state.state, action.payload)
            }
          };

        case 'action.finish':
          return {
            state: state.pending.state,
            pending: NO_ACTION
          };

        case 'action.cancel':
          return {
            state: state.state,
            pending: NO_ACTION
          };

        default:
          return {
            state: baseReducer(state.state, action),
            pending: state.pending
          };
      }
    };
  };

  return ActionModel;
});

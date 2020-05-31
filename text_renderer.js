// Render a map to a <div>, as a text description.

define([
    'jquery',
    'reducer/map',
    'reducer/selection',
    'room',
    'text_renderer/templates'
  ],
function($, Map, Selection, Room, templates) {

  var feetPerSquare = 5;

  // Preprocess data to be rendered into templates.
  var roomInfo = function(store, room) {
    var state = store.getState();
    return {
      key    : room.key,
      id     : room.id,
      exits  : exitInfo(state, room),
      height : room.height * feetPerSquare,
      width  : room.width * feetPerSquare,
      selected : Selection.isSelected(state.selection, 'room', room.id)
    }
  }

  var exitInfo = function(state, room) {
    var exits = Map.exits(state.map.state)[room.id];

    exits.forEach(function(exit) {
      exit.selected = Selection.isSelected(state.selection, 'door', exit.door.id);
    });
    return exits;
  };

  /*
   * Renders the map as a list of text room descriptions.
   */
  var render = function(store, container) {
    var $container = $(container);

    $container.empty();
    var map = store.getState().map;
    $.each(map.state.rooms, function(index, room) {
      $container.append(templates.room(roomInfo(store, room)));
    });

    if (map.pending.action) {
      renderInteraction(map.pending, container);
    }
  };

  /*
   * Renders a form for editing the intermediate state of an action.
   */
  var renderInteraction = function(pendingState, container) {

    switch(pendingState.action.type) {
      case 'map.rooms.add':
        renderAddRoom(pendingState, container);
        break;

      case 'map.doors.add':
        renderAddDoor(pendingState, container);
        break;

      default:
        console.warn('unexpected action ' + pendingState.action.type);
    }
  };

  var renderAddRoom = function(pendingState, container) {
    var $container = $(container),
        roomDetails = pendingState.action.payload;

    // Use the existing edit form, if present; otherwise, add it.
    var editRoomForm = $container.find('#js-edit-room');
    if (editRoomForm.length === 0) {
      editRoomForm = $(templates.createRoom());
    }

    // Set X, Y, Width, and Height based on the action state.
    editRoomForm.find('#new-room-x').val(roomDetails.x);
    editRoomForm.find('#new-room-y').val(roomDetails.y);
    editRoomForm.find('#new-room-width').val(roomDetails.width);
    editRoomForm.find('#new-room-height').val(roomDetails.height);

    // Make sure the form is visible.
    $container.prepend(editRoomForm);
  };

  var renderAddDoor = function(pendingState, container) {
    var $container = $(container),
        doorDetails = pendingState.action.payload,
        map = pendingState.state;

      // Insert form if necessary.
      var $addDoorForm = $container.find('#js-add_door_form');
      if ($addDoorForm.length === 0) {
          $addDoorForm = $(templates.addDoor());
      }

      // Fill in the form based on the action state.
      $addDoorForm.find('#js-room-for-door').text('(in room ' + doorDetails.room.key + ')');
      $addDoorForm.find('#new-door-direction').val(doorDetails.direction);

      // Fill in possible positions.
      // OPTIMISATION: only do this if the direction has changed.
      var $positionSelect = $addDoorForm.find('#new-door-position')
      $positionSelect.empty();

      var room = findByUniqueId(map.rooms, 'id', doorDetails.room.id);
      var wall = Room.walls(room)[doorDetails.direction];
      if (wall) {

          for(var i = 0; i < wall.length; i++) {
              var option = $('<option />');
              var humanDistance = feetPerSquare * i;
              var value = i + parseInt(wall.start, 10);

              option.attr('value', value);

              // Make sure the option corresponding to the proposed door position is selected.
              if (value === doorDetails[wall.parallelAxis]) {
                  option.attr('selected', 'selected');
              }

              // TODO: it would be nice to have more readable options, and pick the most suitable one.
              // ("in the centre", "east corner", "5 feet from south", etc.)
              option.text(humanDistance + ' feet from ' + wall.runsFrom);

              $positionSelect.append(option);
          }
      } else {
          console.warn('Unexpected door direction: ' + doorDetails.direction);
      }

      $container.prepend($addDoorForm);
  };

  // Takes a list of objects, and a field name and value to look for.
  // Returns the one object maching that field, or reports an error
  // if there is more than/less than one match.
  var findByUniqueId = function(list, idField, idValue) {
    var matches = $.grep(list, function(element) {
      return element[idField] === idValue;
    });

    if (matches.length === 0) {
      throw 'Nothing found matching ' + idValue + ' in ' + list;

    } else {
      if (matches.length > 1) {
        throw 'Found several matches for ' + idValue + ' in ' + list;
      }

      return matches[0];
    }
  };

  // Takes a element within a room div, finds the room key for that div, and uses it to look up the room itself.
  // Returns the Room on success, or nul on failure.
  var findRoomForElement = function(map, element) {
    var id = $(element).closest('div.edit-room').data('room-id');
    return findByUniqueId(map.rooms, 'id', id);
  }

  /*
   * Adds event listeners to an element the map will be rendered into.
   * The given store will be updated in response to events.
   */
  var addListeners = function(container, store) {
    var $container = $(container);

    $container.on('click', '.js-select-checkbox', function(event) {
      var $checkbox = $(this),
          objectType = $checkbox.data('select-type'),
          objectId = $checkbox.data('select-id'),
          actionType = $checkbox.is(':checked') ? 'selection.select' : 'selection.deselect';

      store.dispatch({
        type: actionType,
        payload: {
          type: objectType,
          id: objectId
        }
      });
    });

    $container.on('click', '.js-add_door', function(event) {
      var room = findRoomForElement(store.getState().map.state, this);
      if (room !== null) {
        store.dispatch({
          type: 'action.stage',
          payload: {
            type: 'map.doors.add',
            // TODO: probably better to only include the room ID;
            // or don't specify room at all, just location?
            payload: { room: room, x: null, y: null, direction: null}
          }
        });
      }
    });

    // Fire update events as the edit form contents change.
    $container.on('change', '#js-edit-room input', function(_event) {

      var currentAction = store.getState().map.pending.action;
      if (currentAction.type === 'map.rooms.add') {

        var $editRoomForm = $('#js-edit-room');
        var roomProperties = {
          x : parseInt($editRoomForm.find('#new-room-x').val(), 10),
          y : parseInt($editRoomForm.find('#new-room-y').val(), 10),
          width : parseInt($editRoomForm.find('#new-room-width').val(), 10),
          height : parseInt($editRoomForm.find('#new-room-height').val(), 10)
        };
        store.dispatch({
          type: 'action.stage',
          payload: {
            type: 'map.rooms.add',
            payload: roomProperties
          }
        });
      } else {
        console.warn('Tried to work on adding room when not in that state');
      }
    });

    // Fire update events as the add-door form changes.
    $container.on('change', '#js-add_door_form select', function(_event) {

      var currentAction = store.getState().map.pending.action;
      if (currentAction.type === 'map.doors.add') {

        var $addDoorForm = $('#js-add_door_form');
        var direction = $addDoorForm.find('#new-door-direction').val();
        var room = currentAction.payload.room;

        // TODO: need separate tests for these calculations.

        var newDoorPosition = parseInt($addDoorForm.find('#new-door-position').val(), 10);
        var newDoorX, newDoorY;
        if (direction === 'north' || direction === 'south') {

            // Make sure position is set if direction is known, since it will look set in the form.
            newDoorX = newDoorPosition || room.x;
            newDoorY = (direction === 'north') ? room.y : room.y + room.height - 1;

        } else if (direction === 'east' || direction === 'west') {
            newDoorX = (direction === 'west') ? room.x: room.x + room.width - 1;

            // Again, make sure we set position.
            newDoorY = newDoorPosition || room.y;

        } else {

            // Don't know direction yet, so we can't define the door.
            newDoorX = null;
            newDoorY = null;
        }

        store.dispatch({
          type: 'action.stage',
          payload: {
            type: 'map.doors.add',
            payload: {
              room: room,
              direction: direction,
              x: newDoorX,
              y: newDoorY
            }
          }
        });
      } else {
        console.warn('Tried to work on adding door when not in that state');
      }
    });

    // Handle action submit buttons (adding rooms or doors).
    $container.on('click', 'button[data-finish-action]', function(_event) {
      var action = $(this).data('finish-action');
      var currentAction = store.getState().map.pending.action;

      if (currentAction.type === action) {
        store.dispatch({ type: 'action.finish' });
      } else {
        console.warn('Tried to finish action "' + action + '" when it was not in progress');
      }
    });
  };

  return {
    render : render,
    renderInteraction : renderInteraction,
    addListeners : addListeners
  };
});

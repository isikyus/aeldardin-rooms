// Render a map to a <div>, as a text description.

define([
    'jquery',
    'handlebars',
  ],
function($, Handlebars) {

  var feetPerSquare = 5;

  //(function() {
    var doorTypeNames = {
      door      : 'door',
      arch      : 'archway',
      secret    : 'secret door',
      open      : 'opening',
      porticullis : 'porticullis'
    };

    Handlebars.default.registerHelper('displayDoorType', function(door) {
      return doorTypeNames[door];
    });
  //})();

  var rawRoomTemplate = "" +
    '<div class="room">' +
      '<h3><a id="room_{{key}}">Room {{key}}</id></h3>' +
      '<p>' +
        'A bare room. ' +
        'It measures {{height}} feet north-to-south, ' +
        'and {{width}} feet east-to-west' +
      '</p>' +
      '<p>' +
        'There are {{exits.length}} exits:' +
      '</p>' +
      '<ol>' +
        '{{#each exits}}' +
          '<li>' +
            'A {{displayDoorType door.style}} in the {{door.direction}} wall, ' +
            'leading to <a href="#room_{{room.key}}">Room {{room.key}}</a>.' +
          '</li>' +
        '{{/each}}' +
      '</ol>' +
      '<div class="edit-room" data-room-key="{{key}}">' +
        '<p class="select-room"><label>'+
          '<input type="checkbox" id="select_room_{{key}}" class="js-select-checkbox"' +
            ' {{#if selected}}checked{{/if}}/>' +
          'Select' +
        '</label></p>' +
        '<button class="js-remove-room">Remove</button>' +
      '</div>' +
    '</div>'
  var roomTemplate = Handlebars.default.compile(rawRoomTemplate);

  var rawCreateTemplate = '' +
    '<div class="edit-room" id="js-edit-room">' +
      '<h3>New Room</h3>' +
      '<p>' +
        '<label for="new-room-x">X (east-west) position of north-west corner</label>' +
        '<input type="number" id="new-room-x"/>' +
      '</p>' +
      '<p>' +
        '<label for="new-room-y">Y (north-south) position of north-west corner</label>' +
        '<input type="number" id="new-room-y"/>' +
      '</p>' +
      '<p>' +
        '<label for="new-room-width">East-West size</label>' +
        '<input type="number" id="new-room-width"/>' +
      '</p>' +
      '<p>' +
        '<label for="new-room-height">North-South size</label>' +
        '<input type="number" id="new-room-height"/>' +
      '</p>' +
      '<p>' +
        '<button id="submit-add-room">Add Room</button>' +
    '</div>'
  //var createTemplate = Handlebars.default.compile(rawCreateTemplate);


  var roomInfo = function(model, room) {
    return {
      key    : room.key,
      id     : room.id,
      exits  : model.map.exits(room),
      height : room.height * feetPerSquare,
      width  : room.width * feetPerSquare,
      selected : model.selection.isSelected(room.id)
    }
  }

  /*
   * Renders the map as a list of text room descriptions.
   */
  var render = function(model, container) {
    var $container = $(container);

    $container.empty();
    $.each(model.map.getRooms(), function(index, room) {
      $container.append(roomTemplate(roomInfo(model, room)));
    });
  };

  /*
   * Renders a form for editing the intermediate state of an action.
   */
  var renderInteraction = function(action, state, container) {
    var $container = $(container);

    if (action == 'add_room') {
      // We are creating a room.

      // Use the existing edit form, if present; otherwise, add it.
      var editRoomForm = $container.find('#js-edit-room');
      if (editRoomForm.length == 0) {
        editRoomForm = $(rawCreateTemplate);
        editRoomForm.x
      };

      // Set X, Y, Width, and Height based on the action state.
      editRoomForm.find('#new-room-x').val(state.x);
      editRoomForm.find('#new-room-y').val(state.y);
      editRoomForm.find('#new-room-width').val(state.width);
      editRoomForm.find('#new-room-height').val(state.height);

      // Make sure the form is visible.
      $container.prepend(editRoomForm);

    } else {
      console.warn('unexpected action ' + action);
    };
  };

  /*
   * Adds event listeners to an element the map will be rendered into.
   * The given model instance will be updated in response to events.
   */
  var addListeners = function(container, model) {
    var $container = $(container);

    $container.on('click', '.js-remove-room', function(event) {
      var key = $(this).closest('div.edit-room').data('room-key');
      var matchingRooms = $.grep(model.map.getRooms(), function(room) {
        return room.key === key;
      });

      if (matchingRooms.length === 0) {
        console.log('No rooms found matching key: ' + key);
      } else {
        if (matchingRooms.length > 1) {
          console.log('Found several rooms for ' + key + '; removing only the first:');
          console.log(matchingRooms);
        }

        model.map.removeRoom(matchingRooms[0]);
      };
    });

    $container.on('click', '.js-select-checkbox', function(event) {
      var key = $(this).closest('div.edit-room').data('room-key');
      var matchingRooms = $.grep(model.map.getRooms(), function(room) {
        return room.key === key;
      });

      if (matchingRooms.length === 0) {
        console.log('No rooms found matching key: ' + key);
      } else {
        if (matchingRooms.length > 1) {
          console.log('Found several rooms for ' + key + '; selecting/deselecting only the first:');
          console.log(matchingRooms);
        }

        if ($(this).is(':checked')) {
          model.selection.select(matchingRooms[0].id);
        } else {
          model.selection.deselect(matchingRooms[0].id);
        }
      };
    });

    // Fire update events as the edit form contents change.
    $container.on('change', '#js-edit-room input', function(_event) {

      if (model.action.action === 'add_room') {

        var $editRoomForm = $('#js-edit-room');
        var roomProperties = {
          x : $editRoomForm.find('#new-room-x').val(),
          y : $editRoomForm.find('#new-room-y').val(),
          width : $editRoomForm.find('#new-room-width').val(),
          height : $editRoomForm.find('#new-room-height').val()
        };
        model.action.update(roomProperties);
      } else {
        console.warn('Tried to finish adding room when not in that state');
      };
    });

    $container.on('click', '#submit-add-room', function(_event) {
      if (model.action.action === 'add_room') {
        model.action.finish('add_room');
      } else {
        console.warn('Tried to finish adding room when not in that state');
      };
    });
  };

  return {
    render : render,
    renderInteraction : renderInteraction,
    addListeners : addListeners
  };
});
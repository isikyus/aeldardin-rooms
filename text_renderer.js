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
      '<h3><a id="room_{{id}}">Room {{key}}</id></h3>' +
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
            'leading to <a href="#room_{{room.id}}">Room {{room.key}}</a>.' +
          '</li>' +
        '{{/each}}' +
      '</ol>' +
      '<div class="edit-room" data-room-key="{{key}}">' +
        '<p class="select-room"><label>'+
          '<input type="checkbox" id="select_room_{{id}}" class="js-select-checkbox"' +
            ' {{#if selected}}checked{{/if}}/>' +
          'Select' +
        '</label></p>' +
        '<button class="js-remove-room">Remove</button>' +
      '</div>' +
    '</div>'
  var roomTemplate = Handlebars.default.compile(rawRoomTemplate);


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
  };

  return {
    render : render,
    addListeners : addListeners
  };
});
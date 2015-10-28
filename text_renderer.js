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
    '</div>'
  var roomTemplate = Handlebars.default.compile(rawRoomTemplate);


  var roomInfo = function(map, room) {
    return {
      key    : room.key,
      id     : room.id,
      exits  : map.exits(room),
      height : room.height * feetPerSquare,
      width  : room.width * feetPerSquare
    }
  }

  var render = function(map, container) {
    var $container = $(container);

    $.each(map.getRooms(), function(index, room) {
      $container.append(roomTemplate(roomInfo(map, room)));
    });
  };

  return {
    render : render
  };
});
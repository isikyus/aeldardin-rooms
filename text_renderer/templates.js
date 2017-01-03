// Templates used by text-renderer.js,
// and associated Handlebars helpers.

define([
    'handlebars',
    'text!text_renderer/room.html.hbs',

    // These templates don't actually use Handlebars; I'm treating them like they do for consistency.
    // There's a performance cost to this, but it shouldn't make a difference once I start using compiled templates.
    'text!text_renderer/create_room.html.hbs',
    'text!text_renderer/add_door.html.hbs'
  ],
function(Handlebars, rawRoomTemplate, rawCreateRoomTemplate, rawAddDoorTemplate) {

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

  return {
    room: Handlebars.default.compile(rawRoomTemplate),
    createRoom: Handlebars.default.compile(rawCreateRoomTemplate),
    addDoor: Handlebars.default.compile(rawAddDoorTemplate)
  };
});
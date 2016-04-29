// Render a map to a <canvas> object (i.e., as an image)

define([
    'jquery',
    'hit_regions',
    'symbols'
  ],
function($, hitRegions, symbols) {

  // TODO: extract so tests can use it.
  var scale = 50;

  var clearCanvas = function(context) {
    var canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  var drawRoom = function(room, context, map) {
    context.strokeRect(room.x * scale, room.y * scale, room.width * scale, room.height * scale);
    drawKey(room, context);
    //debugExits(room, context, map);
  };

  var drawSelectionBox = function(room, context) {
    var boxOffset = scale / 20;
    context.save();

    context.strokeStyle = 'red';
    context.lineWidth = 4;
    context.strokeRect(room.x * scale - boxOffset, room.y * scale - boxOffset,
                       room.width * scale + boxOffset * 2, room.height * scale + boxOffset * 2);

    context.restore();
  };

  var drawKey = function(room, context) {
    // Just draw in top-left corner for now.
    // TODO: think about key placement.

    var fontSize = scale / 3;
    var xOffset = scale / 2;
    var yOffset = xOffset + (fontSize / 2);
    var x = (room.x * scale) + xOffset;
    var y = (room.y * scale) + yOffset;

    context.save();

    context.font = fontSize + 'px serif';
    context.textAlign = 'center'
    context.fillText(room.key, x, y);

    context.restore();
  };

  var debugExits = function(room, context, map) {
    $.each(map.exits(room), function(_index, exit) {
      context.save();
      d2 = {
        direction : exit.door.direction,
        x : exit.door.x * scale,
        y : exit.door.y * scale
      };
      offset = (exit.door.room_id == room.id) ? 15 : -25;
      char   = (exit.door.room_id == room.id) ? '^' : ' v';
      orient(d2, context);

      context.fillStyle = 'green';
      context.font = '12px serif';
      context.textAlign = 'center'
      context.fillText(room.key + ' ' + char, 25, offset);

      context.restore();
    });
  };

  var drawWallFeature = function(feature, context) {
    context.save();
    orient(feature, context);
    renderWallFeature(feature, context);
    context.restore();
  };

  // Features exist in four different orientations,
  // handled by re-orienting the context before drawing.
  var orient = function(feature, context) {
    // X and Y are for the top-left corner of the cell holding the feature.
    var x = feature.x * scale;
    var y = feature.y * scale;
    var direction = feature.direction;

    // We rotate in every case except 'north', so the decreasing y-direction is always out of the room.
    // This is important for symbols with direction (e.g. swing doors).
    if (direction == 'north') {
      context.translate(x, y);
    } else if (direction == 'south') {
      context.translate(x + scale, y + scale);
      context.rotate(Math.PI);
    } else if (direction == 'east') {
      context.translate(x + scale, y);
      context.rotate(Math.PI / 2);
    } else if (direction == 'west') {
      context.translate(x, y + scale);
      context.rotate(-Math.PI / 2);
    } else {
      console.log('Unrecognised direction: ' + direction);

      // So it's not too far off where it should be.
      context.translate(x, y);
    }
  }

  var wallFeatures = symbols(scale);

  var renderWallFeature = function(feature, context) {
    var render = wallFeatures[feature.style];
    render = render || wallFeatures['door'];
    render(context);
  };

  var render = function(model, context) {
    clearCanvas(context)

    $.each(model.map.getRooms(), function(_index, room) {
      drawRoom(room, context, model.map);

      if (model.selection.isSelected(room.id)) {
        drawSelectionBox(room, context);
      };

      $.each(room['wall_features'], function(_index, feature) {
        drawWallFeature(feature, context);
      });
    });
  };

  /*
   * Draw an intermediate state of a partly-finished action.
   * (e.g. a room being created).
   * render() should be called first to get rid of any existing partial state.
   */
  var renderInteraction = function(action, state, context) {

    // TODO: implement.
  };

  /*
   * Set up listeners to make the canvas interactive.
   */
  var addListeners = function(canvas, model) {
    var regions = hitRegions(canvas);

    regions.reset();
    $.each(model.map.getRooms(), function(_index, room) {
      var region = regions.add(room.x * scale, room.y * scale, room.width * scale, room.height * scale);

      region.addListener('click', function(event) {
        var selection = model.selection;

        if (selection.isSelected(room.id)) {
          selection.deselect(room.id);
        } else {
          selection.select(room.id);
        }
      });
    });

    regions.getFallback().addListener('mousedown', function(event) {
      model.action.start('add_room', {
        x : event.x / scale,
        y : event.y / scale,
        width: 0,
        height: 0
      });
    });
  };

  return {
    render : render,
    renderInteraction : renderInteraction,
    addListeners : addListeners
  };
});
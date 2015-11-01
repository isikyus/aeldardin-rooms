// Render a map to a <canvas> object (i.e., as an image)

define([
    'jquery',
    'symbols'
  ],
function($, symbols) {

  var scale = 50;

  var clearCanvas = function(context) {
    canvas = context.canvas;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  var drawRoom = function(room, context, map) {
    context.strokeRect(room.x * scale, room.y * scale, room.width * scale, room.height * scale);
    drawKey(room, context);
    //debugExits(room, context, map);
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

  var render = function(map, context) {
    clearCanvas(context);

    $.each(map.getRooms(), function(_index, room) {
      drawRoom(room, context, map);

      $.each(room['wall_features'], function(_index, feature) {
        drawWallFeature(feature, context);
      });
    });
  };

  /*
   * Hand-rolled hit-region implementation, as the version in the Canvas spec isn't supported yet.
   * Currently only supports square regions.
   */
  var hitRegions = function(canvas) {
    var hitRegionsKey = 'mapView.hitRegions';
    var $canvas = $(canvas);
    if ($canvas.data(hitRegionsKey) === undefined) {
      $canvas.data(hitRegionsKey, []);
    }

    // Actually install our event handlers.
    $canvas.on('mousemove', function(event) {
      console.log('in mousemove');
      var $this = $(this)
      var offset = $this.offset();
      var canvasX = event.pageX - offset.left;
      var canvasY = event.pageY - offset.top;

      $.each($this.data(hitRegionsKey), function(_index, region) {
        if (region.x1 < canvasX && canvasX < region.x2 &&
            region.y1 < canvasY && canvasY < region.y2) {
          region.fire('hover');
        }
      });
    });

    var Region = function(x, y, width, height) {
      this.x1 = x;
      this.y1 = y;
      this.x2 = x + width;
      this.y2 = y + height;
      this.listeners = {
        hover : []
      };
    };

    /*
     * Add an event listener to the hit region.
     *
     * Currently, the only supported event name is 'hover',
     * which fires when the mouse moves into the region.
     *
     * Listeners will be passed the jQuert event that triggered them.
     */
    Region.prototype.addListener = function(eventName, listener) {
      this.listeners[eventName].push(listener);
    };

    /*
     * Fire an event with the given name.
     */
    Region.prototype.fire = function(eventName, event) {
      $.each(this.listeners[eventName], function(_index, listener) {
        listener(event);
      });
    };

    /*
     * Add a hit region with the specified dimensions.
     * Returns an object representing that region.
     */
    var add = function(x, y, width, height) {
      var region = new Region(x, y, width, height);
      $canvas.data(hitRegionsKey).push(region);
      return region;
    };

    /*
     * Remove all hit regions and listeners from the canvas.
     */
    var clear = function() {
      $canvas.data(hitRegionsKey, []);
      $canvas.off('hitRegion.mousemove');
    };

    return {
      add : add,
      clear : clear
    };
  };

  var addListeners = function(canvas, model) {
    var regions = hitRegions(canvas);

    regions.clear();
    $.each(model.getRooms(), function(_index, room) {
      var region = regions.add(room.x * scale, room.y * scale, room.width * scale, room.height * scale);
      region.addListener('hover', function(event) {
        console.log('Hovering over room ' + room.key);
      });
    });
  };

  return {
    render : render,
    addListeners : addListeners
  };
});
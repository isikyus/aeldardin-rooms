/*
  * Hand-rolled hit-region implementation, as the version in the Canvas spec isn't supported yet.
  * Currently only supports square regions.
  */

define([
    'jquery'
  ],
function($) {

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

  return hitRegions;
});
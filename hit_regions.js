/*
  * Hand-rolled hit-region implementation, as the version in the Canvas spec isn't supported yet.
  * Currently only supports rectangular regions.
  */

define([
    'jquery'
  ],
function($) {

  var hitRegions = function(canvas) {

    /*
     * The mouse events hit regions are sensitive to.
     */
    var SUPPORTED_EVENTS = ['click', 'mousedown'];

    // Define a type for hit regions.
    var Region = (function() {

      var Region = function(x, y, width, height) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + width;
        this.y2 = y + height;

        var listeners = {}
        $.each(SUPPORTED_EVENTS, function(_index, event) {
          listeners[event] = [];
        });
        this.listeners = listeners;
      };

      /*
       * Add an event listener to the hit region.
       *
       * Currently, the only supported event name is 'click',
       * which fires when the user clicks on the region.
       *
       * Listeners will be passed the jQuery event that triggered them.
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

      return Region;
    })();


    var hitRegionsKey = 'mapView.hitRegions';
    var $canvas = $(canvas);
    if ($canvas.data(hitRegionsKey) === undefined) {
      $canvas.data(hitRegionsKey, []);
    }

    var fireEvent = function(name, event) {
      var offset = $canvas.offset();
      var canvasX = event.pageX - offset.left;
      var canvasY = event.pageY - offset.top;

      _fire(name, canvasX, canvasY);
    };

    /**
     * Fire an event as though it occurred at the specified point on the canvas.
     * Exposed as its own method for testing.
     */
    var _fire = function(name, canvasX, canvasY) {

      $.each($canvas.data(hitRegionsKey), function(_index, region) {
        if (region.x1 < canvasX && canvasX < region.x2 &&
            region.y1 < canvasY && canvasY < region.y2) {
          region.fire(name);
        }
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
     * Remove all hit regions, and re-create listeners.
     * TODO: consider ways to only install the listener once.
     */
    var reset = function() {
      $canvas.data(hitRegionsKey, []);

      $.each(SUPPORTED_EVENTS, function(_index, eventName) {
        $canvas.off(eventName);
        $canvas.on(eventName, function(event) {
          fireEvent(eventName, event);
        });
      });
    };

    return {
      add : add,
      reset : reset,

      _fire: _fire
    };
  };

  return hitRegions;
});
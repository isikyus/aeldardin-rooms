define([], function() {

  var buildSymbols = function(options) {
    var o = options;

    return {
      blankDoorArea : function(context, offset) {
        if (typeof(offset) === 'undefined') {
          offset = o.doorOffset;
        }
        var width = o.scale - (offset * 2);
        context.save();
        context.fillStyle = 'white'
        context.fillRect(offset, - o.halfThickness, width, o.doorThickness);
        context.restore();
      },
      dashedLine : function(context, x1, length, y, dashLength, spacing) {
        var unitLength = dashLength + spacing;
        var lastX = x1 + length;
        var x = x1;

        context.beginPath();
        context.moveTo(x, y);

        // The first dash should be half-length, as should the last;
        // we halve the first line, and assume the last is correct.
        x += dashLength / 2;
        context.lineTo(x, y);

        while (x < lastX) {
          x = Math.min(x + dashLength, lastX + 0.5);
          context.lineTo(x, y);

          x += spacing;
          context.moveTo(x, y);
        }
        context.stroke();
      }
    };
  };

  return buildSymbols;
});
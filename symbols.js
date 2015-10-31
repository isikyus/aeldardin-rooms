define([
    'symbols/base',
    'symbols/dnd'
  ],
function(baseScaled, dndScaled, architectureScaled) {

  var scaledSymbols = function(scale) {
    var options = {
      scale : scale,
      doorOffset : 8
    };
    options.doorThickness = options.doorOffset;
    options.doorWidth     = options.scale - (options.doorOffset * 2);
    options.halfThickness = options.doorThickness / 2;

    var dnd = dndScaled(options);

    symbols = {
      door        : dnd.door,
      arch        : dnd.arch,
      secret      : dnd.secret,
      open        : dnd.open,
      porticullis : dnd.porticullis
    };
    return symbols;
  };

  return scaledSymbols;
});
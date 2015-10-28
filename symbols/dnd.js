/**
 * Knossos "D&D" symbol set, imitating Dungeons and Dragons and Pathfinder maps
 *
 * The style of these symbols comes from several sources,
 * but the main ones are:
 *    * Dyson Logos's map key (<https://rpgcharacters.wordpress.com/2013/12/23/the-key-to-all-this-madness/>)
 *    * The "Map Symbols" diagram on p. 175 of the Pathfinder GameMastery Guide (Paizo Publishing 2010, ISBN 978-1-60125-217-3)
 *    * Examples used in Peter Alexandrian's discussion of RPG mapping (<http://thealexandrian.net/wordpress/4811/roleplaying-games/better-dungeon-maps-part-1-opening-doors> and following pages)
 *
 * I believe the common elements of D&D symbols these sources share can be used without
 * needing permission from anybody, but I have no real evidence for this.
 *
 * I'm not affiliated with any of those people, and this isn't endorsed by them.
 */

define([
    'symbols/base'
  ],
function(baseSymbols) {

  var buildSymbols = function(options) {
    var o = options;
    var base = baseSymbols(options);

    return {
      door: function(context) {
        base.blankDoorArea(context);
        context.strokeRect(o.doorOffset, - o.halfThickness, o.doorWidth, o.doorThickness);
      },
      arch: function(context) {
        base.blankDoorArea(context);
        // Short cross-lines at each side of the opening.
        context.beginPath();
        context.moveTo(o.doorOffset, -o.halfThickness);
        context.lineTo(o.doorOffset, o.halfThickness);
        context.moveTo(o.scale - o.doorOffset, -o.halfThickness);
        context.lineTo(o.scale - o.doorOffset, o.halfThickness);
        context.stroke();
      },
      secret: function(context) {
        // Turn 90 degrees, so we draw the 'S' across the line of the wall.
        context.rotate(Math.PI / 2);

        context.font = o.doorWidth + 'px sans-serif';
        context.textAlign = 'center';

        context.strokeStyle = 'white';
        context.strokeText('S', 0, -o.doorOffset);
        context.fillText('S', 0, -o.doorOffset);
      },
      open: function(context) {
        // Blank the full width of the door.
        base.blankDoorArea(context, 0);
      },
      porticullis: function(context) {
        base.blankDoorArea(context, 0);
        var dot_spacing = 5;
        var dot_x;
        for(dot_x = 0; dot_x < o.scale; dot_x += dot_spacing) {
          context.fillRect(dot_x, -1, 2, 2);
        }
      }
    };
  };

  return buildSymbols;
});
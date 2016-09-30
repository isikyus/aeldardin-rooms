// Root file loaded by RequireJS

require.config({
    paths: {
        'jquery': 'lib/jquery',
        'handlebars': 'lib/handlebars'
    },
});

require([
    'jQuery',
    'map_controller'
  ],
function($, MapController) {
  $(function() {
    $('.js-map').each(function(_index, canvas) {
      var controller = new MapController(canvas);
    });
  });
});
$.asm = {};
$.asm.panels = 1;

function sidebar(panels) {
    $.asm.panels = panels;
    if (panels === 1) {
      $('#content').removeClass('span9');
      $('#content').addClass('span12 no-sidebar');
      $('#sidebar').hide();
    } else if (panels === 2) {
      $('#content').removeClass('span12 no-sidebar');
      $('#content').addClass('span9');
      $('#sidebar').show();
    $('#mapCanvas').width($('#mapCanvas').parent().width());
    $('#mapCanvas').height($(window).height() - 50);
    $('#sidebar').height($(window).height() - 50);
    return google.maps.event.trigger($.asm.theMap, 'resize');
    }
};

$('#toggleSidebar').click(function() {
  if ($.asm.panels === 1) {
    $('#toggleSidebar i').addClass('icon-chevron-left');
    $('#toggleSidebar i').removeClass('icon-chevron-right');
    return sidebar(2);
  } else {
    $('#toggleSidebar i').removeClass('icon-chevron-left');
    $('#toggleSidebar i').addClass('icon-chevron-right');
    return sidebar(1);
  }
});

$(function() {
  $.asm.theMap = new google.maps.Map(document.getElementById('mapCanvas'));
});
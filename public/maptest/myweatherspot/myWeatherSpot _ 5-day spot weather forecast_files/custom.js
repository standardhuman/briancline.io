// Animated scroll: to implement, add class="scroll" to internal links

jQuery(document).ready(function($) {

  $(".scroll").click(function(event) {
    event.preventDefault();
    $('html,body').animate({scrollTop: $(this.hash).offset().top}, 300);
  });
  /*
   * Find the external link and add atrributes to open in new tab in page load.
   **/
  $("a[href^=http]").each(function() {
    if (this.href.indexOf(location.hostname) == -1) {
      $(this).attr({
        target: "_blank",
        title: "Opens in a new window"
      });
      $(this).addClass('external');
    }
  });
  if (!$('.flickr_images img').length) {
    //load flickr images
    $('.flickr_images').load('flickrajax.php');
  }
});


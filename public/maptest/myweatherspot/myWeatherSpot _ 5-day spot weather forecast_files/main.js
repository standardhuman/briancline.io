
$(document).ready(function() {

  var markers = [], map, ajax = {};

  function initialize() {
    var myOptions = {
      zoom: $.cookie("forecastZoom") !== null ? parseInt($.cookie("forecastZoom")) : 4,
      center: new google.maps.LatLng(38.000000, -122.000000),
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      streetViewControl: false,
      disableDoubleClickZoom: true
    };
    map = new google.maps.Map(document.getElementById('map'),
      myOptions);

    google.maps.event.addListener(map, 'click', function(e) {
      placeMarker(e.latLng, map);
    });

    google.maps.event.addListener(map, 'zoom_changed', function(e) {
      $.cookie("forecastZoom", map.getZoom(), {
        path: "/", 
        expires: 365
      });
    });


    if ($.cookie("forecastPos") !== null) {

      var position = $.cookie("forecastPos").split(",");

      var lat = Number(position[0]);
      var lng = Number(position[1]);

      if (!isNaN(lat) && !isNaN(lng)) {
        placeMarker(new google.maps.LatLng(lat, lng), map);
      }
    }
    
    //check if user is first time visitor , if yes then makr his current ocation the current marker
    
    var visitor = getCookie('site_visited');
    if(visitor == ""){
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          //do_something(position.coords.latitude, position.coords.longitude);
          placeMarkerAndSetZoom(new google.maps.LatLng(position.coords.latitude, position.coords.longitude), map);
        });
      /* geolocation is available */
      }
     
    }
    setCookie('site_visited',1,3000);
  }

  function placeMarkerAndSetZoom(position, map) {
    placeMarker(position,map);
    map.setZoom(10);
  }




  function placeMarker(position, map) {
    if (markers.length !== 0) {
      markers.pop().setMap(null);
    }

    var marker = new google.maps.Marker({
      position: position,
      map: map
    });

    map.panTo(position);

    $("#markers").html("Marker location: " + position.lat().toFixed(5) + ", " + position.lng().toFixed(5) + "");

    $.cookie("forecastPos", position.lat() + "," + position.lng(), {
      path: "/", 
      expires: 365
    });

    /*$("#data").html("Loading....");*/
    /*
     * Add the ajax loader image class.
     **/
    $("#data").empty().addClass('ajaxloader');

    if (ajax.abort !== undefined)
      ajax.abort();
    ajax = $.get("proxy.php", {
      lat: position.lat(), 
      lng: position.lng()
    }, function(response) {
      /*
       * Remove the ajax loader image class.
       **/
      $("#data").removeClass('ajaxloader');
      $("#data").html(response.msg);
      /*
       * Find the external link and add atrributes to open in new tab in the ajax return html.
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
    }, "json");

    markers.push(marker);
  }

  google.maps.event.addDomListener(window, 'load', initialize);

  $('#loc-find').click(function(e) {
    e.preventDefault();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        //do_something(position.coords.latitude, position.coords.longitude);
        placeMarkerAndSetZoom(new google.maps.LatLng(position.coords.latitude, position.coords.longitude), map);
      },function(){    
      $('#findlocaalert').hide(); 
          $('#findlocaalert').text('Your device is not configured to use Location Services. Please click map.');
  $('#findlocaalert').slideDown();   
          setTimeout(hideMessage, 4000);
      });
    /* geolocation is available */
    } else {
      $('#findlocaalert').hide();
      $('#findlocaalert').text('Your device is not configured to use Location Services. Please click map.');
  $('#findlocaalert').slideDown();   
      setTimeout(hideMessage, 4000);
    }
  });
});

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
  }
  return "";
} 
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
} 

function hideMessage(){
  $('#findlocaalert').slideUp();
}
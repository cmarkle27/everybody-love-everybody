/*
 * Instagram JS module
 * v0.0.1
 *
 * inspired by
 * http://potomak.github.com/jquery-instagram/
 */

var INSTAGRAM = function( options ) {
  
  // private variables and functions
  var that = this,
      apiEndpoint = "https://api.instagram.com/v1",
      settings = {
          hash: null
          , userId: null
          , locationId: null
          , search: null
          , accessToken: null
          , clientId: null
          , limit: null
          , onComplete: null
          , maxId: null
          , minId: null
          , next_url: null
          , image_size: null
      };

      options && $.extend(settings, options);
      
  /* Methods */
  var 
  
  composeRequestURL = function () {

      var url = apiEndpoint,
          params = {};
      
      if (settings.next_url != null) {
        return settings.next_url;
      }

      if (settings.hash != null) {
        url += "/tags/" + settings.hash + "/media/recent";
      }
      else if (settings.search != null) {
        url += "/media/search";
        params.lat = settings.search.lat;
        params.lng = settings.search.lng;
        settings.search.max_timestamp != null && (params.max_timestamp = settings.search.max_timestamp);
        settings.search.min_timestamp != null && (params.min_timestamp = settings.search.min_timestamp);
        settings.search.distance != null && (params.distance = settings.search.distance);
      }
      else if (settings.locationId != null) {
        url += "/locations/" + settings.locationId + "/media/recent";
      }
      else {
        url += "/media/popular";
      }
      
      settings.accessToken != null && (params.access_token = settings.accessToken);
      settings.clientId != null && (params.client_id = settings.clientId);
      settings.minId != null && (params.min_id = settings.minId);
      settings.maxId != null && (params.max_id = settings.maxId);
      settings.limit != null && (params.count = settings.limit);

      url += "?" + $.param(params)
      
      return url;
  },

  makeRequest = function() {

    $.ajax({
      type: "GET",
      dataType: "jsonp",
      cache: false,
      url: composeRequestURL(),
      success: function (res) {

        var length = typeof res.data != 'undefined' ? res.data.length : 0,
             grams = [];

        var limit = settings.limit != null && settings.limit < length ? settings.limit : length;
        
        if (limit > 0) {
          for (var i = 0; i < limit; i++) {
            grams.push( res.data[i] );
          }
        }
        else {
          grams.push( res.data[i] );
        }

        console.log(grams);

        settings.onComplete != null && typeof settings.onComplete == 'function' && settings.onComplete(grams, res);

      }

    });

  };
  
  /* Init */

  /* return public interface */
  return {
      getImages : function( options ) {
        options && $.extend(settings, options);
        makeRequest();
      }
  };
  
};
// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    // Global Variables
    var OpenWeatherAppKey = "7de943075bfa7d0cc3858dccb02b29a5";

    var map = null;
    var marker = null;
    var mapOptions = {
        center: new google.maps.LatLng(39.477801, -8.096995),
        zoom: 6,
        zoomControl: false,
        fullscreenControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Buttons
        $('#get-weather-form-btn').click(getWeatherWithZipCode);

        // Geo Location
        document.getElementById("btnLocation").addEventListener("touchend", getLocation, false);
        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        cordova.dialogGPS();

    };

    // Form Wheater
    function getWeatherWithZipCode() {
       
        var zipcode = $('#zip-code-input').val();
        var queryString =
            'http://api.openweathermap.org/data/2.5/weather?q='
            + zipcode + '&appid=' + OpenWeatherAppKey + '&units=metric';
        $.getJSON(queryString, function (results) {
            showWeatherData(results);
        }).fail(function (jqXHR) {
          
            $('#weather-data').hide();
            $('#error-msg').show();
            $('#error-msg').text("Error retrieving data. " + jqXHR.statusText);
        });
        return false;
    }

    function showWeatherData(results) {
        $('#weather-data').val('');

        if (results.weather.length) {
            $('#error-msg').hide();
            $('#weather-data').show();

            $('#title').text(results.name);
            $('#temperature').text(results.main.temp);
            $('#wind').text(results.wind.speed);
            $('#humidity').text(results.main.humidity);
            $('#visibility').text(results.weather[0].main);

            var sunriseDate = new Date(results.sys.sunrise * 1000);
            $('#sunrise').text(sunriseDate.toLocaleTimeString());

            var sunsetDate = new Date(results.sys.sunset * 1000);
            $('#sunset').text(sunsetDate.toLocaleTimeString());

            var imgUrl = 'http://openweathermap.org/img/wn/' + results.weather[0].icon + '@2x.png';
            $('#icon').html('<img src="' + imgUrl + '" width="50px" height="50px" alt="Image Wheater">');

        } else {
            $('#weather-data').val('');
            $('#weather-data').hide();
            $('#error-msg').show();
            $('#error-msg').text("Error retrieving data. " + results.message);
        }
    }

    // MAp
    function getLocation() {

        navigator.geolocation.getCurrentPosition(
            function (position) {

                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                setMarker(latitude, longitude);

            },
            function (error) {
                navigator.notification.alert(
                    'Code: ' + error.code + '\n' + 'Message: ' + error.message + '\n',      // message
                    null,                                                                   // callback
                    'Error',                                                                // title
                    'Ok'                                                                    // buttonName
                );
            },
            { maximumAge: 5000, timeout: 15000, enableHighAccuracy: true });
    }


    function setMarker(latitude, longitude) {

        var latlng = new google.maps.LatLng(latitude, longitude);

        if (marker === null) {

            marker = new google.maps.Marker({
                position: latlng
            });
            marker.setMap(map);
        }
        else {
            marker.setPosition(latlng);
        }

        map.setZoom(16);
        map.setCenter(marker.getPosition());
        setInfoWindow();
    }

    function setInfoWindow() {

        var geocoder = new google.maps.Geocoder;
        var infowindow = new google.maps.InfoWindow;
        var content;

        geocoder.geocode({ 'location': marker.getPosition() }, function (results, status) {
            if (status === 'OK') {
                if (results[1]) {

                    content = "Latitude:  " + marker.getPosition().lat() + "<br/>";
                    content += "Longitude:  " + marker.getPosition().lng() + "<br/>";
                    content += results[1].formatted_address;

                    infowindow.setContent(content);
                    infowindow.open(map, marker);

                } else {
                    navigator.notification.alert('No results found');
                }
            } else {
                navigator.notification.alert('Geocoder failed due to: ' + status);
            }
        });

    }

})();
/* globals google */
'use strict';

/**
 * appends params to a url
 * @param {string} url - Original url
 * @param {Object} params - Parameters to append
 * @returns {string} result url with appended parameters
 */
function appendToUrl(url, params) {
    var newUrl = url;
    newUrl += (newUrl.indexOf('?') !== -1 ? '&' : '?') + Object.keys(params).map(function (key) {
        return key + '=' + encodeURIComponent(params[key]);
    }).join('&');

    return newUrl;
}

/**
 * Uses google maps api to render a map
 */
function maps() {
    var map;
    var infowindow = new google.maps.InfoWindow();

    // Init U.S. Map in the center of the viewport
    var latlng = new google.maps.LatLng(37.09024, -95.712891);
    var mapOptions = {
        scrollwheel: false,
        zoom: 4,
        center: latlng
    };

    map = new google.maps.Map($('.map-canvas')[0], mapOptions);
    var mapdiv = $('.map-canvas').attr('data-locations');

    mapdiv = JSON.parse(mapdiv);

    var bounds = new google.maps.LatLngBounds();

    // Customized google map marker icon with svg format
    var markerImg = {
        path: 'M13.5,30.1460153 L16.8554555,25.5 L20.0024287,25.5 C23.039087,25.5 25.5,' +
            '23.0388955 25.5,20.0024287 L25.5,5.99757128 C25.5,2.96091298 23.0388955,0.5 ' +
            '20.0024287,0.5 L5.99757128,0.5 C2.96091298,0.5 0.5,2.96110446 0.5,5.99757128 ' +
            'L0.5,20.0024287 C0.5,23.039087 2.96110446,25.5 5.99757128,25.5 L10.1445445,' +
            '25.5 L13.5,30.1460153 Z',
        fillColor: '#0070d2',
        fillOpacity: 1,
        scale: 1.1,
        strokeColor: 'white',
        strokeWeight: 1,
        anchor: new google.maps.Point(13, 30),
        labelOrigin: new google.maps.Point(12, 12)
    };

    Object.keys(mapdiv).forEach(function (key) {
        var item = mapdiv[key];
        var lable = parseInt(key, 10) + 1;
        var storeLocation = new google.maps.LatLng(item.latitude, item.longitude);
        var marker = new google.maps.Marker({
            position: storeLocation,
            map: map,
            title: item.name,
            icon: markerImg,
            label: { text: lable.toString(), color: 'white', fontSize: '16px' }
        });

        marker.addListener('click', function () {
            infowindow.setOptions({
                content: item.infoWindowHtml
            });
            infowindow.open(map, marker);
        });

        // Create a minimum bound based on a set of storeLocations
        bounds.extend(marker.position);
    });
    // Fit the all the store marks in the center of a minimum bounds when any store has been found.
    if (mapdiv && mapdiv.length !== 0) {
        map.fitBounds(bounds);
    }
}

/**
 * Renders the results of the search and updates the map
 * @param {Object} data - Response from the server
 */
function updateStoresResults(data) {
    var $resultsDiv = $('.results');
    var $mapDiv = $('.map-canvas');

    if (data.stores.length === 0) {
        $('.store-locator-no-results').show();
    } else {
        $('.store-locator-no-results').hide();
    }

    $resultsDiv.empty()
        .data('has-results', data.stores.length)
        .data('radius', data.radius)
        .data('search-key', data.searchKey);

    $mapDiv.attr('data-locations', data.locations);

    if ($mapDiv.data('has-google-api')) {
        maps();
    } else {
        $('.store-locator-no-apiKey').show();
    }

    if (data.storesResultsHtml) {
        $resultsDiv.append(data.storesResultsHtml);
    }
}

module.exports = {
    init: function () {
        if ($('.map-canvas').data('has-google-api')) {
            maps();
        } else {
            $('.store-locator-no-apiKey').show();
        }

        if ($('.results').data('has-results') === 0) {
            $('.store-locator-no-results').show();
        }
    },

    detectLocation: function () {
        // clicking on detect location.
        $('.detect-location').on('click', function () {
            $.spinner().start();
            if (!navigator.geolocation) {
                $.spinner().stop();
                return;
            }

            navigator.geolocation.getCurrentPosition(function (position) {
                var $detectLocationButton = $('.detect-location');
                var url = $detectLocationButton.data('action');
                var radius = $('.results').data('radius');
                var urlParams = {
                    radius: radius,
                    lat: position.coords.latitude,
                    long: position.coords.longitude
                };

                url = appendToUrl(url, urlParams);
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'json',
                    success: function (data) {
                        $.spinner().stop();
                        updateStoresResults(data);
                    }
                });
            });
        });
    },

    search: function () {
        $('.store-locator').submit(function (e) {
            e.preventDefault();
            $.spinner().start();
            var $form = $('.store-locator');
            var radius = $('.results').data('radius');
            var url = $form.attr('action');
            var urlParams = { radius: radius };

            url = appendToUrl(url, urlParams);

            $.ajax({
                url: url,
                type: $form.attr('method'),
                data: $form.serialize(),
                dataType: 'json',
                success: function (data) {
                    $.spinner().stop();
                    updateStoresResults(data);
                }
            });
            return false;
        });
    },

    changeRadius: function () {
        $('.radius').change(function () {
            var radius = $(this).val();
            var searchKeys = $('.results').data('search-key');
            var url = $('.radius').data('action');
            var urlParams = {};

            if (searchKeys.postalCode) {
                urlParams = {
                    radius: radius,
                    postalCode: searchKeys.postalCode
                };
            } else if (searchKeys.lat && searchKeys.long) {
                urlParams = {
                    radius: radius,
                    lat: searchKeys.lat,
                    long: searchKeys.long
                };
            }

            url = appendToUrl(url, urlParams);
            $.spinner().start();
            $.ajax({
                url: url,
                type: 'get',
                dataType: 'json',
                success: function (data) {
                    $.spinner().stop();
                    updateStoresResults(data);
                }
            });
        });
    },
    selectStore: function () {
        $('body').on('click', '.select-store', (function (e) {
            e.preventDefault();
            var selectedStore = $(':checked', '.results-card .results').data('store-info');
            $('.select-store').trigger('store:selected', selectedStore);
        }));
    }
};

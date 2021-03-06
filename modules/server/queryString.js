'use strict';

/**
 * Zips the pref[n|v] http query params
 *
 * The Platform allows the use of multiple preference names and values to filter search results,
 * eg.: http://<sandbox>.com/../Search-Show?prefn1=refinementColor&prefv1=Blue&prefn2=size&prefv2=16
 *
 * @param {Object} preferences - HTTP query parameters map specific to selected refinement values
 * @return {Object} Map of provided preference name/value pairs
 */
function parsePreferences(preferences) {
    var params = {};
    var count = Object.keys(preferences).length / 2;
    var key = '';
    var value = '';

    for (var i = 1; i < count + 1; i++) {
        key = preferences['prefn' + i];
        value = preferences['prefv' + i];
        params[key] = value;
    }

    return params;
}

var querystring = function (raw) {
    var pair;
    var left;
    var preferences = {};

    if (raw && raw.length > 0) {
        var qs = raw.substring(raw.indexOf('?') + 1).replace(/\+/g, '%20').split('&');
        for (var i = qs.length - 1; i >= 0; i--) {
            pair = qs[i].split('=');
            left = decodeURIComponent(pair[0]);
            if (left.indexOf('dwvar_') === 0) {
                var variableParts = left.split('_');
                if (variableParts.length === 3) {
                    if (!this.variables) {
                        this.variables = {};
                    }
                    this.variables[variableParts[2]] = {
                        id: variableParts[1],
                        value: decodeURIComponent(pair[1])
                    };
                    continue; // eslint-disable-line no-continue
                }
            } else if (left.indexOf('dwopt_') === 0) {
                var optionParts = left.split('_');
                var productId = optionParts[1];
                var optionId = optionParts[2];
                var selectedOptionValueId = decodeURIComponent(pair[1]);
                if (optionParts.length === 3) {
                    if (!this.options) {
                        this.options = [];
                    }
                    this.options.push({
                        optionId: optionId,
                        selectedValueId: selectedOptionValueId,
                        productId: productId
                    });
                    continue; // eslint-disable-line no-continue
                }
            } else if (left.indexOf('pref') === 0) {
                preferences[left] = decodeURIComponent(pair[1]);
                continue; // eslint-disable-line no-continue
            }

            this[left] = decodeURIComponent(pair[1]);
        }
    }

    if (Object.keys(preferences).length) {
        this.preferences = parsePreferences(preferences);
    }
};

querystring.prototype.toString = function () {
    var result = [];
    var prefKeyIdx = 1;
    var preferences = {};

    Object.keys(this).forEach(function (key) {
        if (key === 'variables') {
            Object.keys(this.variables).forEach(function (variable) {
                result.push('dwvar_' +
                    this.variables[variable].id + '_' +
                    variable + '=' + encodeURIComponent(this.variables[variable].value));
            }, this);
        } else if (key === 'options') {
            this.options.forEach(function (option) {
                result.push('dwopt_' +
                    option.productId + '_' +
                    option.optionId + '=' + encodeURIComponent(option.selectedValueId));
            });
        } else if (key === 'preferences') {
            preferences = this.preferences;
            Object.keys(preferences).forEach(function (prefKey) {
                result.push('prefn' + prefKeyIdx + '=' + encodeURIComponent(prefKey));
                result.push('prefv' + prefKeyIdx + '=' + encodeURIComponent(preferences[prefKey]));
                prefKeyIdx++;
            });
        } else {
            result.push(key + '=' + encodeURIComponent(this[key]));
        }
    }, this);

    return result.sort().join('&');
};

module.exports = querystring;

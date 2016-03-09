/**
 * Created by Zhou on 3/1/16.
 */
/**
 * Created by Zhou on 10/25/15.
 */
//Local Storage
angular.module('ionic.utils', [])

    .factory('$localStorage', ['$window', function($window) {
        return {
            set: function(key, value) {
                console.log(key,value);
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key]==undefined ? defaultValue:$window.localStorage[key];
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }])

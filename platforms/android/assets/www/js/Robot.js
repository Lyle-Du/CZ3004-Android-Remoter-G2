/**
 * Created by Zhou on 2/7/16.
 */
angular.module('starter.services')

.factory("Robot", function ($rootScope, ConverMapString, constants) {
    /**
     * Map: 2D array 20*15 Array
     * 20
     * |
     * |
     * |
     * |
     * |----------*15
     * left down is 0
     * 0: unexplore
     * 1: block
     * 2: clear area
     *
     * Robot Position
     */
    var map = new Array(20);
    for (var i = 0; i < 20; i++) {
        map[i] = new Array(15);
        for (var j = 0; j < 15; j++) {
            map[i][j] = 0;
        }
    }
    /**
     * location of Robot
     * @type {number[x,y]}
     */
    robotLocation = [0, 0];

    /**
     * the orientation of the robot
     * one of 0-3 indicating : NSWE
     * @type {int}
     */
    robotOrientation = 0;

    $rootScope.$on("bluetooth:recievedData", function (event, data) {
        var stateChanged = false;
        console.log(data.robotPosition);
        if (data.robotPosition) {
            robotLocation[0] = data.robotPosition[constants.FLIP_RECEIVED_XY_COORDINATE ? 0 : 1];
            robotLocation[1] = data.robotPosition[constants.FLIP_RECEIVED_XY_COORDINATE ? 1 : 0];
            robotOrientation = (data.robotPosition[2] / 90 + constants.ORIENTATION_OFFSET) % 4;
            stateChanged = true;
        }
        if (data.grid) {
            map = ConverMapString.convert(data.grid);
            stateChanged = true;
        }
        if (stateChanged) notify();
    });


    var notify = function () {
        $rootScope.$emit("robotStateChanged");
    };

    return {
        getMap: function () {
            return map
        },
        getOrientation: function () {
            return robotOrientation
        },
        subscribe: function (scope, callback) {
            var handler = $rootScope.$on('robotStateChanged', callback);
            scope.$on("$destory", handler);
            return handler
        },

        getLocation: function () {
            return robotLocation
        },

        setLocation: function (x, y) {
            robotLocation[0] = x;
            robotLocation[1] = y;

            notify();
        },
        setMap: function (newMap) {
            map = newMap;
            notify();
        },
        notify: notify,
        setOrientation: function (orientation) {
            robotOrientation = orientation % 4;
            notify();

        }
    }
});
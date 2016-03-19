/**
 * Created by Zhou on 2/7/16.
 */
angular.module('starter.services')

.factory("Robot", function ($rootScope, ConverMapString, constants) {
    /**
     * Map: 2D array 15*20 Array
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
    var UNEXPLORE = 0,
        BLOCK = 1,
        CLEAR = 2;
    for (var i = 0; i < 20; i++) {
        map[i] = new Array(15);
        for (var j = 0; j < 15; j++) {
            map[i][j] = UNEXPLORE;
        }
    }


    /**
     * location of Robot
     * @type {number[x,y]}
     */
    var robotLocation = [0, 0];

    /**
     * the orientation of the robot
     * one of 0-3 indicating : NSWE
     * @type {int}
     */
    var robotOrientation = 0;

    $rootScope.$on("bluetooth:recievedData", function (event, data) {

        var stateChanged = false;
        if (data.robotPosition) {
            robotLocation[0] = data.robotPosition[constants.FLIP_RECEIVED_XY_COORDINATE ? 0 : 1];
            robotLocation[1] = data.robotPosition[constants.FLIP_RECEIVED_XY_COORDINATE ? 1 : 0];
            robotOrientation = (data.robotPosition[2] / 90 + constants.ORIENTATION_OFFSET) % 4;
            stateChanged = true;
        }
        if (data.grid) {
            console.log(data.grid);
            map = ConverMapString.convert(data.grid);
            stateChanged = true;
        }
        if (new RegExp('^s\\d{5}').test(data)) {
            for (var i = 0; i < 5; i++) {
                var reading = parseInt(data[i + 1]);
                for (var j = 0; j < Math.min(constants.SENSOR_MAX_RANGE, reading); j++) {
                    var offset = constants.rotate(
                        robotOrientation,
                        constants.DECTECTION_VECTOR[i][j][0],
                        constants.DECTECTION_VECTOR[i][j][1]);
                    if (map[robotLocation[0]+offset[0]]!= undefined && map[robotLocation[0]+offset[0]][robotLocation[1]+offset[1]]!=undefined)
                        map[robotLocation[0] + offset[0]][robotLocation[1] + offset[1]] = CLEAR;
                }
                if (reading < constants.SENSOR_MAX_RANGE) {
                    offset = constants.rotate(
                        robotOrientation,
                        constants.DECTECTION_VECTOR[i][reading][0],
                        constants.DECTECTION_VECTOR[i][reading][1]);
                    if (map[robotLocation[0] + offset[0]] != undefined && map[robotLocation[0] + offset[0]][robotLocation[1] + offset[1]] != undefined) 
                        map[robotLocation[0] + offset[0]][robotLocation[1] + offset[1]] = BLOCK;
                }
            }
            stateChanged = true;
        }


        if (new RegExp("^[fblr]\\d{1,2}").test(data)) {
            stateChanged = true;
            var reading = parseInt(data[1] + data[2]);

            switch (data[0]) {
            case "f":
                robotLocation = [
                        robotLocation[0] + constants.ORIENTATION_VECTOR[robotOrientation][0] * reading,
                        robotLocation[1] + constants.ORIENTATION_VECTOR[robotOrientation][1] * reading,
                    ];
                break;
            case "b":
                robotLocation = [
                        robotLocation[0] - constants.ORIENTATION_VECTOR[robotOrientation][0] * reading,
                        robotLocation[1] - constants.ORIENTATION_VECTOR[robotOrientation][1] * reading,
                    ];
                break;
            case "l":
                robotOrientation = (robotOrientation + 4 - reading) % 4;
                break;
            case "r":
                robotOrientation = (robotOrientation + 4 + reading) % 4;
                break;
            }
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
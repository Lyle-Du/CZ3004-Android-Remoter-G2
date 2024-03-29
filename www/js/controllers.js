angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope, $rootScope, $localStorage, $state, BLE, Robot, sceneRendering, DDrender, constants) {
    $scope.currentState = "Stop";
    $scope.exploreMsg = "none";
    $scope.blockMsg = "none";
    document.addEventListener("deviceready", function () {
        $scope.isAuto = true;
        $scope.onToggleChange($scope.isAuto);
        //init variables
        $scope.currentState = "Stop";
        $scope.checkMsg = "none";
        //this observer handle updating recieved data to ui
        $rootScope.$on('bluetooth:recievedData', function () {
                //$rootScope.recievedData = data;
                if ($scope.recievedData.robotPosition != null)
                    $scope.currentState = "Stop";
                if ($scope.recievedData.explore != null)
                    $scope.exploreMsg = $scope.recievedData.explore;
                if ($scope.recievedData.block != null)
                    $scope.blockMsg = $scope.recievedData.block;
                $scope.$apply();
            })
            //initial the scence;
        renderMyScence();
        Robot.subscribe($scope, renderMyScence);
    });

    $scope.onToggleChange = function (isAuto) {
        $scope.autoFlag = isAuto;
    }

    $scope.manualUpdate = function () {
        if ($scope.autoFlag == true)
            return;
        var twoDCanvas = document.getElementById('2DCanvas');
        var threeDCanvas = document.getElementById('3DCanvas');
        //2d canvas
        var DDRender = DDrender.render(twoDCanvas);
        //3d canvas
        var renderer = new Phoria.CanvasRenderer(threeDCanvas);
        sceneRendering.getScene(function (scene) {
            scene.modelView();
            renderer.render(scene);
        })
    }

    var renderMyScence = function () {
        if ($scope.autoFlag == false)
            return;
        var twoDCanvas = document.getElementById('2DCanvas');
        var threeDCanvas = document.getElementById('3DCanvas');
        //2d canvas
        var DDRender = DDrender.render(twoDCanvas);
        //3d canvas
        var renderer = new Phoria.CanvasRenderer(threeDCanvas);
        sceneRendering.getScene(function (scene) {
            scene.modelView();
            renderer.render(scene);
        });
        console.log(renderer)
    }

    $scope.view = {
        enable: false
    };

    Robot.subscribe($scope, renderMyScence);
    Robot.subscribe($scope, function () {
        $scope.x.value = Robot.getLocation()[0];
        $scope.y.value = Robot.getLocation()[1];
    });

    var WALL_LOCATIONS = [];
    WALL_LOCATIONS.forEach(function (wall) {
        Robot.getMap()[wall[0]][wall[1]] = 1;
    });

    $scope.y = {
        value: 1
    };
    $scope.x = {
        value: 1
    };

    Robot.setLocation($scope.x.value, $scope.y.value);
    Robot.setOrientation(0);

    $scope.robot = Robot;
    $scope.block = [];
    $scope.wall = WALL_LOCATIONS;
    $scope.add = function () {
        Robot.getMap()[$scope.block[0]][$scope.block[1]] = 1;
        Robot.notify();
    };

    $scope.setLoc = function () {
        BLE.write("x" + $scope.x.value + "y" + $scope.y.value);
        Robot.setLocation($scope.x.value, $scope.y.value);
        Robot.setOrientation(0);
    };

    $scope.sendStr = function (index) {
        BLE.write($localStorage.getObject("Strings")[index]);
    };

    $scope.forward = function () {
        BLE.write('f01').then(function () {
            $scope.currentState = "Forward"
        });
    }
    $scope.backward = function () {
        BLE.write('b01').then(function () {
            $scope.currentState = "Backward"
        });
    }
    $scope.left = function () {
        BLE.write('l01').then(function () {
            $scope.currentState = "Turn Left"
        });
    }

    $scope.right = function () {
        BLE.write('r01').then(function () {
            $scope.currentState = "Turn Right"
        });
    }
    $scope.reconfigure = function () {
        $state.go('tab.profile');
    }
    $scope.startExplore = function () {
        BLE.write('se').then(function () {
            $scope.currentState = "Start Explore"
        });
    }
    $scope.startShortest = function () {
        BLE.write('ssp').then(function () {
            $scope.currentState = "Start Shorest Path"
        });
    }
    $scope.clearMap = function () {
        $scope.exploreMsg = "none";
        $scope.blockMsg = "none";
        Robot.getMap().forEach(function (current, index, arr) {
            current.forEach(function (current, index, arr) {
                arr[index] = 0;
            })
        })
        Robot.notify();
    }
})

.filter('reverse', function () {
    return function (items) {
        return items.slice().reverse();
    };
})

.controller('LogsCtrl', function ($scope, $rootScope, BLE, constants) {

    document.addEventListener("deviceready", function () {
        $rootScope.$on('bluetooth:sentData', function () {
            $scope.$apply();
        })
    })

    $scope.send = function (msg) {
        console.log("Sending msg " + msg)
        if (msg.length <= 0)
            return
        if ($rootScope.isConnected == false)
            return alert("Bluetooth is not connected.")
        BLE.write(msg).then(function () {}, function (error) {
            alert(error);
        })
    }

    $scope.clearSent = function () {
        console.log("try to clear sent")
        $rootScope.sentMsgs = [];
    }
    $scope.clearRecieved = function () {
        console.log("try to clear sent")
        $rootScope.recievedMsgs = [];
        $rootScope.myRecievedMsgs = [];
    }
})

.controller('ProfileCtrl', function ($rootScope, $scope, $state, $localStorage, Robot, BLE, constants) {
    //if (!$localStorage.getObject("Strings"))
    defaultObj = $localStorage.getObject("Strings");
    $scope.preDefinedString = defaultObj;
    $scope.set = function () {
        $localStorage.setObject("Strings", defaultObj);
        console.log($localStorage.getObject("Strings"));

    };
    $scope.SetMap = function () {
        var mapString = {
            grid: $scope.preDefinedString[2]
        };
        BLE.write(mapString);
    };
    $scope.isAuto = false;
    var handler = undefined;
    $scope.onToggleChange = function (flag) {
        if (flag) {
            handler = $rootScope.$on("bluetooth:recievedData", function (event, data) {
                if (data == "s") {
                    var returnValue = "s";
                    for (var i = 0; i < 5; i++) {
                        var j = 0;
                        for (; j < constants.SENSOR_MAX_RANGE; j++) {
                            var offsets = constants.rotate(
                                Robot.getOrientation(),
                                constants.DECTECTION_VECTOR[i][j][0],
                                constants.DECTECTION_VECTOR[i][j][1]
                            );
                            var blkContent = Robot.getMap()[Robot.getLocation()[0] + offsets[0]] ?
                                Robot.getMap()[Robot.getLocation()[0] + offsets[0]][Robot.getLocation()[1] + offsets[1]] : undefined;
                            if (blkContent == undefined || blkContent == 1) {
                                returnValue += j;
                                break;
                            }
                        }
                        if (j == constants.SENSOR_MAX_RANGE) {
                            returnValue += constants.SENSOR_MAX_RANGE;
                        }
                    }
                    console.log(returnValue);
                    BLE.write(returnValue);
                }
            })
        } else {
            handler();
        }
    };

    var stringHandler = $rootScope.$on("bluetooth:recievedData", function (event, data) {
        if (data.explore) {
            $scope.exploreString = data.explore;
        }
        if (data.block) {
            $scope.blockString = data.block;
        }
    });

    $scope.boardcastEnable = constants.SELF_BOARDCAST;

    $scope.onBoardcastChange = function (flag) {
        constants.SELF_BOARDCAST = flag;
    };

})

.controller('BluetoothCtrl', function ($scope, BLE, $ionicPopup, $ionicLoading, $rootScope) {

    document.addEventListener("deviceready", function () {

        $rootScope.$on('bluetooth:isConnected', function (event, data) {
            $scope.$apply();
        })

        $rootScope.$on('bluetooth:connectedDevice', function (event, data) {
            $scope.$apply();
        })

        $rootScope.$on('bluetooth:unpairedDevices', function (event, data) {
            $scope.$apply();
        })

        $rootScope.$on('bluetooth:pairedDevice', function (event, data) {
            $scope.$apply();
        })

        $rootScope.$on('bluetooth:isEnabled', function (event, data) {
            if ($rootScope.isEnabled) {
                BLE.loadPaired();
                $scope.onRefresh();
            }
        })

    }, false);

    $scope.show = function (msg) {
        $ionicLoading.show({
            template: msg + '<ion-spinner><ion-spinner>'
        });
    };
    $scope.hide = function () {
        $ionicLoading.hide();
    };

    //This function scan arounded devices
    $scope.onRefresh = function () {
        $scope.isScan = true;
        var success = function (data) {
            if (data.length < 1)
                alert("No New Bluetooth Devices Founded.");
        };
        var failure = function (error) {
            alert(error);
        };
        BLE.scan().then(success, failure).finally(function () {
            $scope.isScan = false;
        })
    }

    //this function connect this device to other device
    $scope.connect = function (device) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Connecting Device',
            template: 'Confirm to Connect Device ' + device.name + ' ? '
        });
        var success = function (device) {
            alert("Connect to " + device.name + " succeed");
        };
        var failure = function (error) {
            //alert(error);
        };
        confirmPopup.then(function (res) {
            if (res) {
                $scope.show('Connecting...');
                BLE.connect(device).then(
                    success, failure
                ).finally(function () {
                    $scope.hide();
                });
            }
        })
    }

    //this function disconnect the device
    $scope.disconnect = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Disconnecting Device',
            template: 'Really Disconnect with Device ' +
                ($rootScope.connectedDevice != null ? $rootScope.connectedDevice.name : "Unknown") + '?'
        });
        var failure = function (error) {
            alert(error);
        };
        confirmPopup.then(function (res) {
            if (res) {
                BLE.disconnect().then(null, failure);
            }
        });
    }

    //this function enables bluetooth
    $scope.BTEnable = function (isEnabled) {
        var success = function () {
            $rootScope.isEnabled = true;
        }
        var failure = function () {
            $rootScope.isEnabled = false;
        }
        BLE.enable().then(success, failure)
    }

    //this function set the decive discoverable by others
    $scope.BTDiscoverable = function (isDiscoverable) {
        BLE.setDiscoverable();
    }

    $scope.refreshState = function () {
        BLE.isConnected().then(function () {
            getConnectedDevice();
        })
    }
});
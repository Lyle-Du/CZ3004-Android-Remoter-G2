angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope, $rootScope, $localStorage, $state, BLE, Robot, sceneRendering, DDrender,constant) {
    document.addEventListener("deviceready", function () {
        $scope.isAuto = true;
        $scope.onToggleChange($scope.isAuto);
        //init variables
        $scope.currentState = "Stop";
        //this observer handle updating recieved data to ui
        $rootScope.$on('bluetooth:recievedData', function () {
                //$rootScope.recievedData = data;
                if ($scope.recievedData.robotPosition != null)
                    $scope.currentState = "Stop";
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
    }

    $scope.view = {
        enable: false
    };

    //Robot.subscribe($scope, reRender);
    //$scope.onViewChanged = reRender;

    var WALL_LOCATIONS = [
    [9, 9],
    [9, 10],
    [9, 11], [9, 12], [9, 13], [12, 11],
    [12, 12]
  ];
    WALL_LOCATIONS.forEach(function (wall) {
        Robot.getMap()[wall[0]][wall[1]] = 1;
    });

    Robot.setLocation(11, 11);
    Robot.setOrientation(2);

    $scope.robot = Robot;
    $scope.block = [];
    $scope.wall = WALL_LOCATIONS;
    $scope.add = function () {
        Robot.getMap()[$scope.block[0]][$scope.block[1]] = 1;
        Robot.notify();
    };
    $scope.y = {
        value: 1
    };
    $scope.x = {
        value: 1
    };
    $scope.setLoc = function () {
        BLE.write("x" + $scope.y.value + "y" + $scope.x.value);
        Robot.setLocation($scope.x.value, $scope.y.value);
    };

    $scope.sendStr = function (index) {
        BLE.write($localStorage.getObject("Strings")[index]);
    };

    $scope.forward = function () {
        BLE.write('f').then(function () {
            $scope.currentState = "Forward"
        });
    }
    $scope.backward = function () {
        BLE.write('r').then(function () {
            $scope.currentState = "Backward"
        });
    }
    $scope.left = function () {
        BLE.write('tl').then(function () {
            $scope.currentState = "Turn Left"
        });
    }

    $scope.right = function () {
        BLE.write('tr').then(function () {
            $scope.currentState = "Turn Right"
        });
    }
    $scope.reconfigure = function () {
        $state.go('tab.profile');
    }


    $scope.updateMap = function () {
        alert("Map updated")
    }
})

.filter('reverse', function () {
    return function (items) {
        return items.slice().reverse();
    };
})

.controller('LogsCtrl', function ($scope, $rootScope, $interval, BLE) {
    document.addEventListener("deviceready", function () {
        //this observer handle updating recieved data to ui
        $rootScope.$on('bluetooth:recievedData', function () {
            $scope.$apply();
        })

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
        BLE.write(msg).then(function () {


        }, function (error) {
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
    }
})

.controller('ProfileCtrl', function ($scope, $state, $localStorage) {


    var defaultObj = ["there is a fire burning in my heart",
        "Reaching a fever pitch, it's bringing me out the dark", ];

    //if (!$localStorage.getObject("Strings"))
    defaultObj = $localStorage.getObject("Strings");
    $scope.preDefinedString = defaultObj;
    $scope.set = function () {
        $localStorage.setObject("Strings", defaultObj);
        console.log($localStorage.getObject("Strings"));
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
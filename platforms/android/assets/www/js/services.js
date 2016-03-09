angular.module('starter.services', [])

.factory('BLE', function ($q, $rootScope, $state, $ionicPopup, $interval) {
    $rootScope.isEnabled = false;
    $rootScope.isConnected = false;
    $rootScope.sentMsg = null;
    $rootScope.recievedData = null;
    $rootScope.sentMsgs = [];
    $rootScope.recievedMsgs = [];
    $rootScope.unpairedDevices = [];
    $rootScope.pairedDevices = [];
    $rootScope.connectedDevice = null;
    var dataHandler = null;

    function DataHandler() {
        var that = this;
        this.run = function () {
            bluetoothSerial.subscribeRawData(
                function (data) { //whenever recieved data, do broadcast to tell other thread who need it.
                    bluetoothSerial.read(function (data) {
                        var obj;
                        try {
                            obj = JSON.parse(data);
                        } catch (e) {
                            console.log(e);
                            obj = data;
                        }
                        $rootScope.recievedData = obj;
                        $rootScope.$broadcast("bluetooth:recievedData", $rootScope.recievedData)
                    })
                },
                function (error) {
                    alert("Subscribe Raw Data encounter an error:\n" + error)
                }
            )
        };
        this.cancel = function () {
            bluetoothSerial.unsubscribeRawData(
                function () {},
                function (error) {
                    alert("Unsubscribe Raw Data encounter an error:\n" + error)
                });
        }
    }

    //initial bluetooth
    document.addEventListener("deviceready", function () {
        //this observer handle updating recieved data to ui
        $rootScope.$on('bluetooth:recievedData', function (event, data) {
            $rootScope.recievedMsgs.push(data);
        })

        //this observer handle updating sent data to ui
        $rootScope.$on('bluetooth:sentData', function (event, data) {
            $rootScope.sentMsgs.push(data);
        })

        //this observer handle updating isConnected
        $rootScope.$on('bluetooth:isConnected', function (event, data) {
            console.log("observer isConnected: " + data)
            if (data) {

                bluetoothSerial.getConnectedDevice(function (data) {
                    $rootScope.connectedDevice = data;
                    $rootScope.$broadcast("bluetooth:connectedDevice", $rootScope.connectedDevice);
                })

                if (dataHandler == null) { //create data recieve listener
                    console.log("create data recieve listener")
                    dataHandler = new DataHandler()
                }
                dataHandler.run();
            } else {
                if (dataHandler != null) {
                    console.log("destroy data recieve listener")
                    dataHandler.cancel()
                }
                dataHandler = null;
            }
        })

        //this observer handle updating isEnabled
        $rootScope.$on('bluetooth:isEnabled', function (event, data) {
            if (data) {
                bluetoothSerial.setConnectedNotifyListener(function () {
                    $rootScope.isConnected = true;
                    $rootScope.$broadcast("bluetooth:isConnected", $rootScope.isConnected);
                }, function () {
                    $rootScope.isConnected = false;
                    $rootScope.$broadcast("bluetooth:isConnected", $rootScope.isConnected);
                });
            } else {
                bluetoothSerial.clearConnectedNotifyListener();
            }
        })

        //check bluetooth is enabled or not
        bluetoothSerial.isEnabled(
            function () {
                $rootScope.isEnabled = true;
                $rootScope.$broadcast("bluetooth:isEnabled", $rootScope.isEnabled)
                    //whenever other device trys to connect/disconnect this device
                bluetoothSerial.setConnectedNotifyListener(function () {
                    console.log("Hey, there is connetion establish notification!");
                    $rootScope.isConnected = true;
                    $rootScope.$broadcast("bluetooth:isConnected", $rootScope.isConnected);
                }, function () {
                    console.log("Hey, there is connetion lost notification!");
                    $rootScope.isConnected = false;
                    $rootScope.$broadcast("bluetooth:isConnected", $rootScope.isConnected);
                });
                bluetoothSerial.isConnected(
                    function () { //if is connected, try to subscribe
                        $rootScope.isConnected = true;
                        $rootScope.$broadcast("bluetooth:isConnected", $rootScope.isConnected)
                    },
                    function () { //if not connected
                        $rootScope.isConnected = false;
                        $rootScope.$broadcast("bluetooth:isConnected", $rootScope.isConnected)
                    }
                )
                bluetoothSerial.list(function (list) {
                    $rootScope.pairedDevices = list;
                    $rootScope.$broadcast("bluetooth:pairedDevices", $rootScope.pairedDevices)
                })
            },
            function () {
                //if bluetooth is not enabled, ask user to enable
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Requires Bluetooth',
                    template: 'Bluetooth is disabled. Click OK to enable it. Or go to Bluetooth settings to enable bluetooth.'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        bluetoothSerial.enable(function () {
                            $rootScope.isEnabled = true;
                            $rootScope.$broadcast("bluetooth:isEnabled", $rootScope.isEnabled)
                        });
                    } else {
                        $state.go('tab.bluetooth');
                    }
                });
            }
        )
    }, false);


    return {
        loadPaired: function () {
            var deferred = $q.defer();
            $rootScope.pairedDevices = [];
            bluetoothSerial.list(function (list) {
                    $rootScope.pairedDevices = list;
                    $rootScope.$broadcast("bluetooth:pairedDevices", $rootScope.pairedDevices)
                    deferred.resolve($rootScope.pairedDevices);
                },
                function () {
                    deferred.reject("Error, Stopping Scan");
                })
            return deferred.promise;
        },
        scan: function () {
            var deferred = $q.defer();
            $rootScope.unpairedDevices = [];
            bluetoothSerial.setDeviceDiscoveredListener(function (device) {
                $rootScope.unpairedDevices.push(device);
                $rootScope.$broadcast("bluetooth:unpairedDevices", $rootScope.unpairedDevices)
            });
            bluetoothSerial.discoverUnpaired( /* scan for all services */
                function () {
                    bluetoothSerial.clearDeviceDiscoveredListener();
                    deferred.resolve($rootScope.unpairedDevices);
                },
                function () {
                    bluetoothSerial.clearDeviceDiscoveredListener();
                    deferred.reject("Error, Stopping Scan");
                });
            return deferred.promise;
        },
        connect: function (device) {
            var that = this;
            var deferred = $q.defer();
            that.isConnected().then(function () {
                that.disconnect();
            }).finally(function () {
                bluetoothSerial.connect(device.id, function () {
                    $rootScope.connectedDevice = device;
                    $rootScope.$broadcast("bluetooth:connectedDevice", $rootScope.connectedDevice);
                    $rootScope.isConnected = true;
                    $rootScope.$broadcast("bluetooth:isConnected", $rootScope.connectedDevice);
                    that.loadPaired();
                    deferred.resolve(device);
                }, function (error) {
                    $rootScope.connectedDevice = null;
                    $rootScope.$broadcast("bluetooth:connectedDevice", $rootScope.connectedDevice);
                    $rootScope.isConnected = false;
                    $rootScope.$broadcast("bluetooth:isConnected", $rootScope.connectedDevice);
                    that.clear();
                    alert(error);
                    deferred.reject(error);
                })
            })
            return deferred.promise;
        },
        disconnect: function () {
            var that = this;
            var deferred = $q.defer();
            bluetoothSerial.disconnect(
                function () {
                    $rootScope.connectedDevice = null;
                    $rootScope.isConnected = false;
                    $rootScope.$broadcast("bluetooth:connectedDevice", $rootScope.connectedDevice)
                    $rootScope.$broadcast("bluetooth:isConnected", $rootScope.isConnected)
                    deferred.resolve();
                },
                function (error) {
                    deferred.reject(error);
                }
            );
            return deferred.promise;
        },
        read: function () {
            var deferred = $q.defer();
            bluetoothSerial.read(function (data) {
                var obj;
                try {
                    obj = JSON.parse(data);
                } catch (e) {
                    console.log(e);
                    obj = data;
                }
                $rootScope.recievedData = obj;
                $rootScope.$broadcast("bluetooth:recievedData", $rootScope.recievedData)
                deferred.resolve(obj);
            }, function (reason) {
                deferred.reject(reason);
            });
            return deferred.promise;
        },
        write: function (data) {
            var deferred = $q.defer();
            bluetoothSerial.write(data, function () {
                $rootScope.sentData = data;
                $rootScope.$broadcast("bluetooth:sentData", $rootScope.sentData)
                deferred.resolve($rootScope.sentData);
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        isConnected: function () {
            var deferred = $q.defer();
            bluetoothSerial.isConnected(function () {
                    $rootScope.isConnected = true;
                    $rootScope.$broadcast("bluetooth:isConnected", $rootScope.isConnected);
                    deferred.resolve();
                },
                function (error) {
                    $rootScope.isConnected = false;
                    $rootScope.$broadcast("bluetooth:isConnected", $rootScope.isConnected);
                    deferred.reject(error);
                });
            return deferred.promise;
        },
        setDiscoverable: function (duration) {
            bluetoothSerial.setDiscoverable(duration);
        },
        clear: function () {
            var deferred = $q.defer();
            bluetoothSerial.clear(function () {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        isEnabled: function () {
            var deferred = $q.defer();
            bluetoothSerial.isEnabled(function () {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
        enable: function () {
            var deferred = $q.defer();
            bluetoothSerial.enable(
                function () {
                    deferred.resolve();
                },
                function () {
                    deferred.reject();
                }
            );
            return deferred.promise;
        },
        setDiscoverable: function () {
            bluetoothSerial.setDiscoverable(120);
        },
        getConnectedDevice: function () {
            var deferred = $q.defer();
            bluetoothSerial.getConnectedDevice(function (data) {
                $rootScope.connectedDevice = data;
                $rootScope.$broadcast("bluetooth:connectedDevice", $rootScope.connectedDevice);
                deferred.resolve($rootScope.connectedDevice);
            }, function () {
                deferred.reject();
            })
            return deferred.promise;
        }
    };
})

.factory('FILE', function ($q, $rootScope) {
//    var path;
//    var logOb;
//
//    var write = function (str) {
//        if (!logOb) return;
//        var log = str;
//        console.log("going to log " + log);
//        logOb.createWriter(function (fileWriter) {
//            //fileWriter.seek(fileWriter.length);
//            var obj;
//            try {
//                obj = JSON.parse(log.toString());
//                var blob = new Blob(obj, {
//                    type: 'text/plain'
//                });
//                fileWriter.write(blob);
//                console.log("ok, in theory i worked");
//            } catch (e) {
//                console.log(e);
//            }
//        }, fail);
//    }
//
//    var read = function () {
//        logOb.file(function (file) {
//            var reader = new FileReader();
//            reader.onloadend = function (e) {
//                console.log("the reading is " + this.result);
//                var str = this.result;
//                var obj;
//                try {
//                    obj = JSON.parse(str);
//                } catch (e) {
//                    console.log(e);
//                }
//                console.log(obj[0])
//            };
//            reader.readAsText(file);
//        }, fail);
//    }
//
//    function fail(e) {
//        console.log("FileSystem Error");
//        console.dir(e);
//    }
//
//    document.addEventListener("deviceready", function () {
//        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
//            console.log("got main dir", dir);
//            dir.getFile("log.txt", {
//                create: true
//            }, function (file) {
//                console.log("got the file", file);
//                logOb = file;
//                console.log("App started");
//            });
//        });
//        setTimeout(function () {
//            write(["a", "b"]);
//            read();
//        }, 3000);
//
//
//    }, false);
//
//    return {
//        write: function (str) {
//            if (!logOb) return;
//            var log = str;
//            console.log("going to log " + log);
//            logOb.createWriter(function (fileWriter) {
//                fileWriter.seek(fileWriter.length);
//                var blob = new Blob(log, {
//                    type: 'text/plain'
//                });
//                fileWriter.write(blob);
//                console.log("ok, in theory i worked");
//            }, fail);
//        },
//        read: function () {
//            logOb.file(function (file) {
//                var reader = new FileReader();
//                reader.onloadend = function (e) {
//                    console.log(this.result);
//                };
//                reader.readAsText(file);
//            }, fail);
//        }
//    };
});
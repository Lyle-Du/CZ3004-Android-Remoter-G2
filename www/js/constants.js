/**
 * Created by Zhou on 2/9/16.
 */
angular.module('starter.services')
  .constant("constants",{
    FLIP_RECEIVED_XY_COORDINATE : true,
    //0 1 2 3 NESW
    ORIENTATION_OFFSET : 0,

    SELF_BOARDCAST : true,

    /*
    when the robot facing N


    */
    DECTECTION_VECTOR: [
        [[1,-2],[1,-3],[1,-4]],
        [[2,-1],[3,-1],[4,-1]],
        [[2,0],[3,0],[4,0]],
        [[2,1],[3,1],[4,1]],
        [[1,2],[1,3],[1,4]],
    ],
    //NESW vector
    ORIENTATION_VECTOR :[
        [1,0],[0,1],[-1,0],[0,-1]
    ]
    ,

    SENSOR_MAX_RANGE : 3,

    CAMERA_OFFSET :  [0.5,1,0],
    SCALE :  0.5,
    FOV :  85,
    CANVAS_WIDTH :  768,
    CANVAS_HEIGHT :  512,
    SCENE_SIZE :  40,

    TWO_D_CANVAS_WIDTH : 768,
    TWO_D_CANVAS_HEIGHT : 512,

    UNEXPLORE_COLOR : "#58FAF4",
    BLOCK_COLOR : "#0101DF",
    BORDER_COLOR : "#FFFFFF",
    BORDER_WIDTH : 5,
    CLEAR_COLOR : "#80FF00",
    ROBOT_BACKGROUND : "#66FFFF",
    ROBOT_COLOR : "#FF0000",
    rotate : function (times, x, y) {
      var newX = 0;
      for (var i = 0; i < times; i++) {
          newX = y;
          y = -x;
          x = newX;
      }
      return [x, y];
    },
  });

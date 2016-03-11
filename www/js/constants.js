/**
 * Created by Zhou on 2/9/16.
 */
angular.module('starter.services')
  .constant("constants",{
    FLIP_RECEIVED_XY_COORDINATE : true,
    //0 1 2 3
    ORIENTATION_OFFSET : 0,

    CAMERA_OFFSET :  [0,1,0],
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
  });

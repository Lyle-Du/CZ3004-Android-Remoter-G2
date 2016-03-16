/**
 * Created by Zhou on 2/6/16.
 */


angular.module('starter.services')
  .factory("sceneRendering",function(Robot,constants) {
    /**
     * magic values
     * @type {number[]}
     */

    var CAMERA_OFFSET = constants.CAMERA_OFFSET;
    var SCALE = constants.SCALE;
    var FOV = constants.FOV;
    var CANVAS_WIDTH = constants.CANVAS_WIDTH;
    var CANVAS_HEIGHT = constants.CANVAS_HEIGHT;
    var SCENE_SIZE = constants.SCENE_SIZE;


    /**
     *
     * y   z
     * ↑  /
     * | /
     * |/
     * ------->x
     * 3 element array, y coordinate is always 0
     * if robot is at upper right corner, [15,0,20]
     */
    /**
     * the orientation of the robot
     * one of 0-3 indicating : NESW
     * @type {int}
     */
    var orientaionVector = [[0,0,1],[1,0,0], [0,0,-1],[-1,0,0]];

    /**
     * internal value of lookat point
     * @type {Array}
     */

    return{
      orientationVector : orientaionVector,
      getScene : function (callback)
      {
        var scene = new Phoria.Scene();

        //TODO make async loading
        var wallTexture = new Image();
        loader = new Phoria.Preloader();
        loader.addImage(wallTexture,"img/texture-wall.png");
        loader.onLoadCallback(function(){

            // set up camera perspective

            scene.camera.position = vec3.toXYZ([Robot.getLocation()[1]+CAMERA_OFFSET[0],CAMERA_OFFSET[1],Robot.getLocation()[0]+CAMERA_OFFSET[2]]);

            scene.camera.up = vec3.toXYZ([0,1,0]);

            scene.camera.lookat = vec3.toXYZ(vec3.add([],vec3.fromXYZ(scene.camera.position),orientaionVector[Robot.getOrientation()]));
            scene.camera.position = vec3.toXYZ(vec3.subtract([],vec3.fromXYZ(scene.camera.position),orientaionVector[Robot.getOrientation()]));

            scene.perspective.aspect = CANVAS_WIDTH/CANVAS_HEIGHT;
            scene.perspective.fov = FOV;
            scene.viewport.width = CANVAS_WIDTH;
            scene.viewport.height = CANVAS_HEIGHT;


            //debug test camera position
            //scene.camera.up = vec3.toXYZ([0,0,1]);
            //scene.camera.position = {x:8, y:20,z:10};
            //scene.camera.lookat = {x:8, y:0, z:10};

            //plane
            var plane = Phoria.Util.generateTesselatedPlane(SCENE_SIZE/SCALE ^ 0,SCENE_SIZE/SCALE ^ 0 ,0,SCENE_SIZE);

            scene.graph.push(Phoria.Entity.create({
              points: plane.points,
              edges: plane.edges,
              polygons: plane.polygons,
              style: {
                shademode: "plain",
                drawmode: "wireframe",
                linewidth: 1,
                objectsortmode: "back"
              }
            }).translateX(10).translateZ(10));



            for (i = 19;i >= 0; i--){
              for(j = 14; j >= 0; j--){

                if (Robot.getMap()[i][j] == 1){
                  var cube = Phoria.Entity.create(Phoria.Util.generateUnitCube(SCALE));
                  cube.textures.push(wallTexture);
                  for (var k = 0; k < 6; k++) cube.polygons[k].texture = 0;
                  cube.translateZ(i+SCALE).translateX(j+SCALE);
                  //Phoria.Entity.debug(cube, {
                  //  showId: true,
                  //  showPosition: true
                  //
                  //});
                  scene.graph.push(cube);
                }
              }
            }


            var light = Phoria.PointLight.create({
              color: [1,0.4,0.4],
              position : scene.camera.position,
              intensity : 1,
              attenuation : 0.02
            });
            scene.graph.push(light);
          callback(scene);
        });
      }
    }
  });

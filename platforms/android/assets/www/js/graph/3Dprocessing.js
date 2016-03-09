var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (c) {
        window.setTimeout(c, 15)
    };


WALL_LOCATIONS = [

  [-2, -1],
  [-2, 0],

    [-2, 1],
  [3, 3],
  [-3, -3]
];
DEFAULT_SCALE = 0.5;

function SimpleCube() {
    // get the canvas DOM element and the 2D drawing context
    var canvas = document.getElementById('canvas');

    // create the scene and setup camera, perspective and viewport
    var scene = new Phoria.Scene();
    scene.camera.position = {
        x: 0.0,
        y: 5.0,
        z: -15.0
    };
    scene.perspective.aspect = canvas.width / canvas.height;
    scene.viewport.width = canvas.width;
    scene.viewport.height = canvas.height;

    // create a canvas renderer
    var renderer = new Phoria.CanvasRenderer(canvas);

    // add a grid to help visualise camera position etc.
    var plane = Phoria.Util.generateTesselatedPlane(8, 8, 0, 20);
    scene.graph.push(Phoria.Entity.create({
        points: plane.points,
        edges: plane.edges,
        polygons: plane.polygons,
        style: {
            drawmode: "wireframe",
            shademode: "plain",
            linewidth: 0.5,
            objectsortmode: "back"
        }
    }));
    var c = Phoria.Util.generateUnitCube();
    var cube = Phoria.Entity.create({
        points: c.points,
        edges: c.edges,
        polygons: c.polygons
    });
    scene.graph.push(cube);
    scene.graph.push(new Phoria.DistantLight());

    var pause = false;
    var fnAnimate = function () {
        if (!pause) {
            // rotate local matrix of the cube
            cube.rotateY(0.5 * Phoria.RADIANS);

            // execute the model view 3D pipeline and render the scene
            scene.modelView();
            renderer.render(scene);
        }
        requestAnimFrame(fnAnimate);
    };

    // key binding
    document.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
        case 27: // ESC
            pause = !pause;
            break;
        }
    }, false);
    // start animation
    requestAnimFrame(fnAnimate);
}


var appliedTexture = new Image();

function TextureCube() {
    // get the images loading
    var loader = new Phoria.Preloader();

    loader.addImage(appliedTexture, 'img/texture-wall.png');
    loader.onLoadCallback(TextureInit);
}

var scene = new Phoria.Scene();

function TextureInit() {
    // get the canvas DOM element and the 2D drawing context
    var canvas = document.getElementById('canvas');

    // create the scene and setup camera, perspective and viewport

    scene.camera.position = {
        x: 0.0,
        y: 5.0,
        z: -15.0
    };
    scene.perspective.aspect = canvas.width / canvas.height;
    scene.perspective.fov = 90;
    //alert(scene.perspective.fov);
    scene.viewport.width = canvas.width;
    scene.viewport.height = canvas.height;

    // create a canvas renderer
    var renderer = new Phoria.CanvasRenderer(canvas);

    //add a grid to help visualise camera position etc.
    var plane = Phoria.Util.generateTesselatedPlane(80, 80, 0.5, 40);
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
    }));



    WALL_LOCATIONS.forEach(function generateWalls(offset) {
        var cube = Phoria.Entity.create(Phoria.Util.generateUnitCube(DEFAULT_SCALE));
        cube.textures.push(appliedTexture);
        for (var i = 0; i < 6; i++) cube.polygons[i].texture = 0;
        cube.translateX(offset[0]).translateZ(offset[1]);
        scene.graph.push(cube);
    });

    //scene.graph.push(Phoria.DistantLight.create({
    //  direction: {x:0, y:-0.5, z:1}
    //}));

    var light = Phoria.PointLight.create({
        color: [1, 1, 0],
        position: {
            x: 0,
            y: 0.75,
            z: -1
        },
        intensity: 1,
        attenuation: 0.05
    });
    scene.graph.push(light);

    //test camera position
    scene.camera.up = vec3.toXYZ([0, 1, 0]);
    scene.camera.position = {
        x: 0,
        y: 0.75,
        z: -1
    };
    scene.camera.lookat = {
        x: 0,
        y: 0.65,
        z: 1
    };

    var pause = false;
    var delta = {
        x: 0,
        y: 0,
        z: 0
    };
    var fnAnimate = function () {
        if (!pause) {
            // rotate local matrix of the cube
            //cube.rotateY(0.5*Phoria.RADIANS);

            // execute the model view 3D pipeline and render the scene
            //scene.camera.lookat.y += 0.01;
            scene.modelView();
            renderer.render(scene);
        }
        requestAnimFrame(fnAnimate);
    };


    // key binding
    document.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
        case 27:
            {
                pause = !pause;
                break;
            }
        case 119:
            {

                break;
            }
        case 115:
            {

                break;
            }

        }
    }, false);
    // start animation
    requestAnimFrame(fnAnimate);
}
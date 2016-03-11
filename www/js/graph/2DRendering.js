/**
 * Created by Zhou on 2/29/16.
 */
angular.module('starter.services')
    .factory("DDrender", function (constants, Robot) {
        var SQUARE_WIDTH = constants.TWO_D_CANVAS_WIDTH / 15 ^ 0;
        var SQUARE_HEIGHT = constants.TWO_D_CANVAS_HEIGHT / 20 ^ 0;
        var image = new Image(),
            imageLoaded = false,
            neverLoadedBefore = true;
        image.src = "img/robot.png";
        //image.src = "img/tuzi.png";
        image.onload = function () {
            imageLoaded = true;
        };

        return {
            render: function (canvas) {
                var ctx = canvas.getContext("2d");
                if (neverLoadedBefore){
                    ctx.scale(1,-1);
                    ctx.translate(0,-constants.TWO_D_CANVAS_HEIGHT);
                    neverLoadedBefore = false;
                }
                ctx.save();
                for (var i = 0; i < 20; i++) {
                    ctx.save();
                    for (var j = 0; j < 15; j++) {
                        switch (Robot.getMap()[i][j]) {
                        case 0:
                            ctx.fillStyle = constants.UNEXPLORE_COLOR;
                            break;
                        case 1:
                            ctx.fillStyle = constants.BLOCK_COLOR;
                            break;
                        case 2:
                            ctx.fillStyle = constants.CLEAR_COLOR;
                            break
                        }
                        ctx.fillRect(0, 0, SQUARE_WIDTH, SQUARE_HEIGHT);
                        ctx.strokeStyle = constants.BORDER_COLOR;
                        ctx.lineWidth = constants.BORDER_WIDTH;
                        ctx.strokeRect(0, 0, SQUARE_WIDTH, SQUARE_HEIGHT);
                        ctx.translate(SQUARE_WIDTH, 0);
                    }
                    ctx.restore();
                    ctx.translate(0, SQUARE_HEIGHT);
                }
                ctx.restore();

                var callback = function () {
                    ctx.save();

                    ctx.scale(1,-1);

                    var yx = constants.rotate(4-Robot.getOrientation() % 4,
                        SQUARE_WIDTH * (Robot.getLocation()[1]),
                        -SQUARE_HEIGHT * (Robot.getLocation()[0]));
                    var base = constants.rotate(4-Robot.getOrientation() %4,
                        SQUARE_WIDTH,
                        -SQUARE_HEIGHT);

                    //offset the flip





                    ctx.rotate(Math.PI/2 * (Robot.getOrientation()));
                    ctx.translate(-base[0], -base[1]);

                    ctx.drawImage(image, yx[0], yx[1], base[0] * 3, base[1] * 3 );
                    ctx.restore();
                };

                if (imageLoaded) {
                    callback();
                } else {
                    image.onload = function () {
                        callback();
                        imageLoaded = true;
                    }
                }
            }
        }
    });

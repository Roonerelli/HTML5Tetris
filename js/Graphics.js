var createjs;
var _;
var Hammer;
var picoModal;

var Graphics;
(function (Graphics) {
    var TetrisRoot = (function () {
        function TetrisRoot(canvasId, blockSize, numColumns, numRows) {
            document.body.onkeydown = function (event) {
                event = event || window.event;
                var keycode = event.charCode || event.keyCode;

                var action = TetrisRoot.keyBindings['' + keycode];

                if (action != undefined) {
                    action();
                }
            };

            document.ontouchmove = function (event) {
                event.preventDefault();
            };

            this.choons = document.getElementById('choons');

            var a = document.createElement('audio');
            this.canPlayAudio = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));

            this.reSize(canvasId, blockSize, numColumns, numRows);
        }
        TetrisRoot.prototype.reSize = function (canvasId, blockSize, numColumns, numRows) {
            var width = blockSize * numColumns;
            this.gameCanvas = document.getElementById(canvasId);
            this.gameCanvas.width = width;
            this.gameCanvas.height = blockSize * numRows;

            document.getElementById('scoreboard').style.width = width + 'px';
            document.getElementById('container').style.width = width + 'px';
            document.getElementById('controls').style.width = width + 'px';
            document.getElementById('newGame').style.width = width / 4 + 'px';
            document.getElementById('pause').style.width = width / 4 + 'px';
            document.getElementById('help').style.width = width / 4 + 'px';
            document.getElementById('about').style.width = width / 4 + 'px';
        };

        TetrisRoot.prototype.bindKey = function (keyChar, action) {
            TetrisRoot.keyBindings[keyChar] = action;
        };

        TetrisRoot.prototype.bindTouch = function (eventName, action) {
            var hammerOptions = {
                swipe_velocity: 0.1
            };

            Hammer(this.gameCanvas, hammerOptions).on(eventName, action);
        };

        TetrisRoot.prototype.playAudio = function () {
            if (this.canPlayAudio) {
                this.choons = document.getElementById('choons');
                this.choons.pause();
                this.choons.currentTime = 0;
                this.choons.play();
            }
        };

        TetrisRoot.prototype.pauseAudio = function () {
            if (this.canPlayAudio && this.choons.currentTime > 0) {
                this.choons.paused ? this.choons.play() : this.choons.pause();
            }
        };

        TetrisRoot.prototype.stopAudio = function () {
            if (this.canPlayAudio) {
                this.choons.pause();
                this.choons.currentTime = 0;
            }
        };
        TetrisRoot.keyBindings = {};
        return TetrisRoot;
    })();
    Graphics.TetrisRoot = TetrisRoot;

    var Ticker = (function () {
        function Ticker(interval, fps) {
            createjs.Ticker.setInterval(interval);
            createjs.Ticker.setFPS(fps);
            createjs.Ticker.useRAF = true;
        }
        Ticker.pause = function () {
            var isPaused = !createjs.Ticker.getPaused();
            createjs.Ticker.setPaused(isPaused);
        };

        Ticker.prototype.unpause = function () {
            createjs.Ticker.setPaused(false);
        };

        Ticker.prototype.setCallback = function (callback) {
            createjs.Ticker.addListener(callback);
        };

        Ticker.prototype.setFPS = function (fps) {
            createjs.Ticker.setFPS(fps);
        };

        Ticker.prototype.incrementFPS = function (inc) {
            var currentFPS = createjs.Ticker.getFPS();
            createjs.Ticker.setFPS(currentFPS + inc);
        };
        return Ticker;
    })();
    Graphics.Ticker = Ticker;

    var Canvas = (function () {
        function Canvas(blockSize, numColumns, numRows) {
            this.stage = new createjs.Stage("tetris");

            this.drawGrid(blockSize, numColumns, numRows);
        }
        Canvas.prototype.addChild = function (ele) {
            this.stage.addChild(ele);
        };

        Canvas.prototype.removeChild = function (ele) {
            this.stage.removeChild(ele);
        };

        Canvas.prototype.update = function () {
            this.stage.update();
        };

        Canvas.prototype.drawGrid = function (blockSize, numColumns, numRows) {
            for (var i = 1; i <= numColumns; i++) {
                var g = new createjs.Graphics();
                g.beginStroke("#aaa");
                g.setStrokeStyle(0.2);

                g.moveTo((i * blockSize), 0);
                g.lineTo(i * blockSize, numRows * blockSize);
                var s = new createjs.Shape(g);
                this.stage.addChild(s);
            }

            for (var i = 0; i < numRows; i++) {
                var g = new createjs.Graphics();
                g.beginStroke("#aaa");
                g.setStrokeStyle(0.2);

                g.moveTo(0, i * blockSize);
                g.lineTo(numColumns * blockSize, i * blockSize);
                var s = new createjs.Shape(g);
                this.stage.addChild(s);
            }
        };
        return Canvas;
    })();
    Graphics.Canvas = Canvas;

    var Square = (function () {
        function Square(canvas, x, y, w, color) {
            this.rect = new createjs.Shape();
            this.rect.graphics.beginStroke("#000");
            this.rect.graphics.setStrokeStyle(1);
            this.rect.snapToPixel = true;
            this.rect.graphics.beginFill(color).drawRect(x, y, w, w);

            this.canvas = canvas;
            this.canvas.addChild(this.rect);
            this.canvas.update();
        }
        Square.prototype.move = function (dx, dy) {
            this.rect.x += dx;
            this.rect.y += dy;
        };

        Square.prototype.remove = function () {
            this.canvas.removeChild(this.rect);
        };
        return Square;
    })();
    Graphics.Square = Square;

    var Label = (function () {
        function Label(elementId) {
            this.ele = document.getElementById(elementId);
        }
        Label.prototype.setText = function (text) {
            this.ele.innerHTML = text;
        };
        return Label;
    })();
    Graphics.Label = Label;

    var Button = (function () {
        function Button(elementId, action) {
            this.ele = document.getElementById(elementId);
            this.ele.onclick = action;
        }
        return Button;
    })();
    Graphics.Button = Button;
})(Graphics || (Graphics = {}));

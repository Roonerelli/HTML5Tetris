/// <reference path="ambients/touch.d.ts" />
var createjs;
var _;
var Hammer;
var picoModal;

module Graphics {

    export class TetrisRoot {
        
        static keyBindings = {};
        private gameCanvas;
        private choons : HTMLAudioElement;
        private canPlayAudio : boolean

        constructor(canvasId: string, blockSize, numColumns, numRows) {
            
            document.body.onkeydown = function (event) {
                event = event || window.event;
                var keycode = event.charCode || event.keyCode;

                var action = TetrisRoot.keyBindings['' + keycode];

                if (action != undefined) {
                    action();
                }
            }

            document.ontouchmove = function(event){
                event.preventDefault();
            }

            this.choons = <HTMLAudioElement>document.getElementById('choons');

            var a = document.createElement('audio');
            this.canPlayAudio =  !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));

            this.reSize(canvasId, blockSize, numColumns, numRows);            
        }

        reSize(canvasId, blockSize, numColumns, numRows) {
            var width = blockSize * numColumns;
            this.gameCanvas = document.getElementById(canvasId);
            this.gameCanvas.width =  width;
            this.gameCanvas.height = blockSize * numRows;
            
            document.getElementById('scoreboard').style.width = width + 'px';
            document.getElementById('container').style.width = width + 'px';
            document.getElementById('controls').style.width = width + 'px';
            document.getElementById('newGame').style.width = width/4 + 'px';
            document.getElementById('pause').style.width = width/4 + 'px';
            document.getElementById('help').style.width = width/4 + 'px';
            document.getElementById('about').style.width = width/4 + 'px';
        }

        bindKey(keyChar : number, action : Function) {
            TetrisRoot.keyBindings[keyChar] = action;
        }

        bindTouch(eventName : string, action : Function) {
            var hammerOptions = {
                swipe_velocity: 0.1
            };

            Hammer(this.gameCanvas, hammerOptions).on(eventName, action);            
        }

        playAudio() {

            if (this.canPlayAudio) {
                this.choons = <HTMLAudioElement>document.getElementById('choons');
                this.choons.pause();
                this.choons.currentTime = 0;
                this.choons.play();
            }
        }


        pauseAudio() {
            if(this.canPlayAudio && this.choons.currentTime > 0){
                this.choons.paused ? this.choons.play() : this.choons.pause();
            }
        }

        stopAudio() {
            if (this.canPlayAudio) {
                this.choons.pause();
                //this.choons.currentTime = 0;
            }
        }
    }

    export class Ticker {

        constructor(interval: number, fps: number) {
            createjs.Ticker.setInterval(interval);
            createjs.Ticker.setFPS(fps);
            createjs.Ticker.useRAF = true;
        }

        static pause() {
            var isPaused = !createjs.Ticker.getPaused();
            createjs.Ticker.setPaused(isPaused);
        }

        unpause() {
            createjs.Ticker.setPaused(false);
        }

        setCallback(callback) {
            createjs.Ticker.addListener(callback);
            //createjs.Ticker.addEventListener("tick", callback);
        }

        setFPS(fps) {
            createjs.Ticker.setFPS(fps);
        }

        incrementFPS(inc) {
            var currentFPS = createjs.Ticker.getFPS();
            createjs.Ticker.setFPS(currentFPS + inc);
        }
    } 

    export class Canvas {

        public stage; 
        constructor(blockSize : number, numColumns : number, numRows : number) {
            this.stage = new createjs.Stage("tetris");
            
            this.drawGrid(blockSize, numColumns, numRows);
        }

        addChild(ele: any) {
            this.stage.addChild(ele);
        }

        removeChild(ele: Square) {
            this.stage.removeChild(ele);
        }

        update() {
            this.stage.update();
        }

        drawGrid(blockSize : number, numColumns : number, numRows : number) {
            for (var i = 1; i <= numColumns; i++) {
                var g = new createjs.Graphics();
                g.beginStroke("#aaa");
                g.setStrokeStyle(0.2);

                g.moveTo((i * blockSize),0);
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
        }
    }

    export class Square {

        public rect;
        private canvas : Canvas;

        constructor(canvas: Canvas, x, y, w, color) {
            
            this.rect = new createjs.Shape();
            this.rect.graphics.beginStroke("#000");
            this.rect.graphics.setStrokeStyle(1);
            this.rect.snapToPixel = true;
            this.rect.graphics.beginFill(color).drawRect(x, y, w, w);

            this.canvas = canvas;
            this.canvas.addChild(this.rect);
            this.canvas.update();
        }

        move(dx: number, dy: number) {
            this.rect.x += dx;
            this.rect.y += dy;
        }

        remove() {
            this.canvas.removeChild(this.rect);
        }
    } 

    export class Label {

        private ele;

        constructor(elementId: string) {
            this.ele = document.getElementById(elementId);
        }

        setText(text :string) {
            this.ele.innerHTML  = text;
        }
    }

    export class Button {

        private ele;

        constructor(elementId: string, action : Function) {
            this.ele = document.getElementById(elementId);
            this.ele.onclick = action;
        }

        blur() {
            this.ele.blur();
        }
    }
}
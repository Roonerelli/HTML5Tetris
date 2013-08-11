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
            Hammer(this.gameCanvas).on(eventName, action);
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

                g.moveTo(i * blockSize + 3, 0);
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
        function Square(canvas, x, y, w, h, color) {
            this.rect = new createjs.Shape();
            this.rect.graphics.beginStroke("#000");
            this.rect.graphics.setStrokeStyle(1);
            this.rect.snapToPixel = true;
            this.rect.graphics.beginFill(color).drawRect(x, y, w, h);

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

var Game;
(function (Game) {
    var Piece = (function () {
        function Piece(pointArray, board) {
            this.basePosition = [5, 0];
            this.moved = true;
            this.allRotations = pointArray;
            var rotIndx = Math.floor(Math.random() * this.allRotations.length);
            this.rotationIndex = rotIndx;
            var indx = Math.floor(Math.random() * Piece.AllColors.length);
            this.color = Piece.AllColors[indx];
            this.basePosition = [5, 0];
            this.board = board;
            this.moved = true;
        }
        Piece.prototype.currentRotation = function () {
            return this.allRotations[this.rotationIndex];
        };

        Piece.prototype.dropByOne = function () {
            this.moved = this.move(0, 1, 0);
            return this.moved;
        };

        Piece.prototype.move = function (deltaX, deltaY, deltaRotation) {
            var moved = true;
            var potential = this.allRotations[(this.rotationIndex + deltaRotation) % this.allRotations.length];

            for (var index = 0; index < potential.length; ++index) {
                var posns = potential[index];
                if (!this.board.emptyAt([
                    posns[0] + deltaX + this.basePosition[0],
                    posns[1] + deltaY + this.basePosition[1]
                ])) {
                    moved = false;
                }
            }

            if (moved) {
                this.basePosition[0] += deltaX;
                this.basePosition[1] += deltaY;
                this.rotationIndex = (this.rotationIndex + deltaRotation) % this.allRotations.length;
            }

            return moved;
        };

        Piece.rotations = function (pointArray) {
            var rotate1 = _.map(pointArray, function (point) {
                return [-point[1], point[0]];
            });
            var rotate2 = _.map(pointArray, function (point) {
                return [-point[0], point[1]];
            });
            var rotate3 = _.map(pointArray, function (point) {
                return [point[1], -point[0]];
            });

            return [pointArray, rotate1, rotate2, rotate3];
        };

        Piece.nextPiece = function (board) {
            var indx = Math.floor(Math.random() * this.AllPieces.length);
            return new Piece(this.AllPieces[indx], board);
        };

        Piece.AllPieces = [
            [
                [[0, 0], [1, 0], [0, 1], [1, 1]]
            ],
            [
                [[0, 0], [-1, 0], [1, 0], [2, 0]],
                [[0, 0], [0, -1], [0, 1], [0, 2]]
            ],
            [
                [[0, 0], [-1, 0], [1, 0], [0, -1]],
                [[0, 0], [1, 0], [0, 1], [0, -1]],
                [[0, 0], [-1, 0], [1, 0], [0, 1]],
                [[0, 0], [-1, 0], [0, 1], [0, -1]]
            ],
            [
                [[0, 0], [0, -1], [0, 1], [1, 1]],
                [[0, 0], [-1, 0], [1, 0], [-1, 1]],
                [[0, 0], [0, 1], [0, -1], [-1, -1]],
                [[0, 0], [-1, 0], [1, 0], [1, -1]]
            ],
            Piece.rotations([[0, 0], [-1, 0], [0, -1], [1, -1]]),
            Piece.rotations([[0, 0], [1, 0], [0, -1], [-1, -1]])
        ];

        Piece.AllColors = ['Aqua', 'Blue', 'red', 'DarkViolet', 'Yellow', 'Orange', 'Green'];
        return Piece;
    })();
    Game.Piece = Piece;

    var Board = (function () {
        function Board(game) {
            this.score = 0;
            this.blockSize = game.options.blockSize;
            this.numColumns = game.options.numColumns;
            this.numRows = game.options.numRows;

            this.grid = new Array(this.numRows);

            for (var i = 0; i < this.numRows; i++) {
                this.grid[i] = new Array(this.numColumns);
            }

            this.currentBlock = Piece.nextPiece(this);
            this.game = game;
        }
        Board.prototype.gameOver = function () {
            return _.some(this.grid[1], function (x) {
                return x != undefined;
            });
        };

        Board.prototype.run = function () {
            var ran = this.currentBlock.dropByOne();

            if (!ran) {
                this.storeCurrent();

                if (!this.gameOver()) {
                    this.nextPiece();
                }
            }

            this.score += 1;
            this.game.updateScore();
            this.draw();
        };

        Board.prototype.move_left = function () {
            this.move(-1, 0, 0);
        };

        Board.prototype.move_right = function () {
            this.move(1, 0, 0);
        };

        Board.prototype.rotate_clockwise = function () {
            this.move(0, 0, 1);
        };

        Board.prototype.rotate_counter_clockwise = function () {
            this.move(0, 0, -1);
        };

        Board.prototype.move = function (x, y, rot) {
            if (!this.gameOver() && this.game.isRunning) {
                this.currentBlock.move(x, y, rot);
            }
            this.draw();
        };

        Board.prototype.drop_all_the_way = function () {
            if (this.game.isRunning) {
                var ran = this.currentBlock.dropByOne();

                while (ran) {
                    for (var i = 0; i < this.currentPos.length; i++) {
                        var block = this.currentPos[i];
                        block.remove();
                    }

                    this.score += 1;
                    ran = this.currentBlock.dropByOne();
                }
                this.draw();
                this.storeCurrent();
                if (!this.gameOver()) {
                    this.nextPiece();
                }

                this.game.updateScore();

                this.draw();
            }
        };

        Board.prototype.nextPiece = function () {
            this.currentBlock = Piece.nextPiece(this);
            this.currentPos = null;
        };

        Board.prototype.storeCurrent = function () {
            var locations = this.currentBlock.currentRotation();
            var displacements = this.currentBlock.basePosition;

            for (var i = 0; i < 4; i++) {
                var current = locations[i];
                this.grid[current[1] + displacements[1]][current[0] + displacements[0]] = this.currentPos[i];
            }

            this.removeFilled();
        };

        Board.prototype.emptyAt = function (point) {
            if (!(point[0] >= 0 && point[0] < this.numColumns)) {
                return false;
            } else if (point[1] < 1) {
                return true;
            } else if (point[1] >= this.numRows) {
                return false;
            }

            return this.grid[point[1]][point[0]] == null;
        };

        Board.prototype.removeFilled = function () {
            for (var i = 2; i < this.grid.length; i++) {
                var row = this.grid.slice(i);

                var allFull = true;

                for (var g = 0; g < this.grid[i].length; g++) {
                    if (this.grid[i][g] == undefined) {
                        allFull = false;
                        break;
                    }
                }

                if (allFull) {
                    for (var j = 0; j < this.numColumns; j++) {
                        this.grid[i][j].remove();
                        this.grid[i][j] = undefined;
                    }

                    for (var k = this.grid.length - i + 1; k <= this.grid.length; k++) {
                        var rects = this.grid[this.grid.length - k];

                        for (var l = 0; l < rects.length; l++) {
                            var rect = rects[l];
                            if (rect) {
                                rect.move(0, this.blockSize);
                            }
                        }

                        this.grid[this.grid.length - k + 1] = this.grid[this.grid.length - k].slice();
                    }

                    this.grid[0] = new Array(this.numColumns);
                    this.score += 10;
                }
            }
        };

        Board.prototype.draw = function () {
            this.currentPos = this.game.drawPiece(this.currentBlock, this.currentPos);
        };
        return Board;
    })();
    Game.Board = Board;

    var Tetris = (function () {
        function Tetris(options) {
            this.options = options;
            this.root = new Graphics.TetrisRoot('tetris', options.blockSize, options.numColumns, options.numRows);
            this.ticker = new Graphics.Ticker(options.tickerInterval, options.fps);
            this.ticker.setCallback(this);
            this.setBoard();
            this.keyBindings();
            this.touchBindings();
            this.buttonBindings();
            this.scores();
            this.isRunning = false;
        }
        Tetris.prototype.newGame = function () {
            this.setBoard();
            this.ticks = 0;
            this.ticker.setFPS(this.options.fps);
            this.isRunning = true;
        };

        Tetris.prototype.setBoard = function () {
            this.canvas = new Graphics.Canvas(this.options.blockSize, this.options.numColumns, this.options.numRows);
            this.canvas.update();
            this.board = new Board(this);
        };

        Tetris.prototype.keyBindings = function () {
            var _this = this;
            this.root.bindKey(37, function () {
                _this.board.move_left();
            });
            this.root.bindKey(39, function () {
                _this.board.move_right();
            });
            this.root.bindKey(38, function () {
                _this.board.rotate_clockwise();
            });
            this.root.bindKey(40, function () {
                _this.board.rotate_counter_clockwise();
            });
            this.root.bindKey(32, function () {
                _this.board.drop_all_the_way();
            });
        };

        Tetris.prototype.touchBindings = function () {
            var _this = this;
            this.root.bindTouch("doubletap", function () {
                _this.board.drop_all_the_way();
            });
            this.root.bindTouch("swipeleft", function () {
                _this.board.move_left();
            });
            this.root.bindTouch("swiperight", function () {
                _this.board.move_right();
            });
            this.root.bindTouch("swipeup", function () {
                _this.board.rotate_clockwise();
            });
            this.root.bindTouch("swipedown", function () {
                _this.board.rotate_counter_clockwise();
            });
        };

        Tetris.prototype.buttonBindings = function () {
            var _this = this;
            this.pauseBtn = new Graphics.Button('pause', function () {
                _this.pause();
            });
            this.newGameBtn = new Graphics.Button('newGame', function () {
                _this.newGame();
            });
            this.helpBtn = new Graphics.Button('help', function () {
                _this.showHelp();
            });
        };

        Tetris.prototype.scores = function () {
            this.score = new Graphics.Label('currentScore');
            this.hiScore = new Graphics.Label('hiScore');
            var hi = localStorage.getItem('hiScore');
            this.hiScore.setText(hi || '0');
            this.score.setText('0');
        };

        Tetris.prototype.tick = function () {
            if (this.isRunning) {
                if (this.board.gameOver()) {
                    this.gameOver();
                } else {
                    this.speedUp();
                    this.board.run();
                }
            }
        };

        Tetris.prototype.pause = function () {
            Graphics.Ticker.pause();
        };

        Tetris.prototype.gameOver = function () {
            this.isRunning = false;
            var content = this.setHiScore() ? 'hiScoreMsg' : 'gameOverMsg';

            picoModal({
                content: document.getElementById(content).innerHTML,
                overlayStyles: {
                    backgroundColor: "#ccc",
                    opacity: 0.55
                }
            });
        };

        Tetris.prototype.speedUp = function () {
            this.ticks++;

            if (this.ticks % 250 === 0) {
                this.ticker.incrementFPS(0.1);
            }
        };

        Tetris.prototype.showHelp = function () {
            var self = this;
            this.pause();
            var modal = picoModal({
                content: document.getElementById('instructions').innerHTML,
                overlayStyles: {
                    backgroundColor: "#ddd",
                    opacity: 0.75
                }
            });

            modal.onClose(function () {
                self.pause();
            });
        };

        Tetris.prototype.setHiScore = function () {
            var hi = localStorage.getItem('hiScore');
            hi = hi || 0;

            if (this.board.score > parseInt(hi)) {
                localStorage.setItem('hiScore', this.board.score.toString());
                this.hiScore.setText(this.board.score.toString());
                return true;
            }
            return false;
        };

        Tetris.prototype.drawPiece = function (piece, old) {
            if (old != null && piece.moved) {
                for (var i = 0; i < old.length; i++) {
                    var o = old[i];
                    o.remove();
                }
            }

            var size = this.board.blockSize;
            var blocks = piece.currentRotation();
            var start = piece.basePosition;

            var results = [];

            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i];

                results.push(new Graphics.Square(this.canvas, start[0] * size + block[0] * size + 3, start[1] * size + block[1] * size, this.board.blockSize, this.board.blockSize, piece.color));
            }

            return results;
        };

        Tetris.prototype.updateScore = function () {
            this.score.setText(this.board.score.toString());
        };
        return Tetris;
    })();
    Game.Tetris = Tetris;
})(Game || (Game = {}));

var screenHeight = document.documentElement.clientHeight;
var blockSize;

if (screenHeight <= 460) {
    blockSize = 15;
    document.getElementById('forkMe').style.display = 'none';
} else if (screenHeight > 460 && screenHeight <= 800) {
    blockSize = 25;
} else if (screenHeight > 800) {
    blockSize = 30;
}

var options = {
    blockSize: blockSize,
    numColumns: 10,
    numRows: 25,
    fps: 2,
    tickerInterval: 200
};

var game = new Game.Tetris(options);

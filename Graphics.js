var createjs;

var Graphics;
(function (Graphics) {
    var TetrisRoot = (function () {
        function TetrisRoot() {
        }
        TetrisRoot.prototype.bind = function (char, callback) {
        };
        return TetrisRoot;
    })();
    Graphics.TetrisRoot = TetrisRoot;

    var TetrisTimer = (function () {
        function TetrisTimer() {
            createjs.Ticker.setInterval(25);
            createjs.Ticker.setFPS(40);
            createjs.Ticker.useRAF = true;
        }
        TetrisTimer.pause = function () {
            var paused = !createjs.Ticker.getPaused();
            createjs.Ticker.setPaused(paused);
        };

        TetrisTimer.prototype.setCallback = function (callback) {
            createjs.Ticker.addListener(callback);
        };
        return TetrisTimer;
    })();
    Graphics.TetrisTimer = TetrisTimer;

    var TetrisCanvas = (function () {
        function TetrisCanvas() {
            this.stage = new createjs.Stage("tetris");
        }
        TetrisCanvas.prototype.place = function (height, width, x, y) {
        };

        TetrisCanvas.prototype.addChild = function (ele) {
            this.stage.addChild(ele);
        };

        TetrisCanvas.prototype.update = function () {
            this.stage.update();
        };

        TetrisCanvas.prototype.unplace = function () {
        };

        TetrisCanvas.prototype.remove = function () {
        };
        return TetrisCanvas;
    })();
    Graphics.TetrisCanvas = TetrisCanvas;

    var TetrisRect = (function () {
        function TetrisRect(canvas, x, y, w, h, color) {
            this.rect = new createjs.Shape();
            this.rect.graphics.beginFill(color).drawRect(x, y, w, h);
            canvas.addChild(this.rect);
            canvas.update();
        }
        TetrisRect.prototype.move = function (dx, dy) {
            console.log(this);

            this.rect.x += dx;
            this.rect.y += dy;
        };
        return TetrisRect;
    })();
    Graphics.TetrisRect = TetrisRect;
})(Graphics || (Graphics = {}));

var Game;
(function (Game) {
    var Piece = (function () {
        function Piece(pointArray, board) {
            this.base_position = [5, 0];
            this.moved = true;
            this.all_rotations = pointArray;
            this.board = board;
            this.rotation_index = 0;
            this.color = "Red";
            this.base_position = [5, 0];
            this.moved = true;
        }
        Piece.prototype.current_rotation = function () {
            return this.all_rotations[this.rotation_index];
        };

        Piece.prototype.dropByOne = function () {
            this.moved = this.move(0, 1, 0);
        };

        Piece.prototype.move = function (deltaX, deltaY, deltaRotation) {
            this.moved = true;
            var potential = this.all_rotations[(this.rotation_index + deltaRotation) % this.all_rotations.length];

            potential.forEach(function (posns) {
                if (this.board.emptyAt([
                    posns[0] + deltaX + this.base_position[0],
                    posns[1] + deltaY + this.base_position[1]
                ])) {
                    this.moved = false;
                }
            });

            if (this.moved) {
                this.base_position[0] += deltaX;
                this.base_position[1] += deltaY;
                this.rotation_index = (this.rotation_index + deltaRotation) % this.all_rotations.length;
            }

            return this.moved;
        };

        Piece.rotations = function (point_array) {
        };

        Piece.next_piece = function (board) {
            return new Piece(this.All_Pieces[0], board);
        };

        Piece.All_Pieces = [[[[0, 0], [1, 0], [0, 1], [1, 1]]]];

        Piece.AllColors = [
            'DarkGreen',
            'dark blue',
            'dark red',
            'gold2',
            'Purple3',
            'OrangeRed2',
            'LightSkyBlue'
        ];
        return Piece;
    })();
    Game.Piece = Piece;

    var Board = (function () {
        function Board(game) {
            this.blockSize = 15;
            this.numColumns = 10;
            this.numRows = 27;
            this.score = 0;
            this.delay = 500;
            this.game = game;

            this.grid = new Array(this.numRows);

            for (var i = 0; i < this.numRows; i++) {
                this.grid[i] = new Array(this.numColumns);
            }

            this.currentBlock = Piece.next_piece(this);
        }
        Board.prototype.emptyAt = function (point) {
        };

        Board.prototype.run = function () {
            var ran = this.currentBlock.dropByOne();

            if (!ran) {
            }
        };

        Board.prototype.storeCurrent = function () {
        };

        Board.prototype.draw = function () {
            this.current_pos = this.game.draw_piece(this.currentBlock, this.current_pos);
        };
        return Board;
    })();
    Game.Board = Board;

    var Tetris = (function () {
        function Tetris() {
            this.root = new Graphics.TetrisRoot();
            this.ticker = new Graphics.TetrisTimer();
            this.canvas = new Graphics.TetrisCanvas();
            this.rect = new Graphics.TetrisRect(this.canvas, 2, 2, 25, 25, "red");
            this.ticker.setCallback(this);
            this.board = new Board(this);
            this.isRunning = true;
        }
        Tetris.prototype.tick = function () {
            if (this.isRunning) {
                this.rect.move(0, 3);
                this.canvas.update();
            }
        };

        Tetris.prototype.draw_piece = function (piece, old) {
            old = null;
            var size = this.board.blockSize;
            var blocks = piece.current_rotation();
            var start = piece.base_position;
        };
        return Tetris;
    })();
    Game.Tetris = Tetris;
})(Game || (Game = {}));

var g = new Game.Tetris();

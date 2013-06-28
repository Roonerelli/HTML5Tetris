var createjs;
var _;

var Graphics;
(function (Graphics) {
    var TetrisRoot = (function () {
        function TetrisRoot() {
            document.body.onkeydown = function (event) {
                event = event || window.event;
                var keycode = event.charCode || event.keyCode;

                var closur = TetrisRoot.keyBindings['' + keycode];

                if (closur != undefined) {
                    closur();
                }
            };
        }
        TetrisRoot.prototype.bind = function (char, callback) {
            TetrisRoot.keyBindings[char] = callback;
        };
        TetrisRoot.keyBindings = {};
        return TetrisRoot;
    })();
    Graphics.TetrisRoot = TetrisRoot;

    var TetrisTimer = (function () {
        function TetrisTimer() {
            createjs.Ticker.setInterval(200);
            createjs.Ticker.setFPS(2);
            createjs.Ticker.useRAF = true;
        }
        TetrisTimer.pause = function () {
            var isPaused = !createjs.Ticker.getPaused();
            createjs.Ticker.setPaused(isPaused);
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

        TetrisCanvas.prototype.removeChild = function (ele) {
            this.stage.removeChild(ele);
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
            this.canvas = canvas;
            this.canvas.addChild(this.rect);
            this.canvas.update();
        }
        TetrisRect.prototype.move = function (dx, dy) {
            this.rect.x += dx;
            this.rect.y += dy;
        };

        TetrisRect.prototype.remove = function () {
            this.canvas.removeChild(this.rect);
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
            this.rotation_index = 0;
            this.color = "Red";
            this.base_position = [5, 0];
            this.board = board;
            this.moved = true;
        }
        Piece.prototype.current_rotation = function () {
            return this.all_rotations[this.rotation_index];
        };

        Piece.prototype.dropByOne = function () {
            this.moved = this.move(0, 1, 0);
            return this.moved;
        };

        Piece.prototype.move = function (deltaX, deltaY, deltaRotation) {
            this.moved = true;
            var potential = this.all_rotations[(this.rotation_index + deltaRotation) % this.all_rotations.length];

            for (var index = 0; index < potential.length; ++index) {
                var posns = potential[index];
                if (!this.board.emptyAt([
                    posns[0] + deltaX + this.base_position[0],
                    posns[1] + deltaY + this.base_position[1]
                ])) {
                    this.moved = false;
                }
            }

            if (this.moved) {
                this.base_position[0] += deltaX;
                this.base_position[1] += deltaY;
                this.rotation_index = (this.rotation_index + deltaRotation) % this.all_rotations.length;
            }

            return this.moved;
        };

        Piece.rotations = function (point_array) {
            var rotate1 = _.map(point_array, function (x, y) {
                return [-y, x];
            });
            var rotate2 = _.map(point_array, function (x, y) {
                return [-x, y];
            });
            var rotate3 = _.map(point_array, function (x, y) {
                return [y, -x];
            });

            return [point_array, rotate1, rotate2, rotate3];
        };

        Piece.next_piece = function (board) {
            var indx = Math.floor(Math.random() * this.All_Pieces.length);
            return new Piece(this.All_Pieces[indx], board);
        };

        Piece.All_Pieces = [
            [[[0, 0], [1, 0], [0, 1], [1, 1]]],
            Piece.rotations([[0, 0], [-1, 0], [1, 0], [0, -1]]),
            [
                [[0, 0], [-1, 0], [1, 0], [2, 0]],
                [[0, 0], [0, -1], [0, 1], [0, 2]]
            ],
            Piece.rotations([[0, 0], [0, -1], [0, 1], [1, 1]]),
            Piece.rotations([[0, 0], [0, -1], [0, 1], [-1, 1]]),
            Piece.rotations([[0, 0], [-1, 0], [0, -1], [1, -1]]),
            Piece.rotations([[0, 0], [1, 0], [0, -1], [-1, -1]])
        ];

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
            this.score = 0;
            this.delay = 500;
            this.blockSize = 15;
            this.numColumns = 10;
            this.numRows = 27;
            this.grid = new Array(this.numRows);

            for (var i = 0; i < this.numRows; i++) {
                this.grid[i] = new Array(this.numColumns);
            }

            this.currentBlock = Piece.next_piece(this);
            this.game = game;
        }
        Board.prototype.game_over = function () {
            return false;
        };

        Board.prototype.run = function () {
            var ran = this.currentBlock.dropByOne();
            console.log(ran);

            if (!ran) {
                this.storeCurrent();
                console.log('stored piece.');

                if (!this.game_over()) {
                    console.log('getting next piece');

                    this.next_piece();
                }
            }

            this.draw();
        };

        Board.prototype.move_left = function () {
            if (!this.game_over() && this.game.isRunning) {
                this.currentBlock.move(-1, 0, 0);
            }
            this.draw();
        };

        Board.prototype.move_right = function () {
            if (!this.game_over() && this.game.isRunning) {
                this.currentBlock.move(1, 0, 0);
            }
            this.draw();
        };

        Board.prototype.rotate_clockwise = function () {
            if (!this.game_over() && this.game.isRunning) {
                this.currentBlock.move(0, 0, 1);
            }
            this.draw();
        };

        Board.prototype.rotate_counter_clockwise = function () {
            if (!this.game_over() && this.game.isRunning) {
                this.currentBlock.move(0, 0, -1);
            }
            this.draw();
        };

        Board.prototype.next_piece = function () {
            this.currentBlock = Piece.next_piece(this);
            this.current_pos = null;
        };

        Board.prototype.storeCurrent = function () {
            var locations = this.currentBlock.current_rotation();
            var displacements = this.currentBlock.base_position;

            for (var i = 0; i < 4; i++) {
                var current = locations[i];
                this.grid[current[1] + displacements[1]][current[0] + displacements[0]] = this.current_pos[i];
            }
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

                if (_.every(this.grid[i])) {
                    for (var j = 0; j < this.numColumns; j++) {
                        this.grid[i][j].remove();
                        this.grid[i][j] = null;
                    }

                    for (var k = this.grid.size - i + 1; k <= this.grid.length; k++) {
                    }

                    this.grid[0] = new Array(this.numColumns);
                    this.score += 10;
                }
            }
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
            this.ticker.setCallback(this);
            this.board = new Board(this);
            this.isRunning = true;
            this.keyBindings();
        }
        Tetris.prototype.keyBindings = function () {
            var self = this;

            this.root.bind(37, function () {
                self.board.move_left();
            });
            this.root.bind(39, function () {
                self.board.move_right();
            });
            this.root.bind(38, function () {
                self.board.rotate_clockwise();
            });
            this.root.bind(40, function () {
                self.board.rotate_counter_clockwise();
            });
        };

        Tetris.prototype.tick = function () {
            if (this.isRunning) {
                this.board.run();
            }
        };

        Tetris.prototype.draw_piece = function (piece, old) {
            if (old != null && piece.moved) {
                for (var i = 0; i < old.length; i++) {
                    var o = old[i];
                    o.remove();
                }
            }

            var size = this.board.blockSize;
            var blocks = piece.current_rotation();
            var start = piece.base_position;

            var results = [];

            for (var i = 0; i < blocks.length; i++) {
                var block = blocks[i];

                results.push(new Graphics.TetrisRect(this.canvas, start[0] * size + block[0] * size + 3, start[1] * size + block[1] * size, 15, 15, piece.color));
            }

            return results;
        };
        return Tetris;
    })();
    Game.Tetris = Tetris;
})(Game || (Game = {}));

var g = new Game.Tetris();

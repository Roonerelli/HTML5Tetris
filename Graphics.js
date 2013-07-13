var createjs;
var _;
var Graphics;
(function (Graphics) {
    var TetrisRoot = (function () {
        function TetrisRoot() {
            document.body.onkeydown = function (event) {
                event = event || window.event;
                var keycode = event.charCode || event.keyCode;
                var action = TetrisRoot.keyBindings['' + keycode];
                if(action != undefined) {
                    action();
                }
            };
        }
        TetrisRoot.keyBindings = {
        };
        TetrisRoot.prototype.bind = function (char, action) {
            TetrisRoot.keyBindings[char] = action;
        };
        return TetrisRoot;
    })();
    Graphics.TetrisRoot = TetrisRoot;    
    var TetrisTimer = (function () {
        function TetrisTimer(interval, fps) {
            createjs.Ticker.setInterval(interval);
            createjs.Ticker.setFPS(fps);
            createjs.Ticker.useRAF = true;
        }
        TetrisTimer.pause = function pause() {
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
            this.blockSize = 25;
            this.numColumns = 10;
            this.numRows = 27;
            this.stage = new createjs.Stage("tetris");
            this.drawGrid();
        }
        TetrisCanvas.prototype.addChild = function (ele) {
            this.stage.addChild(ele);
        };
        TetrisCanvas.prototype.removeChild = function (ele) {
            this.stage.removeChild(ele);
        };
        TetrisCanvas.prototype.update = function () {
            this.stage.update();
        };
        TetrisCanvas.prototype.remove = function () {
        };
        TetrisCanvas.prototype.drawGrid = function () {
            for(var i = 1; i <= this.numColumns; i++) {
                var g = new createjs.Graphics();
                g.beginStroke("#aaa");
                g.setStrokeStyle(1);
                g.moveTo(i * this.blockSize, 0);
                g.lineTo(i * this.blockSize, this.numRows * this.blockSize);
                var s = new createjs.Shape(g);
                this.stage.addChild(s);
            }
            for(var i = 0; i < this.numRows; i++) {
                var g = new createjs.Graphics();
                g.beginStroke("#aaa");
                g.setStrokeStyle(1);
                g.moveTo(0, i * this.blockSize);
                g.lineTo(this.numColumns * this.blockSize, i * this.blockSize);
                var s = new createjs.Shape(g);
                this.stage.addChild(s);
            }
        };
        return TetrisCanvas;
    })();
    Graphics.TetrisCanvas = TetrisCanvas;    
    var TetrisRect = (function () {
        function TetrisRect(canvas, x, y, w, h, color) {
            this.rect = new createjs.Shape();
            this.rect.graphics.beginStroke("#000");
            this.rect.graphics.setStrokeStyle(1);
            this.rect.snapToPixel = true;
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
    var TetrisLabel = (function () {
        function TetrisLabel(canvas, text, xPosn) {
            this.font = "20px Arial";
            this.colour = "#ff7700";
            this.label = new createjs.Text(text, this.font, this.colour);
            this.label.x = xPosn;
            canvas.addChild(this.label);
            canvas.update();
        }
        TetrisLabel.prototype.setText = function (text) {
            this.label.text = text;
        };
        return TetrisLabel;
    })();
    Graphics.TetrisLabel = TetrisLabel;    
    var TetrisButton = (function () {
        function TetrisButton(canvas, x, y, w, h) {
        }
        return TetrisButton;
    })();
    Graphics.TetrisButton = TetrisButton;    
})(Graphics || (Graphics = {}));
var Game;
(function (Game) {
    var Piece = (function () {
        function Piece(pointArray, board) {
            this.base_position = [
                5, 
                0
            ];
            this.moved = true;
            this.all_rotations = pointArray;
            var rotIndx = Math.floor(Math.random() * this.all_rotations.length);
            this.rotation_index = rotIndx;
            var indx = Math.floor(Math.random() * Piece.AllColors.length);
            this.color = Piece.AllColors[indx];
            this.base_position = [
                5, 
                0
            ];
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
            for(var index = 0; index < potential.length; ++index) {
                var posns = potential[index];
                if(!this.board.emptyAt([
                    posns[0] + deltaX + this.base_position[0], 
                    posns[1] + deltaY + this.base_position[1]
                ])) {
                    this.moved = false;
                }
            }
            if(this.moved) {
                this.base_position[0] += deltaX;
                this.base_position[1] += deltaY;
                this.rotation_index = (this.rotation_index + deltaRotation) % this.all_rotations.length;
            }
            return this.moved;
        };
        Piece.rotations = function rotations(point_array) {
            var rotate1 = _.map(point_array, function (point) {
                return [
                    -point[1], 
                    point[0]
                ];
            });
            var rotate2 = _.map(point_array, function (point) {
                return [
                    -point[0], 
                    point[1]
                ];
            });
            var rotate3 = _.map(point_array, function (point) {
                return [
                    point[1], 
                    -point[0]
                ];
            });
            return [
                point_array, 
                rotate1, 
                rotate2, 
                rotate3
            ];
        };
        Piece.next_piece = function next_piece(board) {
            var indx = Math.floor(Math.random() * this.All_Pieces.length);
            return new Piece(this.All_Pieces[indx], board);
        };
        Piece.All_Pieces = [
            [
                [
                    [
                        0, 
                        0
                    ], 
                    [
                        1, 
                        0
                    ], 
                    [
                        0, 
                        1
                    ], 
                    [
                        1, 
                        1
                    ]
                ]
            ], 
            Piece.rotations([
                [
                    0, 
                    0
                ], 
                [
                    -1, 
                    0
                ], 
                [
                    1, 
                    0
                ], 
                [
                    0, 
                    -1
                ]
            ]), 
            [
                [
                    [
                        0, 
                        0
                    ], 
                    [
                        -1, 
                        0
                    ], 
                    [
                        1, 
                        0
                    ], 
                    [
                        2, 
                        0
                    ]
                ], 
                [
                    [
                        0, 
                        0
                    ], 
                    [
                        0, 
                        -1
                    ], 
                    [
                        0, 
                        1
                    ], 
                    [
                        0, 
                        2
                    ]
                ]
            ], 
            Piece.rotations([
                [
                    0, 
                    0
                ], 
                [
                    0, 
                    -1
                ], 
                [
                    0, 
                    1
                ], 
                [
                    1, 
                    1
                ]
            ]), 
            Piece.rotations([
                [
                    0, 
                    0
                ], 
                [
                    0, 
                    -1
                ], 
                [
                    0, 
                    1
                ], 
                [
                    -1, 
                    1
                ]
            ]), 
            Piece.rotations([
                [
                    0, 
                    0
                ], 
                [
                    -1, 
                    0
                ], 
                [
                    0, 
                    -1
                ], 
                [
                    1, 
                    -1
                ]
            ]), 
            Piece.rotations([
                [
                    0, 
                    0
                ], 
                [
                    1, 
                    0
                ], 
                [
                    0, 
                    -1
                ], 
                [
                    -1, 
                    -1
                ]
            ])
        ];
        Piece.AllColors = [
            'Aqua', 
            'Blue', 
            'red', 
            'DarkViolet', 
            'Yellow', 
            'Orange', 
            'Green'
        ];
        return Piece;
    })();
    Game.Piece = Piece;    
    var Board = (function () {
        function Board(game) {
            this.score = 0;
            this.delay = 500;
            this.blockSize = 25;
            this.numColumns = 10;
            this.numRows = 27;
            this.grid = new Array(this.numRows);
            for(var i = 0; i < this.numRows; i++) {
                this.grid[i] = new Array(this.numColumns);
            }
            this.currentBlock = Piece.next_piece(this);
            this.game = game;
        }
        Board.prototype.game_over = function () {
            var anyInTopRow = _.some(this.grid[1], function (x) {
                return x != undefined;
            });
            console.log(anyInTopRow);
            return anyInTopRow;
        };
        Board.prototype.run = function () {
            var ran = this.currentBlock.dropByOne();
            if(!ran) {
                this.storeCurrent();
                if(!this.game_over()) {
                    this.next_piece();
                }
            }
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
            if(!this.game_over() && this.game.isRunning) {
                this.currentBlock.move(x, y, rot);
            }
            this.draw();
        };
        Board.prototype.drop_all_the_way = function () {
            if(this.game.isRunning) {
                var ran = this.currentBlock.dropByOne();
                while(ran) {
                    for(var i = 0; i < this.current_pos.length; i++) {
                        var block = this.current_pos[i];
                        block.remove();
                    }
                    this.score += 1;
                    ran = this.currentBlock.dropByOne();
                }
                this.draw();
                this.storeCurrent();
                if(!this.game_over()) {
                    this.next_piece();
                }
                this.game.updateScore();
                this.draw();
            }
        };
        Board.prototype.next_piece = function () {
            this.currentBlock = Piece.next_piece(this);
            this.current_pos = null;
        };
        Board.prototype.storeCurrent = function () {
            var locations = this.currentBlock.current_rotation();
            var displacements = this.currentBlock.base_position;
            for(var i = 0; i < 4; i++) {
                var current = locations[i];
                this.grid[current[1] + displacements[1]][current[0] + displacements[0]] = this.current_pos[i];
            }
            this.removeFilled();
        };
        Board.prototype.emptyAt = function (point) {
            if(!(point[0] >= 0 && point[0] < this.numColumns)) {
                return false;
            } else if(point[1] < 1) {
                return true;
            } else if(point[1] >= this.numRows) {
                return false;
            }
            return this.grid[point[1]][point[0]] == null;
        };
        Board.prototype.removeFilled = function () {
            for(var i = 2; i < this.grid.length; i++) {
                var row = this.grid.slice(i);
                var allFull = true;
                for(var g = 0; g < this.grid[i].length; g++) {
                    if(this.grid[i][g] == undefined) {
                        allFull = false;
                        break;
                    }
                }
                if(allFull) {
                    for(var j = 0; j < this.numColumns; j++) {
                        this.grid[i][j].remove();
                        this.grid[i][j] = undefined;
                    }
                    for(var k = this.grid.length - i + 1; k <= this.grid.length; k++) {
                        var rects = this.grid[this.grid.length - k];
                        for(var l = 0; l < rects.length; l++) {
                            var rect = rects[l];
                            if(rect) {
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
            this.current_pos = this.game.draw_piece(this.currentBlock, this.current_pos);
        };
        return Board;
    })();
    Game.Board = Board;    
    var Tetris = (function () {
        function Tetris() {
            this.root = new Graphics.TetrisRoot();
            this.ticker = new Graphics.TetrisTimer(200, 2);
            this.canvas = new Graphics.TetrisCanvas();
            this.ticker.setCallback(this);
            this.board = new Board(this);
            this.isRunning = true;
            this.keyBindings();
            this.controls();
        }
        Tetris.prototype.newGame = function () {
        };
        Tetris.prototype.keyBindings = function () {
            var _this = this;
            this.root.bind(37, function () {
                _this.board.move_left();
            });
            this.root.bind(39, function () {
                _this.board.move_right();
            });
            this.root.bind(38, function () {
                _this.board.rotate_clockwise();
            });
            this.root.bind(40, function () {
                _this.board.rotate_counter_clockwise();
            });
            this.root.bind(32, function () {
                _this.board.drop_all_the_way();
            });
        };
        Tetris.prototype.controls = function () {
            this.score = new Graphics.TetrisLabel(this.canvas, "0", 200);
        };
        Tetris.prototype.tick = function () {
            if(this.isRunning && !this.board.game_over()) {
                this.board.run();
            }
        };
        Tetris.prototype.draw_piece = function (piece, old) {
            if(old != null && piece.moved) {
                for(var i = 0; i < old.length; i++) {
                    var o = old[i];
                    o.remove();
                }
            }
            var size = this.board.blockSize;
            var blocks = piece.current_rotation();
            var start = piece.base_position;
            var results = [];
            for(var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                results.push(new Graphics.TetrisRect(this.canvas, start[0] * size + block[0] * size + 3, start[1] * size + block[1] * size, this.board.blockSize, this.board.blockSize, piece.color));
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
var g = new Game.Tetris();

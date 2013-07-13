
var createjs;
var _;

module Graphics {

    export class TetrisRoot {
        
        static keyBindings = {};

        constructor() {
            document.body.onkeydown = function (event) {
                event = event || window.event;
                var keycode = event.charCode || event.keyCode;

                var action = TetrisRoot.keyBindings['' + keycode];

                if (action != undefined) {
                    action();
                }
            }
        }

        bind(char, action) {
            TetrisRoot.keyBindings[char] = action;
        }
    }

    export class TetrisTimer {

        constructor(interval: number, fps: number) {
            createjs.Ticker.setInterval(interval);
            createjs.Ticker.setFPS(fps);
            createjs.Ticker.useRAF = true;
        }

        static pause() {
            var isPaused = !createjs.Ticker.getPaused();
            createjs.Ticker.setPaused(isPaused);
        }

        setCallback(callback) {
            createjs.Ticker.addListener(callback);
            //createjs.Ticker.addEventListener("tick", callback);
        }
    } 

    export class TetrisCanvas {

        blockSize = 25;
        numColumns = 10;
        numRows = 27;

        public stage; 
        constructor() {
            this.stage = new createjs.Stage("tetris");
            this.drawGrid();
        }

        addChild(ele: any) {
            this.stage.addChild(ele);
        }

        removeChild(ele: TetrisRect) {
            this.stage.removeChild(ele);
        }

        update() {
            this.stage.update();
        }
        
        remove() {
        }

        drawGrid() {
            for (var i = 1; i <= this.numColumns; i++) {
                var g = new createjs.Graphics();
                g.beginStroke("#aaa");
                g.setStrokeStyle(1);

                g.moveTo(i*this.blockSize,0);
                g.lineTo(i*this.blockSize,this.numRows*this.blockSize);
                var s = new createjs.Shape(g);
                this.stage.addChild(s);
            }

            for (var i = 0; i < this.numRows; i++) {
                var g = new createjs.Graphics();
                g.beginStroke("#aaa");
                g.setStrokeStyle(1);

                g.moveTo(0, i*this.blockSize);
                g.lineTo(this.numColumns*this.blockSize, i*this.blockSize);
                var s = new createjs.Shape(g);
                this.stage.addChild(s);
            }
        }
    }

    export class TetrisRect {

        public rect;
        private canvas : TetrisCanvas;

        constructor(canvas: TetrisCanvas, x, y, w, h, color) {
            
            this.rect = new createjs.Shape();
            this.rect.graphics.beginStroke("#000");
            this.rect.graphics.setStrokeStyle(1);
            this.rect.snapToPixel = true;
            this.rect.graphics.beginFill(color).drawRect(x, y, w, h);

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

    export class TetrisLabel {

        private label;
        private font = "20px Arial";
        private colour = "#ff7700";

        constructor(canvas: TetrisCanvas, text: string, xPosn : number) {

            this.label = new createjs.Text(text, this.font, this.colour);
            this.label.x = xPosn;
            canvas.addChild(this.label);
            canvas.update();
        }

        setText(text :string) {
            this.label.text = text;
        }
    }

    export class TetrisButton {

        constructor(canvas: TetrisCanvas, x, y, w, h, ) {

        }
    }
}


module Game {

    export class Piece {
        
        all_rotations;
        rotation_index;
        color;
        base_position = [5, 0];
        board: Board;
        moved = true;
        
        constructor(pointArray, board : Board) {
            this.all_rotations = pointArray;
            var rotIndx = Math.floor(Math.random() * this.all_rotations.length);
            this.rotation_index = rotIndx; //TODO:randomize
            var indx = Math.floor(Math.random() * Piece.AllColors.length);
            this.color = Piece.AllColors[indx]; 
            this.base_position = [5, 0];
            this.board = board;
            this.moved = true;
        }

        current_rotation() {
            return this.all_rotations[this.rotation_index];
        }

        dropByOne() {
            this.moved = this.move(0, 1, 0);
            return this.moved;
        }

        move(deltaX, deltaY, deltaRotation) {
            this.moved = true;
            var potential = this.all_rotations[(this.rotation_index + deltaRotation) % this.all_rotations.length];

            for (var index = 0; index < potential.length; ++index) {
                var posns = potential[index];
                if(!this.board.emptyAt([
                    posns[0] + deltaX + this.base_position[0], 
                    posns[1] + deltaY + this.base_position[1]])) {
                    this.moved = false;
                }
            }

            if (this.moved) {
                this.base_position[0] += deltaX;
                this.base_position[1] += deltaY;
                this.rotation_index = (this.rotation_index + deltaRotation) % this.all_rotations.length;
            }

            return this.moved;
        }

        static rotations (point_array) {
            var rotate1 = _.map(point_array, (point) => { return [-point[1], point[0]]; })
            var rotate2 = _.map(point_array, (point) => { return [-point[0], point[1]]; })
            var rotate3 = _.map(point_array, (point) => { return [point[1], -point[0]]; })

            return [point_array, rotate1, rotate2, rotate3];
        }
        
        static next_piece(board: Board) {            
            var indx = Math.floor(Math.random() * this.All_Pieces.length);
            return new Piece(this.All_Pieces[indx], board);
        }

        static All_Pieces = [[[[0, 0], [1, 0], [0, 1], [1, 1]]], //# square (only needs one)
            Piece.rotations([[0, 0], [-1, 0], [1, 0], [0, -1]]), // T
            [[[0, 0], [-1, 0], [1, 0], [2, 0]],     // long
                [[0, 0], [0, -1], [0, 1], [0, 2]]],
            Piece.rotations([[0, 0], [0, -1], [0, 1], [1, 1]]), // L
            Piece.rotations([[0, 0], [0, -1], [0, 1], [-1, 1]]), // inverted L
            Piece.rotations([[0, 0], [-1, 0], [0, -1], [1, -1]]), // S
            Piece.rotations([[0, 0], [1, 0], [0, -1], [-1, -1]])]; // Z

        static AllColors = ['Aqua', 'Blue', 'red', 'DarkViolet', 'Yellow', 'Orange', 'Green'];
    }

    export class Board {

        grid: any;
        currentBlock: Piece;
        score = 0;
        game: Tetris;
        delay = 500;

        blockSize = 25;
        numColumns = 10;
        numRows = 27;
        current_pos: any;
        
        constructor(game: Tetris) {
            //this.grid = _.map(_.range(this.numRows), function(){return _.range(this.numColumns)});

            this.grid = new Array(this.numRows);

            for (var i = 0; i < this.numRows; i++) {
                this.grid[i] = new Array(this.numColumns);
            }

            this.currentBlock = Piece.next_piece(this);
            this.game = game;
        }

        game_over() {

            var anyInTopRow = _.some(this.grid[1], (x) => {return x != undefined;});


            /*var anyInTopRow = false;

            for (var g = 0; g < this.grid[1].length; g++ ) {
                if (this.grid[1][g] != undefined) {
                    anyInTopRow = true;
                    break;
                }
            }*/

            console.log(anyInTopRow);

            return anyInTopRow;      
        }

        run() {
            var ran = this.currentBlock.dropByOne();

            if (!ran) {
                this.storeCurrent();
                
                if (!this.game_over()) {
                    this.next_piece();                    
                }
            }

            this.game.updateScore();
            this.draw();
        }

        move_left() {
            this.move(-1, 0, 0);
        }

        move_right() {
            this.move(1, 0, 0);
        }

        rotate_clockwise() {
            this.move(0, 0, 1);
        }

        rotate_counter_clockwise() {
            this.move(0, 0, -1);
        }

        move(x, y, rot) {
            if (!this.game_over() && this.game.isRunning) {
                this.currentBlock.move(x, y, rot);
            }
            this.draw();
        }

        drop_all_the_way() {
            if (this.game.isRunning) {
                var ran = this.currentBlock.dropByOne();

                while (ran) {

                    for (var i = 0; i < this.current_pos.length; i++) {
                        var block = this.current_pos[i];
                        block.remove();
                    }

                    //_.each(this.current_pos, function (block) { block.remove; })
                    this.score += 1;
                    ran = this.currentBlock.dropByOne();
                }
                this.draw();
                this.storeCurrent();
                if (!this.game_over()) {
                    this.next_piece();
                }

                this.game.updateScore();

                this.draw();
            }
        }

        next_piece() {
            this.currentBlock = Piece.next_piece(this);
            this.current_pos = null;
        }

        storeCurrent() {
            var locations = this.currentBlock.current_rotation();
            var displacements = this.currentBlock.base_position

            for (var i = 0; i < 4; i++) {
                var current = locations[i];
                this.grid[current[1] + displacements[1]][current[0] + displacements[0]] = this.current_pos[i];
            }
            
            this.removeFilled();
        }

        emptyAt(point) {
            if (!(point[0] >= 0 && point[0] < this.numColumns)) {
                return false;
            }
            else if (point[1] < 1) {
                return true;
            }
            else if (point[1] >= this.numRows) {
                return false;
            }

            return this.grid[point[1]][point[0]] == null;
        }

        removeFilled() {
            for (var i = 2; i < this.grid.length; i++) {
                var row = this.grid.slice(i);

                var allFull = true;

                for (var g = 0; g < this.grid[i].length; g++ ) {
                    if (this.grid[i][g] == undefined) {
                        allFull = false;
                        break;
                    }
                }

                //TODO: why is _.every not working?
                //if (_.every(this.grid[i], function(x) {console.log(x); return x != undefined })) {
                if (allFull) {
                    for (var j = 0; j < this.numColumns; j++) {
                        this.grid[i][j].remove();
                        this.grid[i][j] = undefined;
                    }

                    for (var k = this.grid.length - i + 1; k <= this.grid.length; k++) {

                        var rects = this.grid[this.grid.length - k];

                        for(var l = 0; l < rects.length; l++) {
                            var rect  = rects[l];
                            if (rect) {
                                rect.move(0, this.blockSize);
                            }
                        }

                        this.grid[this.grid.length - k + 1] = this.grid[this.grid.length - k].slice();
                    }

                    this.grid[0] =  new Array(this.numColumns);
                    this.score += 10;
                }
            }
        }

        draw() {
            this.current_pos = this.game.draw_piece(this.currentBlock, this.current_pos);
        }
    }

    export class Tetris {

        root: Graphics.TetrisRoot;
        ticker: Graphics.TetrisTimer;
        canvas: Graphics.TetrisCanvas;
        rect: Graphics.TetrisRect;
        board: Board;
        isRunning: bool;
        score : Graphics.TetrisLabel;

        constructor() {
            this.root = new Graphics.TetrisRoot();
            this.ticker = new Graphics.TetrisTimer(200, 2);
            this.canvas = new Graphics.TetrisCanvas();
            this.ticker.setCallback(this);
            this.board = new Board(this);
            this.isRunning = true;
            this.keyBindings();
            this.controls();
        }

        newGame() {

        }
        
        keyBindings() {

            this.root.bind(37, () => { this.board.move_left(); })
            this.root.bind(39, () => { this.board.move_right(); })
            this.root.bind(38, () => { this.board.rotate_clockwise(); })
            this.root.bind(40, () => { this.board.rotate_counter_clockwise(); })
            
            this.root.bind(32, () => { this.board.drop_all_the_way(); })
        }

        controls() {
            this.score = new Graphics.TetrisLabel(this.canvas, "0", 200);
        }

        tick() {
            if (this.isRunning && !this.board.game_over()) {
                this.board.run();
            }
        }

        draw_piece(piece: Piece, old) {

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

                results.push(new Graphics.TetrisRect(this.canvas, 
                                    start[0] * size + block[0]*size + 3,
                                    start[1] * size + block[1]*size,
                                    this.board.blockSize, this.board.blockSize, piece.color));
            }

            return results;
        }

        updateScore() {
            this.score.setText(this.board.score.toString());

        }
    }
}

var g = new Game.Tetris();

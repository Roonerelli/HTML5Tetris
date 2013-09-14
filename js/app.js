var screenHeight = document.documentElement.clientHeight;
var blockSize;

if (screenHeight <= 460) {
    blockSize = 13;
    document.getElementById('forkMe').style.display = 'none';    
} else if (screenHeight > 460 && screenHeight <= 800) {
    blockSize = 25;
}
else if (screenHeight > 800) {
    blockSize = 30;
}

var options = {
    blockSize : blockSize,
    numColumns : 10,
    numRows : 25,
    fps : 2,
    tickerInterval : 200
};

var game = new Game.Tetris(options);
var canvas = document.getElementById('board');		//gets specific id'd element
var ctx = canvas.getContext("2d");		//returns drawing canvas
var linecount = document.getElementById('lines');	
var clear = window.getComputedStyle(canvas).getPropertyValue('background-color');	//retrieved canvas and placed bg color
var width = 10;		//width of block	
var height = 20;	//height of block
var tilesz = 24;	//number of tiles
canvas.width = width * tilesz;	//builds tile length and width
canvas.height = height * tilesz;

var board = [];			//loops tile size for pixels and places in an array next to each other
for (var r = 0; r < height; r++) {
	board[r] = [];
	for (var c = 0; c < width; c++) {
		board[r][c] = "";
	}
}

function newPiece() {		//generates a new shape
	var p = pieces[parseInt(Math.random() * pieces.length, 10)];	//pieces = shape, random generates a size with 
	return new Piece(p[0], p[1]);
}

function drawSquare(x, y) {	//draws a sqaure
	ctx.fillRect(x * tilesz, y * tilesz, tilesz, tilesz);
	var ss = ctx.strokeStyle;
	ctx.strokeStyle = "#555";	//ctx draws on canvas with colour
	ctx.strokeRect(x * tilesz, y * tilesz, tilesz, tilesz);	//ctx builds rectangle with x,y, h and w
	ctx.strokeStyle = "#888";	//generates larger squares for tiles
	ctx.strokeRect(x * tilesz + 3*tilesz/8, y * tilesz + 3*tilesz/8, tilesz/4, tilesz/4);
	ctx.strokeStyle = ss;
}

function Piece(patterns, color) {	//builds shape pieces
	this.pattern = patterns[0];	//creates a pattern with an array
	this.patterns = patterns;
	this.patterni = 0;

	this.color = color;

	this.x = width/2-parseInt(Math.ceil(this.pattern.length/2), 10);
	this.y = -2;
}

Piece.prototype.rotate = function() {		//rotate changes image position
	var nudge = 0;
	var nextpat = this.patterns[(this.patterni + 1) % this.patterns.length];	//repositions all the coordinates

	if (this._collides(0, 0, nextpat)) { 		//checks to see if rotation collides with any other shape coordinates
		// Check kickback
		nudge = this.x > width / 2 ? -1 : 1;	//checks to see if coordinates "bump into" each other
	}

	if (!this._collides(nudge, 0, nextpat)) {	//if there is no "nudge" then the shape rotates
		this.undraw();				//eliminate previous shape 
		this.x += nudge;			
		this.patterni = (this.patterni + 1) % this.patterns.length; //shifts shape coordinates and size
		this.pattern = this.patterns[this.patterni];
		this.draw();	//redraw shape
	}
};

var WALL = 1;
var BLOCK = 2;
Piece.prototype._collides = function(dx, dy, pat) {
	for (var ix = 0; ix < pat.length; ix++) {
		for (var iy = 0; iy < pat.length; iy++) {
			if (!pat[ix][iy]) {
				continue;
			}

			var x = this.x + ix + dx;
			var y = this.y + iy + dy;
			if (y >= height || x < 0 || x >= width) {
				return WALL;
			}
			if (y < 0) {
				// Ignore negative space rows
				continue;
			}
			if (board[y][x] !== "") {
				return BLOCK;
			}
		}
	}

	return 0;
};

Piece.prototype.down = function() {	//location travelling that is hit (if moving down hits bottom)
	if (this._collides(0, 1, this.pattern)) {
		this.lock();
		piece = newPiece();
	} else {		//eliminates drawing if passes certain border
		this.undraw();
		this.y++;
		this.draw();
	}
};

Piece.prototype.moveRight = function() {			//if moving right hits right border
	if (!this._collides(1, 0, this.pattern)) {
		this.undraw();
		this.x++;
		this.draw();
	}
};

Piece.prototype.moveLeft = function() {		//if moving left hits left border
	if (!this._collides(-1, 0, this.pattern)) {	//eliminates image
		this.undraw();
		this.x--;
		this.draw();
	}
};
			//this code ends the game if you reach the top
var lines = 0;
var done = false;
Piece.prototype.lock = function() {
	for (var ix = 0; ix < this.pattern.length; ix++) {	//continue to check the coordinates of all the shapess on the screen
		for (var iy = 0; iy < this.pattern.length; iy++) {
			if (!this.pattern[ix][iy]) {		//if coordinates don't hit the coordinates of the top border line
				continue;		//continue with function calls
			}

			if (this.y + iy < 0) {		//if the coordinates collide (or are less than 0) then give alert
				// Game ends!
				alert("You're done!");	//its less than 0 because when you make a canvas there is a new x/y plane setup
				done = true;
				return;
			}
			board[this.y + iy][this.x + ix] = this.color;
		}
	}

	var nlines = 0;				//lines cleared
	for (var y = 0; y < height; y++) {		//if the shapes fill up all the boxes/coordinates for the entire y value
		var line = true;			//run a loop which eliminates all the colour there
		for (var x = 0; x < width; x++) {	//
			line = line && board[y][x] !== "";	//adds whitespace
		}
		if (line) {
			for (var y2 = y; y2 > 1; y2--) {	//this code loops through y values and shifts all coordinates of shapes downwards
				for (var x = 0; x < width; x++) {
					board[y2][x] = board[y2-1][x];
				}
			}
			for (var x = 0; x < width; x++) {
				board[0][x] = ""; //adds whitespace to each shift downwards so colours don't "blend"
			}
			nlines++;
		}
	}

	if (nlines > 0) {		//once line gets eliminated, update lines and redraw the board (adds whitespace)
		lines += nlines;
		drawBoard();
		linecount.textContent = "Lines: " + lines;
	}
};

Piece.prototype._fill = function(color) {		//fills shapes with colour
	var fs = ctx.fillStyle;	//ctx calls style and puts into fs
	ctx.fillStyle = color;	//fillStyle takes color
	var x = this.x;		//the code takes each pattern and fills the x and y of the shape with colour
	var y = this.y;
	for (var ix = 0; ix < this.pattern.length; ix++) {	//loops through the shape to fill with colour
		for (var iy = 0; iy < this.pattern.length; iy++) {
			if (this.pattern[ix][iy]) {
				drawSquare(x + ix, y + iy);	//loop basically redraws the shape with coloour and its coorindates
			}
		}
	}
	ctx.fillStyle = fs;
};

Piece.prototype.undraw = function(ctx) {	//undraw function eliminates drawings and creates whitespace
	this._fill(clear);
};

Piece.prototype.draw = function(ctx) {		//draw creates images and eliminates whitespace
	this._fill(this.color);
};

var pieces = [
	[I, "cyan"],
	[J, "blue"],
	[L, "orange"],
	[O, "yellow"],
	[S, "green"],
	[T, "purple"],
	[Z, "red"]
];
var piece = null;

var dropStart = Date.now();			//event listeners add button taps
var downI = {};
document.body.addEventListener("keydown", function (e) {		//down
	if (downI[e.keyCode] !== null) {
		clearInterval(downI[e.keyCode]);
	}
	key(e.keyCode);
	downI[e.keyCode] = setInterval(key.bind(this, e.keyCode), 200);
}, false);
document.body.addEventListener("keyup", function (e) {			//move up
	if (downI[e.keyCode] !== null) {
		clearInterval(downI[e.keyCode]);
	}
	downI[e.keyCode] = null;
}, false);

function key(k) {
	if (done) {
		return;
	}
	if (k == 38) { // Player pressed up
		piece.rotate();
		dropStart = Date.now();
	}
	if (k == 40) { // Player holding down
		piece.down();
	}
	if (k == 37) { // Player holding left
		piece.moveLeft();
		dropStart = Date.now();
	}
	if (k == 39) { // Player holding right
		piece.moveRight();
		dropStart = Date.now();
	}
}

function drawBoard() {			//draws the entire board
	var fs = ctx.fillStyle;
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			ctx.fillStyle = board[y][x] || clear;
			drawSquare(x, y, tilesz, tilesz);
		}
	}
	ctx.fillStyle = fs;
}

function main() {			//calls function to begin game right when button is tapped
	var now = Date.now();
	var delta = now - dropStart;

	if (delta > 1000) {
		piece.down();
		dropStart = now;
	}

	if (!done) {
		requestAnimationFrame(main);
	}
}

piece = newPiece();
drawBoard();
linecount.textContent = "Lines: 0";		//line count above
main();

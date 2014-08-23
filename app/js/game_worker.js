'strict mode';
var TAU = Math.PI * 2;
var TIMESCALE = 0.08;
var FRAMETIME = 20;
var WIDTH;
var HEIGHT;

var mouse = {};

onmessage = function(event) {
  var msg = event.data;
  switch (event.data.type) {
    case 'init':
      WIDTH = msg.width;
      HEIGHT = msg.height;
      init();
      break;
		case 'mouse':
			mouse = msg.mouse;
			break;
  }
};

function random(a, b) {
  if (b === undefined) {
    b = a;
    a = 0;
  }
  return Math.random() * (b - a) + a;
}

var types = ['fire', 'air', 'water', 'earth'];

function Atom() {
  this.data = [0,0,0,255],
	this.c = 0,
  this.x = random(WIDTH),
  this.y = random(HEIGHT),
  this.vx = 0;
  this.vy = 0;
  this.heat = 0.1;
  this.r = 4;
  this.type = types[random(4)|0];
}

var atoms = [];
var lastRun;

function init() {
  for (var i = 0; i < 500; i++) {
    atoms.push(new Atom());
  }
  lastRun = Date.now();
  setInterval(tick, FRAMETIME);
}

function tick() {
  var now = Date.now();
  var dt = (now - lastRun) * TIMESCALE;
  lastRun = now;

  var atom;
  for (var i = 0; i < atoms.length; i++) {
    atom = atoms[i];

    // Heat
    var ang = Math.random() * TAU;
    var mag = Math.random() * atom.heat * dt;
    atom.vx += Math.cos(ang) * mag;
    atom.vy += Math.sin(ang) * mag;

    // Friction
    // TODO: Should this create heat?
    atom.vx *= Math.pow(0.99, dt);
    atom.vy *= Math.pow(0.99, dt);

    // Bounce
    var radius = atom.r;
    if (atom.x > WIDTH - radius) {
      atom.vx = -Math.abs(atom.vx);
      atom.x += atom.vx;
    }
    if (atom.x < radius) {
      atom.vx = Math.abs(atom.vx);
      atom.x += atom.vx;
    }
    if (atom.y > HEIGHT - radius) {
      atom.vy = -Math.abs(atom.vy);
      atom.y += atom.vy;
    }
    if (atom.y < radius) {
      atom.vy = Math.abs(atom.vy);
      atom.y += atom.vy;
    }

    // Move
    atom.x += atom.vx * dt;
    atom.y += atom.vy * dt;
		radius = 12;
		if (mouse.x < atom.x + radius && mouse.x > atom.x-radius && mouse.y < atom.y + radius && mouse.y > atom.y-radius) {
			//console.log('match');
			atom.x = mouse.x;
			atom.y = mouse.y;
		}
/*
		else if (Math.abs(atom.x-mouse.x) < 50 && Math.abs(atom.y-mouse.y) < 50) {
			if (mouse.x-atom.x > 0) {
				atom.x--;
			}
			else {
				atom.x++;
			}
		}
		/*
		if (Math.abs(atom.y-mouse.y) < 50) {
			if (mouse.y-atom.y > 0) {
				atom.y--;
			}
			else {
				atom.y++;
			}
		}
*/
		atom.data[0] = Math.abs(atom.vx)*200;
		atom.data[2] = Math.abs(atom.vy)*200;

		if (i > 0 && checkBounds(i)) {
			postMessage({
				type: "hit",
				atom: atom,
			});
    }

		if (i != 1 && checkBounds(i, 1)) {
			atom.c++;
			postMessage({
				type: "hit",
				atom: atom,
				form: "grow",
			});
    }

  }

  uploadAtoms();
}

function checkBounds() {
	var atom0 = atoms[arguments[0]];
	var atom1 = arguments[1] ? atoms[arguments[1]] : atoms[0]; 
	radius = atom0.r;

	if (atom0.x-radius < (atom1.x+radius) && atom0.x+radius > (atom1.x - radius) &&
		atom0.y-radius < (atom1.y+radius) && atom0.y+radius > (atom1.y - radius)) {
		return true;
	}
	return false;
}

function uploadAtoms() {
  postMessage({
    type: 'gameTick',
    atoms: atoms,
  });
}

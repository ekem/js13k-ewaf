'strict mode';
var TAU = Math.PI * 2;
var TIMESCALE = 0.1;
var FRAMETIME = 30;
var WIDTH;
var HEIGHT;

onmessage = function(event) {
  var msg = event.data;
  switch (event.data.type) {
    case 'init':
      WIDTH = msg.width;
      HEIGHT = msg.height;
      init();
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
  this.x = random(WIDTH),
  this.y = random(HEIGHT),
  this.vx = 0;
  this.vy = 0;
  this.heat = 0.1;
  this.r = 7;
  this.type = types[random(4)|0];
}

var atoms = [];
var lastRun;

function init() {
  for (var i = 0; i < 1000; i++) {
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
  }

  uploadAtoms();
}

function uploadAtoms() {
  postMessage({
    type: 'gameTick',
    atoms: atoms,
  });
}

/* globals onmessage: true, postMessage: false */
'use strict';
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
var typeMaxBonds = {
  air: 1,
  earth: 2,
  water: 3,
  fire: 4,
};
function Atom() {
  this.x = random(WIDTH);
  this.y = random(HEIGHT);
  this.vx = random(-1, 1);
  this.vy = random(-1, 1);
  this.heat = 0.1;
  this.r = 7;
  this.type = types[random(4)|0];
  this.bonds = [];
  this.max_bonds = typeMaxBonds[this.type];
}

function Bond(atom1, atom2) {
  this.length = 10;
  this.k = 0.001;
  this.atom1 = atom1;
  this.atom2 = atom2;
  atom1.bonds.push(this);
  atom2.bonds.push(this);
}

var atoms = [];
var bonds = [];
var lastRun;

function init() {
  var NUM_ATOMS = 400;
  var i;
  for (i = 0; i < NUM_ATOMS; i++) {
    atoms.push(new Atom());
  }
  lastRun = Date.now();
  setInterval(tick, FRAMETIME);
}

var E = 1;
var K = 0.9;
var F = 0.998;
var E_MAX_DIST_SQ = Math.pow(E / 0.01, 2);

function tick() {
  var i, j;
  var atom1, atom2, d, f, ang;
  var now = Date.now();
  var dt = (now - lastRun) * TIMESCALE;
  lastRun = now;

  var atom;
  for (i = 0; i < atoms.length; i++) {
    atom = atoms[i];

    // Friction
    atom.vx *= Math.pow(F, dt);
    atom.vy *= Math.pow(F, dt);

    // Move
    atom.x += atom.vx * dt;
    atom.y += atom.vy * dt;

    // Bounce
    var radius = atom.r;
    if (atom.x > WIDTH - radius) {
      atom.vx = -Math.abs(atom.vx) * K;
      atom.x += atom.vx;
    }
    if (atom.x < radius) {
      atom.vx = Math.abs(atom.vx) * K;
      atom.x += atom.vx;
    }
    if (atom.y > HEIGHT - radius) {
      atom.vy = -Math.abs(atom.vy) * K;
      atom.y += atom.vy;
    }
    if (atom.y < radius) {
      atom.vy = Math.abs(atom.vy) * K;
      atom.y += atom.vy;
    }
  }

  var bond;
  for (i = 0; i < bonds.length; i++) {
    bond = bonds[i];
    atom1 = bond.atom1;
    atom2 = bond.atom2;
    d = Math.sqrt(distSq(atom1.x, atom1.y, atom2.x, atom2.y));
    f = -(d - bond.length) * bond.k * dt;
    ang = Math.atan2(atom1.y - atom2.y, atom1.x - atom2.x);
    atom1.vx += Math.cos(ang) * f;
    atom1.vy += Math.sin(ang) * f;
    atom2.vx -= Math.cos(ang) * f;
    atom2.vy -= Math.sin(ang) * f;
  }

  for (i = 0; i < atoms.length - 1; i++) {
    atom1 = atoms[i];
    for (j = i + 1; j < atoms.length; j++) {
      atom2 = atoms[j];
      d = distSq(atom1.x, atom1.y, atom2.x, atom2.y);
      if (d < E_MAX_DIST_SQ) {
        if (d < 1) {
          d = 1;
        }
        f = dt * E / d;
        ang = Math.atan2(atom1.y - atom2.y, atom1.x - atom2.x);
        atom1.vx += Math.cos(ang) * f;
        atom1.vy += Math.sin(ang) * f;
        atom2.vx -= Math.cos(ang) * f;
        atom2.vy -= Math.sin(ang) * f;
      }

      if (d < 50 &&
          Math.random() > 0.9 &&
          atom1.bonds.length < atom1.max_bonds &&
          atom2.bonds.length < atom2.max_bonds) {
        bonds.push(new Bond(atom1, atom2));
      }
    }
  }

  uploadState();
}

function distSq(x1, y1, x2, y2) {
  var dx = x1 - x2;
  var dy = y1 - y2;
  return dx * dx + dy * dy;
}

function uploadState() {
  postMessage({
    type: 'gameTick',
    atoms: atoms,
    bonds: bonds,
  });
}

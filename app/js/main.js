(function() {
  var TAU = Math.PI * 2;
  var canvas = document.querySelector('canvas');
  var ctx = canvas.getContext('2d');

  var atoms = [];

  function random(a, b) {
    if (b === undefined) {
      b = a;
      a = 0;
    }
    return Math.random() * (b - a) + a;
  }

  var types = ['fire', 'air', 'water', 'earth'];
  for (var i = 0; i < 1000; i++) {
    atoms.push({
      // x: random(7, canvas.width - 7),
      // y: random(7, canvas.height - 7),
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      // heat: random(1.0),
      heat: 0.1,
      r: 7,
      type: types[random(4)|0],
    });
  }

  function gameLoop() {
    tick();
    draw();
    requestAnimationFrame(gameLoop);
  }

  function tick() {
    var atom;
    for (var i = 0; i < atoms.length; i++) {
      atom = atoms[i];
      // Heat
      var ang = Math.random() * TAU;
      var mag = Math.random() * atom.heat;
      atom.vx += Math.cos(ang) * mag;
      atom.vy += Math.sin(ang) * mag;

      // Friction
      // TODO: Should this create heat?
      atom.vx *= 0.99;
      atom.vy *= 0.99;

      // Bounce
      var radius = atom.r;
      if (atom.x > canvas.width - radius) {
        atom.vx = -Math.abs(atom.vx);
        atom.x += atom.vx;
      }
      if (atom.x < radius) {
        atom.vx = Math.abs(atom.vx);
        atom.x += atom.vx;
      }
      if (atom.y > canvas.height - radius) {
        atom.vy = -Math.abs(atom.vy);
        atom.y += atom.vy;
      }
      if (atom.y < radius) {
        atom.vy = Math.abs(atom.vy);
        atom.y += atom.vy;
      }

      // Move
      atom.x += atom.vx;
      atom.y += atom.vy;
    }
  }

  var typeColors = {
    fire: '#ef3932',
    water: '#1e26c9',
    air: '#caccf1',
    earth: '#965f32',
  };

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var atom;
    for (var i = 0; i < atoms.length; i++) {
      atom = atoms[i];
      ctx.save();
      ctx.fillStyle = typeColors[atom.type],
      ctx.translate(atom.x, atom.y);
      ctx.beginPath();
      ctx.arc(0, 0, atom.r, 0, TAU);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  gameLoop();
})();

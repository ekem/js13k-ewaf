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

  var sprites = {};
  var typeColors = {
    fire: '#ef3932',
    water: '#1e26c9',
    air: '#caccf1',
    earth: '#965f32',
  };

  types.forEach(function(type) {
    var spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 14;
    spriteCanvas.height = 14;
    var spriteCtx = spriteCanvas.getContext('2d');
    spriteCtx.fillStyle = typeColors[type];
    spriteCtx.beginPath();
    spriteCtx.arc(7, 7, 7, 0, TAU);
    spriteCtx.closePath();
    spriteCtx.fill();
    sprites[type + '7'] = spriteCanvas;
  });

  var gameWorker = new Worker('game_worker.js');
  gameWorker.addEventListener('message', function(event) {
    var msg = event.data;
    switch (msg.type) {
      case 'gameTick':
        atoms = msg.atoms;
        if (!haveDrawn) {
          haveDrawn = true;
          draw()
        }
        break;
    }
  });

  var haveDrawn = false;
  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var atom;
    for (var i = 0; i < atoms.length; i++) {
      atom = atoms[i];
      var sprite = sprites[atom.type + atom.r];
      ctx.drawImage(sprite, atom.x - atom.r, atom.y - atom.r);
    }
    requestAnimationFrame(draw);
  }

  gameWorker.postMessage({type: 'init', width: canvas.width, height: canvas.height});
})();

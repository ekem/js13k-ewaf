(function() {
  var TAU = Math.PI * 2;
  var canvas = document.querySelector('canvas');
  var ctx = canvas.getContext('2d');

  var data = ctx.createImageData(12, 12);

  var mouse = [];

  var atoms = [];
	var hits = [];

	canvas.addEventListener('mousemove', function(e) {
		mouse = getMousePos(canvas, e);
		//console.log(mousePos);
	}, false);

	function getMousePos(canvas, e) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: (e.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
			y: (e.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height
		}
	};
	

	function utf16(text) {
		if (text > 0xFFFF) {
			text -= 0x10000;
			return String.fromCharCode(0xD800 + (text >> 10), 0xDC00 + (text & 0x03FF));
		} 
		else { return String.fromCharCode(text); }
	}

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
    earth: '#669900',
  };

  var typeChar = {
		fire: 0x706b,
		water: 0x6C34,
		air: 0x632C,
		earth: 0x5730,
	};

  types.forEach(function(type) {
    var spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 8;
    spriteCanvas.height = 8;
    var spriteCtx = spriteCanvas.getContext('2d');
    spriteCtx.fillStyle = typeColors[type];
    spriteCtx.beginPath();
    spriteCtx.arc(4, 4, 4, 0, TAU);
    spriteCtx.closePath();
    spriteCtx.fill();
    sprites[type + '4'] = spriteCanvas;
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
			case 'hit':
				hits.push(msg.atom);

				break;
    }
  });

	function hit() {
		
	}

  function drawText(text, size, color, x, y) {
    ctx.fillStyle = color;
    ctx.font = size;
    ctx.fillText(text, x, y);
  }

	function toHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0"+hex:hex;
	}

	function rgb(r,g,b) {
		return "#"+toHex(r)+toHex(g)+toHex(b);
	}

  var haveDrawn = false;
  function draw() {

    ctx.fillStyle = '#101';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var atom;
		if (hits.length > 0) {
			for (var i = 0; i < hits.length; i++) {
				hit = hits[i];
				drawText(utf16(typeChar[hit.type]), "52px sans-serif", rgb(i,
							Math.trunc(random(1,244)), Math.trunc(random(1,244))),
							hit.x, hit.y);
				hits.pop();
			}
		}

    for (var i = 0; i < atoms.length; i++) {
      atom = atoms[i];

      var color = "#FFF";
      switch (i) {
        case 0:
          drawText("\u2620", "32px sans-serif", "#FFF", atoms[i].x, atoms[i].y);
          break;
        case 1:
          drawText("\u262f", "32px sans-serif", "#AAFF88", atoms[i].x, atoms[i].y);
          break;
      }

      for (var o=0; o < data.data.length; o+=4) {
				for (var p=0; p < 4; p++){
					data.data[o+p]=atom.data[p];
				}
      }

      //ctx.putImageData(data, atom.x+4, atom.y);
      drawText(utf16(typeChar[atom.type]), '12px sans-serif', color, atom.x+2, atom.y+12);
			if (atom.c > 0) {
				drawText(utf16(0x2741), (atom.c%124).toString() + 'px sans-serif', "#F"+(random(16)|0).toString(16)+"8", atom.x, atom.y);
			}
      var sprite = sprites[atom.type + atom.r];
      //ctx.drawImage(sprite, atom.x - atom.r, atom.y - atom.r);
      ctx.drawImage(sprite, atom.x - atom.r, atom.y - atom.r);

    }
		//console.log(mouse);
		gameWorker.postMessage({type: 'mouse', mouse : mouse});
    requestAnimationFrame(draw);
  }

  gameWorker.postMessage({type: 'init', width: canvas.width, height: canvas.height});
})();

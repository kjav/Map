var DEFAULT_SEED = 666;

function Map(seed) {
  seed = seed | DEFAULT_SEED;
  InitSimplexNoise(seed);
  this.getChunk = function(x, y) {
    var chunk = [];
    var d = +new Date();
    for (var j=0; j<256; j++) {
      for (var i=0; i < 256; i++) {
        chunk[256 * j + i] = eval(2147483648 + (256*x)/100 + i / 100, 2147483648 + (256*y)/100 + j / 100);
        chunk[256 * j + i] += 1/2 * eval(2147483648 + (256*x)/50 + i / 50, 2147483648 + (256*y)/50 + j / 50);
        chunk[256 * j + i] += 1/4 * eval(2147483648 + (256*x)/25 + i / 25, 2147483648 + (256*y)/25 + j / 25);
        chunk[256 * j + i] += 1/8 * eval(2147483648 + (256*x)/12.5 + i / 12.5, 2147483648 + (256*y)/12.5 + j / 12.5);
        chunk[256 * j + i] += 1/16 * eval(2147483648 + (256*x)/6.25 + i / 6.25, 2147483648 + (256*y)/6.25 + j / 6.25);
        chunk[256 * j + i] += 1/32 * eval(2147483648 + (256*x)/3.125 + i / 3.125, 2147483648 + (256*y)/3.125 + j / 3.125);
        chunk[256 * j + i] += 1/64 * eval(2147483648 + (256*x)/1.6125 + i / 1.6125, 2147483648 + (256*y)/1.6125 + j / 1.6125);
        chunk[256 * j + i] += 1/128 * eval(2147483648 + (256*x)/0.80625 + i / 0.80625, 2147483648 + (256*y)/0.80625 + j / 0.80625);
        chunk[256 * j + i] += 1/256 * eval(2147483648 + (256*x)/0.403125 + i / 0.403125, 2147483648 + (256*y)/0.403215 + j / 0.403215);
        chunk[256 * j + i] = delta(chunk[256 * j + i]);
      }
    }
    console.log("Time taken: " + (+new Date() - d));
    return chunk;
  }
}

var max = 0;
var min = 0;
function delta(x) {
  if (max < x) max = x;
  if (min > x) min = x;

  if (x > 0.4 && x < 0.8) {
    x = 0.4;
  }
  if (x > 0.8) {
    x -= 0.4;
  }
  return x;
}

function drawOnCanvas(map, width, height) {
  var canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.width = 256;
  canvas.height = 256;
  var context = canvas.getContext("2d");
  imageData = context.createImageData(256, 256);
  var chunk = map.getChunk(0, 0);
  function setPixel(imageData, x, y, r, g, b, a) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = r > 255 ? 255: (r < 0 ? 0 : r);
    imageData.data[index+1] = g > 255 ? 255: (g < 0 ? 0 : g);
    imageData.data[index+2] = b > 255 ? 255: (b < 0 ? 0 : b);
    imageData.data[index+3] = a;
  }
  for (var i=0;i<256;i++) {
    for (var j=0;j<256;j++) {
      var x = chunk[256 * j + i];
      if (x > 0.4 && x < 0.9) x = 0.9;
        setPixel(imageData, i, j, x * 255, x * 255, x * 255, 255);
    }
  }
  context.putImageData(imageData, 0, 0);
}

function loadChunk(x, y) {
  var chunk = map.getChunk(x, y);
  var bgeometry = new THREE.PlaneBufferGeometry( 255, 255, 255, 255 );
  for (var i=0; i < 256; i++) {
    for (var j=0; j < 256; j++) {
      bgeometry.attributes.position.array[(j * 256 + i) * 3 + 2] = 80 * chunk[j * 256 + i];
    }
  }
  bgeometry.attributes.position.needsUpdate = true;
  var bplane = new THREE.Mesh( bgeometry, planeMaterial );
  bplane.position.y -= 255 * y;
  bplane.position.x += 255 * x;
  scene.add(bplane);
}

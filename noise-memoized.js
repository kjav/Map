// 66% faster than noise.js!!



var HEIGHT_MAP_RESOLUTION = 256;


function noiseArray(width, height) {
  var result = [];
  for (var i=0;i<width;i++) {
    result[i] = [];
    for (var j=0;j<height;j++) {
      result[i][j] = Math.random();
    }
  }
  return result;
}

function normalize(x) {
  // map from [0,1] to squished [0,1]

  return 4 * (0.125 + Math.pow(x - 0.5, 3));
}

function interpolate(array, width, height, scale) {
  var result = [];

  var p_ix = -1;
  var p_iy = -1;

  var f0, f1, f2, f3;

  var x = 1.5 + 0.5/scale;
  for (var i = 0; i < (width - 4) * scale; i++) {
    y = 1.5 + 0.5 / scale;

    result[i] = [];
    for (var j = 0; j < (height - 4) * scale; j++) {
      var i_x = x | 0;
      var i_y = y | 0;
      var y0,y1,y2,y3;

      if (i_y == p_iy + 1) {
        f0 = f1;
        f1 = f2;
        f2 = f3;

        f3 = cubic(array[i_x - 1][i_y + 2], array[i_x - 0][i_y + 2],
                   array[i_x + 1][i_y + 2], array[i_x + 2][i_y + 2]);

      } else if (i_x != p_ix || i_y != p_iy) {
        f0 = cubic(array[i_x - 1][i_y - 1], array[i_x - 0][i_y - 1],
                   array[i_x + 1][i_y - 1], array[i_x + 2][i_y - 1]);

        f1 = cubic(array[i_x - 1][i_y - 0], array[i_x - 0][i_y - 0],
                   array[i_x + 1][i_y - 0], array[i_x + 2][i_y - 0]);

        f2 = cubic(array[i_x - 1][i_y + 1], array[i_x - 0][i_y + 1],
                   array[i_x + 1][i_y + 1], array[i_x + 2][i_y + 1]);

        f3 = cubic(array[i_x - 1][i_y + 2], array[i_x - 0][i_y + 2],
                   array[i_x + 1][i_y + 2], array[i_x + 2][i_y + 2]);
      }
      p_ix = i_x;
      p_iy = i_y;

      var f = cubic(f0(x - i_x), f1(x - i_x),
                    f2(x - i_x), f3(x - i_x));

      result[i][j] = f(y - i_y);

      y += 1 / scale;
    }
    x += 1 / scale;
  }
  return result;
}

function cubic(y0, y1, y2, y3) {

  var a = (  -y0 + 3*(y1 -   y2)+ y3) / 6;
  var b = (   y0 -  2*y1 +   y2)      / 2;
  var c = (-2*y0 -  3*y1 + 6*y2 - y3) / 6;
  var d =             y1;

  return function(x) {
    return a*x*x*x + b*x*x + c*x + d;
  };
}

function drawArray(array, width, height, offsetx, offsety, x, y, scale) {
  var imageData = context.createImageData(width, height);

  for (var i = 0; i < width - offsetx * 2; i++) {
    for (var j=0; j < height - offsety * 2; j++)  {
      var index = (i + j * width) * 4;
      imageData.data[index+0] = 0 | 256 * array[i+offsetx][j+offsety];
      imageData.data[index+1] = 0 | 256 * array[i+offsetx][j+offsety];
      imageData.data[index+2] = 0 | 256 * array[i+offsetx][j+offsety];
      imageData.data[index+3] = 0 | 256;
    }
  }

  var newCanvas = document.createElement('canvas');
  newCanvas.width = imageData.width;
  newCanvas.height = imageData.height;

  var newContext = newCanvas.getContext("2d");
  newContext.putImageData(imageData, 0, 0);

  context.imageSmoothingEnabled = false;
  context.scale(scale, scale);
  context.drawImage(newCanvas, x, y);
  context.scale(1/scale, 1/scale);
}

function demo(size, scale) {
  context.clearRect(0, 0, 10000, 10000);
  size = Math.pow(2, size);
  scale = Math.pow(2, scale);
  var map = noiseArray(size + 4, size + 4);
  var map2 = interpolate(map, size + 4, size + 4, scale);
  drawArray(map2, size * scale, size * scale, 0, 0, size * scale, 0, 1);
  drawArray(map, size + 4, size + 4, 2, 2, 0, 0, scale);
}

function perlinNoise(n_octaves, size) {
  if (size - n_octaves < 1)
    throw "more octaves than size";

  size = Math.pow(2, size);
  var octaves = [];

  var n = 1;
  for (var i = 0; i < n_octaves; i++) {
    octaves[i] = interpolate(
        noiseArray(
            4 + size / n,
            4 + size / n),
        4 + size / n, 4 + size / n, n);

    n *= 2;
  }

  var r = 0.3;
  var octave = octaves[n_octaves - 1];
  for (var i = n_octaves - 2; i >= 0; i--) {
    octave = sumArraysFactor(r, octave, octaves[i]);
    r /= 2;
  }

  return octave;
}

function map(f, xs) {
  for (var i = 0; i < xs[i]; i++)
    xs[i] = f(xs[i]);
}

function sumArraysFactor(r, a1, a2) {
  for (var i = 0; i < a1.length;i++) {
    for (var j = 0; j < a1[0].length; j++) {
      a1[i][j] += r * (a2[i][j] - 0.5);
    }
  }
  return a1;
}

function LCG(seed) {
  this.next = function() {
    seed = (seed * 713 + 2796203) % 15485863;
    return seed;
  }
}

function Map(seed) {
  console.log('Map');
  var generator = new LCG(seed);
  var octaves = [];
  for (var i=0;i<9;i++) {
    octaves.push(new Simplex());
    octaves[i].InitSimplexNoise(generator.next());
  }
  this.getChunk = function(x, y) {
    console.log('getChunk');
    var chunk = [];
    var d = +new Date();
    for (var j=0; j<256; j++) {
      for (var i=0; i < 256; i++) {
        var index = 256 * j + i;
        chunk[index] = 0;
        var r = 1;
        for (var k=0;k<9;k++) {
          chunk[index] += r * octaves[k].eval(
            2147483648 + (255*x)/(100*r) + i / (100*r),
            2147483648 + (255*y)/(100*r) + j / (100*r)
          );
          r /= 2;
        }
        chunk[index] = delta(chunk[index]);
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

  if (x > 0.24) {
    x = (x - 0.24) / 4 + 0.24;
  }
  if (x > 0.32) {
    x = 0.26;
  }
  return x;
}

var map;

self.addEventListener("message", function(e) {
  var args = e.data;
  if (args.command) {
    switch (args.command) {
      case "init":
        if (args.seed) {
          map = new Map(args.seed);
          postMessage({ success: true, command: "init" });
        } else {
          postMessage({ success: false, err: "No seed provided", command: "init" });
        }
        break;
      case "getChunk":
        if (args.position) {
          var pos = args.position;
          console.log('here');
          var chunk = map.getChunk(pos.x, pos.y);
          console.log('there');
          postMessage({ success: true, command: "getChunk", chunk: chunk });
        } else {
          postMessage({ success: false, err: "No position provided", command: "getChunk" });
        }
    }
  }
}, false);


function Simplex() {
function fastFloor(x) { return 0 | x; }

var perm = [];
var permGradIndex3D = [];

var gradients2D = [
   5,  2,  2,  5,
  -5,  2, -2,  5,
   5, -2,  2, -5,
  -5, -2, -2, -5
];
var gradients3D = [
  -11,  4,  4, -4,  11,  4, -4,  4,  11,
   11,  4,  4,  4,  11,  4,  4,  4,  11,
  -11, -4,  4, -4, -11,  4, -4, -4,  11,
   11, -4,  4,  4, -11,  4,  4, -4,  11,
  -11,  4, -4, -4,  11, -4, -4,  4, -11,
   11,  4, -4,  4,  11, -4,  4,  4, -11,
  -11, -4, -4, -4, -11, -4, -4, -4, -11,
   11, -4, -4,  4, -11, -4,  4, -4, -11,
];

this.InitSimplexNoise = function(seed) {
  var source = [];
  for (i = 0; i < 256; i++) {
    source[i] = i;
  }
  seed = (seed * 713 + 2796203) % 15485863;
  seed = (seed * 713 + 2796203) % 15485863;
  seed = (seed * 713 + 2796203) % 15485863;
  for (var i = 255; i >= 0; i--) {
    seed = (seed * 713 + 2796203) % 15485863;
    var r = (seed + 31) % (i + 1);
    if (r < 0)
      r += (i + 1);
    perm[i] = source[r];
    permGradIndex3D[i] = fastFloor((perm[i] % (gradients3D.length / 3)) * 3);
    source[r] = source[i];
  }
}

function extrapolate(xsb, ysb, dx, dy) {
  var index = perm[(perm[xsb & 0xFF] + ysb) & 0xFF] & 0x0E;
  return gradients2D[index] * dx + gradients2D[index + 1] * dy;
}

var STRETCH_CONSTANT_2D = -0.21132486540518708;    //(1/Math.sqrt(2+1)-1)/2;
var SQUISH_CONSTANT_2D = 0.3660254037844386;      //(Math.sqrt(2+1)-1)/2;
var NORM_CONSTANT_2D = 47;

this.eval = function(x, y) {
  //Place input coordinates onto grid.
  var stretchOffset = (x + y) * STRETCH_CONSTANT_2D;
  var xs = x + stretchOffset;
  var ys = y + stretchOffset;
	
  //Floor to get grid coordinates of rhombus (stretched square) super-cell origin.
  var xsb = fastFloor(xs);
  var ysb = fastFloor(ys);

  //Skew out to get actual coordinates of rhombus origin. We'll need these later.
  var squishOffset = (xsb + ysb) * SQUISH_CONSTANT_2D;
  var xb = xsb + squishOffset;
  var yb = ysb + squishOffset;

  //Compute grid coordinates relative to rhombus origin.
  var xins = xs - xsb;
  var yins = ys - ysb;
		
  //Sum those together to get a value that determines which region we're in.
  var inSum = xins + yins;

  //Positions relative to origin point.
  var dx0 = x - xb;
  var dy0 = y - yb;

  //We'll be defining these inside the next block and using them afterwards.
  var dx_ext, dy_ext;
  var xsv_ext, ysv_ext;

  var value = 0;

  //Contribution (1,0)
  var dx1 = dx0 - 1 - SQUISH_CONSTANT_2D;
  var dy1 = dy0 - 0 - SQUISH_CONSTANT_2D;
  var attn1 = 2 - dx1 * dx1 - dy1 * dy1;
  if (attn1 > 0) {
    attn1 *= attn1;
    value += attn1 * attn1 * extrapolate(xsb + 1, ysb + 0, dx1, dy1);
  }

  //Contribution (0,1)
  var dx2 = dx0 - 0 - SQUISH_CONSTANT_2D;
  var dy2 = dy0 - 1 - SQUISH_CONSTANT_2D;
  var attn2 = 2 - dx2 * dx2 - dy2 * dy2;
  if (attn2 > 0) {
    attn2 *= attn2;
    value += attn2 * attn2 * extrapolate(xsb + 0, ysb + 1, dx2, dy2);
  }

  if (inSum <= 1) { //We're inside the triangle (2-Simplex) at (0,0)
    var zins = 1 - inSum;
    if (zins > xins || zins > yins) { //(0,0) is one of the closest two triangular vertices
      if (xins > yins) {
        xsv_ext = xsb + 1;
        ysv_ext = ysb - 1;
        dx_ext = dx0 - 1;
        dy_ext = dy0 + 1;
      } else {
        xsv_ext = xsb - 1;
        ysv_ext = ysb + 1;
        dx_ext = dx0 + 1;
        dy_ext = dy0 - 1;
      }
    } else { //(1,0) and (0,1) are the closest two vertices.
      xsv_ext = xsb + 1;
      ysv_ext = ysb + 1;
      dx_ext = dx0 - 1 - 2 * SQUISH_CONSTANT_2D;
      dy_ext = dy0 - 1 - 2 * SQUISH_CONSTANT_2D;
    }
  } else { //We're inside the triangle (2-Simplex) at (1,1)
    var zins = 2 - inSum;
    if (zins < xins || zins < yins) { //(0,0) is one of the closest two triangular vertices
      if (xins > yins) {
        xsv_ext = xsb + 2;
        ysv_ext = ysb + 0;
        dx_ext = dx0 - 2 - 2 * SQUISH_CONSTANT_2D;
        dy_ext = dy0 + 0 - 2 * SQUISH_CONSTANT_2D;
      } else {
        xsv_ext = xsb + 0;
        ysv_ext = ysb + 2;
        dx_ext = dx0 + 0 - 2 * SQUISH_CONSTANT_2D;
        dy_ext = dy0 - 2 - 2 * SQUISH_CONSTANT_2D;
      }
    } else { //(1,0) and (0,1) are the closest two vertices.
      dx_ext = dx0;
      dy_ext = dy0;
      xsv_ext = xsb;
      ysv_ext = ysb;
    }
    xsb += 1;
    ysb += 1;
    dx0 = dx0 - 1 - 2 * SQUISH_CONSTANT_2D;
    dy0 = dy0 - 1 - 2 * SQUISH_CONSTANT_2D;
  }

  //Contribution (0,0) or (1,1)
  var attn0 = 2 - dx0 * dx0 - dy0 * dy0;
  if (attn0 > 0) {
    attn0 *= attn0;
    value += attn0 * attn0 * extrapolate(xsb, ysb, dx0, dy0);
  }

  //Extra Vertex
  var attn_ext = 2 - dx_ext * dx_ext - dy_ext * dy_ext;
  if (attn_ext > 0) {
    attn_ext *= attn_ext;
    value += attn_ext * attn_ext * extrapolate(xsv_ext, ysv_ext, dx_ext, dy_ext);
  }

  return value / NORM_CONSTANT_2D;
}
}

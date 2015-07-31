// TODO: 
//     - write correct access function for generateEdges, which stores the same
//       random number twice in adjacent edges and writes edges the same way as
//       generateOctaves

/*

     Format of sides:

     0000000000000011
     0000000000000011
     33            11
     33            11
     33            11
     33            11
     33            11
     3322222222222222
     3322222222222222

     (0 and 2 stored left to right, top to bottom)
     (1 and 3 stored right to left, top to bottom)

*/

var PARAMS = {
  "OCTAVES": 6,
  "SIZE"   : 7
};

function generateChunk(x, y) {
  Math.seedrandom(getSeed(x, y));

  return flatten(perlinNoise(6, 7));
}

// We need edges of the squares 2^(size-1), 2^(size-2), ... 2^(size - octaves)
function generateEdges(x, y) {
  Math.seedrandom(getSeed(x, y));

  var n = Math.pow(2, PARAMS.SIZE + 3) -
          Math.pow(2, PARAMS.SIZE-PARAMS.OCTAVES+4);

  var side = 0;
  var side_counter = 0;
  var current_n = Math.pow(2, PARAMS.SIZE - 1);
  var n_counter = 0;
  var current_pos = 0;
  var half = 0;
  function access(i, x, xs) {
    if (side_counter >= 2 * (current_n - 2)) {
      side++;
      side_counter = 0;
    }

    if (n_counter >= current_n * 8 - 16) {
      current_pos += current_n * 8;
      current_n /= 2;
      n_counter = 0;
      side = 0;
      side_counter = 0;
    }

    if (side < 2) {
      xs[current_pos + 2*side*current_n + side_counter +
         2*(side_counter < current_n - 2 ? 0 : 1)] = x;
    } else {
      xs[current_pos + 2*side*current_n + side_counter +
         2*(side_counter < current_n - 2 ? 0 : 1) + 2] = x;
    }
    // if in one before
    if (side_counter % (current_n - 2) < 2) {
      // put in one before
      if (side == 0) {
        xs[current_pos + 2*((side + 3) % 4)*current_n +
           current_n * (1 - (side_counter % (current_n - 2))) +
           (side_counter < current_n - 2 ? 0 : 1)] = x;
      } else if (side == 1) {
        xs[current_pos + 2*((side + 3) % 4)*current_n +
           current_n - 1 + current_n * (side_counter % (current_n - 2)) -
           (side_counter >= current_n - 2 ? 1 : 0)] = x;
      } else if (side == 2) {
        xs[current_pos + 2*((side + 3) % 4)*current_n +
           current_n - 1 + current_n * (1 - (side_counter % (current_n - 2))) -
           (side_counter < current_n - 2 ? 1 : 0)] = x;
      } else if (side == 3) {
        xs[current_pos + 2*((side + 3) % 4)*current_n +
           current_n * (side_counter % (current_n - 2)) +
           (side_counter >= current_n - 2 ? 0 : 1)] = x
      }
    }

    side_counter++; 
    n_counter++;
  }

  return getAndPlaceRandomNumbers(n, n - 16 * (PARAMS.OCTAVES - 1), access);
}


function generateOctaves(x, y) {
  Math.seedrandom(getSeed(x, y));

  var n = 0;
  for (var i = PARAMS.SIZE - PARAMS.OCTAVES + 1; i <= PARAMS.SIZE; i++) {
    n += Math.pow(2, i*2);
  }

  var sizeOfEdges = Math.pow(2, PARAMS.SIZE + 3) -
      (Math.pow(2, PARAMS.SIZE-PARAMS.OCTAVES+4) + (PARAMS.OCTAVES-1) * 16);
 
  var current_n = Math.pow(2, PARAMS.SIZE - 1);
  var n_counter = 0;
  var side_counter = 0;
  var side = 0;
  var current_pos = Math.pow(2, 2 * PARAMS.SIZE);
  var size_counter = PARAMS.SIZE - 1;
  var line_counter = 0;
  var line = 0;
  var just_started = true;
  var largeSize = Math.pow(2, 2 * PARAMS.SIZE) + sizeOfEdges;
  var current_pointer = 0;
  function access(i, x, xs) {
    if (i < sizeOfEdges) {
      if (n_counter >= current_n * 8 - 16) {
        n_counter = 0;
        current_pos += Math.pow(2, 2 * size_counter--);
        current_n /= 2;
        side = 0;
        side_counter = 0;
      }

      if (side_counter >= current_n * 2 - 4) {
        side_counter = 0;
        side += 1;
      }

      switch (side) {
        case 0:
          if (side_counter < current_n - 2) {
            xs[current_pos + side_counter] = x;
          } else {
            xs[current_pos + side_counter + 2] = x;
          }
          break;
        case 1:
          if (side_counter < current_n - 2) {
            xs[current_pos + current_n * (side_counter + 1) - 1] = x;
          } else {
            xs[current_pos + current_n * ((side_counter % (current_n - 2)) + 1) - 2] = x;
          }
          break;
        case 2:
          if (side_counter < current_n - 2) {
            xs[current_pos + current_n * (current_n - 2) + side_counter + 2] = x;
          } else {
            xs[current_pos + current_n * (current_n - 2) + side_counter + 4] = x;
          }
          break;
        case 3:
          if (side_counter < current_n - 2) {
            xs[current_pos + (side_counter + 2)*current_n + 1] = x;
          } else {
            xs[current_pos + ((side_counter % (current_n - 2)) + 2)*current_n] = x;
          }
          break;
      }

      side_counter++;
      n_counter++;
    } else {
      if (just_started) {
        current_n = Math.pow(2, PARAMS.SIZE - 1);
        current_pos = Math.pow(2, 2 * PARAMS.SIZE) + 2 * current_n + 2;
        n_counter = 0;
        line_counter = 0;
        line = 0;
        just_started = false;
      }

      if (!(i < largeSize)) {

        if (line_counter >= current_n - 4) {
          line++;
          line_counter = 0;
        }

        if (n_counter >= (current_n - 4) * (current_n - 4)) {
          current_pos += current_n * (current_n - 2);
          current_n /= 2;
          current_pos += current_n * 2;
          n_counter = 0;
          line = 0;
          line_counter = 0;
        }

        xs[current_pos + line * current_n + line_counter] = x;

        n_counter++;
        line_counter++;
      } else {
        xs[current_pointer++] = x;
      }
    }
  }
  return getAndPlaceRandomNumbers(n, n, access);
}

var GLOBAL_SEED = 'abcd1234';
function getSeed(x, y) {
  return '' + x + GLOBAL_SEED + y;
}

function getRandomNumbers(n) {
  var numbers = new Float32Array(n);
  for (var i=0;i<n;i++) {
    numbers[i] = Math.random();
  }
  return numbers;
}

function getAndPlaceRandomNumbers(n, m, f) {
  var x = 0;
  var xs = new Float32Array(n);
  for (var i=0; i < m; i++) {
    x = Math.random();
    f(i, x, xs);
  }
  return xs;
}

function interpolate_float32array(octaves) {
  // interpolate into first octave
  

  // give back subarray containing just first octave
  return octaves.subarray(0, Math.pow(2, 2 * PARAMS.SIZE));
}

/*

vec4 cubic(float v)
{
    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
    vec4 s = n * n * n;
    float x = s.x;
    float y = s.y - 4.0 * s.x;
    float z = s.z - 4.0 * s.y + 6.0 * s.x;
    float w = 6.0 - x - y - z;
    return vec4(x, y, z, w);
}

vec4 filter(sampler2D texture, vec2 texcoord, vec2 texscale)
{
    float fx = fract(texcoord.x);
    float fy = fract(texcoord.y);
    texcoord.x -= fx;
    texcoord.y -= fy;

    vec4 xcubic = cubic(fx);
    vec4 ycubic = cubic(fy);

    vec4 c = vec4(texcoord.x - 0.5, texcoord.x + 1.5, texcoord.y -
0.5, texcoord.y + 1.5);
    vec4 s = vec4(xcubic.x + xcubic.y, xcubic.z + xcubic.w, ycubic.x +
ycubic.y, ycubic.z + ycubic.w);
    vec4 offset = c + vec4(xcubic.y, xcubic.w, ycubic.y, ycubic.w) /
s;

    vec4 sample0 = texture2D(texture, vec2(offset.x, offset.z) *
texscale);
    vec4 sample1 = texture2D(texture, vec2(offset.y, offset.z) *
texscale);
    vec4 sample2 = texture2D(texture, vec2(offset.x, offset.w) *
texscale);
    vec4 sample3 = texture2D(texture, vec2(offset.y, offset.w) *
texscale);

    float sx = s.x / (s.x + s.y);
    float sy = s.z / (s.z + s.w);

    return mix(
        mix(sample3, sample2, sx),
        mix(sample1, sample0, sx), sy);
}

*/

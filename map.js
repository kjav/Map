// TODO: 
//     - add a new GetRandomNumbers with a function as a parameter
//       that takes the index of the random number and returns the
//       correct index in the array, and also the number of random
//       numbers to generate
//     - write this function for generateOctaves, storing the first
//       few numbers in edges.
//     - write this function for generateEdges, which stores the same
//       random number twice in adjacent edges

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
  // n = the sum from i = 0 to PARAMS.OCTAVES-1 of 2^i
  // sum from i = 0 to (n-1) of 2^i = 2^n - 1
  // so n = (sum from i = 0 to (PARAMS.SIZE) of 2^i -
  //        (sum from i = 0 to (PARAMS.SIZE-PARAMS.OCTAVES) of 2^i)
  //
  //      = ((2^PARAMS.SIZE+1) - 1) - (2^(PARAMS.SIZE-PARAMS.OCTAVES+1) - 1)
  //      = 2^(PARAMS.SIZE+1) - 2^(PARAMS.SIZE-PARAMS.OCTAVES+1)

  var n = Math.pow(2, PARAMS.SIZE + 3) - 
          Math.pow(2, PARAMS.SIZE-PARAMS.OCTAVES + 4);

  return getRandomNumbers(n);
}

function generateOctaves(x, y) {
  var n = 0;
  for (var i = PARAMS.SIZE - PARAMS.OCTAVES + 1; i <= PARAMS.SIZE; i++) {
    n += Math.pow(2, i*2);
  }
  return getRandomNumbers(n);
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

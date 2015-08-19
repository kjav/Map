var map = new Map(0 | 1000000000 * Math.random());

// set the scene size
var WIDTH = window.innerWidth,
  HEIGHT = window.innerHeight;

// set some camera attributes
var VIEW_ANGLE = 45,
  ASPECT = WIDTH / HEIGHT,
  NEAR = 0.1,
  FAR = 10000;

// create a WebGL renderer, camera
// and a scene
var renderer = new THREE.WebGLRenderer();
var camera =
  new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    ASPECT,
    NEAR,
    FAR);

var controls = new THREE.OrbitControls( camera );
controls.damping = 0.2;

var scene = new THREE.Scene();

// add the camera to the scene
scene.add(camera);

// the camera starts at 0,0,0
// so pull it back
camera.position.z = 300;
camera.position.y = -150;


// start the renderer
renderer.setSize(WIDTH, HEIGHT);

document.body.insertBefore(renderer.domElement, document.body.firstChild);


var planeMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0x44ee22
    });

var waterMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0x0088ff,
      transparent: true,
      opacity: 0.85
    });



function flatten(xxs) {
  for (var i=1;i<xxs.length;i++) {
    xxs[i] = xxs[i-1].concat(xxs[i]);
    xxs[i-1] = 0;
  }
  return xxs[xxs.length - 1];
}


var chunk1 = map.getChunk(0, 0);
var bgeometry = new THREE.PlaneBufferGeometry(255, 255, 255, 255);
for (var i=0;i<256;i++) {
  for (var j=0;j<256;j++) {
    bgeometry.attributes.position.array[(256 * j + i) * 3 + 2] = 80 * chunk1[j * 256 + i];
  }
}
bgeometry.attributes.position.needsUpdate = true;
var bplane = new THREE.Mesh(bgeometry, planeMaterial);
scene.add(bplane);

var bgeometry2 = new THREE.PlaneBufferGeometry( 255, 255, 255, 255 );
var chunk2 = map.getChunk(1, 0);
for (var i=0; i < 256; i++) {
  for (var j=0; j < 256; j++) {
    bgeometry2.attributes.position.array[(j * 256 + i) * 3 + 2] = 80 * chunk2[j * 256 + i];
  }
}
bgeometry2.attributes.position.needsUpdate = true;
var bplane2 = new THREE.Mesh( bgeometry2, planeMaterial );
bplane2.position.x += 255;
scene.add( bplane2 );

var bgeometry3 = new THREE.PlaneBufferGeometry( 255, 255, 255, 255 );
var chunk3 = map.getChunk(0, 1);
for (var i=0; i < 256; i++) {
  for (var j=0; j < 256; j++) {
    bgeometry3.attributes.position.array[(j * 256 + i) * 3 + 2] = 80 * chunk3[j * 256 + i];
  }
}
bgeometry3.attributes.position.needsUpdate = true;
var bplane3 = new THREE.Mesh( bgeometry3, planeMaterial );
bplane3.position.y -= 255;
scene.add( bplane3 );

var bgeometry4 = new THREE.PlaneBufferGeometry( 255, 255, 255, 255 );
var chunk4 = map.getChunk(1, 1);
for (var i=0; i < 256; i++) {
  for (var j=0; j < 256; j++) {
    bgeometry4.attributes.position.array[(j * 256 + i) * 3 + 2] = 80 * chunk4[j * 256 + i];
  }
}
bgeometry4.attributes.position.needsUpdate = true;
var bplane4 = new THREE.Mesh( bgeometry4, planeMaterial );
bplane4.position.y -= 255;
bplane4.position.x += 255;
scene.add( bplane4 );

var watergeometry = new THREE.PlaneBufferGeometry(1200, 1200, 1, 1);
for (var i=0;i<2;i++) {
  for (var j=0;j<2;j++) {
    watergeometry.attributes.position.array[(2 * j + i) * 3 + 2] = 24;
  }
}
watergeometry.attributes.position.needsUpdate = true;
var waterplane = new THREE.Mesh(watergeometry, waterMaterial);
waterplane.position.x += 128;
waterplane.position.y -= 128;
scene.add(waterplane);

// create a point light
var pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 128;
pointLight.position.y = -128;
pointLight.position.z = 180;

// add to the scene
scene.add(pointLight);



function render() {
  renderer.render(scene, camera); 
  controls.update();
  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);

var currChunk = 2;
function addChunk() {
  var chunk1 = map.getChunk(currChunk, 0);
  var bgeometry = new THREE.PlaneBufferGeometry(255, 255, 255, 255);
  for (var i=0;i<256;i++) {
    for (var j=0;j<256;j++) {
      bgeometry.attributes.position.array[(256 * j + i) * 3 + 2] = 80 * chunk1[j * 256 + i];
    }
  }
  bgeometry.attributes.position.needsUpdate = true;
  var bplane = new THREE.Mesh(bgeometry, planeMaterial);
  bplane.position.x = currChunk * 255;
  scene.add(bplane);

  currChunk = 1-currChunk;
  if (currChunk > 0) currChunk++;
}

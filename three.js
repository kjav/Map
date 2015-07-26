Math.seedrandom(123451234);
console.log(Math.random());

// set the scene size
var WIDTH = 400,
  HEIGHT = 300;

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

document.body.appendChild(renderer.domElement);



// create the sphere's material
var planeMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0xCC0000
    });



function flatten(xxs) {
  for (var i=1;i<xxs.length;i++) {
    xxs[i] = xxs[i-1].concat(xxs[i]);
    xxs[i-1] = 0;
  }
  return xxs[xxs.length - 1];
}



var geometry = new THREE.PlaneGeometry( 160, 160, 127, 127 );
var map = flatten(perlinNoise(6, 7));
for (var i=0; i < 128; i++) {
  for (var j=0; j < 128; j++) {
    geometry.vertices[i * 128 + j].z = 80 * map[i * 128 + j];
  }
}
geometry.verticesNeedUpdate = true;
var material = planeMaterial;
var plane = new THREE.Mesh( geometry, material );
scene.add( plane );


// create a point light
var pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 100;
pointLight.position.y = 50;
pointLight.position.z = 120;

// add to the scene
scene.add(pointLight);



setInterval(function() {
  renderer.render(scene, camera); 
  controls.update();
}, 16);

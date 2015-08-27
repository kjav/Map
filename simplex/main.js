var map = new Map(0 | 1000000000 * Math.random());

var loaded = {};

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
  new THREE.ShaderMaterial(
    {
      vertexShader: document.getElementById('vertexshader').innerHTML,
      fragmentShader: document.getElementById('fragmentshader').innerHTML
    });

var waterMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0x0088ff,
      transparent: true,
      opacity: 0.75
    });



function flatten(xxs) {
  for (var i=1;i<xxs.length;i++) {
    xxs[i] = xxs[i-1].concat(xxs[i]);
    xxs[i-1] = 0;
  }
  return xxs[xxs.length - 1];
}


/*var chunk1 = map.getChunk(0, 0);
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
*/

loadChunk(0, 0);
loadChunk(0, 1);
loadChunk(1, 0);
loadChunk(1, 1);

var watergeometry = new THREE.PlaneBufferGeometry(1200, 1200, 100, 100);
for (var i=0;i<100;i++) {
  for (var j=0;j<100;j++) {
    watergeometry.attributes.position.array[(100 * j + i) * 3 + 2] = 18 + Math.sin(i) * 2 + Math.sin(5.1234*i + 0.981234) + Math.sin(19.8234 * j + 0.4) + Math.sin(j + 1.17861234) * 2;
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

function getFrustrumIntersects() {
  var dy = Math.tan(camera.fov * Math.PI/360);
  var dx = ASPECT * dy;

  var vector = new THREE.Vector3(-dx, dy, -1)
  vector.normalize();
  vector.applyQuaternion(camera.quaternion);
  vector.multiplyScalar(camera.position.z / vector.z);
  var pos = camera.position.clone();
  pos.sub(vector)
  var point1 = pos.clone();

  var vector = new THREE.Vector3(dx, dy, -1)
  vector.normalize();
  vector.applyQuaternion(camera.quaternion);
  vector.multiplyScalar(camera.position.z / vector.z);
  var pos = camera.position.clone();
  pos.sub(vector)
  var point2 = pos.clone();

  var vector = new THREE.Vector3(-dx, -dy, -1)
  vector.normalize();
  vector.applyQuaternion(camera.quaternion);
  vector.multiplyScalar(camera.position.z / vector.z);
  var pos = camera.position.clone();
  pos.sub(vector)
  var point3 = pos.clone();

  var vector = new THREE.Vector3(dx, -dy, -1)
  vector.normalize();
  vector.applyQuaternion(camera.quaternion);
  vector.multiplyScalar(camera.position.z / vector.z);
  var pos = camera.position.clone();
  pos.sub(vector)
  var point4 = pos.clone();
  return [point1, point2, point3, point4];
}

function drawFrustrum() {
  var lineMaterial = new THREE.LineBasicMaterial({
    color: 0x99ff00
  });

  var quad = getFrustrumIntersects();

  var rect = { x1: 0, y1: 0, x2: 0, y2: 0};

  rect.x1 = quad[0].x < quad[2].x ? quad[0].x : quad[2].x;
  rect.y1 = quad[0].y > quad[1].y ? quad[0].y : quad[1].y;

  rect.x2 = quad[1].x > quad[3].x ? quad[1].x : quad[3].x;
  rect.y2 = quad[2].y < quad[3].y ? quad[2].y : quad[3].y;

  console.log(rect);

  var geometry1 = new THREE.Geometry();
  geometry1.vertices.push(camera.position.clone());
  geometry1.vertices.push(quad[0]);
  var geometry2 = new THREE.Geometry();
  geometry2.vertices.push(camera.position.clone());
  geometry2.vertices.push(quad[1]);
  var geometry3 = new THREE.Geometry();
  geometry3.vertices.push(camera.position.clone());
  geometry3.vertices.push(quad[2]);
  var geometry4 = new THREE.Geometry();
  geometry4.vertices.push(camera.position.clone());
  geometry4.vertices.push(quad[3]);

  var line1 = new THREE.Line(geometry1, lineMaterial);
  var line2 = new THREE.Line(geometry2, lineMaterial);
  var line3 = new THREE.Line(geometry3, lineMaterial);
  var line4 = new THREE.Line(geometry4, lineMaterial);

  scene.add(line1);
  scene.add(line2);
  scene.add(line3);
  scene.add(line4);
}

function min2(a, b) {
  return a < b ? a : b;
}

function max2(a, b) {
  return a > b ? a : b;
}

function min4(a, b, c, d) {
  var x = min2(a, b);
  var y = min2(c, d);
  return min2(x, y);
}

function max4(a, b, c, d) {
  var x = max2(a, b);
  var y = max2(c, d);
  return max2(x, y);
}

function drawLineOnGround(a, b, colour) {
  colour = colour | 0xff0000;
  var lineMaterial = new THREE.LineBasicMaterial({
    color: colour
  });
  
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(a.x, a.y, 24));
  geometry.vertices.push(new THREE.Vector3(b.x, b.y, 24));

  var line = new THREE.Line(geometry, lineMaterial);

  scene.add(line);
}

function getSplatter() {
  var points = getFrustrumIntersects();

  var minX = min4(points[0].x, points[1].x,
                  points[2].x, points[3].x);

  var maxX = max4(points[0].x, points[1].x,
                  points[2].x, points[3].x);

  var minY = min4(points[0].y, points[1].y,
                  points[2].y, points[3].y);

  var maxY = max4(points[0].y, points[1].y,
                  points[2].y, points[3].y);

  minX = (minX+127.5)/255; maxX = (maxX+127.5)/255; minY = (minY+127.5)/255; maxY = (maxY+127.5)/255;
  minX = minX-1|0; maxX = maxX|0; minY = minY-1|0; maxY = maxY|0;

  var dir1 = { x: points[3].x - points[0].x, y: points[3].y - points[0].y };
  var dir2 = { x: points[2].x - points[1].x, y: points[2].y - points[1].y };

  var xratio = {y: -dir1.y / dir2.y, x: 1/(dir1.x + dir2.x * (-dir1.y / dir2.y))}

  var yratio = {x: -dir1.x / dir2.x, y: 1/(dir1.y + dir2.y * (-dir1.x / dir2.x))};


  for (var i = minX; i <= maxX; i++)
    for (var j = minY; j <= maxY; j++) {
      if (true) {
        // paint red
        console.log(i, j);
        loadChunk(i, j);
        drawLineOnGround({x: -127.5 + 255 * i, y: -127.5 + 255 * j}, {x: -127.5 + 255 * (i+1), y: -127.5 + 255 * j});
        drawLineOnGround({x: -127.5 + 255 * (i+1), y: -127.5 + 255 * j}, {x: -127.5 + 255 * (i+1), y: -127.5 + 255 * (j+1)});
        drawLineOnGround({x: -127.5 + 255 * (i+1), y: -127.5 + 255 * (j+1)}, {x: -127.5 + 255 * i, y: -127.5 + 255 * (j+1)});
        drawLineOnGround({x: -127.5 + 255 * i, y: -127.5 + 255 * (j+1)}, {x: -127.5 + 255 * i, y: -127.5 + 255 * j});
      }
    }





  console.log({
    x: (dir1.x + dir2.x * xratio.y) * xratio.x,
    y: (dir1.y + dir2.y * xratio.y) * xratio.x
  });





  console.log({
    y: (dir1.y + dir2.y * yratio.x) * yratio.y,
    x: (dir1.x + dir2.x * yratio.x) * yratio.y
  });


  console.log('xratio: ', xratio, 'yratio: ', yratio);
}

function loadChunk(x, y) {
  if (!loaded[x + ',' + y]) {
    var chunk = map.getChunk(x, y);
    var bgeometry = new THREE.PlaneBufferGeometry( 255, 255, 255, 255 );
    for (var i=0; i < 256; i++) {
      for (var j=0; j < 256; j++) {
        bgeometry.attributes.position.array[(j * 256 + i) * 3 + 2] = 80 * chunk[j * 256 + i];
      }
    }
    bgeometry.attributes.position.needsUpdate = true;
    bgeometry.computeVertexNormals();
    var bplane = new THREE.Mesh( bgeometry, planeMaterial );
    bplane.position.y -= 255 * y;
    bplane.position.x += 255 * x;
    scene.add(bplane);
    loaded[x + ',' + y] = true;
  }
}


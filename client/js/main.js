var blocks = {
  ' ': 0,
  '#': 1
};
var chunk_size = 16;
var screen_chunks = {};


function get_chunks(chunk_ids, cb) {
  microAjax('http://2.2.2.110:6001?chunk_ids=' + chunk_ids.toString(), function (chunks) {
    cb(JSON.parse(chunks));

  });
}


function add_chunks(chunk_ids) {
  get_chunks(chunk_ids, function (chunks) {

    for (var chunk_id in chunks) {
      var chunk = chunks[chunk_id];
      screen_chunks[chunk_id] = {};

      for (var x in chunk) {
        screen_chunks[chunk_id][x] = {};

        for (var y in chunk[x]) {

          var block_id = chunk[x][y];
          screen_chunks[chunk_id][x][y] = create_block(block_id, {x: parseInt(x), y: parseInt(y)});
        }
      }
    }

  });
}


function delete_chunk(chunk_id) {
  chunk_id = chunk_id;

  var chunk = screen_chunks[chunk_id];
  for (var x in chunk) {
    for (var y in chunk[x]) {
      scene.remove(chunk[x][y]);
    }

  }
  delete screen_chunks[chunk_id];
}


function create_block(block_id, position) {
  if (blocks[block_id]) {
    var geometry = new THREE.BoxGeometry(1,1,2);
    var material = new THREE.MeshLambertMaterial({color: 0x00ff00});

    var block = new THREE.Mesh(geometry, material);
    block.position.x = position.x;
    block.position.y = position.y;
    block.position.z = -.5;

    block.receiveShadow = true;

    scene.add(block);

    return block;
  }
}


function load_chunks() {
  var loaded_chunks = Object.keys(screen_chunks);
  var new_chunks = [];

  var check_x = player.position.x - (half_screen_blocks + chunk_size);
  while (check_x <= player.position.x + (half_screen_blocks + chunk_size)) {
    new_chunks.push((Math.floor(check_x / chunk_size)).toString());
    check_x += chunk_size;
  }

  // Delete old chunks
  for (var key in loaded_chunks) {
    var loaded_chunk_id = loaded_chunks[key];

    if (new_chunks.indexOf(loaded_chunk_id) == -1) {
      delete_chunk(loaded_chunk_id);
    }
  }

  // Load new chunks
  var chunks_to_add = []
  for (var key in new_chunks) {
    var new_chunk_id = new_chunks[key];

    if (loaded_chunks.indexOf(new_chunk_id) == -1) {
      chunks_to_add.push(new_chunk_id.toString());
    }
  }

  if (chunks_to_add.length > 0) {
    add_chunks(chunks_to_add);
  }
}


function create_player(position) {

  var bitmap = new Image();
  bitmap.src = 'world.jpg';
  bitmap.onerror = function () {
    console.error("Error loading: " + bitmap.src);
  }
  var texture = THREE.ImageUtils.loadTexture(bitmap.src);
  var geometry = new THREE.SphereGeometry(.5, 64, 64);
  var material = new THREE.MeshLambertMaterial({map: texture});

  var player = new THREE.Mesh(geometry, material);
  player.position.x = position.x;
  player.position.y = position.y;
  player.position.z = -.5;

  player.castShadow = true;
  player.receiveShadow = true;

  scene.add(player);

  return player;
}


function render() {
  requestAnimationFrame(render);

  if (Math.abs(player.position.x - old_x) >= 1) {
    load_chunks();
    old_x = player.position.x;
  }

  camera.position.x = player.position.x;
  camera.position.y = player.position.y - (cam_dist * Math.tan(cam_rot));

  light.position.x = player.position.x;
  light.target.position.x = player.position.x;
  light.target.position.y = player.position.y;
  light.target.position.z = player.position.z;

  shadow_light.position.x = player.position.x;
  shadow_light.target.position.x = player.position.x;
  shadow_light.target.position.y = player.position.y;
  shadow_light.target.position.z = player.position.z;

  renderer.render(scene, camera);
}


function rad(deg) {
  return deg * Math.PI / 180;
}


var socket = io('http://2.2.2.110:6001');
var scene = new THREE.Scene();

// Camera
var width = window.innerWidth;
var height = window.innerHeight;
var FOV = 30;
var cam_dist = 30;
var cam_rot = -Math.PI / 12;
var H_FOV = 2 * Math.atan(Math.tan(rad(FOV) / 2) * (width / height));
var half_screen_blocks = Math.ceil(cam_dist * Math.tan(H_FOV / 2));

var camera = new THREE.PerspectiveCamera(FOV, width / height, 1, 1000);
camera.position.z = cam_dist;
camera.rotation.x = cam_rot;

// Light
scene.add(new THREE.AmbientLight(0x202020));

var light = new THREE.DirectionalLight(0x404040, 2);
light.position.y = -10;
light.position.z = cam_dist / 3;
scene.add(light);

var shadow_light = new THREE.SpotLight(0x404040, 5, 200);
shadow_light.position.y = 30;
shadow_light.position.z =  0;
shadow_light.castShadow = true;
shadow_light.shadowMapWidth = 1024;
shadow_light.shadowMapHeight = 1024;
shadow_light.shadowCameraNear = 5;
shadow_light.shadowCameraFar = 50;
shadow_light.shadowCameraFov = 30;
scene.add(shadow_light);

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
document.body.appendChild(renderer.domElement);

// Player
var player = create_player({x: 0, y: 15});

// Start
var old_x = 1;
render();

d = .2
setInterval(function () {
  player.position.x += d;
  if (player.position.x < -43) {
    d = .2
  } else if (player.position.x > 42) {
    d = -.2
  }
}, 20);
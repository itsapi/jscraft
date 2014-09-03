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
    var material = new THREE.MeshNormalMaterial({color: 0x00ff00});

    var block = new THREE.Mesh(geometry, material);
    block.position.x = position.x;
    block.position.y = position.y;
    block.position.z = -.5;

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
  var geometry = new THREE.BoxGeometry(1,1,1);
  var material = new THREE.MeshNormalMaterial({color: 0x0000ff});

  var player = new THREE.Mesh(geometry, material);
  player.position.x = position.x;
  player.position.y = position.y;
  player.position.z = -.5;

  scene.add(player);

  return player;
}


function render() {
  requestAnimationFrame(render);

  if (player.position.x != old_x) {
    load_chunks();
  }
  old_x = player.position.x;

  camera.position.x = player.position.x;
  camera.position.y = player.position.y - (cam_dist * Math.tan(cam_rot));

  renderer.render(scene, camera);
}


function rad(deg) {
  return deg * Math.PI / 180;
}


var socket = io('http://2.2.2.110:6001');

var scene = new THREE.Scene();

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

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

var player = create_player({x: 0, y: 15});

var old_x;
render();

setInterval(function () {player.position.x -= 1}, 200);
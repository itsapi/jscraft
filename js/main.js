var server_chunks = {
  '-3': {
    '-48': '###############               ',
    '-47': '##################            ',
    '-46': '###############               ',
    '-45': '################              ',
    '-44': '################              ',
    '-43': '#################             ',
    '-42': '#################             ',
    '-41': '##################            ',
    '-40': '##################            ',
    '-39': '#################             ',
    '-38': '#################             ',
    '-37': '################              ',
    '-36': '################              ',
    '-35': '###############               ',
    '-34': '###############               ',
    '-33': '###############               '
  },
  '-2': {
    '-32': '###############               ',
    '-31': '###############               ',
    '-30': '###############               ',
    '-29': '##############                ',
    '-28': '##############                ',
    '-27': '#############                 ',
    '-26': '#############                 ',
    '-25': '############                  ',
    '-24': '############                  ',
    '-23': '#############                 ',
    '-22': '#############                 ',
    '-21': '##############                ',
    '-20': '##############                ',
    '-19': '###############               ',
    '-18': '###############               ',
    '-17': '###############               '
  },
  '-1': {
    '-16': '###############               ',
    '-15': '###############               ',
    '-14': '###############               ',
    '-13': '################              ',
    '-12': '################              ',
    '-11': '#################             ',
    '-10': '#################             ',
    '-9':  '##################            ',
    '-8':  '##################            ',
    '-7':  '#################             ',
    '-6':  '#################             ',
    '-5':  '################              ',
    '-4':  '################              ',
    '-3':  '###############               ',
    '-2':  '###############               ',
    '-1':  '###############               '
  },
  '0': {
     '0':  '###############               ',
     '1':  '###############               ',
     '2':  '###############               ',
     '3':  '##############                ',
     '4':  '##############                ',
     '5':  '#############                 ',
     '6':  '#############                 ',
     '7':  '############                  ',
     '8':  '############                  ',
     '9':  '#############                 ',
     '10': '#############                 ',
     '11': '##############                ',
     '12': '##############                ',
     '13': '###############               ',
     '14': '###############               ',
     '15': '###############               '
  },
  '1': {
     '16': '###############               ',
     '17': '###############               ',
     '18': '###############               ',
     '19': '################              ',
     '20': '################              ',
     '21': '#################             ',
     '22': '#################             ',
     '23': '##################            ',
     '24': '##################            ',
     '25': '#################             ',
     '26': '#################             ',
     '27': '################              ',
     '28': '################              ',
     '29': '###############               ',
     '30': '###############               ',
     '31': '###############               '
  },
  '2': {
     '32': '###############               ',
     '33': '###############               ',
     '34': '###############               ',
     '35': '##############                ',
     '36': '##############                ',
     '37': '#############                 ',
     '38': '#############                 ',
     '39': '############                  ',
     '40': '############                  ',
     '41': '#############                 ',
     '42': '#############                 ',
     '43': '##############                ',
     '44': '##############                ',
     '45': '###############               ',
     '46': '##################            ',
     '47': '###############               '
  }
}

var blocks = {
  ' ': 0,
  '#': 1
}

var chunk_size = 16;


var chunks = {};


function add_chunk(chunk_id) {
  chunk_id = chunk_id.toString();
  chunks[chunk_id] = {};

  var chunk = server_chunks[chunk_id];
  for (x in chunk) {
    x = x.toString();
    chunks[chunk_id][x] = {};

    for (y in chunk[x]) {
      y = y.toString();

      var block_id = chunk[x][y];
      chunks[chunk_id][x][y] = create_block(block_id, {x: parseInt(x), y: parseInt(y)});
    }

  }
}


function delete_chunk(chunk_id) {
  chunk_id = chunk_id.toString();

  var chunk = chunks[chunk_id];
  for (x in chunk) {
    x = x.toString();

    for (y in chunk[x]) {
      y = y.toString();

      scene.remove(chunk[x][y]);
    }

  }
  delete chunks[chunk_id];
}


function create_block(block_id, position) {
  if (blocks[block_id]) {
    var geometry = new THREE.BoxGeometry(1,1,1);
    var material = new THREE.MeshNormalMaterial({color: 0x00ff00});

    var block = new THREE.Mesh(geometry, material);
    block.position.x = position.x;
    block.position.y = position.y;

    scene.add(block);

    return block;
  }
}


function load_chunks() {
  var loaded_chunks = Object.keys(chunks);
  var new_chunks = [];

  var check_x = player.position.x - (half_screen_blocks + chunk_size);
  while (check_x <= player.position.x + (half_screen_blocks + (chunk_size * .5))) {/////////////////////////////////////
    new_chunks.push(Math.floor(check_x / chunk_size));
    check_x += chunk_size;
  }

  // Delete old chunks
  for (key in loaded_chunks) {
    var loaded_chunk_id = loaded_chunks[key];

    if (new_chunks.indexOf(loaded_chunk_id) == -1) {
      delete_chunk(loaded_chunk_id);
    }
  }
  // Load new chunks
  for (key in new_chunks) {
    var new_chunk_id = new_chunks[key];

    if (loaded_chunks.indexOf(new_chunk_id) == -1) {
      add_chunk(new_chunk_id);
    }
  }
}


function create_player(position) {
  var geometry = new THREE.BoxGeometry(1,1,1);
  var material = new THREE.MeshNormalMaterial({color: 0x0000ff});

  var player = new THREE.Mesh(geometry, material);
  player.position.x = position.x;
  player.position.y = position.y;

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
};


function rad(deg) {
  return deg * Math.PI / 180;
}


var scene = new THREE.Scene();

var width = window.innerWidth;
var height = window.innerHeight;
var FOV = 30;
var cam_dist = 30;
var cam_rot = -Math.PI / 18;
var H_FOV = 2 * Math.atan(Math.tan(rad(FOV) / 2) * (width / height));
var half_screen_blocks = Math.ceil(cam_dist * Math.tan(H_FOV / 2));

var camera = new THREE.PerspectiveCamera(FOV, width / height, 1, 1000);
camera.position.z = cam_dist;
camera.rotation.x = cam_rot;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

var player = create_player({x: 0, y: 15})

var old_x;

render();

setInterval(function () {player.position.x += 1}, 500)
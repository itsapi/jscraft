var app = require('http').createServer(handler),
    io = require('socket.io')(app),
    url = require('url'),
    util = require('util'),
    fs = require('fs'),
    file = new (require('node-static').Server)('./client');


var port = 6001;

function handler(req, res) {
    if (req.method == 'GET') {
        file.serve(req, res, function(err, result) {
            if (err) {
                console.error('Error serving %s - %s', req.url, err.message);
                res.writeHead(err.status, err.headers);
                res.write(util.format('Error: %s - %s', err.status, err.message));
                res.end();
            } else {
                console.log('%s - %s', req.url, res.message); 
            }
        });
    }
}

io.on('connection', function (socket) {
  socket.on('get_chunks', function (data) {
    console.log(data);
    socket.emit('chunks', data);
  });
});

app.listen(port);
console.log('Server running on port', port);

var app = require('http').createServer(handler),
    io = require('socket.io')(app),
    url = require('url'),
    util = require('util'),
    file = new (require('node-static').Server)('./client');


var port = 6001;

function load_chunks(chunk_ids) {
    chunks = {};
    for (var i in chunk_ids) {
        try {
            chunks[chunk_ids[i]] = require('./chunks/' + chunk_ids[i]);
            console.log('Loading chunk', chunk_ids[i]);
        } catch (e) {
            console.log('Chunk %s out of range', chunk_ids[i]);
        }
    }
    return chunks;
}

function handler(req, res) {
    if (req.method == 'GET') {
        chunk_ids  = url.parse(req.url, true).query.chunk_ids;
        if (chunk_ids) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.writeHead(200, {'Content-Type': 'application/json'});
            var data = JSON.stringify(load_chunks(chunk_ids.split(',')));
            res.write(data);
            res.end();
        } else {
            file.serve(req, res, function(err, result) {
                if (err) {
                    console.error('Error serving %s - %s', req.url, err.message);
                    res.writeHead(err.status, err.headers);
                    res.write(util.format('Error: %s - %s', err.status, err.message));
                    res.end();
                } else {
                    console.log('%s - %s', req.url, result.message);
                }
            });
        }
    }
}

io.on('connection', function (socket) {});

app.listen(port);
console.log('Server running on port', port);

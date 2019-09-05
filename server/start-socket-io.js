const port = 3000;

/**
 * most basic implement
 */
const startStandalone = () => {
    console.log('start: standalone');
    const io = require('socket.io')();
    io.on(
        'connection',
        client => {
            console.log('-> connection');

            client.on(
                'disconnect',
                () => {
                    console.log('-> disconnect');
                }
            );

            client.on(
                'event',
                data => {
                    console.log('-> event: ' + JSON.stringify(data));
                    client.emit('server say', 'receive: ' + JSON.stringify(data));
                }
            );

            client.on(
                'event1',
                data => {
                    console.log('-> event1: ' + JSON.stringify(data));
                }
            );
        }
    );
    io.listen(port);
};

const startWithHttp = () => {
    console.log('start: with http');

    const server = require('http').createServer();
    const io = require('socket.io')(server);
    io.on(
        'connection',
        client => {
            console.log('-> connection');

            client.on(
                'event',
                data => {
                    console.log('-> event: ' + JSON.stringify(data));
                }
            );

            client.on(
                'disconnect',
                () => {
                    console.log('-> disconnect');
                }
            );
        });

    server.listen(port);
};

const startWithExpress = () => {
    console.log('start: with express');

    var app = require('express')();
    var http = require('http').createServer(app);
    var io = require('socket.io')(http);

    /**
     * open http://localhost:3000 in browser
     * you can see 'Hello world'
     */


    app.get('/', function (req, res) {
        res.send('<h1>Hello world</h1>');
    });

    io.on(
        'connection', (socket) => {
            console.log('-> connection');

            socket.on('event',
                (data) => {
                    console.log('-> event: ' + JSON.stringify(data));
                }
            );
        }
    );

    http.listen(
        port,
        () => {
            console.log('-> listening on port: ' + port);
        }
    );
};

startStandalone();
// startWithExpress();




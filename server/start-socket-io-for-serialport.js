const SerialPort = require('serialport');

const SP_ACTION = 'SP_ACTION';
const SP_ON_ACTION = 'SP_ON_ACTION';
const SP_ON_ACTION_ILLEGAL = 'SP_ON_ACTION_ILLEGAL';
const SP_ON_ERROR = 'SP_ON_ERROR';

const socketPort = 3000;

const startStandalone = () => {
    const io = require('socket.io')();
    let port = null;

    const isPortOpen = () => {
        return port !== null && port.isOpen;
    };

    io.on(
        'connection',
        socket => {
            console.log('-> connection');

            socket.on(
                'disconnect',
                () => {
                    console.log('-> disconnect');

                    if (isPortOpen()) {
                        port.close((err) => {
                            if (err) {
                                socket.emit(SP_ON_ERROR, {message: err.message});
                            }
                        })
                    }
                }
            );

            socket.on(
                SP_ACTION,
                (data) => {
                    const {type, path, baudRate, buffer, writeIndex} = data;

                    // check legal
                    switch (type) {
                        case 'open':
                            if (isPortOpen()) {
                                socket.emit(SP_ON_ACTION_ILLEGAL, {message: 'Do not re-open'});
                                return;
                            }
                            break;
                        case 'close':
                            if (!isPortOpen()) {
                                socket.emit(SP_ON_ACTION_ILLEGAL, {message: 'No port opened'});
                                return;
                            }
                            break;
                        case 'write':
                            if (!isPortOpen()) {
                                socket.emit(SP_ON_ACTION_ILLEGAL, {message: 'Open first'});
                                return;
                            }
                            break;
                    }

                    switch (type) {
                        case 'list':
                            SerialPort.list((err, ports) => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                                const paths = ports.map(item => {
                                    return item.comName;
                                });
                                socket.emit(SP_ON_ACTION, {type: 'list', paths});
                            });
                            break;
                        case 'open': {
                            port = new SerialPort(path, {baudRate, autoOpen: false});

                            // Open errors will be emitted as an error event
                            port.on('error', (err) => {
                                socket.emit(SP_ON_ERROR, {message: err.message});
                            });

                            port.on('data', (buffer) => {
                                const array = buffer2array(buffer);
                                socket.emit(SP_ON_ACTION, {type: 'data', array});
                            });

                            port.on('close', () => {
                                socket.emit(SP_ON_ACTION, {type: 'close', path});
                            });

                            port.on('open', () => {
                                socket.emit(SP_ON_ACTION, {type: 'open', path});
                            });

                            port.open();
                            break;
                        }
                        case 'close':
                            port.close((err) => {
                                if (err) {
                                    socket.emit(SP_ON_ERROR, {message: err.message});
                                }
                            });
                            break;
                        case 'write':
                            port.write(buffer, (err) => {
                                if (err) {
                                    socket.emit(SP_ON_ERROR, {message: err.message});
                                } else {
                                    socket.emit(SP_ON_ACTION, {type: 'write', writeIndex});
                                }
                            });
                            break;
                        case 'isOpened':
                            if (isPortOpen()) {
                                socket.emit(SP_ON_ACTION, {type: 'isOpened', path: port.path});
                            } else {
                                socket.emit(SP_ON_ACTION, {type: 'isOpened', path: null});
                            }
                            break;

                    }
                }
            );
        }
    );

    io.listen(socketPort);
};

// const buffer2ArrayBuffer = (buffer) => {
//     const arrayBuffer = new ArrayBuffer(buffer.length);
//     const view = new Uint8Array(arrayBuffer);
//     for (let i = 0; i < buffer.length; ++i) {
//         view[i] = buffer[i];
//     }
//     return arrayBuffer;
// };

const buffer2array = (buffer) => {
    const array = [];
    for (let i = 0; i < buffer.length; i++) {
        array.push(buffer[i]);
    }
    return array;
};

startStandalone();


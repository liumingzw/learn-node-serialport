const SerialPort = require('serialport');

const socketPort = 3000;

const baudRate = 230400;
const autoOpen = false;

const SP_LIST_PATHS = 'SP_LIST_PATHS';
const SP_OPEN = 'SP_OPEN';
const SP_CLOSE = 'SP_CLOSE';
const SP_WRITE = 'SP_WRITE';
const SP_IS_OPENED = 'SP_IS_OPENED';

const SP_ON_LIST_PATHS = 'SP_ON_LIST_PATHS';

const SP_ON_OPEN = 'SP_ON_OPEN';
const SP_ON_DATA = 'SP_ON_DATA';
const SP_ON_CLOSE = 'SP_ON_CLOSE';
const SP_ON_ERROR = 'SP_ON_ERROR';
const SP_ON_WRITE = 'SP_ON_WRITE';
const SP_ON_IS_OPENED = 'SP_ON_IS_OPENED';

const SP_ON_ACTION_ILLEGAL = 'SP_ON_ACTION_ILLEGAL';

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
                SP_LIST_PATHS,
                () => {
                    SerialPort.list((err, ports) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const portPaths = ports.map(item => {
                            return item.comName;
                        });
                        socket.emit(SP_ON_LIST_PATHS, portPaths);
                    });
                }
            );

            socket.on(
                SP_IS_OPENED,
                () => {
                    const isOpened = isPortOpen();
                    let path = null;
                    if (isOpened) {
                        path = port.path;
                    }
                    socket.emit(SP_ON_IS_OPENED, {isOpened, path});
                }
            );

            socket.on(
                SP_OPEN,
                (data) => {
                    if (isPortOpen()) {
                        socket.emit(SP_ON_ACTION_ILLEGAL, {message: 'Do not re-open'});
                        return;
                    }

                    const {path} = data;
                    port = new SerialPort(path, {baudRate: baudRate, autoOpen: autoOpen});

                    // Open errors will be emitted as an error event
                    port.on('error', (err) => {
                        socket.emit(SP_ON_ERROR, {message: err.message});
                    });

                    port.on('data', (buffer) => {
                        // console.log('buffer: ', buffer.length)
                        // console.log(Buffer.isBuffer(buffer))
                        const arr = [];
                        for (let i = 0; i < buffer.length; i++) {
                            arr.push(buffer[i]);
                        }
                        // console.log('arr: ' + arr)
                        socket.emit(SP_ON_DATA, arr);
                    });

                    port.on('close', () => {
                        socket.emit(SP_ON_CLOSE, {path});
                    });

                    port.on('open', () => {
                        socket.emit(SP_ON_OPEN, {path});
                    });

                    port.open();
                }
            );

            socket.on(
                SP_CLOSE,
                () => {
                    if (!isPortOpen()) {
                        socket.emit(SP_ON_ACTION_ILLEGAL, {message: 'No port opened'});
                        return;
                    }

                    port.close((err) => {
                        if (err) {
                            socket.emit(SP_ON_ERROR, {message: err.message});
                        }
                    })
                }
            );

            socket.on(
                SP_WRITE,
                (data) => {
                    const {buffer} = data;
                    port.write(buffer, (err) => {
                        if (err) {
                            socket.emit(SP_ON_ERROR, {message: err.message});
                        } else {
                            socket.emit(SP_ON_WRITE);
                        }
                    })
                }
            );
        }
    );

    io.listen(socketPort);
};

startStandalone();


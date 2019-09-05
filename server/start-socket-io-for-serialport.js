const SerialPort = require('serialport');

const socketPort = 3000;

const baudRate = 230400;
const autoOpen = true;

const SP_LIST_NAMES = 'SP_LIST_NAMES';
const SP_OPEN = 'SP_OPEN';
const SP_CLOSE = 'SP_CLOSE';
const SP_WRITE = 'SP_WRITE';

const SP_ON_LIST_NAMES = 'SP_ON_LIST_NAMES';

const SP_ON_OPEN = 'SP_ON_OPEN';
const SP_ON_DATA = 'SP_ON_DATA';
const SP_ON_CLOSE = 'SP_ON_CLOSE';
const SP_ON_ERROR = 'SP_ON_ERROR';
const SP_ON_WRITE = 'SP_ON_WRITE';

const startStandalone = () => {
    const io = require('socket.io')();
    let port = null;

    io.on(
        'connection',
        client => {
            console.log('-> connection');

            client.on(
                'disconnect',
                () => {
                    console.log('-> disconnect');

                    if (port && port.isOpen) {
                        port.close((err) => {
                            if (err) {
                                client.emit(SP_ON_ERROR, {message: err.message});
                            }
                        })
                    }
                }
            );

            client.on(
                SP_LIST_NAMES,
                () => {
                    SerialPort.list((err, ports) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        const portNames = ports.map(item => {
                            return item.comName;
                        });
                        client.emit(SP_ON_LIST_NAMES, portNames);
                    });
                }
            );

            client.on(
                SP_OPEN,
                (data) => {
                    const {name} = data;
                    port = new SerialPort(name, {
                        baudRate: baudRate,
                        autoOpen: autoOpen
                    });

                    // Open errors will be emitted as an error event
                    port.on('error', (err) => {
                        client.emit(SP_ON_ERROR, {message: err.message});
                    });

                    port.on('data', (buffer) => {
                        // console.log('buffer: ', buffer.length)
                        // console.log(Buffer.isBuffer(buffer))
                        const arr = [];
                        for (let i = 0; i < buffer.length; i++){
                            arr.push(buffer[i]);
                        }
                        // console.log('arr: ' + arr)
                        client.emit(SP_ON_DATA, arr);
                    });

                    port.on('close', () => {
                        client.emit(SP_ON_CLOSE, {name});
                    });

                    port.on('open', () => {
                        client.emit(SP_ON_OPEN, {name});
                    });
                }
            );

            client.on(
                SP_CLOSE,
                (data) => {
                    port.close((err) => {
                        if (err) {
                            client.emit(SP_ON_ERROR, {message: err.message});
                        }
                    })
                }
            );

            client.on(
                SP_WRITE,
                (data) => {
                    const {buffer} = data;
                    port.write(buffer, (err) => {
                        if (err) {
                            client.emit(SP_ON_ERROR, {message: err.message});
                        } else {
                            client.emit(SP_ON_WRITE);
                        }
                    })
                }
            );
        }
    );
    io.listen(socketPort);
};

startStandalone();


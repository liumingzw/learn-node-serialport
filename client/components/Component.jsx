import React from 'react';
import io from 'socket.io-client';
import generateCmd from '../lib/generateCmd.js';
import cmdTypes from '../lib/cmdTypes.js';
import ProtocolParser from '../lib/ProtocolParser.js';

import {
    SP_LIST_PATHS,
    SP_OPEN,
    SP_CLOSE,
    SP_WRITE,
    SP_IS_OPENED,

    SP_ON_LIST_PATHS,
    SP_ON_OPEN,
    SP_ON_DATA,
    SP_ON_CLOSE,
    SP_ON_ERROR,
    SP_ON_WRITE,
    SP_ON_IS_OPENED,

    SP_ON_ACTION_ILLEGAL
} from '../../share/SPEventTypes.js';

let colorIndex = 0;
const colors = [
    'red',
    'green',
    'yellow',
    'blue',
    'purple',
    'cyan',
    'orange',
    'white'
];

const spPath = '/dev/tty.wchusbserial1410';

class Component extends React.Component {
    socket = null;
    protocolParser = new ProtocolParser();
    actions = {
        _socketSendData: (event, data) => {
            this.socket.emit(event, data);
        },
        listSerialPortPaths: () => {
            const event = SP_LIST_PATHS;
            this.actions._socketSendData(event);
        },
        openSerialPort: (path) => {
            const event = SP_OPEN;
            path = spPath;
            const data = {path};
            this.actions._socketSendData(event, data);
        },
        closeSerialPort: (path) => {
            const event = SP_CLOSE;
            path = spPath;
            const data = {path};
            this.actions._socketSendData(event, data);
        },
        readFirmwareVersion: () => {
            const event = SP_WRITE;
            const cmdBuffer = generateCmd(cmdTypes.read_firmware_version);
            const data = {buffer: cmdBuffer};
            this.actions._socketSendData(event, data);
        },
        writeMcNameColor: () => {
            const event = SP_WRITE;
            const type = cmdTypes.write_mc_name_color;
            const params = {mc_name: 'test', mc_color: colors[(colorIndex++) % 8]};
            const cmdBuffer = generateCmd(type, params);
            const data = {buffer: cmdBuffer};
            this.actions._socketSendData(event, data);
        },
        readTouchBall: (index) => {
            const event = SP_WRITE;
            const params = {touch_ball_index: index};
            const cmdBuffer = generateCmd(cmdTypes.read_touch_ball, params);
            const data = {buffer: cmdBuffer};
            this.actions._socketSendData(event, data);
        },
        isOpenSerialPort: () => {
            const event = SP_IS_OPENED;
            this.actions._socketSendData(event);
        }
    };

    componentDidMount() {
        this.setupSocket();
        this.setupSerialPortListener();
        this.setupProtocolParserListener();
    }

    setupSocket = () => {
        this.socket = io('http://localhost:3000');
        this.socket.on('connect', () => {
            console.log('socket -> connect')
        });
        this.socket.on('disconnect', () => {
            console.log('socket -> disconnect')
        });
    };

    setupSerialPortListener = () => {
        this.socket.on(SP_ON_LIST_PATHS, (data) => {
            console.log('SP_ON_LIST_PATHS: ' + JSON.stringify(data))
        });
        this.socket.on(SP_ON_OPEN, (data) => {
            console.log('SP_ON_OPEN: ' + JSON.stringify(data))
        });
        this.socket.on(SP_ON_DATA, (arr) => {
            // hex array
            // console.log('SP_ON_DATA: ' + JSON.stringify(arr));
            this.protocolParser.parse(arr)
        });
        this.socket.on(SP_ON_CLOSE, (data) => {
            console.log('SP_ON_CLOSE: ' + JSON.stringify(data))
        });
        this.socket.on(SP_ON_ERROR, (data) => {
            console.log('SP_ON_ERROR: ' + JSON.stringify(data))
        });
        this.socket.on(SP_ON_WRITE, (data) => {
            console.log('SP_ON_WRITE: ')
        });

        this.socket.on(SP_ON_IS_OPENED, (data) => {
            const {isOpened, path} = data;
            console.log('SP_ON_IS_OPENED: ' + JSON.stringify(data))
        });

        this.socket.on(SP_ON_ACTION_ILLEGAL, (data) => {
            const {message} = data;
            console.log('SP_ON_ACTION_ILLEGAL: ' + JSON.stringify(data))
        });
    };

    setupProtocolParserListener = () => {
        this.protocolParser.on(ProtocolParser.onChange, (data) => {
            const {
                firmwareVersion,
                mc_color,
                mc_name,
                mc_name_color_write_succeed,
                touch_ball_index,
                touch_ball_pressed
            } = data;
            console.log('onChange -> ' + JSON.stringify(data))
        })
    };

    render() {
        const actions = this.actions;
        return (
            <div>
                <h2>Learn how to use socket.io and socket.io-client</h2>

                <button onClick={actions.listSerialPortPaths}>
                    listSerialPortPaths
                </button>

                <br/><br/>

                <button onClick={actions.isOpenSerialPort}>
                    isOpenSerialPort
                </button>

                <br/><br/>

                <button onClick={actions.openSerialPort}>
                    openSerialPort
                </button>

                <br/><br/>

                <button onClick={actions.closeSerialPort}>
                    closeSerialPort
                </button>

                <br/><br/>

                <button onClick={actions.readFirmwareVersion}>
                    readFirmwareVersion
                </button>

                <br/><br/>

                <button onClick={actions.writeMcNameColor}>
                    writeMcNameColor
                </button>

                <br/><br/>

                <button onClick={() => {
                    actions.readTouchBall(1)
                }}>
                    readTouchBall 1
                </button>

                <br/><br/>

                <button onClick={() => {
                    actions.readTouchBall(2)
                }}>
                    readTouchBall 2
                </button>
            </div>
        )
    }
}

export default Component;

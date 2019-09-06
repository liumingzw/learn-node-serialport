import React from 'react';
import io from 'socket.io-client';
import generateCmd from '../lib/generateCmd.js';
import cmdTypes from '../lib/cmdTypes.js';
import ProtocolParser from '../lib/ProtocolParser.js';

const SP_ACTION = 'SP_ACTION';
const SP_ON_ACTION = 'SP_ON_ACTION';
const SP_ON_ACTION_ILLEGAL = 'SP_ON_ACTION_ILLEGAL';
const SP_ON_ERROR = 'SP_ON_ERROR';

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
const baudRate = 230400;

let writeIndex = 0;

class Component extends React.Component {
    socket = null;
    protocolParser = new ProtocolParser();
    actions = {
        _socketSendData: (event, data) => {
            this.socket.emit(event, data);
        },
        listSerialPortPaths: () => {
            const data = {type: 'list'};
            this.actions._socketSendData(SP_ACTION, data);
        },
        openSerialPort: (path) => {
            const data = {type: 'open', path, baudRate};
            this.actions._socketSendData(SP_ACTION, data);
        },
        closeSerialPort: (path) => {
            const data = {type: 'close', path};
            this.actions._socketSendData(SP_ACTION, data);
        },
        readFirmwareVersion: () => {
            const buffer = generateCmd(cmdTypes.read_firmware_version);
            const data = {type: 'write', buffer, writeIndex: writeIndex++};
            this.actions._socketSendData(SP_ACTION, data);
        },
        writeMcNameColor: () => {
            const type = cmdTypes.write_mc_name_color;
            const params = {mc_name: 'test', mc_color: colors[(colorIndex++) % 8]};
            const buffer = generateCmd(type, params);
            const data = {type: 'write', buffer, writeIndex: writeIndex++};
            this.actions._socketSendData(SP_ACTION, data);
        },
        readTouchBall: (index) => {
            const params = {touch_ball_index: index};
            const buffer = generateCmd(cmdTypes.read_touch_ball, params);
            const data = {type: 'write', buffer, writeIndex: writeIndex++};
            this.actions._socketSendData(SP_ACTION, data);
        },
        isOpenSerialPort: () => {
            const data = {type: 'isOpened'};
            this.actions._socketSendData(SP_ACTION, data);
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
        this.socket.on(SP_ON_ACTION_ILLEGAL, (data) => {
            console.log(SP_ON_ACTION_ILLEGAL, data.message)
        });

        this.socket.on(SP_ON_ERROR, (data) => {
            console.log(SP_ON_ERROR, data.message)
        });

        this.socket.on(SP_ON_ACTION, (data) => {
            switch (data.type) {
                case 'list':
                    console.log('list', data.paths);
                    break;
                case 'open':
                    console.log('open', data.path);
                    break;
                case 'data':
                    console.log('data', data.array);
                    this.protocolParser.parse(data.array);
                    break;
                case 'close':
                    console.log('close', data.path);
                    break;
                case 'write':
                    console.log('write', data.writeIndex);
                    break;
                case 'isOpened':
                    console.log('isOpened', data.path);
                    break;
            }
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
            console.log('mabot onChange -> ' + JSON.stringify(data))
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

                <button onClick={() => actions.openSerialPort(spPath)}>
                    openSerialPort
                </button>

                <br/><br/>

                <button onClick={() => actions.closeSerialPort(spPath)}>
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

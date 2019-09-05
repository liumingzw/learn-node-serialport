import React from 'react';
import io from 'socket.io-client';
import generateCmd from '../lib/generateCmd.js';
import CmdTypes from '../lib/CmdTypes.js';
import DataParser from '../lib/DataParser4SerialPort.js';

import {
    SP_LIST_NAMES,
    SP_OPEN,
    SP_CLOSE,
    SP_WRITE,
    SP_ON_LIST_NAMES,
    SP_ON_OPEN,
    SP_ON_DATA,
    SP_ON_CLOSE,
    SP_ON_ERROR,
    SP_ON_WRITE
} from '../../serialPortEventTypes.js';

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

let colorIndex = 0;

class Component extends React.Component {
    socket = null;
    dataParser = new DataParser();
    actions = {
        _socketSendData: (event, data) => {
            this.socket.emit(event, data);
        },
        listSerialPortNames: () => {
            const event = SP_LIST_NAMES;
            this.actions._socketSendData(event);
        },
        openSerialPort: (name) => {
            const event = SP_OPEN;
            name = '/dev/tty.wchusbserial1410';
            const data = {name};
            this.actions._socketSendData(event, data);
        },
        closeSerialPort: (name) => {
            const event = SP_CLOSE;
            name = '/dev/tty.wchusbserial1410';
            const data = {name};
            this.actions._socketSendData(event, data);
        },
        readFirmwareVersion: () => {
            const event = SP_WRITE;
            const cmdBuffer = generateCmd(CmdTypes.read_firmware_version);
            const data = {buffer: cmdBuffer};
            this.actions._socketSendData(event, data);
        },
        setMcNameColor: () => {
            const event = SP_WRITE;
            const type = CmdTypes.set_mc_name_color;
            const params = {name: 'test', color: colors[(colorIndex++)%8]};
            const cmdBuffer = generateCmd(type, params);
            const data = {buffer: cmdBuffer}
            this.actions._socketSendData(event, data);
        },
    };

    componentDidMount() {
        this.setupSocket();
        this.setupSerialPortListener();

        this.dataParser.on('firmwareVersion', (firmwareVersion) => {
            console.log('firmwareVersion -> ' + firmwareVersion)
        })
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
        this.socket.on(SP_ON_LIST_NAMES, (data) => {
            console.log('SP_ON_LIST_NAMES: ' + JSON.stringify(data))
        });
        this.socket.on(SP_ON_OPEN, (data) => {
            console.log('SP_ON_OPEN: ' + JSON.stringify(data))
        });
        this.socket.on(SP_ON_DATA, (arr) => {
            // hex array
            console.log('SP_ON_DATA: ' + JSON.stringify(arr));
            this.dataParser.parse(arr)
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
    };

    render() {
        const actions = this.actions;
        return (
            <div>
                <h2>Learn how to use socket.io and socket.io-client</h2>

                <button onClick={actions.listSerialPortNames}>
                    SerialPort:list-names
                </button>

                <br/>

                <button onClick={actions.openSerialPort}>
                    SerialPort:open
                </button>

                <br/>

                <button onClick={actions.closeSerialPort}>
                    SerialPort:close
                </button>

                <br/>

                <button onClick={actions.readFirmwareVersion}>
                    read_firmware_version
                </button>

                <br/>

                <button onClick={actions.setMcNameColor}>
                    set_mc_name_color
                </button>
            </div>
        )
    }
}

export default Component;

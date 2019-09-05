import React from 'react';
import io from 'socket.io-client';

class Component extends React.Component {
    socket = null;
    actions = {
        sendData: (event, data) => {
            this.socket.emit(event, data);
        }
    };

    componentDidMount() {
        console.log('client -> try to connect');

        this.socket = io('http://localhost:3000');

        this.socket.on('connect', () => {
            console.log('client -> connect')
        });

        this.socket.on('disconnect', () => {
            console.log('client -> connect')
        });

        this.socket.on('server say', (data) => {
            console.log('client -> server say: ' + JSON.stringify(data))
        });
    }

    render() {
        const actions = this.actions;
        return (
            <div>
                <h2>Learn how to use socket.io and socket.io-client</h2>
                <button
                    onClick={() => {
                        actions.sendData('event', 'data')
                    }}
                >
                    send event
                </button>
                <br/>
                <button
                    onClick={() => {
                        actions.sendData('event1', 'data1')
                    }}
                >
                    send event1
                </button>
            </div>
        )
    }
}

export default Component;

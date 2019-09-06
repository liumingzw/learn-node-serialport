import events from 'events';
import CmdTypes from './CmdTypes.js';
import protocolEventTypes from '../lib/MabotProtocolParserEventTypes.js';

/**
 * parse the received data from serial port
 * only for mabot
 * the control protocol of mabot(need authority): https://www.yuque.com/cnnpzh/uxtq2p/tux8ow
 */
class MabotProtocolParser4SP extends events.EventEmitter{
    constructor() {
        super();
        this._bufferedArr = [];
    }

    parse(arr) {
        this._bufferedArr = this._bufferedArr.concat(arr);

        const cmdType = this._parseCmdType(this._bufferedArr);
        if (cmdType !== CmdTypes.reply_not_match) {
            this._parseAsType(cmdType, this._bufferedArr);
        }
    }

    _parseCmdType(bufferedArr) {
        const head0 = bufferedArr[0];
        const head1 = bufferedArr[1];

        if (head0 === 0xFF && head1 === 0xEE && bufferedArr.length >=4) {
            return CmdTypes.reply_firmware_version;
        }

        return CmdTypes.reply_not_match;
    }

    _parseAsType(cmdType, bufferedArr) {
        switch (cmdType) {
            case CmdTypes.reply_firmware_version:
                const firmwareVersion = '0' + bufferedArr[3] + '-' + '0' + bufferedArr[2]
                this.emit(protocolEventTypes.firmwareVersion, firmwareVersion);
                break;
        }
    }
}

export default MabotProtocolParser4SP;

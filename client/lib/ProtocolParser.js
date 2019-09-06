import events from 'events';
import Utils from "./Utils";

/**
 * parse the received data from serial port
 * only for mabot
 * the control protocol of mabot(need authority): https://www.yuque.com/cnnpzh/uxtq2p/tux8ow
 */
class ProtocolParser extends events.EventEmitter{
    static onChange = 'onChange';

    constructor() {
        super();
        this.bufferedArr = []; // 数据缓存数组
    }


    // 暂时不考虑丢包的情况，不考虑一帧数据可能多次发送的情况
    parse(arr) {
        this.bufferedArr = this.bufferedArr.concat(arr);
        let buffer = this.bufferedArr;

        // 完整一帧数据至少 4 bytes
        if (buffer.length < 4) {
            return;
        }

        console.log('buffer: ', buffer)
        const head0 = buffer[0];
        const head1 = buffer[1];

        // todo: crc check
        /**
         * 返回的数据格式为：
         * {
         *     firmwareVersion,
         *
         *     mc_color,
         *     mc_name,
         *     mc_name_color_write_succeed,
         *
         *     touch_ball_index,
         *     touch_ball_pressed
         * }
         */
        if (head0 === 0xff && head1 === 0xee) {
            const firmwareVersion = '0' + buffer[3] + '-' + '0' + buffer[2];
            this.emit(ProtocolParser.onChange, {firmwareVersion});
            buffer.splice(0, 6);
            return;
        }

        if (head0 === 0xfb && head1 === 0x02) {
            const mc_color = Utils.byte2color(buffer[2]);
            const nameByteLen = buffer[3];
            // todo: name
            this.emit(ProtocolParser.onChange, {mc_color, mc_name: 'mabot'});
            buffer.splice(0, nameByteLen + 6);
            return;
        }

        if (head0 === 0xfb && head1 === 0x03) {
            const mc_name_color_write_succeed = (buffer[2] === 1);
            this.emit(ProtocolParser.onChange, {mc_name_color_write_succeed});
            buffer.splice(0, 5);
            return;
        }

        if (head0 === 0xb0 && head1 === 0x05) {
            const touch_ball_index = buffer[2];
            const touch_ball_pressed = (buffer[3] === 1);
            this.emit(ProtocolParser.onChange, {touch_ball_index, touch_ball_pressed});
            buffer.splice(0, 6);
            return;
        }
    }
}

export default ProtocolParser;

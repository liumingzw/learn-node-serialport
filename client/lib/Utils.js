const color2Byte = (color) => {
    switch (color) {
        case 'red':
            return 0x01;
        case 'green':
            return 0x02;
        case 'yellow':
            return 0x03;
        case 'blue':
            return 0x04;
        case 'purple':
            return 0x05;
        case 'cyan':
            return 0x06;
        case 'orange':
            return 0x07;
        case 'white':
            return 0x08;
        default:
            throw new Error('Unknown color: ' + color);
    }
};

const byte2color2 = (byte) => {
    switch (byte) {
        case 0x01:
            return 'red';
        case 0x02:
            return 'green';
        case 0x03:
            return 'yellow';
        case 0x04:
            return 'blue';
        case 0x05:
            return 'purple';
        case 0x06:
            return 'cyan';
        case 0x07:
            return 'orange';
        case 0x08:
            return 'white';
        default:
            throw new Error('Unknown color: ' + color);
    }
};

export default {
    color2Byte,
    byte2color2
}

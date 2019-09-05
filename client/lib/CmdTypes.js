/**
 * there 3 kinds of cmd: read, write, replay
 */
const CmdTypes = {
    read_firmware_version : 0,

    set_mc_name_color : 1,

    reply_firmware_version : 100,

    reply_not_match : -1,
};

export default CmdTypes;


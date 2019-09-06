/**
 * there are 2 kinds of sending cmd: read, write
 */
const CmdTypes = {
    read_firmware_version: 1,

    // about firmware upgrade: ignore

    // 略：查询主控昵称和颜色设置状态指令（查询主控是否已经设置了初始名称和颜色）

    read_mc_name_color: 5,

    write_mc_name_color: 7,

    // 略：遥控——自由运动指令 B0 C0
    // 略：四、 Demo 指令

    read_lua_status: 8,

    write_light: 9,

    // 略：单电机灯光设置指令

    read_online_count: 10,

    read_touch_ball: 11
};

export default CmdTypes;


//action
exports.live_message = async (e, s) => {
    const cmdMsg = (e.update_component.message.value).split(' ');
    _getCommand(cmdMsg, s);
} // live_message end


// private 
function _getCommand(msg, sock) {
    switch(msg[0]) {
        case '!노래': case '!리액': case '!리액션': {
            switch(msg[1]) {
                case '인디' : {
                    // !노래 인디를 입력한 경우
                    sock.message(`
                    백아 - 첫사랑\\n백아 - 첫사랑 \\n백아 - 첫사랑 \\n백아 - 첫사랑 \\n백아 - 첫사랑 \\n
                    백아 - 첫사랑\\n백아 - 첫사랑 \\n백아 - 첫사랑 \\n백아 - 첫사랑 \\n백아 - 첫사랑 \\n`);
                } break;
                case '아이돌' : {
                    // !노래 아이돌을 입력한 경우
                    sock.message(`2`);
                } break;
                case undefined : {
                    // !노래, !리액, !리액션을 입력한 경우
                    sock.message(`인디, 아이돌`);
                } break;
            } // swtich end
        } break;
    } // switch end
} // _getCommand() end



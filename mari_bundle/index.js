let chat_cnt = 0;
let target_price = 486;
let price = 0;
let spoonComment = '❤ 김마리 키우기';
let chatting_count = 80;

exports.live_message = async (evt, sock) => {
    const message = evt.update_component.message.value;
    chat_cnt++;
    
    _getSpoonCommand(message, sock, evt);

    if (chat_cnt === chatting_count) {
        sock.message(`${spoonComment} ( ${price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} / ${target_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} )`); 
        chat_cnt = -1;
    }

} // live_message() end

// User Donation
exports.live_present = (evt, sock) => {
    const num = evt.data.amount * evt.data.combo;
    price += num;
} // live_present() end


function _getSpoonCommand(msg, sock, evt) {
    const cmd = msg.split(' ');

    switch(cmd[0]) {
        case '!제목변경' : {
            if (!evt.data.user.is_dj && !sock._live.manager_ids.includes(evt.data.user.id)) {
                return;
            }
            if (cmd[2] != undefined) {
                spoonComment = cmd[1] + ' ' + cmd[2];
            } 
            if (cmd[3] != undefined) {
                spoonComment = cmd[1] + ' ' + cmd[2] + ' ' + cmd[3];
            } 
            if (cmd[4] != undefined) { 
                spoonComment = cmd[1] + ' ' + cmd[2] + ' ' + cmd[3] + ' ' + cmd[4];
            }
           sock.message(`스푼목표 이름이 변경되었습니다.`);
        } break;
        case '!목표스푼' : {
            if (!evt.data.user.is_dj && !sock._live.manager_ids.includes(evt.data.user.id)) {
                return;
            }
            target_price = cmd[1];
            sock.message(`스푼목표금액이 변경되었습니다.`);
        } break;
        case '!현재스푼' : {
            if (!evt.data.user.is_dj && !sock._live.manager_ids.includes(evt.data.user.id)) {
                return;
            }
            price = cmd[1];
            sock.message(`스푼금액이 변경되었습니다.`);
        } break;
        case '!스푼' : {
            sock.message(`${spoonComment} ( ${price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} / ${target_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} )`); 
        } break; 
        case '!채팅수' : {
            if (!evt.data.user.is_dj && !sock._live.manager_ids.includes(evt.data.user.id)) {
                return;
            }
            chatting_count = parseInt(cmd[1]);
            sock.message(`채팅수가 ${cmd[1]}회로 변경되었습니다.`);
        } break; 
    }
} // _getSpoonCommand() end
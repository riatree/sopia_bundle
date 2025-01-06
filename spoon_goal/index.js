const fs = window.require('fs');
const path = window.require('path');

let $base_path = path.join(__dirname, 'data');
if (!fs.existsSync($base_path)) {
    fs.mkdirSync($base_path);
}

let chat_cnt = 0;
let target_price = 1000;
let price = 0;
let chatting_count = 80;
let dj_tag = '';
let flag = true;
let point = 2000;
let goal_count = 1;
let ticket = 2;

exports.live_message = async (evt, sock) => {
    const message = evt.update_component.message.value;
    dj_tag = evt.data.live.author.tag;
    chat_cnt++;
    
    _getSpoonCommand(message, sock, evt);
    load_goal_data(dj_tag);
    var user_data = jsonData.goal_info.find(x => x.tag === dj_tag);
    
    if (user_data == undefined) return;
    
    if (chat_cnt === chatting_count) {
        sock.message(`${user_data.title} ( ${price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} / ${target_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} )`); 
        chat_cnt = -1;
    }
} // live_message() end

// User Donation
exports.live_present = (evt, sock) => {
	const num = evt.data.amount * evt.data.combo;
    price += parseInt(num);
    
    if (price >= target_price && flag) {
        let tag = evt.data.author.tag;
        if (goal_count % 2 != 0) {
            sock.message(`!상점 ${tag} ${point}`);
        } else {
            sock.message(`!복권지급 ${tag} ${ticket}`)
        }
        goal_count++;
        flag = false;
    }


} // live_present() end

function _getSpoonCommand(msg, sock, evt) {
    const cmd = msg.split(' ');
    const tag = evt.data.user.tag;
    dj_tag = evt.data.live.author.tag; 
    
    load_goal_data(dj_tag);
    var user_data = jsonData.goal_info.find(x => x.tag === dj_tag);

    switch(cmd[0]) {
        case '!목표명' : {
            if (!evt.data.user.is_dj && !sock._live.manager_ids.includes(evt.data.user.id) && tag != 'hati_manager' && tag != 'ria_tree') {
                return;
            }

            if (cmd[1] != undefined) {
                user_data.title = cmd[1];
            }
            if (cmd[2] != undefined) {
                user_data.title = cmd[1] + ' ' + cmd[2];
            } 
            if (cmd[3] != undefined) {
                user_data.title = cmd[1] + ' ' + cmd[2] + ' ' + cmd[3];
            } 
            if (cmd[4] != undefined) { 
                user_data.title = cmd[1] + ' ' + cmd[2] + ' ' + cmd[3] + ' ' + cmd[4];
            }
            if (cmd[5] != undefined) { 
                user_data.title = cmd[1] + ' ' + cmd[2] + ' ' + cmd[3] + ' ' + cmd[4] + ' ' + cmd[5];
            }
            save_gaol_data(dj_tag);
           	sock.message(`${user_data.title} ( ${price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} / ${target_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} )`); 
        } break;
        case '!목표스푼' : {
            if (!evt.data.user.is_dj && !sock._live.manager_ids.includes(evt.data.user.id) && tag != 'hati_manager') {
                return;
            }
			if (isNaN(cmd[1])) { sock.message(`숫자만 입력해주세요`); return;}
            target_price = cmd[1];
            flag = true;
            sock.message(`${user_data.title} ( ${price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} / ${target_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} )`); 
        } break;
        case '!현재스푼' : {
            if (!evt.data.user.is_dj && !sock._live.manager_ids.includes(evt.data.user.id) && tag != 'hati_manager' ) {
                return;
            }
			if (isNaN(cmd[1])) { sock.message(`숫자만 입력해주세요`); return;}
            price = parseInt(cmd[1]);
            sock.message(`${user_data.title} ( ${price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} / ${target_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} )`); 
        } break;
        case '!스푼' : {
            sock.message(`${user_data.title} ( ${price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} / ${target_price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} )`); 
        } break; 
        case '!채팅수' : {
            if (!evt.data.user.is_dj && tag != 'hati_manager') {
                return;
            }
			if (isNaN(cmd[1])) { sock.message(`숫자만 입력해주세요`); return;}
            chatting_count = parseInt(cmd[1]);
            sock.message(`채팅수가 ${cmd[1]}회로 변경되었습니다.`);
        } break;
        case '!달성점수' : {
            if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
            if (isNaN(cmd[1])) { sock.message(`숫자만 입력해주세요`); return;}
            user_data.point = parseInt(cmd[1]);
            save_gaol_data(dj_tag);
            sock.message(`달성점수가 ${cmd[1]}점으로 변경되었습니다.`);
        } break;
        case '!달성복권' : {
            if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
            if (isNaN(cmd[1])) { sock.message(`숫자만 입력해주세요`); return;}
            ticket = parseInt(cmd[1]);
            sock.message(`달성복권이 ${cmd[1]}개로 변경되었습니다.`);
        } break;
        
    }
} // _getSpoonCommand() end


//#region [Spoon Goal Data]

function save_gaol_data(file_name) {
    fs.writeFileSync(path.join($base_path, file_name + '.json'), JSON.stringify(jsonData));
}

function load_goal_data(file_name) {
    try {
        jsonData = require(path.join($base_path, file_name + '.json'));
    } catch (e) {
        jsonData = {
            "goal_info": [
                {
                    title : "♥️••𝙎𝙥𝙤𝙤𝙣 달성까지",
                    tag : file_name,
                    point : 2000
                }
            ]
        }
        save_gaol_data(dj_tag);
    } //데이터 파일이 없으면 새로 만들어줍니다.
} //해당방의 유저 데이터를 로드합니다.

//#endregion



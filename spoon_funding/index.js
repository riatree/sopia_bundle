const fs = window.require('fs');
const path = window.require('path');

let $path = __dirname + '\\';
let jsonData = {};
let chatting_count = 80;
let chat_cnt = 0;
let funding_onoff = false;


function load_data() {
    try {
        jsonData = require($path + 'data.json');
    } catch (e) {
        console.log(`data.json 파일이 없습니다.새로 작성합니다.`);
        jsonData = {
            title: '아희 키우기🌱',
            funding: 0,
            max_funding: 10000
        }
        save_data();
    }
}

function save_data() {
    fs.writeFileSync($path + 'data.json', JSON.stringify(jsonData));
}

exports.live_message = (evt, sock) => {
    const message = evt.update_component.message.value;
    const dj_tag = evt.data.live.author.tag;
    const tag = evt.data.user.tag;
    const split_msg = message.split(' ');
    
    chat_cnt++;

    load_data();

    if (funding_onoff) {
        if (chat_cnt === chatting_count) {
            sock.message(`${jsonData.title} : ${jsonData.funding} / ${jsonData.max_funding}`);
            chat_cnt = -1;
        }
    }

    switch(split_msg[0]) {
        case '!펀딩' : {
            if (split_msg[1] == undefined) {
                if (funding_onoff) {
                    sock.message(`${jsonData.title} : ${jsonData.funding} / ${jsonData.max_funding}`);
                } 
            } else if(split_msg[1] === '+' && !isNaN(+split_msg[2])) {
                if (funding_onoff) {
                    if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
    
                    jsonData.funding += (+split_msg[2]);
                    sock.message(`${jsonData.title} : ${jsonData.funding} / ${jsonData.max_funding}`);
                }
            } else if(split_msg[1] === '-' && !isNaN(+split_msg[2])) {
                if (funding_onoff) {
                    if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
                    
                    jsonData.funding -= (+split_msg[2]);
                    sock.message(`${jsonData.title} : ${jsonData.funding} / ${jsonData.max_funding}`);
                }
            } else if (split_msg[1] === '목표' && !isNaN(+split_msg[2]))  {
                if (funding_onoff) {
                    if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
                    
                    jsonData.max_funding  = split_msg[2];
                    sock.message(`${jsonData.title} : ${jsonData.funding} / ${jsonData.max_funding}`);
                }
            } else if (split_msg[1] === '이름') {
                if (funding_onoff) {
                    if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
                    
                    if (split_msg[2] != undefined) {
                        jsonData.title = split_msg[2];
                    } 
                    if (split_msg[3] != undefined) {
                        jsonData.title = split_msg[2] + ' ' + split_msg[3];
                    } 
                    if (split_msg[4] != undefined) { 
                        jsonData.title = split_msg[2] + ' ' + split_msg[3] + ' ' + split_msg[4];
                    }
                    if (split_msg[5] != undefined) { 
                        jsonData.title = split_msg[2] + ' ' + split_msg[3] + ' ' + split_msg[4] + ' ' + split_msg[5];
                    }
    
                    //jsonData.title = split_msg[2];
                    sock.message(`${jsonData.title} : ${jsonData.funding} / ${jsonData.max_funding}`);
                }
            } else if (split_msg[1] === '채팅수') {
                if (funding_onoff) {
                    if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
                    chatting_count = parseInt(split_msg[2]);
                    sock.message(`펀딩 채팅수가 ${split_msg[2]} 회로 변경되었습니다. `);
                }
            } else if (split_msg[1] === 'on') {
                if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
                funding_onoff = true;
                chat_cnt = 0;
                sock.message(`${jsonData.title} : ${jsonData.funding} / ${jsonData.max_funding}`);
            } else if (split_msg[1] === 'off') {
                if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
                funding_onoff = false;
                sock.message(`펀딩기능을 정지합니다.`);
            } else if (split_msg[1] === '초기화') {
                if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != 'ria_tree') return;
                jsonData.funding = 0;
                sock.message(`${jsonData.title} : ${jsonData.funding} / ${jsonData.max_funding}`);
            } else sock.message('📌잘못된 입력입니다.');
        } break;
    }
    save_data();
} // live_message() end

const fs = window.require('fs');
const CfgLite = window.appCfg.__proto__.constructor;
const path = window.require('path');

let $path = path.join(__dirname, 'data');
if (!fs.existsSync($path)) {
    fs.mkdirSync($path);
}

function updateData() {
    const datas = fs.readdirSync(__dirname)
        .filter((item) => item.includes('.json') && item !== 'package.json');
    datas.forEach((data) => fs.renameSync(path.join(__dirname, data), path.join($path, data)));
}
updateData();

function initializeConfig(target) {
    const dir = path.dirname(target);
    const backup = path.join(dir, 'config.bak');
    try {
        new CfgLite(target);
    } catch {
        // Cannot open cfg file. restore backup or create new file
        fs.rmSync(target, { force: true, recursive: true });
        if (fs.existsSync(backup)) {
            // When exists backup file then restore backup.
            // The reason for renameSync rather than copySync is to avoid falling into recursive restoration.
            fs.renameSync(backup, target);
            return initializeConfig(target);
        }
    }

    const cfg = new CfgLite(target);

    // Do create backup file
    fs.writeFileSync(backup, fs.readFileSync(target));

    return cfg;
}
let cfg = initializeConfig(path.join(__dirname, 'config.cfg'));

let last_chat_user = '';
let quiz_Q = [];
let quiz_process = { question: '', answer: '', status: 0 };
let jsonData = {};
let dj_tag = '';
let dj_nickname = '';
let lottoSwitch = false;
let infoSwitch = true;
let chatting_count = 0;
let chatCount = 150;


setInterval(function () {
    if (!cfg.get('list')) return;
    let quiznum = Math.floor(Math.random() * cfg.get('list').length);
    quiz_Q.push(cfg.get('list')[quiznum]);
}, 1000 * 60 * parseInt(cfg.get('options.quiz_itv')));

function cfg_check() {
    let current_cfg = {};
    current_cfg.chatpoint = cfg.get('options.chatpoint') || 1;
    current_cfg.likepoint = cfg.get('options.likepoint') || 10;
    current_cfg.attendpoint = cfg.get('options.attendpoint') || 10;
    current_cfg.lottospoon = cfg.get('options.lottospoon') || 100;
    current_cfg.lottodefpoint = cfg.get('options.lottodefpoint') || 10;
    current_cfg.quiz_enable = cfg.get('options.quiz_enable') || false;
    current_cfg.quiz_itv = cfg.get('options.quiz_itv') || 5;
    current_cfg.quiz_point = cfg.get('options.quiz_point') || 50;
    cfg.set('options', current_cfg);
    cfg.save();
}
async function getAllListeners(liveId) {

    let members = [];
    let req = await $sopia.api.lives.listeners(liveId);
    let res = req.res;
    members = members.concat(req.res.results);
    while (res.next) {
        res = await req.next();
        members = members.concat(res.results);
    }
    return members;
}//현재 방의 접속자를 가져옵니다.

function new_data(new_nick, new_tag) {
    //let now_date = new Date();
    jsonData.user_info.push({
        "nickname": new_nick,
        "tag": new_tag,
        "last_attend": new Date().getTime(),
        "level": 1,
        "point": 0,
        "attend_count": 1,
        "heart_count": 0,
        "chat_count": 0,
        "is_double": false,
        "spoon": [0, 0, 0]
    });
    save_data(dj_tag);
}//새로운 유저 데이터 생성/저장

function save_data(file_name) {
    //fs.writeFileSync($path + file_name + '.json', JSON.stringify(jsonData));

    fs.writeFileSync(path.join($path, file_name + '.json'), JSON.stringify(jsonData));
}//수정된 데이터를 저장

function load_data(file_name) {
    try {
        jsonData = require(path.join($path, file_name + '.json'));
        //jsonData = require(path.join($path, file_name + '.json'));
    } catch (e) {
        console.log(`${file_name}.json 파일이 없습니다.새로 작성합니다.`);
        jsonData = {
            "help_message": "*-* 소피아 팬 정보 관리 *_*\n*_*출석점수는 30분에 한번씩 지급됩니다.\n*_*정보 초기화는 디제이만 가능합니다.",
            "user_info": []
        }
        save_data(dj_tag);
    }//데이터 파일이 없으면 새로 만들어줍니다.
}//해당방의 유저 데이터를 로드합니다.

function level_check(check_tag, sock) {
    var user_data = jsonData.user_info.find(x => x.tag === check_tag);
    if (user_data.point >= (user_data.level * 100)) {
        while (user_data.point >= (user_data.level * 100)) {
            user_data.point -= user_data.level * 100;
            user_data.level++;
            if ((user_data.level % 10) == 0) {
                //sock.message(`${user_data.nickname}님 레벨 ${user_data.level}달성 \\n 복권 한장 지급 합니다.`);
                user_data.spoon[2]++;
            }
        }
        return true;
    } else if (user_data.point < 0) {
        while (user_data.point < 0) {
            if (user_data.level == 1) {
                user_data.point = 0;
            } else {
                user_data.level -= 1;
                user_data.point += user_data.level * 100;
            }
        }

    }
    return false;
}//포인트-레벨 정산

function attend_check(check_tag) {
    var user_data = jsonData.user_info.find(x => x.tag === check_tag);
    let now_date = new Date();
    if (isNaN(+(cfg.get('options.attendpoint')))) {
        console.log('[ERROR] CFG FILE READ ERROR!!!(attendpoint)');
        return;
    }
    if (now_date.getTime() > (user_data.last_attend + (1000 * 60 * 30))) {
        user_data.last_attend = now_date.getTime();
        user_data.point += parseInt(cfg.get('options.attendpoint'));
        user_data.attend_count++;
        return true;
    } else return false;
}

function new_data(new_nick, new_tag) {
    jsonData.user_info.push({
        "nickname": new_nick,
        "tag": new_tag,
        "last_attend": new Date().getTime(),
        "level": 1,
        "point": 0,
        "attend_count": 1,
        "heart_count": 0,
        "chat_count": 0,
        "is_double": false,
        "spoon": [0, 0, 0]
    });
    save_data(dj_tag);
}//새로운 유저 데이터 생성/저장


let user_join_list = [];

// action
// User Join 
exports.live_join = (evt, sock) =>{
    const nickname = evt.data.author.nickname;
    const tag = evt.data.author.tag;
    
    if (user_join_list.length === 0) {
        user_join_list.push(tag);
        sock.message(`가장 빨리 달려 온 ✨${nickname}✨ 입장하십니다!!!♥`);
        sock.message(`!복권지급 ${tag} 2`);
    } else {
        //var revisit = user_join_list.includes(tag);
        var revisit = user_join_list.find(f => f === tag);

        if (revisit) {
            sock.message(`${nickname} 다시 올 줄 알았어, 어디 가지마😮‍💨`);
        } else {
            sock.message(`어서와요, 오늘도 ${nickname} 봐서 좋아!🌼.`);
        }
        
    }
} // _join() end

exports.live_present = (evt, sock) => {
    const num = evt.data.amount * evt.data.combo;
    const tag = evt.data.author.tag;
    cfg_check();
    const lottoperspoon = parseInt(cfg.get('options.lottospoon'));

    var user_data = jsonData.user_info.find(x => x.tag === tag);
    if (user_data.spoon == undefined) {
        let push_data = [0, 0, 0];
        jsonData.user_info.find(x => x.tag === tag).spoon = push_data;
    } else {
        user_data.spoon[0] += num;
        user_data.spoon[1] += num;
        while (user_data.spoon[1] >= lottoperspoon) {
            user_data.spoon[1] -= lottoperspoon;
            user_data.spoon[2]++;
        }
    }
    save_data(dj_tag);

}//스푼이벤트발생시 복권지급 처리

exports.live_like = (evt, sock) => {

    const nick = evt.data.author.nickname;
    const tag = evt.data.author.tag;

    cfg_check();
    let like_point = parseInt(cfg.get('options.likepoint'));

    if (user_data != undefined) {
        user_data.nickname = nick;
    } else if (isNaN(like_point)) {
        console.log('[ERROR] CFG FILE READ ERROR!!!(Likepoint)');
        return;
    }

    var user_data = jsonData.user_info.find(x => x.tag === tag);
    if (user_data == undefined) {
        return;
    } else {
        user_data.point += like_point;

        user_data.heart_count++;
        //if (level_check(tag, sock)) sock.message(`${nick}님 레벨업!!!`);
    }
    save_data(dj_tag);

}//하트 이벤트 발생시 포인트 추가

exports.live_message = (evt, sock) => {
    const live_id = sock._live.id;
    const message = evt.update_component.message.value;
    const term = message.split(' ');
    const nick = evt.data.user.nickname;
    const tag = evt.data.user.tag;
    cfg_check();
    let chat_point = parseInt(cfg.get('options.chatpoint'));
    let lotto_point = parseInt(cfg.get('options.lottodefpoint'));
    let now_date = new Date();
    dj_nickname = evt.data.live.author.nickname;
    dj_tag = evt.data.live.author.tag;

    load_data(dj_tag);

    chatting_count++;

    if (chatting_count === 200) {
        sock.message(`📍 아희 방송이 마음에 든다면 ?\\n프로필 [+ 팬] 누르고 내일도 보기🌸`);
        chatting_count = 1;
    }

    var user_data = jsonData.user_info.find(x => x.tag === tag);

    if (user_data != undefined) {
        user_data.nickname = nick;
    } else if (isNaN(chat_point) || isNaN(lotto_point)) {
        console.log('[ERROR] CFG FILE READ ERROR!!!(Chatpoint)');
        return;
    }

    if (message.startsWith('@') && term.length == 1) {
        if (!sock._live.manager_ids.includes(evt.data.user.id) && !evt.data.user.is_dj) return;

        let find_tag = term[0].replace('@', '');
        var find_data = jsonData.user_info.find(x => x.tag === find_tag);
        if (find_data == undefined) sock.message(`고유닉 ${find_tag}님의 데이터를 찾을 수 없습니다.`);
        else {
            let stack = [];
            stack.push(`${find_data.nickname} (${find_data.level})\\n` + 
                       `[𝙷/𝙲/𝙰] : ${find_data.heart_count} / ${find_data.chat_count} / ${find_data.attend_count}\\n` +
                       `𝑇𝑖𝑐𝑘𝑒𝑡 : ${find_data.spoon[2]}개`);
            print_list(stack , sock);
        }
    }

    if (cfg.get('options.quiz_enable') && quiz_Q.length != 0 && quiz_process.status == 0) {
        quiz_process = {
            question: quiz_Q[quiz_Q.length - 1].question,
            answer: quiz_Q[quiz_Q.length - 1].answer,
            status: 1
        }
        sock.message(`[[[돌발퀴즈]]]\\n${quiz_process.question}`);
        setTimeout(function () {
            if (quiz_process.status != 0) {
                sock.message(`정답자가 없어 아쉽네요\\n답은 ${quiz_process.answer}입니다.`)
                quiz_Q = [];
                quiz_process.status = 0;
            }
        }, 1000 * 10);
    } else if (quiz_process.status == 1) {
        if (message == quiz_process.answer) {
            if (!user_data.point) {
                sock.message(`${nick}님의 정보가 없어 참여가 불가능합니다.`);
                return;
            }
            user_data.point += parseInt(cfg.get('options.quiz_point'));
            sock.message(`정답!\\n ${nick}님 점수 ${cfg.get('options.quiz_point')}점 지급!!`);
            quiz_Q = [];
            quiz_process.status = 0;
        }
    }

    switch (term[0]) {
        case '!복권지급': {
            if (!evt.data.user.is_dj && tag != 'hati_manager' && tag != '5mynzk' && tag != 'ria_tree') {
                sock.message('복권은 디제이만 지급 할 수 있습니다.');
                return;
            } if (term[1] == '전체') {
                let paid_user = '';
                let pay_num = 1;
                if (!isNaN(parseInt(term[2]))) pay_num = parseInt(term[2]);
                getAllListeners(live_id).then(members => {
                    console.log(members);
                    for (i in members) {
                        let find_data = jsonData.user_info.find(x => x.tag === members[i].tag)
                        if (find_data) {
                            find_data.spoon[2] += pay_num;
                            paid_user += '\\n' + find_data.nickname;
                        }
                    }
                    setTimeout(() => {
                        sock.message(`아래 유저에게 ${pay_num}개의 복권 전체 지급`
                            + paid_user);
                    }, 2000);
                })

            } else {
                if (term.length != 3) {
                    sock.message(`사용법 예) !복권지급 [고유닉] [지급갯수]`);
                    return;
                } else if (isNaN(parseInt(term[2]))) {
                    sock.message(`사용법 예) !복권지급 [고유닉] [지급갯수]`);
                    return;
                } else if (jsonData.user_info.find(x => x.tag === term[1]) == undefined) {
                    sock.message(`${term[1]}의 태그를 찾을 수 없습니다.`);
                    return;
                } else {
                    user_data = jsonData.user_info.find(x => x.tag === term[1]);
                    let temp_data = user_data.spoon || [0, 0, 0];
                    temp_data[2] += parseInt(term[2]);
                    user_data.spoon = temp_data;
                    sock.message(`${user_data.nickname}님에게 복권 ${term[2]}장 지급.`);
                    return;
                }
            }
        } break;
        case '!상점': {
            if (!sock._live.manager_ids.includes(evt.data.user.id) && tag != dj_tag && tag != 'hati_manager' && tag != '5mynzk') {
                sock.message('매니저 이상만 가능한 기능입니다.');
                return;
            }
            find_data = jsonData.user_info.find(x => x.tag === term[1]);
            if (find_data == undefined) {
                sock.message(`${term[1]}의 태그를 찾지 못했습니다.`);
            } else {
                let add_point = 100;
                if (!isNaN(parseInt(term[2], 10))) add_point = parseInt(term[2], 10);
                find_data.point += add_point;
                sock.message(`${find_data.nickname}님에게 상점 ${add_point}점 지급`);
            }

        } break;
        case '!고유닉변경': {
            if (!sock._live.manager_ids.includes(evt.data.user.id) && tag != dj_tag && tag != 'hati_manager' && tag != '5mynzk') {
                console.log(sock._live.manager_ids.includes(evt.data.user.id), tag != dj_tag);
                sock.message('매니저 이상만 가능한 기능입니다.');
                return;
            }
            find_data = jsonData.user_info.find(x => x.tag === term[1]);
            if (find_data == undefined) {
                sock.message(`${term[1]}의 태그를 찾지 못했습니다.`);
            } else {
                new_find_data = jsonData.user_info.find(x => x.tag === term[2]);
                if (new_find_data) {
                    sock.message(`고유닉 ${term[2]}의 데이터가 이미 존재합니다.\\n계속 진행을 원하실경우 비워주십시오`);
                    return;
                }
                find_data.tag = term[2];
                sock.message(`${find_data.nickname}님의 고유닉을 ${term[1]}에서 ${term[2]}로 변경하였습니다.`);
            }

        } break;
        case '!내정보': {
            if (infoSwitch) {
                switch (term[1]) {
                    case undefined: {
                        if (user_data == undefined) {
                            sock.message(`❌${nick}님의 정보가 존재하지 않습니다.❌`);
                        } else {
                            let stack = [];
                            stack.push(`ෆ 𝘜𝘴𝘦𝘳 : ${user_data.nickname}\\n` +
                                `ෆ 𝐿𝑒𝑣𝑒𝑙 : ${user_data.level}\\n` + 
                                `ෆ 𝑃𝑜𝑖𝑛𝑡 : ${user_data.point} / ${user_data.level * 100}`);
                            stack.push( `ෆ 𝙷𝙲𝙰 : ${user_data.heart_count} / ${user_data.chat_count} / ${user_data.attend_count}\\n` +
                                `ෆ 𝑇𝑖𝑐𝑘𝑒𝑡 : ${user_data.spoon[2]}개`);
                            print_list(stack , sock);
                        }
                    } break;
                    case '생성': {
                        if (user_data == undefined) {
                            new_data(nick, tag);
                            sock.message(`❃˖DJ : ${dj_nickname} \\n${nick}님의 데이터 생성`);
                        } else {
                            sock.message(`${user_data.nickname}님의 정보가 존재합니다.📝`);
                        }
                    } break;
                    case '삭제':
                    case '제거': {
                        jsonData.user_info.splice(jsonData.user_info.findIndex(item => item.tag === tag), 1)
                        sock.message(`${user_data.nickname}님의 데이터를 제거!!`);
                    } break;
                }
            }
        } break;
        case '!유저정보': {
            switch (term[1]) {
                case '초기화': {
                    if (tag != dj_tag) return;
                    jsonData.user_info = [];
                    sock.message('모든 유저 정보가 삭제되었습니다.');
                } break;
                case '삭제':
                case '제거': {
                    if (!sock._live.manager_ids.includes(evt.data.user.id) && tag != dj_tag&& tag != 'hati_manager' || term.length < 3) return;
                    user_data = jsonData.user_info.find(x => x.tag === term[2]);
                    if (user_data == undefined) {
                        sock.message(`${term[2]}의 정보를 찾을 수 없어요.😭`);
                    } else {
                        let del__nick = user_data.nickname;
                        let del__tag = user_data.tag;
                        jsonData.user_info.splice(jsonData.user_info.findIndex(item => item.tag === del__tag), 1);
                        sock.message(`${del__nick}(${del__tag}) 님의 정보 제거완료✔️`);
                    }
                } break;
            }

        } break;
        case '!랭크': {
            let temp__obj = [];
            for (i in jsonData.user_info) {
                let sort__level = jsonData.user_info[i].level;
                let sort__point = parseInt(jsonData.user_info[i].point) / (parseInt(jsonData.user_info[i].level) * 100)
                sort__level += sort__point;
                sort__level = sort__level.toFixed(2);
                const stack = {
                    nickname: jsonData.user_info[i].nickname,
                    tag: jsonData.user_info[i].tag,
                    chat: jsonData.user_info[i].chat_count,
                    heart: jsonData.user_info[i].heart_count,
                    rankpoint: sort__level,
                }
                temp__obj.push(stack);
            }
            let result_level = temp__obj.sort((a, b) => b.rankpoint - a.rankpoint);
            result_level = result_level.slice(0, 5);
            let stack =[];
            stack.push(`🏆 ${dj_nickname}'s' 𝚁𝚊𝚗𝚔`);
            for (i in result_level) {
                let add = 'ෆ ' + result_level[i].nickname.replace(' ','').replace('ㅤ', '') + ' : ' +result_level[i].rankpoint;
                // + '(' + result_level[i].tag + ')'
                stack.push(add);
            }
            print_list(stack , sock);
        } break;
        case '!이달랭크': case '!이달의랭크': case '!순위':{
            let result_chat = jsonData.user_info.sort((a, b) => b.chat_count - a.chat_count);
            //const chattingKing = '*이달의 채팅왕\\n*' + result_chat[0].nickname + '(' + result_chat[0].chat_count + '회)\\n*' + result_chat[1].nickname + '(' + result_chat[1].chat_count + '회)';
            sock.message(`ෆ 채팅왕\\n🥇 ${result_chat[0].nickname} (${result_chat[0].chat_count}회)\\n` + 
                         `🥈 ${result_chat[1].nickname} (${result_chat[1].chat_count}회)`);
            let result_heart = jsonData.user_info.sort((a, b) => b.heart_count - a.heart_count);
            sock.message(`ෆ 하트왕\\n🥇 ${result_heart[0].nickname} (${result_heart[0].heart_count}번)\\n` + 
                         `🥈 ${result_heart[1].nickname} (${result_heart[1].heart_count}번)`);
            //const haertKing = '*이달의 하트왕\\n*' + result_heart[0].nickname + '(' + result_heart[0].heart_count + '번)\\n*' + result_heart[1].nickname + '(' + result_heart[1].heart_count + '번)';
            
        } break;
        case '!감점': {
            if (!sock._live.manager_ids.includes(evt.data.user.id) && tag != dj_tag && tag != 'hati_manager'|| term.length < 2) return;
            find_data = jsonData.user_info.find(x => x.tag === term[1]);
            if (find_data == undefined) {
                sock.message(`${term[1]}의 태그를 찾지 못했습니다.`);
            } else {
                let add_point = 100;
                if (!isNaN(parseInt(term[2], 10))) add_point = parseInt(term[2], 10);
                find_data.point -= add_point;
                sock.message(`${find_data.nickname}님에게 감점 ${add_point}점 차감`);
                level_check(find_data.tag, sock);
            }

        } break;
        case '!복권': {
            if (!lottoSwitch) {
                let msg_split = message.split(' ');
                if (msg_split.length === 4) {
                    msg_split.shift();
                    let items = [];
                    for (i in msg_split) {
                        if (isNaN(+msg_split[i]) || msg_split[i].length > 1) {
                            sock.message('복권은 0~9 사이의 숫자 세개를 선택하세요\\n(예)!복권 2 5 7');
                            return;
                        } else if (!user_data.spoon[2] || user_data.spoon[2] <= 0) {
                            sock.message(`${nick}님은 보유한 복권이 없습니다.`);
                            return;
                        } else {
                            items.push(+msg_split[i]);
                        }
                    }
                    let rtn = [];
                    let rtn_times = 1;
                    let rtn_point = 0;
                    while (rtn.length < 3) {
                        let rand_0_9 = Math.floor(Math.random() * 10);
                        if (!rtn.includes(rand_0_9)) rtn.push(rand_0_9);
                    }
                    for (i in rtn) {
                        if (items.includes(rtn[i])) {
                            rtn_times = rtn_times * 10;
                            rtn_point++;
                        }
                    }
                    user_data.spoon[2]--;

                    sock.message(`ෆ 𝑅𝑒𝑠𝑢𝑙𝑡 : ${rtn_point} (${rtn.join(' , ')})\\nෆ 𝑃𝑜𝑖𝑛𝑡 : ${rtn_point}`)

                    //sock.message(`[당첨숫자]${rtn.join(' , ')}\\n[당첨결과]${nick}님${rtn_point}개 적중\\n포인트 ${rtn_times * lotto_point}점 지급`);
                    user_data.point += (rtn_times * lotto_point);
                } else if (term[1] == '자동') {
                    let auto_play = user_data.spoon[2];
                    if (term[2] && !isNaN(+term[2])) auto_play = (+term[2]);
                    if (user_data.spoon[2] <= 0 || user_data.spoon[2] < auto_play) {
                        sock.message(`${nick}님은 복권이 부족합니다.`);
                        return;
                    }
                    let items = [0, 1, 2];
                    let res_lotto = [0, 0, 0, 0];
                    let run_count = 0;
                    let get_point = 0;


                    while (auto_play > 0) {
                        let rtn = [];
                        let rtn_times = 1;
                        let rtn_point = 0;

                        while (rtn.length < 3) {
                            let rand_0_9 = Math.floor(Math.random() * 10);
                            if (!rtn.includes(rand_0_9)) rtn.push(rand_0_9);
                        }
                        for (i in rtn) {
                            if (items.includes(rtn[i])) {
                                rtn_times = rtn_times * 10;
                                rtn_point++;
                            }
                        }
                        run_count++;
                        user_data.spoon[2]--;
                        auto_play--;
                        get_point += rtn_times * lotto_point;
                        switch (rtn_point) {
                            case 0: {
                                res_lotto[0]++;
                            } break;
                            case 1: {
                                res_lotto[1]++;
                            } break;
                            case 2: {
                                res_lotto[2]++;
                            } break;
                            case 3: {
                                res_lotto[3]++;
                            } break;
                        }
                    }
                    let stack =[];
                    stack.push(`ෆ 𝑇𝑖𝑐𝑘𝑒𝑡 𝐴𝑢𝑡𝑜\\n🥇 : ${res_lotto[3]} / 🥈 : ${res_lotto[2]} / 🥉 : ${res_lotto[1]} / 💩 : ${res_lotto[0]}\\nෆ 𝑃𝑜𝑖𝑛𝑡 : ${get_point}`);
                    //stack.push(`[자동결과]${nick}님 ${run_count}개 사용\\n🥇3개적중::${res_lotto[3]}회\\n🥈2개적중::${res_lotto[2]}회\\n🥉1개적중::${res_lotto[1]}회\\n🏅0개적중::${res_lotto[0]}회`);
                    //stack.push(`💎포인트 ${get_point}점 지급`);
                    print_list(stack , sock);
                    user_data.point += get_point;
                } else {
                    sock.message('복권은 0~9 사이의 숫자 세개를 선택하세요\\n(예)!복권 2 5 7');
                }
            } else {
                
            }
            
        } break;
        case '!복권양도': {
            if (jsonData.user_info.find(x => x.tag === term[1]) == undefined) {
                sock.message('양도할 유저의 고유닉을 확인하세요');
                return;
            } else if (isNaN(+term[2]) || term[2] == undefined || term[2] <= 0 ) {
                sock.message('Error 복권 갯수를 입력하세요(음수는 지정할 수 없습니다.)');
                return;
            } else {
                find_data = jsonData.user_info.find(x => x.tag === term[1]);
                if (user_data.spoon[2] < +(term[2])) {
                    sock.message('복권의 갯수가 부족합니다.');
                    return;
                }
                find_data.spoon[2] += +(term[2]);
                user_data.spoon[2] -= +(term[2]);
                sock.message(`${user_data.nickname}님의 복권을 ${find_data.nickname}님에게 ${+(term[2])}장 양도 하였습니다.`);
            }
        } break;
        case '!복권off' : {
            if (tag != 'hati_manager') {
                return;
            } 
            lottoSwitch = true;
            sock.message(`복권시스템을 종료합니다.`);
        } break;
        case '!복권on' : {
            if (tag != 'hati_manager') {
                return;
            } 
            lottoSwitch = false;
            sock.message(`복권시스템을 시작합니다.`);
        } break;
        case '!내정보off' : {
            if (tag != 'hati_manager') {
                return;
            } 
            infoSwitch = false;
        } break;
        case '!내정보on' : {
            if (tag != 'hati_manager') {
                return;
            } 
            infoSwitch = true;
        } break;
        default: {
            if (last_chat_user == tag) {
                console.log('연속채팅입니다..');
                return;
            } else {
                last_chat_user = tag;
            }
            if (user_data == undefined) return;
            if (Math.floor(Math.random() * 100 + 1) == 1) {
                user_data.point += (chat_point * 10);
                user_data.chat_count++;
                sock.message(`${nick}님 대박 채팅 포인트 ${chat_point * 10}점 당첨`);
            } else {
                user_data.point += chat_point;
                user_data.chat_count++;
            }
            //if (level_check(tag, sock)) sock.message(`${nick}님 레벨업!!!`);
            //if (attend_check(tag)) sock.message(`${nick}님 출석점수 지급!!!`);
        }
    }

    save_data(dj_tag);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function print_list(array , sock) {
        let print_list = array;
        let print_string='';
        if(print_list.length === 0) return;

        for (i in print_list) {
            let add_list = print_list[i];

            if (print_string.length + add_list.length >= 90) {
                await sock.message(print_string);
                await sleep(20);
                print_string = add_list;
            } else {
                if(i ==0) print_string += add_list;
                else print_string += `\\n` + add_list;
            }
        }
        if(print_string) await sock.message(print_string);
}
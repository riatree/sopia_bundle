const path = window.require('path');
const fs = window.require('fs');
let $path = path.join(__dirname, 'data');
if (!fs.existsSync($path)) {
    fs.mkdirSync($path);
}

let user_join_list = [];

// 전역변수 선언
let chat_cnt = 0, liveDate = 0,
    join_cnt = 0, command_swich = false;

let jsonData = {}, dj_tag = '';

//사용자가 입력할 날짜 
const startDate = '2024-04-18';
const loopCnt = 10;

// 호출함수
_getLiveDate();


// action
// User Join 
// exports.live_join = (evt, sock) =>{
//     const nickname = evt.data.author.nickname;
//     const tag = evt.data.author.tag;
    
//     if (user_join_list.length === 0) {
//         user_join_list.push(tag);
//         sock.message(`가장 빨리 달려 온 ✨${nickname}✨ 입장하십니다!!!♥`);
//         sock.message(`!복권지급 ${tag} 2`);
//     } else {
//         //var revisit = user_join_list.includes(tag);
//         var revisit = user_join_list.find(f => f === tag);

//         if (revisit) {
//             sock.message(`${nickname} 다시 올 줄 알았어, 어디 가지마😮‍💨`);
//         } else {
//             sock.message(`어서와요, 오늘도 ${nickname} 봐서 좋아!🌼.`);
//         }
        
//     }
    

    
    

//     //sock.message(user_join_list.length);
// } // _join() end

// User Chatting
exports.live_message = async (evt, sock) => {
    const message = evt.update_component.message.value;
    const cmd = message.split(' ');
    //const index = 1;
    //dj_tag = evt.data.live.author.tag;

    //_loadFundingData(dj_tag);
    //var fundingData = jsonData.funding_info.find(f => f.index === index);

    _getCommand(cmd, sock);
    chat_cnt++;
    

    if (chat_cnt === loopCnt) {
        //sock.message(`방송 : ${liveDate}일 째`);
        chat_cnt = 0;
    }
}

// User Donation
exports.live_present = (evt, sock) => {}

// User Like
exports.live_like = (evt, sock) =>{}



//private 
function _getLiveDate() {
    const liveStartDateTime = new Date(startDate).getTime();
    const toDate = new Date().getTime();
    liveDate = Math.ceil(Math.abs((liveStartDateTime - toDate) / (1000 * 60 * 60 * 24)));
} // _getLiveDate() end

function _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
} //_delay() end

async function _getCommand(commandMessage, sock) {
    switch(commandMessage[0]) {
        case '!방송일수' :
        case '!디데이' : {
            sock.message(`방송 : ${liveDate}일 째`);
            chat_cnt = 0;
        } break;
        case '!카운트' : {
            // DJ 및 지정유저만 가능
            // 시간 입력 시 시간 표시
            sock.message('-------Start-------');
            await _delay(3000);
            sock.message('--------End--------');
        } break;
        case '!노래' : case '!리액' : case '!리액션' : {
            switch(commandMessage[1]) {
                case '인디' : {
                    sock.message(`
                    `);
                } break;
                case '아이돌' : {
                    sock.message(`
                    `);
                } break;
                case undefined : {
                    sock.message(`인디, 아이돌`);
                }
            } // switch() end
        } break;
        case '!펀딩' : {
            switch(commandMessage[1]) {
                case undefined : {

                } break;
            }
        } break;
        case '!3초' : {
            sock.message('-------1초-------');
            await _delay(1300);
            sock.message('-------2초-------');
            await _delay(1500);
            sock.message('-------3초-------');
        } break;
        
    }
    
} // _getCommand() end

async function fncSoundPlay(second, soundName){
	var audio = new Audio(path.join(__dirname, 'sounds', soundName));
	audio.load();
	audio.volume = 1;
	await delay(second);

    audio.play();
} // fncSoundPlay() end

function _newFundingData(name, index) {
    jsonData.funding_info.push({
        "name" : name,
        "index" : 1,
        "fundingIndex" : index,
        "price" : 0,
        "targetPrice" : 100,
        "isGoal" : false,
        "funding_startDate" : new Date().getTime()
    });
} // new_funding() end

function _saveFundingData(fileName) {
    fs.writeFileSync(path.join($path, fileName + '.json'), JSON.stringify(jsonData));
} // save_data() end

function _loadFundingData(fileName) {
    try {
        jsonData = require(path.join($path, fileName + '.json'));
    } catch (e) {
        jsonData = {
            "funding_info": []
        }
        _saveFundingData(dj_tag);
    } // try ~ catch () end 
} //_loadFundingData() end


function _newJoinUser(nickname, tag) {
    joinList.join_info.push({
        "nickname": nickname,
        "tag" : tag
    });
} // _newJoinUser() end 
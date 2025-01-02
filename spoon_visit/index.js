const fs = window.require('fs');

let user_join_list = [];

// action
// User Join 
exports.live_join = (evt, sock) =>{
    const nickname = evt.data.author.nickname;
    const tag = evt.data.author.tag;
    
    if (user_join_list.length === 0) {
        user_join_list.push(tag);
        //sock.message(`가장 빨리 달려 온 ✨${nickname}✨ 입장하십니다!!!♥`);
        sock.message(`어서와요, 오늘도 ${nickname} 봐서 좋아!🌼`);
    } else {
        //var revisit = user_join_list.includes(tag);
        var revisit = user_join_list.find(f => f === tag);

        if (revisit) {
            sock.message(`${nickname} 다시 올 줄 알았어, 어디 가지마😮‍💨`);
            //ㅇㅇ님 다시 와줘서 고마워요🩵 여기 있어주세요 :D
        } else {
			user_join_list.push(tag);
            sock.message(`어서와요, 오늘도 ${nickname} 봐서 좋아!🌼`);
            //ㅇㅇ님 어서와요💗 잠시 스치는 인연이 아니었으면 해요.
        }
        
    }
} // _join() end

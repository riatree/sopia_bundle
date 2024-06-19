let user_join_list = [];
let join_command = `어서와요, ${nickname}시 반가워요`;


//action
//User Join 
exports.live_join = (evt, sock) =>{
    const nickname = evt.data.author.nickname;
    const tag = evt.data.author.tag;
    
    if (user_join_list.length === 0) {
        user_join_list.push(tag);
        sock.message(`어서와요, ${nickname}시 반가워요`);
        //sock.message(`가장 빨리 달려 온 ✨${nickname}✨ 입장하십니다!!!♥`);
        //sock.message(`!복권지급 ${tag} 2`);
    } else {
        var revisit = user_join_list.find(f => f === tag);
        
        if (revisit) {
            sock.message(`${nickname}시 다시 어서오세요`);
        } else {
            user_join_list.push(tag);
            //sock.message(`어서와요, 오늘도 ${nickname} 봐서 좋아!🌼.`);
            sock.message(`어서와요, ${nickname}시 반가워요`);
        }
    }
} // live_join() end

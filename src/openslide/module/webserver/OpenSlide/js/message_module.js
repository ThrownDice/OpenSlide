/**
 * Created by Administrator on 2014-08-26.
 *
 * 클라이언트쪽 멧시지 모듈임
 *
 * 할일 : 온라인된 유저목록 관리 및 채팅창 관리
 */

var MessageModule = (function(){
    function MessageModule(eb, body, user_list_ele, session_id) {
        this.eb = eb; // 이벤트버스를 받아옴
        this.body = body; // 채팅창을 열 body 엘리먼트를 가져옴
        this.user_list_ele = user_list_ele; // 유저리스트를 띄울 엘리먼트
        this.session_id = session_id;

        this.UserListManager = new UserListManager(this.user_list_ele, this);
        this.ChatManager = new ChatManager(eb, body);

        this.myInfo = {}
    }

    MessageModule.prototype.newUser = function(data) {
        this.UserListManager.newUser(data);
    };

    MessageModule.prototype.setMyInfo = function(message) {
        this.myInfo = message;
        delete this.myInfo.action;
        this.ChatManager.my_info = this.myInfo;
    };

    MessageModule.prototype.userList = function(datas) {
        for (var i = 0; i < datas.length; i++) {
            this.UserListManager.newUser(datas[i]);
        }
    };

    MessageModule.prototype.receiveMessage = function(msg) {
        this.ChatManager.receiveMsg(msg);
    };
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function UserListManager(user_list_ele, message_module) {
        this.user_list_ele = user_list_ele;
        this.user_list = new Array();
        this.message_module = message_module;
    }

    // 유저 추가
    UserListManager.prototype.newUser = function(data) {
        if(this._checkDuplicatedEmail(data.email) == false) {
            var node = $('<div class="node"></div>').appendTo(this.user_list_ele);
            $('<img src="img/thumbnail_anonymous.png" alt=""/>').appendTo(node);
            $('<span></span>').html(data.name).appendTo(node);
            var message_module = this.message_module
            if(data.email != this.message_module.myInfo.email) {
                node.on('click',function(e) {
                    message_module.ChatManager.newChat(data);
                })
            } else {
                node.find('span')[0].innerHTML += " (me)";
            }
            this.user_list.push(data);
        }
    };

    // 유저 지우기
    UserListManager.prototype.deleteUser = function(data) {

    };

    // 이메일주소를 받아 유저리스트에 이미 중복된 유저가 있으면 true 리턴, 없으면 false 리턴
    UserListManager.prototype._checkDuplicatedEmail = function(email) {
        for(var i=0; i<this.user_list.length; i++) {
            if(this.user_list[i].email == email)
                return true;
        }
        return false;
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function ChatManager(eb, body) {
        this.eb = eb; // 이벤트버스를 받아옴
        this.body = body; // 채팅창을 열 body 엘리먼트를 가져옴
        this.my_info;

        this.chat_list = [];  // 채팅창 리스트
    }

    ChatManager.prototype.newChat = function(data){
        // 중복확인
        if( this._findChatWithEmail(data.email) == -1) {
            // 새로운 채팅창 만들기
            var chat = new Chat(this, data);
            console.log("new chat : " + data);
            // 새로운 채팅창 어레이에 저장
            this.chat_list.push(chat);
            // 채팅창 정렬
            this._relocate();
        }
    };

    ChatManager.prototype.receiveMsg = function(msg){
        if(msg.receiver_data.email == this.my_info.email) { // 리시버가 나여야댐
            // 새로운 채팅창 만들기
            var chat = this.newChat(msg.sender_data);
            // 채팅창에 메시지 보내기
            this.chat_list[this._findChatWithEmail(msg.sender_data.email)].receiveMsg(msg);
        } else { console.log("abnormal msg!")}
    };

    ChatManager.prototype._findChatWithEmail = function(email) {
        for(var i = 0; i < this.chat_list.length; i++) {
            if (this.chat_list[i].other_email == email)
                return i;
        }
        return -1;
    };

    ChatManager.prototype._relocate = function() {
        var width = 5;
        for(var i = 0; i < this.chat_list.length; i++) {
            this.chat_list[i].right(width);
            width += 205;
        }
    };

    ChatManager.prototype._remove_chat = function(email){
        var index;
        if( (index = this._findChatWithEmail(email)) == -1) {
            console.log("ChatManager.prototype._remove_chat : wrong email : " + email);
        } else {
            this.chat_list[index].ele_chat_div.remove();
            this.chat_list.splice(index, 1);
            // 채팅창 정렬
            this._relocate();
        }
    };
    //////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////
    function Chat(manager, data){
        this.manager = manager;
        this.other_email = data.email;
        this.other_name = data.name;

        this.ele_chat_div = $('<div class="chat_div"></div>').appendTo(this.manager.body); // 채팅창 엘리먼트

        $('<div class="chat_close">창닫기</div>').on('click', function(e) {
            manager._remove_chat(data.email);
        }).appendTo(this.ele_chat_div);

        this.ele_chat_title = $('<div class="chat_title"></div>').appendTo(this.ele_chat_div);
        this.ele_other_name = $('<p>상대방 : <span class="other"> 나중에 </span></p>').appendTo(this.ele_chat_title);
        this.ele_other_name.find('.other').html(this.other_name);

        this.chat_contents = $('<div class="chat_contents">채팅내용 시작</div>').appendTo(this.ele_chat_div);
        this.chat_input = $('<div class="chat_input"></div>').appendTo(this.ele_chat_div);
        this.chat_message_input = $('<input type="text" class="chat_message_input" />').appendTo(this.chat_input);
        this.chat_send_message_btn = $('<button class="btn_chat_send_message">메세지보내기</button>').on('click', function(e) {

            var contents = $(e.target).parent().find('.chat_message_input').val();
            $(e.target).parent().find('.chat_message_input').val("");

            $('<p class="message_from_me"></p>').html(contents).appendTo($(e.target).parents().parents().find(".chat_contents"));

            var send_message = {
                from : manager.my_info,
                to : data,
                contents : contents
            };
            manager.eb.send("openslide.message", send_message, function(reply){
                if (reply == "ACK") console.log("Good! ACK received!");
                else console.log("Bad! ACK does not received");
            })

        }).appendTo(this.chat_input);
    }

    Chat.prototype.receiveMsg = function(msg) {
        if(msg.hasOwnProperty('contents')){
            $('<p class="message_from_other"></p>').html(msg.contents).appendTo(this.chat_contents);
        }
    };

    Chat.prototype.right = function(val) {
        this.ele_chat_div.css('right',val+'px');
    };
    /////////////////////////////////////////////////////////////////////////////////

    return MessageModule;
}());

console.log("message module injected");


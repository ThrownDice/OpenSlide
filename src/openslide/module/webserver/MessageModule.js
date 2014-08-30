/**
 * Created by Administrator on 2014-08-25.
 *
 * 멧시지 모듈임
 *
 * 이런 멧시지가 와야댐
 * message =
 * {
 *  from : 보낸사람
 *  to : 받을사람
 *  contents : 내용
 * }
 *
 * 그러면 디비에 이렇게 저장함
 * message2 =
 * {
 *  no : sequence_number() // 아니면 id
 *  sender_id : message.from
 *  receiver_id : message.to
 *  contents : message.contents
 *  send_time : current_time()
 *  receive_time : null
 * }
 *
 * 저장하고 멧시지의 to 한테 디비에 저장한 형태의 메시지를 보냄
 *
 * 그러면 to는 이런 형태의 응답을 보내야댐
 * reply =
 * {
 *  no : message2.no // 아니면 id
 *  receive_time : to가 멧시지를 받은 시간을 기록
 * }
 */


var console = require('vertx/console');
var event_bus = require('vertx/event_bus');
var DEFAULT_SESSION_ADDRESS = "openslide.session-manager";
var DEFAULT_EDITOR_ADDRESS = "openslide.editor"
var DEFAULT_GROUP_ADDRESS = "openslide.group"
var DEFAULT_DB_ADDRESS = "openslide.mongo";
var DEFAULT_SESSION_CLIENT_ADDRESS = "openslide.session.client.";
var DEFAULT_MESSAGE_ADDRESS = "openslide.message";


event_bus.registerHandler(DEFAULT_MESSAGE_ADDRESS, function(message, replier) {
    replier("ACK");
    console.log("MessageModule.js : a message came!");

    if(message.hasOwnProperty("from") && message.hasOwnProperty("to") && message.hasOwnProperty("contents")) {
        console.log("normal message came");
        var temp_message = {
            sender_data : message.from,
            receiver_data : message.to,
            contents : message.contents,
            send_time : new Date().getTime(),
            receive_time : -1
        };
        // 디비에 저장
	// 추가해야댐

        // 보내기
        temp_message.action = "send_message"
        // receiver 세션아이디 구하기
        event_bus.send(DEFAULT_SESSION_ADDRESS, {
            action : "status",
            report: "matches",
            data: {
                email : message.to.email,
                name : message.to.name
            }
        }, function(reply) {
            if(reply.status == "ok" && reply.matches == true) {
                reply.sessions.forEach(function(v) {
                    event_bus.send(DEFAULT_SESSION_CLIENT_ADDRESS + v.sessionId, temp_message, function(reply) {

                        console.log("reply received ");
			// 디비 수정
			// 추가해야댐
                    });
                })
            }
        });

    } else console.log("abnormal message came");


});
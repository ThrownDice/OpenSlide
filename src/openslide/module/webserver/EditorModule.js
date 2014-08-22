/**
 * Created by TD on 2014-08-11.
 */
var console = require('vertx/console');
var event_bus = require('vertx/event_bus');
var DEFAULT_SESSION_ADDRESS = "openslide.session-manager";
var DEFAULT_EDITOR_ADDRESS = "openslide.editor"
var DEFAULT_GROUP_ADDRESS = "openslide.group"
var DEFAULT_DOCUMENT_ADDRESS = "openslide.document";

console.log('deploying EditorModule.js');

event_bus.registerHandler(DEFAULT_EDITOR_ADDRESS, function(message, replier){

    console.log(message.JSESSIONID + " is request " + message.action);

    //confirm session and get user data from session
    event_bus.send(DEFAULT_SESSION_ADDRESS, {
        action : "get",
        sessionId : message.JSESSIONID,
        fields : ["_id", "email", "nickname", "name"]
    }, function(session_result){

        if(session_result.status == "ok"){

            var user_data = session_result.data;

            /***** File Function *****/

            //new document
            if(message.action == "editor_create_document"){

                /**
                 * create new document
                 * @param   document_title -required- {string}
                 * @return {status, document_id}
                 */

                    //create group
                    event_bus.send(DEFAULT_GROUP_ADDRESS,{
                        action : "group_new",
                        owner_id : user_data._id
                    }, function(group_result){

                    console.log("created gruop id is " + group_result.group_id);

                    //create document
                    event_bus.send(DEFAULT_DOCUMENT_ADDRESS, {
                        action : "document_new",
                        document_title : message.document_title,
                        group_id : group_result.group_id
                    }, function(document_result){

                        //respond to client
                        replier(document_result);

                    });
                });
            }

            if(message.action == "editor_open_document") {

                /**
                 * load uploaded document, and parse to svg document. and return it
                 * @param file_name -required- {string}
                 * @return {status, [{slide_num, slide_svg_contents}...]}
                 */

                logger.info(user_data.nickname + " requested editor_open_document");

                //create group
                event_bus.send(DEFAULT_GROUP_ADDRESS, {
                    action: "group_new",
                    owner_id: user_data._id
                }, function (group_result) {

                    console.log("created gruop id is " + group_result.group_id);

                    //create document
                    event_bus.send(DEFAULT_DOCUMENT_ADDRESS, {
                        action: "document_new",
                        document_title: message.document_title,
                        group_id: group_result.group_id
                    }, function (document_result) {

                        //parse document to svg documents
                        event_bus.send(DEFAULT_DOCUMENT_ADDRESS, {
                            document_id : document_result.document_id,
                            file_name : message.file_name
                        }, function(document_result){

                        });

                    });

                });
            }

            /***** -End- File Function *****/

        }else{
            //invalid session

            console.log("error, invalid session");

        }
    });


});


/**
 * Created by TD on 2014-08-11.
 */
var console = require('vertx/console');
var event_bus = require('vertx/event_bus');
var DEFAULT_SESSION_ADDRESS = "openslide.session-manager";
var DEFAULT_EDITOR_ADDRESS = "openslide.editor"
var DEFAULT_GROUP_ADDRESS = "openslide.group"

console.log('deploying Editor.js');

event_bus.registerHandler(DEFAULT_EDITOR_ADDRESS, function(message){

    console.log(message.JSESSIONID + " is request " + message.action);

    //get user data from session
    event_bus.send(DEFAULT_SESSION_ADDRESS, {
        action : "get",
        sessionId : message.JSESSIONID,
        fields : ["_id", "email", "nickname", "name"]
    }, function(session_result){

        console.log(JSON.stringify(session_result));
        if(session_result.status == "ok"){

            var user_data = session_result.data;

            /***** File Function *****/

            //new document
            if(message.action == "editor_create_document"){

                console.log(session_result.data.nickname + " 's _id is " + session_result.data._id);

                //create group
                event_bus.send(DEFAULT_GROUP_ADDRESS,{
                    action : "group_new",
                    owner_id : user_data._id
                }, function(group_result){

                    console.log("created gruop id is " + group_result.group_id);

                    //create document




                });
            }

            /***** -End- File Function *****/


        }else{
            //invalid session

            console.log("error, invalid session");

        }
    });


});


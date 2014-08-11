/**
 * Created by TD on 2014-08-11.
 */
var console = require('vertx/console');
var event_bus = require('vertx/event_bus');
var DEFAULT_SESSION_ADDRESS = "openslide.session-manager";

console.log('deploying Editor.js');




event_bus.registerHandler('openslide.editor', function(message){
    /***** File Function *****/


     console.log('action : ' + message.action);
    //new document
    if(message.action == "editor_create_document"){

        //get user session data
        event_bus.send(DEFAULT_SESSION_ADDRESS, {
            action : "get",
            sessionId : message.JSESSIONID,
            fields : ["_id"]
        }, function(session_result){

            console.log(session_result);

        });


        //create group

        //create document


    }

    /***** -End- File Function *****/
});


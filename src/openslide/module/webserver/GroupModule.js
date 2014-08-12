/**
 * Created by TD on 2014-08-11.
 */
var console = require('vertx/console');
var event_bus = require('vertx/event_bus');
var DEFAULT_DB_ADDRESS = "openslide.mongo";
var DEFAULT_SESSION_ADDRESS = "openslide.session-manager";
var DEFAULT_EDITOR_ADDRESS = "openslide.editor"
var DEFAULT_GROUP_ADDRESS = "openslide.group"

console.log('deploying GroupModule.js');

event_bus.registerHandler("openslide.group", function(message, replier){

    //new group
    if(message.action == "group_new"){

        //create new group object and group's users array
        var group = {};
        var user_array = new Array();

        user_array.push({
            user_id : message.owner_id,
            role : "owner"
        });

        group.users = user_array;

        event_bus.send(DEFAULT_DB_ADDRESS, {
            action : "save",
            collection : "groups",
            document : group
        }, function(result){

            //save success
            if(result.status == "ok"){
                replier({
                    status : "ok",
                    group_id : result._id
                });
            }else{
                replier({
                    status : "fail"
                });
            }

        });

    }else if(message.action == ""){

    }

});
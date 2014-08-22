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

        /**
         * create new group. save new group and user_groups
         * parameter information
         * @param   owner_id    -required-  {string}    group's leader
         * @result {status,group_id}
         */

        //create new group object and group's users array
        var group_new = {};
        var user_array = new Array();

        user_array.push({
            user_id : message.owner_id,
            role : "owner"
        });

        group_new.users = user_array;

        //save new group into groups collection
        event_bus.send(DEFAULT_DB_ADDRESS, {
            action : "save",
            collection : "groups",
            document : group_new
        }, function(result){

            //save success
            if(result.status == "ok"){

                var group_id = result._id;

                //save user_id, group_id into user_groups collection
                event_bus.send(DEFAULT_DB_ADDRESS, {
                    action : "save",
                    collection : "user_groups",
                    document : {
                        user_id : message.owner_id,
                        group_id : group_id
                    }
                }, function(result){

                    if(result.status == "ok"){
                        replier({
                            status : "ok",
                            group_id : group_id
                        });
                    }else{
                        replier({
                            status : "fail"
                        });
                    }
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

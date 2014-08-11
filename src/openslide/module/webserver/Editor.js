/**
 * Created by TD on 2014-08-11.
 */
var console = require('vertx/console');
var event_bus = require('vertx/event_bus');

console.log('deploying Editor.js');




event_bus.registerHandler('openslide.editor', function(message){
    /***** File Function *****/


     console.log('action : ' + message.action);
    //new document
    if(message.action == "editor_create_document"){

        //create group

        //create document


    }

    /***** -End- File Function *****/
});


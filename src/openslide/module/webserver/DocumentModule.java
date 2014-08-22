package openslide.module.webserver;

import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Verticle;
import java.util.Date;

/**
 * Created by TD on 2014-08-12.
 */
public class DocumentModule extends Verticle {

    public static final String DEFAULT_DOCUMENT_ADDRESS = "openslide.document";

    public static final String DEFAULT_DB_ADDRESS = "openslide.mongo";

    public static final String DEFAULT_UPLOAD_PATH = "C:\\openslide_uploads\\";

    @Override
    public void start() {

        final EventBus event_bus = vertx.eventBus(); //event_bus object
        final Logger logger = container.logger();   //logger object

        event_bus.registerHandler(DEFAULT_DOCUMENT_ADDRESS, new Handler<Message>() {
            @Override
            public void handle(final Message outter_message) {

                final JsonObject request = new JsonObject(outter_message.body().toString());

                //new document
                if (request.getString("action").equals("document_new")) {

                    /**
                     * parameter information
                     * @param   group_id        -required-  {string}
                     * @param   document_title  -required-  {string}
                     * @param   contents                    {string}
                     * @return {status, document_id}
                     */

                    JsonObject db_action = new JsonObject();
                    JsonObject param = new JsonObject();
                    JsonObject document = new JsonObject();

                    //create document object
                    document.putString("group_id", request.getString("group_id"));
                    document.putString("created_time", new Date().toString());
                    try {
                        document.putString("contents", request.getString("contents"));
                    } catch (Exception e) {
                        document.putString("contents", "");
                    }

                    //save new document
                    db_action.putString("action", "save");
                    db_action.putString("collection", "documents");
                    db_action.putObject("document", document);

                    event_bus.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
                        @Override
                        public void handle(Message message) {

                            JsonObject db_result = new JsonObject(message.body().toString());
                            JsonObject db_action = new JsonObject();
                            JsonObject param = new JsonObject();
                            final JsonObject user_document = new JsonObject();  //for user_document collection

                            if (db_result.getString("status").equals("ok")) {

                                user_document.putString("document_id", db_result.getString("_id"));

                                //make matcher
                                param.putString("_id", request.getString("group_id"));

                                //get groups
                                db_action.putString("action", "findone");
                                db_action.putString("collection", "groups");
                                db_action.putObject("matcher", param);

                                event_bus.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
                                    @Override
                                    public void handle(Message message) {

                                        JsonObject db_result = new JsonObject(message.body().toString());
                                        JsonObject group = null;
                                        JsonObject db_action = new JsonObject();
                                        JsonObject response = new JsonObject();
                                        JsonArray user_list = null;

                                        if (db_result.getString("status").equals("ok")) {

                                            //get group
                                            group = db_result.getObject("result");
                                            //get users
                                            user_list = group.getArray("users");

                                            //save document id into user_document collection each user
                                            db_action.putString("action", "save");
                                            db_action.putString("collection", "user_documents");

                                            try {
                                                for (Object user : user_list) {

                                                    user_document.putString("user_id", ((JsonObject) user).getString("user_id"));
                                                    db_action.putObject("document", user_document);

                                                    //save user_document
                                                    event_bus.send(DEFAULT_DB_ADDRESS, db_action);

                                                }
                                            } finally {
                                                //at last send response data
                                                response.putString("status", "ok");
                                                response.putString("document_id", user_document.getString("document_id"));

                                                //respond
                                                outter_message.reply(response);
                                            }

                                        }else{
                                            //fail to get group
                                        }
                                    }
                                }

                            );

                            }else{
                                //fail to save document
                            }
                        }
                    });
                }else if(request.getString("action").equals("document_parse")){

                    //load file, and parse to svg documents, and save them.
                    /**
                     * parameter information
                     * @param   document_id      -required-  {string}
                     * @param   file_name        -required-  {string}
                     * @return {status, document_id}
                     */

                    String document_id = request.getString("document_id");
                    String file_name = request.getString("file_name");

                    try{
                        //PPTX2SVG.parse(DEFAULT_UPLOAD_PATH + file_name);
                    }catch (Exception e){
                        e.printStackTrace();
                    }

                    //TestClass.print();

                }
            }
        });
    }
}

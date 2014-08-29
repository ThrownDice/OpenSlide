package openslide.module.webserver;

import org.vertx.java.core.*;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerFileUpload;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.sockjs.SockJSServer;
import org.vertx.java.platform.Verticle;

import java.net.URI;
import java.util.ArrayList;
import java.util.UUID;

public class WebServer extends Verticle {

    //todo : gather default option

    public static final int DEFAULT_PORT = 8080;

    public static final String DEFAULT_ADDRESS = "0.0.0.0";

    public static final String DEFAULT_WEB_ROOT = "OpenSlide";  //temp web root path

    public static final String DEFAULT_INDEX_PAGE = "index.html";

    public static final String DEFAULT_AUTH_ADDRESS = "vertx.basicauthmanager.authorise";

    public static final long DEFAULT_AUTH_TIMEOUT = 5 * 60 * 1000;

    public static final String DEFAULT_DB_ADDRESS = "openslide.mongo";

    public static final String DEFAULT_SESSION_ADDRESS = "openslide.session-manager";

    public static final String DEFAULT_SESSION_CLEANER_ADDRESS = "openslide.session.cleaner";

    public static final String DEFAULT_SESSION_CLIENT_ADDRESS = "openslide.session.client";

    /// ADD ///
    public static final String DEFAULT_MESSAGE_ADDRESS = "openslide.message";
    //////////

    public static final String DEFAULT_UPLOAD_PATH = "C:\\openslide_uploads\\";

    @Override
    public void start() {
        // TODO Auto-generated method stub

        //Date date = new Date();

        HttpServer server = vertx.createHttpServer();
        final Logger logger = container.logger();
        JsonObject mongo_config = new JsonObject(); //mongoDB configuration object
        JsonObject session_config = new JsonObject(); //session configuration object
        JsonObject editor_config = new JsonObject(); //editor configuration object
        JsonObject group_config = new JsonObject(); //group module configuration object
        JsonObject document_config = new JsonObject(); //document module configuration object
        JsonObject upload_config = new JsonObject(); //upload module configuration object
        final EventBus event_bus = vertx.eventBus();

        mongo_config.putString("address", DEFAULT_DB_ADDRESS);
        mongo_config.putString("host", "127.0.0.1");
        mongo_config.putNumber("port", 27017);
        mongo_config.putString("db_name", "openslide");

        session_config.putString("address", DEFAULT_SESSION_ADDRESS);
        session_config.putNumber("timeout", 10 * 60 * 1000);
        session_config.putString("cleaner", DEFAULT_SESSION_CLEANER_ADDRESS);
        session_config.putString("prefix", DEFAULT_SESSION_CLIENT_ADDRESS);

        //////////////////////////////// ADD ///////////////////////////////////////////
        session_config.putObject("mongo-sessions", new JsonObject("{ \"address\" : \""+DEFAULT_DB_ADDRESS+"\", \"collection\" : \"session\" }"));
        /////////////////////////////////////////////////////////////////////////////////

        logger.info("ServerCore Deployed");

        container.deployModule("io.vertx~mod-mongo-persistor~2.1.0", mongo_config, new AsyncResultHandler<String>() {
            @Override
            public void handle(AsyncResult<String> stringAsyncResult) {
                if (stringAsyncResult.succeeded()) {
                    logger.info("io.vertx~mod-mongo-persistor~2.1.0 module is deployed");
                } else {
                    logger.info("io.vertx~mod-mongo-persistor~2.1.0 module failed to deploy");
                    logger.info(stringAsyncResult.cause());
                }
            }
        });
        container.deployModule("com.campudus~session-manager~2.0.1-final", session_config, new AsyncResultHandler<String>() {
            @Override
            public void handle(AsyncResult<String> stringAsyncResult) {
                if (stringAsyncResult.succeeded()) {
                    logger.info("com.campudus~session-manager~2.0.1-final is deployed");
                } else {
                    logger.info("com.campudus~session-manager~2.0.1-final failed to deploy");
                    logger.info(stringAsyncResult.cause());
                }
            }
        });
        container.deployVerticle("UploadModule.java",upload_config,new AsyncResultHandler<String>() {
            @Override
            public void handle(AsyncResult<String> stringAsyncResult) {
                if(stringAsyncResult.succeeded()){
                    logger.info("UploadModule.java Module is deployed");
                }else{
                    logger.info("UploadModule.java Module failed to deploy");
                    logger.info(stringAsyncResult.cause());
                }
            }
        });
        container.deployVerticle("EditorModule.js",session_config,new AsyncResultHandler<String>() {
            @Override
            public void handle(AsyncResult<String> stringAsyncResult) {
                if(stringAsyncResult.succeeded()){
                    logger.info("EditorModule.js Module is deployed");
                }else{
                    logger.info("EditorModule.js Module failed to deploy");
                    logger.info(stringAsyncResult.cause());
                }
            }
        });
        container.deployVerticle("GroupModule.js", group_config, new AsyncResultHandler<String>() {
            @Override
            public void handle(AsyncResult<String> stringAsyncResult) {
                if (stringAsyncResult.succeeded()) {
                    logger.info("GroupModule.js Module is deployed");
                } else {
                    logger.info("GroupModule.js Module failed to deploy");
                    logger.info(stringAsyncResult.cause());
                }
            }
        });
        container.deployVerticle("DocumentModule.java", document_config, new AsyncResultHandler<String>() {
            @Override
            public void handle(AsyncResult<String> stringAsyncResult) {
                if(stringAsyncResult.succeeded()){
                    logger.info("DocumentModule.java Module is deployed");
                }else{
                    logger.info("DocumentModule.java Module failed to deploy");
                    logger.info(stringAsyncResult.cause());
                }
            }
        });
        /////// ADD /////////////
        container.deployVerticle("MessageModule.js",session_config,new AsyncResultHandler<String>() {
            @Override
            public void handle(AsyncResult<String> stringAsyncResult) {
                if(stringAsyncResult.succeeded()){
                    logger.info("MessageModule.js Module is deployed");
                }else{
                    logger.info("MessageModule.js Module failed to deploy");
                    logger.info(stringAsyncResult.cause());
                }
            }
        });
        /////////////////////////

        server.requestHandler(new Handler<HttpServerRequest>() {

            @Override
            public void handle(final HttpServerRequest request) {
                // TODO Auto-generated method stub

                //log.info("Requested URI is " + request.uri());

                if (request.uri().equals("/")) {
                    // Serve the index page
                    JsonObject session_action = new JsonObject();
                    session_action.putString("action", "start");
                    //session test
                    event_bus.send(DEFAULT_SESSION_ADDRESS, session_action, new Handler<Message>() {
                        @Override
                        public void handle(Message message) {
                            JsonObject result = new JsonObject(message.body().toString());
                            String session_id = null;

                            if (result.getString("status").equals("ok")) {
                                session_id = result.getString("sessionId");
                                request.response().putHeader("Set-Cookie", "JSESSIONID=" + session_id).setChunked(true).sendFile(DEFAULT_WEB_ROOT + "/index.html");
                            } else {

                            }
                        }
                    });
                } else if (request.uri().equals(("/upload"))) {

                    request.expectMultiPart(true);
                    request.response().setChunked(true);

                    //save upload file
                    request.uploadHandler(new Handler<HttpServerFileUpload>() {
                        @Override
                        public void handle(final HttpServerFileUpload httpServerFileUpload) {

                            //get session data
                            CookieManager cookie = new CookieManager(request.headers().get("Cookie"));
                            final String file_name = httpServerFileUpload.filename();
                            final JsonObject response = new JsonObject();
                            String uuid = UUID.randomUUID().toString(); //to avoid repeated file name

                            /*String session_id = cookie.getValue("JSESSIONID");
                            JsonObject session_action = new JsonObject();
                            JsonArray fields = new JsonArray();

                            fields.addString("_id");
                            fields.addString("email");
                            fields.addString("nickname");
                            fields.addString("name");

                            logger.info(session_id + " is requested file upload");

                            session_action.putString("action", "get");
                            session_action.putString("sessionId", session_id);
                            session_action.putArray("fields", fields);*/

                            //get session
                            //todo : check session (can't upload file if i first use event_bus, then file upload. so it is commented)
                            /*event_bus.send(DEFAULT_SESSION_ADDRESS, session_action, new Handler<Message>() {
                                @Override
                                public void handle(Message message) {
                                    JsonObject session_result = new JsonObject(message.body().toString());
                                    JsonObject session = null;


                                    if(session_result.getString("status").equals("ok")){
                                        //success to get session data
                                        session = session_result.getObject("data");

                                        logger.info(session.getString("nickname") + " upload " + file_name);

                                        //only pptx file is uploadable
                                        if(file_name.indexOf(".pptx") != -1){
                                            //httpServerFileUpload.streamToFileSystem(DEFAULT_UPLOAD_PATH + session.getString("_id") + httpServerFileUpload.filename());
                                            httpServerFileUpload.streamToFileSystem(DEFAULT_UPLOAD_PATH + httpServerFileUpload.filename());
                                            response.putString("status", "ok");
                                            response.putString("file_name", session.getString("_id") + file_name);
                                        }else{
                                            response.putString("status","fail");
                                            response.putString("error_code","001_010");
                                            response.putString("message","not_pptx_file");
                                        }

                                    }else{
                                        logger.info("get session fail");
                                        response.putString("status","fail");
                                        response.putString("error_code","001_020");
                                        response.putString("message","no_session");
                                    }
                                }
                            });*/

                            if(file_name.indexOf(".pptx") != -1){
                                //httpServerFileUpload.streamToFileSystem(DEFAULT_UPLOAD_PATH + session.getString("_id") + httpServerFileUpload.filename());
                                httpServerFileUpload.streamToFileSystem(DEFAULT_UPLOAD_PATH + uuid + httpServerFileUpload.filename());
                                //httpServerFileUpload.streamToFileSystem(DEFAULT_UPLOAD_PATH + httpServerFileUpload.filename());
                                response.putString("status", "ok");
                                response.putString("file_name", uuid + file_name);
                            }else{
                                response.putString("status","fail");
                                response.putString("error_code","001_010");
                                response.putString("message","not_pptx_file");
                            }

                            //end handler
                            httpServerFileUpload.endHandler(new Handler<Void>() {
                                @Override
                                public void handle(Void aVoid) {
                                    logger.info("Upload Process Completed");

                                    request.response().write(response.toString());
                                    request.response().end();

                                }
                            });
                            //exception handler
                            httpServerFileUpload.exceptionHandler(new Handler<Throwable>() {
                                @Override
                                public void handle(Throwable throwable) {
                                    logger.info("Exception occured while upload file");
                                }
                            });
                            logger.info(httpServerFileUpload.contentType());
                            logger.info(httpServerFileUpload.size());
                            logger.info("upload file : " + httpServerFileUpload.filename());
                        }
                    });


                } else if (request.uri().equals("/signup")) {

                    request.expectMultiPart(true);

                    request.endHandler(new VoidHandler() {
                        @Override
                        protected void handle() {

                            MultiMap attrs = request.formAttributes();

                            final JsonObject new_user = new JsonObject();
                            final JsonObject db_action = new JsonObject();

                            final String email = attrs.get("email");
                            final String nickname = attrs.get("nickname");
                            final String password = attrs.get("password");
                            final String name = attrs.get("name");

                            new_user.putString("email", email);
                            new_user.putString("nickname", nickname);
                            new_user.putString("password", password);
                            new_user.putString("name", name);

                            //로그 출력
                            logger.info(email);
                            logger.info(nickname);
                            logger.info(password);
                            logger.info(name);

                            //response chunked check
                            request.response().setChunked(true);

                            //email 중복 체크
                            db_action.putString("action", "find");
                            db_action.putString("collection", "users");
                            db_action.putObject("document", new JsonObject().putString("Email", email));
                            event_bus.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
                                @Override
                                public void handle(Message message) {
                                    JsonObject result = new JsonObject(message.body().toString());

                                    if (result.getString("status").equals("ok")) {
                                        if (result.getObject("result") == null) {

                                            db_action.putObject("document", new JsonObject().putString("nickname", nickname));

                                            event_bus.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
                                                @Override
                                                public void handle(Message message) {
                                                    JsonObject result = new JsonObject(message.body().toString());

                                                    if (result.getString("status").equals("ok")) {
                                                        if (result.getObject("result") == null) {
                                                            //All redundancy checked
                                                            db_action.putString("action", "save");
                                                            db_action.putObject("document", new_user);
                                                            event_bus.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
                                                                @Override
                                                                public void handle(Message message) {
                                                                    JsonObject result = new JsonObject(message.body().toString());
                                                                    if (result.getString("status").equals("ok")) {
                                                                        //success db save
                                                                        request.response().write(new JsonObject().putBoolean("success", true).toString());
                                                                        request.response().end();
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            logger.info(message.body());
                                                            logger.info(nickname + " is already used nickname.");
                                                            request.response().write(new JsonObject().putBoolean("success", false).toString());
                                                            request.response().end();
                                                        }
                                                    }
                                                }
                                            });
                                        } else {
                                            logger.info(message.body());
                                            logger.info(email + " is already used email.");
                                            request.response().write(new JsonObject().putBoolean("success", false).toString());
                                            request.response().end();
                                        }
                                    }
                                }
                            });
                        }
                    });

                } else if (request.uri().equals("/signup_redundancy_check")) {

                    request.expectMultiPart(true);

                    //get email and check redundancy
                    request.endHandler(new VoidHandler() {
                        @Override
                        protected void handle() {

                            MultiMap attrs = request.formAttributes();

                            String email = attrs.get("email");
                            JsonObject matcher = new JsonObject();
                            JsonObject param = new JsonObject();

                            matcher.putString("email", email);

                            param.putString("action", "findone");
                            param.putString("collection", "users");
                            param.putObject("matcher", matcher);

                            logger.info("got email : " + email);

                            event_bus.send(DEFAULT_DB_ADDRESS, param, new Handler<Message>() {
                                @Override
                                public void handle(Message message) {
                                    JsonObject result = new JsonObject(message.body().toString());
                                    JsonObject response_data = new JsonObject();

                                    if (result.getString("status").equals("ok")) {
                                        //success to db action

                                        //if email is already used, return response redundancy checked
                                        if (result.getObject("result") != null) {
                                            logger.info(result.getObject("result").toString());
                                            response_data.putBoolean("redundancy", true);
                                        } else {
                                            response_data.putBoolean("redundancy", false);
                                        }
                                        request.response().setChunked(true);
                                        request.response().write(response_data.toString()).end();
                                    }
                                }
                            });
                        }
                    });
                } else if (request.uri().equals("/signup_nickname_check")) {
                    request.expectMultiPart(true);

                    request.endHandler(new Handler<Void>() {
                        @Override
                        public void handle(Void aVoid) {
                            //get nickname, check redundancy
                            MultiMap attrs = request.formAttributes();

                            String nickname = attrs.get("nickname");
                            JsonObject matcher = new JsonObject();
                            JsonObject param = new JsonObject();

                            matcher.putString("nickname", nickname);

                            param.putString("action", "findone");
                            param.putString("collection", "users");
                            param.putObject("matcher", matcher);

                            logger.info("got nickname : " + nickname);

                            event_bus.send(DEFAULT_DB_ADDRESS, param, new Handler<Message>() {
                                @Override
                                public void handle(Message message) {
                                    JsonObject result = new JsonObject(message.body().toString());
                                    JsonObject response_data = new JsonObject();

                                    if (result.getString("status").equals("ok")) {
                                        //success to db action

                                        //if nickname is already used, return response redundancy checked
                                        if (result.getObject("result") != null) {
                                            logger.info(result.getObject("result").toString());
                                            response_data.putBoolean("redundancy", true);
                                        } else {
                                            response_data.putBoolean("redundancy", false);
                                        }
                                        request.response().setChunked(true);
                                        request.response().write(response_data.toString()).end();
                                    }
                                }
                            });
                        }
                    });
                } else if (request.uri().equals("/login")) {

                    request.expectMultiPart(true);

                    request.endHandler(new Handler<Void>() {
                        @Override
                        public void handle(Void aVoid) {
                            MultiMap attrs = request.formAttributes();
                            final String session_id = request.headers().get("Cookie");
                            final JsonObject user = new JsonObject();
                            JsonObject db_action = new JsonObject();

                            logger.info("email is " + attrs.get("email"));

                            user.putString("email", attrs.get("email"));
                            user.putString("password", attrs.get("pw"));

                            db_action.putString("action","findone");
                            db_action.putString("collection","users");
                            db_action.putObject("matcher",user);

                            logger.info("Processing Login");
                            logger.info(session_id + " is requested.");

                            request.response().setChunked(true);

                            event_bus.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
                                @Override
                                public void handle(Message message) {

                                    JsonObject result = new JsonObject(message.body().toString());
                                    JsonObject data = null; //var to store found user data
                                    final JsonObject response = new JsonObject(); //response object
                                    JsonObject session_action = new JsonObject(); //session action object

                                    if (result.getString("status").equals("ok")) {
                                        if (result.getObject("result") != null) {
                                            data = result.getObject("result");
                                            logger.info(data.getString("nickname") + " log in");
                                            data.putString("password", ""); //delete password, temp code

                                            //make response object
                                            response.putString("result", "ok");

                                            CookieManager cookie = new CookieManager(session_id);
                                            logger.info("JSESSIONID : " + cookie.getValue("JSESSIONID"));



                                            //////////////////////// ADD ///////////////////////////////////////////////////
                                            //// notice new login user info to other users ////
                                            // make notice message
                                            final JsonObject notice_message = new JsonObject();
                                            notice_message.putString("action", "new_user");
                                            notice_message.putObject("data", data);

                                            // load session list
                                            session_action.putString("action", "status");
                                            session_action.putString("report", "matches");
                                            session_action.putObject("data", new JsonObject());
                                            event_bus.send(DEFAULT_SESSION_ADDRESS, session_action, new Handler<Message>() {
                                                @Override
                                                public void handle(Message message) {
                                                    // send notice message to sessions
                                                    JsonObject result = new JsonObject(message.body().toString());
                                                    JsonArray sessions = result.getArray("sessions");
                                                    for (int i=0; i<sessions.size(); i++) {
                                                        JsonObject tempJsonObject = new JsonObject(sessions.get(i).toString());
                                                        logger.info("no" + i +" : " + tempJsonObject.getString("sessionId"));
                                                        event_bus.send(DEFAULT_SESSION_CLIENT_ADDRESS + "." + tempJsonObject.getString("sessionId"), notice_message);
                                                    }
                                                }
                                            });
                                            /////////////////////////////////////////////////////////////////////////////////

                                            //save user information into session
                                            session_action.putString("action", "put");
                                            session_action.putString("sessionId", cookie.getValue("JSESSIONID"));
                                            session_action.putObject("data", data);

                                            event_bus.send(DEFAULT_SESSION_ADDRESS, session_action, new Handler<Message>() {
                                                @Override
                                                public void handle(Message message) {
                                                    request.response().write(response.toString()).end();
                                                }
                                            });
                                            //request.response().sendFile(DEFAULT_WEB_ROOT + "/main.html");

                                        } else {
                                            //no matching user
                                            logger.info("There is no such user (" + user.toString() + ")");
                                            response.putString("result", "fail");
                                            request.response().write(response.toString()).end();
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
                ///////////////////////////////// ADD ////////////////////////////////////////////////////////
                else if (request.uri().equals("/get_user_list")) {
                    request.expectMultiPart(true);
                    request.endHandler(new Handler<Void>() {
                        @Override
                        public void handle(Void aVoid) {
                            final MultiMap attrs = request.formAttributes();
                            final String session_id = request.headers().get("Cookie");
                            CookieManager cookie = new CookieManager(session_id);
                            final JsonObject response = new JsonObject(); //response object


                            //// send current user list to new login user  ////
                            // get session list from mongo db
                            JsonObject db_action = new JsonObject();
                            db_action.putString("action", "find");
                            db_action.putString("collection", "session");
                            db_action.putObject("document", new JsonObject());
                            final java.lang.String temp_jsessionid = cookie.getValue("JSESSIONID");
                            event_bus.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
                                @Override
                                public void handle(Message message) {
                                    JsonObject result = new JsonObject(message.body().toString());
                                    if (result.getString("status").equals("ok")) {
                                        JsonArray results = result.getArray("results");
                                        JsonArray results_data = new JsonArray();
                                        if (result.size() > 0) {
                                            for (int i = 0; i < results.size(); i++) {
                                                JsonObject tempJsonObject = new JsonObject(results.get(i).toString());
                                                if (tempJsonObject.containsField("data")) {
                                                    results_data.add(tempJsonObject.getObject("data"));
                                                    if ((tempJsonObject.getString("sessionId")).equals(attrs.get("jses"))) {
                                                        JsonObject my_info = new JsonObject();
                                                        my_info.putString("action", "my_info");
                                                        my_info.putString("email", tempJsonObject.getObject("data").getString("email"));
                                                        my_info.putString("name", tempJsonObject.getObject("data").getString("name"));
                                                        my_info.putString("nickname", tempJsonObject.getObject("data").getString("nickname"));
                                                        event_bus.send(DEFAULT_SESSION_CLIENT_ADDRESS + "." + attrs.get("jses"), my_info);
                                                    }
                                                }
                                            }
                                        }
                                        // send user list message
                                        JsonObject user_list_message = new JsonObject();
                                        user_list_message.putString("action", "user_list");
                                        user_list_message.putArray("data", results_data);
                                        event_bus.send(DEFAULT_SESSION_CLIENT_ADDRESS + "." + attrs.get("jses"), user_list_message);
                                        logger.info("send user list to : " + attrs.get("jses")); /////////////
                                    }
                                }
                            });
                            response.putString("result", "ok");
                            request.response().setChunked(true);
                            request.response().write(response.toString()).end();
                        }
                    });
                }
                ///////////////////////////////////////////////////////////////////////////////////
                else {

                    request.response().sendFile(DEFAULT_WEB_ROOT + request.uri());

                    //request.response().setStatusCode(404);
                    //request.response().end();
                }
            }
        });

        /*eb.registerHandler(DEFAULT_SESSION_CLIENT_ADDRESS+".*", new Handler<Message>() {
            @Override
            public void handle(Message message) {
                log.info(message.body().toString());
            }
        });*/

        event_bus.registerHandler("openslide.test", new Handler<Message>() {
            @Override
            public void handle(Message message) {
                String JSESSIONID = new JsonObject(message.body().toString()).getString("JSESSIONID");
                message.reply("ok");

                event_bus.send(DEFAULT_SESSION_CLIENT_ADDRESS + "." + JSESSIONID, "wow!!");

            }
        });


        SockJSServer sjsServer = vertx.createSockJSServer(server);

        //create config object which decide inbound address
        JsonArray inboundPermitted = new JsonArray();
        inboundPermitted.add(new JsonObject("{ \"address\" : \"openslide.editor\" }"));
        inboundPermitted.add(new JsonObject("{ \"address\" : \"openslide.test\" }"));
        /// ADD ///
        inboundPermitted.add(new JsonObject("{ \"address\" : \"" + DEFAULT_MESSAGE_ADDRESS + "\" }"));
        ///////////
        inboundPermitted.add(new JsonObject("{ \"address_re\" : \"" + DEFAULT_SESSION_CLIENT_ADDRESS + ".*\" }"));
        //create config object which decide outbound address
        JsonArray outboundPermitted = new JsonArray();
        outboundPermitted.add(new JsonObject("{ \"address_re\" : \"" + DEFAULT_SESSION_CLIENT_ADDRESS + ".*\" }"));

        sjsServer.bridge(new JsonObject().putString("prefix", "/eventbus"),
                inboundPermitted, outboundPermitted, DEFAULT_AUTH_TIMEOUT, DEFAULT_AUTH_ADDRESS);

        server.listen(DEFAULT_PORT, "localhost");
    }
}
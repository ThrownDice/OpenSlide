package openslide.module.webserver;

import org.vertx.java.core.*;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.sockjs.SockJSServer;
import org.vertx.java.platform.Verticle;

public class ServerCore extends Verticle {

    public static final int DEFAULT_PORT = 8080;

    public static final String DEFAULT_ADDRESS = "0.0.0.0";

    public static final String DEFAULT_WEB_ROOT = "C:\\Users\\TD\\Desktop\\TeamSlide\\Project\\OpenSlide";  //임시

    public static final String DEFAULT_INDEX_PAGE = "index.html";

    public static final String DEFAULT_AUTH_ADDRESS = "vertx.basicauthmanager.authorise";

    public static final long DEFAULT_AUTH_TIMEOUT = 5 * 60 * 1000;

    public static final String DEFAULT_DB_ADDRESS = "openslide.mongo";

    public static final String DEFAULT_SESSION_ADDRESS = "openslide.session";

    public static final String DEFAULT_SESSION_CLEANER_ADDRESS = "openslide.session.cleaner";

    public static final String DEFAULT_SESSION_CLIENT_ADDRESS = "openslide.session.client";

    @Override
    public void start() {
        // TODO Auto-generated method stub

        //Date date = new Date();

        HttpServer server = vertx.createHttpServer();
        final Logger log = container.logger();
        JsonObject mongo_config = new JsonObject(); //mongoDB configuration object
        JsonObject session_config = new JsonObject(); //session configuration object
        final EventBus eb = vertx.eventBus();

        mongo_config.putString("address", DEFAULT_DB_ADDRESS);
        mongo_config.putString("host", "127.0.0.1");
        mongo_config.putNumber("port", 27017);
        mongo_config.putString("db_name", "openslide");

        session_config.putString("address", DEFAULT_SESSION_ADDRESS);
        session_config.putNumber("timeoust", 10 * 60 * 1000);
        session_config.putString("cleaner", DEFAULT_SESSION_CLEANER_ADDRESS);
        session_config.putString("prefix", DEFAULT_SESSION_CLIENT_ADDRESS);

        System.out.println("ServerCore Deployed");

        //container.deployVerticle("UploadModule.java");
        //container.deployModule("io.vertx~mod-mongo-persistor~2.1.0", mongo_config);
/*        try{
            container.deployModule("com.campudus~session-manager~2.0.1-final", session_config);
        }catch(Exception e){
            log.info("ERROR");
            //e.printStackTrace();
        }*/
        log.info("test");
        server.requestHandler(new Handler<HttpServerRequest>() {

            @Override
            public void handle(final HttpServerRequest request) {
                // TODO Auto-generated method stub

                log.info("Requested URI is " + request.uri());

                if (request.uri().equals("/")) {
                    // Serve the index page
                    request.response().sendFile(DEFAULT_WEB_ROOT + "/index.html");
                } else if (request.uri().equals(("/presentation/upload"))) {

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

                            new_user.putString("Email", email);
                            new_user.putString("Nickname", nickname);
                            new_user.putString("Password", password);

                            //로그 출력
                            log.info(email);
                            log.info(nickname);
                            log.info(password);

                            //response chunked check
                            request.response().setChunked(true);

                            //email 중복 체크
                            db_action.putString("action", "find");
                            db_action.putString("collection", "users");
                            db_action.putObject("document", new JsonObject().putString("Email", email));
                            log.info(db_action);
                            eb.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
                                @Override
                                public void handle(Message message) {
                                    JsonObject result = new JsonObject(message.body().toString());

                                    if (result.getString("status").equals("ok")) {
                                        if (result.getObject("result") == null) {

                                            db_action.putObject("document", new JsonObject().putString("Nickname", nickname));

                                            eb.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
                                                @Override
                                                public void handle(Message message) {
                                                    JsonObject result = new JsonObject(message.body().toString());

                                                    if (result.getString("status").equals("ok")) {
                                                        if (result.getObject("result") == null) {
                                                            //All redundancy checked
                                                            db_action.putString("action", "save");
                                                            db_action.putObject("document", new_user);
                                                            eb.send(DEFAULT_DB_ADDRESS, db_action, new Handler<Message>() {
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
                                                            log.info(message.body());
                                                            log.info(nickname + " is already used nickname.");
                                                            request.response().write(new JsonObject().putBoolean("success", false).toString());
                                                            request.response().end();
                                                        }
                                                    }
                                                }
                                            });
                                        } else {
                                            log.info(message.body());
                                            log.info(email + " is already used email.");
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

                            matcher.putString("Email", email);

                            param.putString("action", "findone");
                            param.putString("collection", "users");
                            param.putObject("matcher", matcher);

                            log.info("got email : " + email);

                            eb.send(DEFAULT_DB_ADDRESS, param, new Handler<Message>() {
                                @Override
                                public void handle(Message message) {
                                    JsonObject result = new JsonObject(message.body().toString());
                                    JsonObject response_data = new JsonObject();

                                    if (result.getString("status").equals("ok")) {
                                        //success to db action

                                        //if email is already used, return response redundancy checked
                                        if (result.getObject("result") != null) {
                                            log.info(result.getObject("result").toString());
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

                            matcher.putString("Nickname", nickname);

                            param.putString("action", "findone");
                            param.putString("collection", "users");
                            param.putObject("matcher", matcher);

                            log.info("got nickname : " + nickname);

                            eb.send(DEFAULT_DB_ADDRESS, param, new Handler<Message>() {
                                @Override
                                public void handle(Message message) {
                                    JsonObject result = new JsonObject(message.body().toString());
                                    JsonObject response_data = new JsonObject();

                                    if (result.getString("status").equals("ok")) {
                                        //success to db action

                                        //if nickname is already used, return response redundancy checked
                                        if (result.getObject("result") != null) {
                                            log.info(result.getObject("result").toString());
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

                    JsonObject session_action = new JsonObject();
                    session_action.putString("action", "start");

                    //session test
                    eb.send(DEFAULT_SESSION_ADDRESS, session_action, new Handler<Message>() {
                        @Override
                        public void handle(Message message) {
                            JsonObject result = new JsonObject(message.body().toString());
                            JsonObject response = new JsonObject();
                            String session_id = null;

                            if (result.getString("status").equals("ok")) {
                                session_id = result.getString("sessionId");
                            } else {
                                session_id = "fail";
                            }

                            response.putString("sessionId", session_id);
                            request.response().write(response.toString()).end();
                        }
                    });

                } else {

                    request.response().sendFile(DEFAULT_WEB_ROOT + request.uri());

                    //request.response().setStatusCode(404);
                    //request.response().end();
                }
            }
        });

        SockJSServer sjsServer = vertx.createSockJSServer(server);
        JsonArray inboundPermitted = new JsonArray();

        inboundPermitted.add(new JsonObject("{ \"address\" : \"document.create.request\" }"));


        JsonArray outboundPermitted = new JsonArray();

        sjsServer.bridge(new JsonObject().putString("prefix", "/eventbus"),
                inboundPermitted, outboundPermitted, DEFAULT_AUTH_TIMEOUT, DEFAULT_AUTH_ADDRESS);

        server.listen(DEFAULT_PORT, "localhost");
    }
}
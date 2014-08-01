package openslide.module.webserver;

import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Verticle;

/**
 * Created by TD on 2014-07-19.
 */
public class UploadVerticle extends Verticle{

    @Override
    public void start() {

        System.out.println("UploadVerticle Deployed");

        final Logger log = container.logger();
        EventBus eb = vertx.eventBus();

        eb.registerHandler("document.create.request", new Handler<Message>() {
            @Override
            public void handle(Message message) {

                log.info("UploadVerticle got message");
                log.info(message.body());

                //message.reply(new JsonObject("{ \"result\" : \"success\" }"));
                message.reply("ok");
            }
        });

    }
}



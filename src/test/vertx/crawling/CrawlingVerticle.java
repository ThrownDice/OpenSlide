package test.vertx.crawling;

import org.vertx.java.core.Handler;
import org.vertx.java.core.VoidHandler;
import org.vertx.java.core.buffer.Buffer;
import org.vertx.java.core.http.HttpClient;
import org.vertx.java.core.http.HttpClientResponse;
import org.vertx.java.platform.Verticle;
import org.vertx.java.core.logging.Logger;

/**
 * Created by TD on 2014-07-11.
 */
public class CrawlingVerticle extends Verticle {

    @Override
    public void start() {

        final Logger log = this.container.logger();
        final Buffer body = new Buffer(0);

        HttpClient client = vertx.createHttpClient().setHost("www.google.com");

        client.getNow("/search?q=%EC%82%B0&tbm=isch", new Handler<HttpClientResponse>() {
            public void handle(HttpClientResponse resp) {
                resp.dataHandler(new Handler<Buffer>() {
                    public void handle(Buffer data) {
                        body.appendBuffer(data);
                    }
                });
                resp.endHandler(new VoidHandler() {
                    public void handle() {
                        // The entire response body has been received
                        log.info("The total body received was " + body.length() + " bytes");
                        log.info(body.toString());
                    }
                });
            }
        });


        log.info("Hi there");


    }
}

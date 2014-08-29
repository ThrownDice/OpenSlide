package openslide.module.webserver;

import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.EventBus;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.http.HttpClient;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Verticle;

/**
 * Created by TD on 2014-08-27.
 */
public class WebSearchModule extends Verticle{

    public static final String DEFAULT_WEBSEARCH_ADDRESS = "openslide.websearch";

    public static final String DEFAULT_SEARCH_HOST = "www.google.com";

    @Override
    public void start() {

        final EventBus event_bus = vertx.eventBus();    //event_bus object
        final Logger logger = container.logger();       //logger object

        event_bus.registerHandler(DEFAULT_WEBSEARCH_ADDRESS, new Handler<Message>() {
            @Override
            public void handle(Message outter_message) {

                final JsonObject request = new JsonObject(outter_message.body().toString());

                //create vertx httpclient, and search.
                final HttpClient client = vertx.createHttpClient().setHost(DEFAULT_SEARCH_HOST);

                //image search
                if(request.getString("action").equals("websearch_image")){

                    /**
                     * parameter information
                     * @param   keyword     -required-  {string}
                     * @return {status, image_url_list}
                     */

                    //search image by keyword



                    //extract image url information

                    //return


                }else if(request.getString("action").equals("websearch_video")){

                    /**
                     * parameter information
                     * @param   keyword     -required-  {string}
                     * @return {status, video_url_list}
                     */


                }



            }
        });





    }
}

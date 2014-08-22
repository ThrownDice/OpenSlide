package openslide.controller.main;

import org.vertx.java.platform.Verticle;

/**
 * Created by TD on 2014-07-19.
 */
public class MainController extends Verticle {

    @Override
    public void start() {


        container.deployVerticle("openslide.controller.main.TestClass.java");
        //container.deployVerticle("ServerCore.java");
        //container.deployVerticle("DocumentCreateVerticle");



    }
}

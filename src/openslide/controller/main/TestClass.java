package openslide.controller.main;

import org.vertx.java.platform.Verticle;

/**
 * Created by TD on 2014-07-21.
 */
public class TestClass extends Verticle {

    @Override
    public void start() {
        super.start();
        System.out.println("Debug");
    }
}

package openslide.module.webserver;

import org.vertx.java.core.Handler;
import org.vertx.java.core.VoidHandler;
import org.vertx.java.core.buffer.Buffer;
import org.vertx.java.core.http.HttpClient;
import org.vertx.java.core.http.HttpClientResponse;
import org.vertx.java.core.shareddata.SharedData;
import org.vertx.java.platform.Verticle;
import org.vertx.java.core.logging.Logger;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentMap;
import java.util.regex.MatchResult;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by TD on 2014-07-11.
 */
public class CrawlingVerticle extends Verticle {

    @Override
    public void start() {

        final Logger log = this.container.logger();
        final Buffer body = new Buffer(0);

        //the url return the page which has 19 image url information
        //so the start value is multiples of 19

        String keywork = "";
        int start = 0;

        //a tag regular expression which wrap img tag
        //<a[^>]*><img

        final HttpClient client = vertx.createHttpClient().setHost("www.google.com");
        client.getNow("/search?q=%EC%82%B0&tbm=isch&gws_rd=ssl&start=0", new Handler<HttpClientResponse>() {
            public void handle(HttpClientResponse resp) {

                resp.dataHandler(new Handler<Buffer>() {
                    public void handle(Buffer data) {
                        body.appendBuffer(data);
                    }
                });
                resp.endHandler(new VoidHandler() {
                    public void handle() {
                        // The entire response body has been received
                        String regex = "<a[^>]*><img";          //extract a tag
                        //String regex = "<img[^>]*src=[\"']?([^>\"']+)[\"']?[^>]*>"; //extract img tag
                        //^(https?):\/\/([^:\/\s]+)(:([^\/]*))?((\/[^\s/\/]+)*)?\/?([^#\s\?]*)(\?([^#\s]*))?(#(\w*))?$
                        //String regex = "^(https?):\\/\\/([^:\\/\\s]+)(:([^\\/]*))?((\\/[^\\s/\\/]+)*)?\\/?([^#\\s\\?]*)(\\?([^#\\s]*))?(#(\\w*))?$";      //extract url
                        Pattern pattern = Pattern.compile(regex);
                        Matcher matcher = pattern.matcher(body.toString());
                        ArrayList<String> url_list = new ArrayList<String>();
                        ArrayList<String> img_list = new ArrayList<String>();
                        String url = null;

                        log.info("The total body received was " + body.length() + " bytes");

                        // 1. extract a tag
                        // 2. extract href attribute

                        try {
                            FileWriter writer = new FileWriter("c:\\vertx_crawling_test\\result.html");

                            log.info("group count : " + matcher.groupCount());
                            log.info("find?" + matcher.find());


                            //writer.write(body.toString());

                            while (matcher.find()) {

                                String mapped_string = matcher.group();
                                url = URLDecoder.decode(mapped_string.substring(16, mapped_string.length() - 6), "UTF-8").replaceAll("amp;","");
                                url_list.add(url);
                                writer.write(url + "\n");
                            }
                            writer.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }

                        crawling(url_list, img_list, 1);

                        client.close();

                    }
                });
            }
        });
    }

    /**
     *
     * @param url_list
     * @param img_list
     * @param depth
     */
    public ArrayList<String> crawling(ArrayList<String> url_list, final ArrayList<String> img_list, int depth){

        if(depth == 0){
            return img_list;
        }else{
            //https?://[^:/\s]+ extract host
            //https?://[^:/\s]+:[^/]* extract host + port

            Pattern url_pattern = Pattern.compile("(https?:\\/\\/)([^:/\\s]+):?([^\\/]*)?([^?&]*)([\\s\\S]*)?");
            final Pattern img_pattern = Pattern.compile("<img[^>]*src=[\\\"']?([^>\\\"']+)[\\\"']?[^>]*>");

            ArrayList<String> new_url_list = new ArrayList<String>();
            final int url_list_length = url_list.size();
            ConcurrentMap<String, Integer> shared_map = vertx.sharedData().getMap("craw.shared_map");
            shared_map.put("current_index", 0); //represent current connect url_index

            for(String url : url_list){

                //Buffer
                final Buffer craw_data = new Buffer(0);

                //For Search Connect
                String host = null;
                String port_s = null;
                String uri = null;
                String parameters = null;
                String new_uri = "";
                int port = 0;

                //For Extract Information
                Matcher matcher = null;

                //For Parameter manager
                ParameterManager param_manager = null;
                String[] keys = null;

                //For Crawling
                HttpClient craw_client = null;

                matcher = url_pattern.matcher(url);
                if(matcher.find()){
                    host = matcher.group(2);
                    port_s = matcher.group(3);
                    uri = matcher.group(4);
                }

                if(!port_s.equals("") && port_s!=null){
                    port = Integer.parseInt(port_s);
                }

                param_manager = new ParameterManager(url);
                keys = param_manager.getKeys();
                new_uri = uri + "?";

                //remove unnecessary parameters, and make new uri
                for(String key : keys){
                    if( !key.equals("sa") && !key.equals("ei") && !key.equals("usg") && !key.equals("ved") ){
                        new_uri += key;
                        new_uri += "=";
                        new_uri += param_manager.get(key);
                    }
                }

                //connect setting
                craw_client = vertx.createHttpClient().setHost(host);
                if(port!=0){
                    craw_client.setPort(port);
                }

                //connect and get information
                craw_client.getNow(new_uri, new Handler<HttpClientResponse>() {
                    @Override
                    public void handle(HttpClientResponse httpClientResponse) {

                        httpClientResponse.dataHandler(new Handler<Buffer>() {
                            @Override
                            public void handle(Buffer buffer) {
                                craw_data.appendBuffer(buffer);
                            }
                        });

                        httpClientResponse.endHandler(new Handler<Void>() {
                            @Override
                            public void handle(Void aVoid) {

                                Matcher matcher = img_pattern.matcher(craw_data.toString());
                                ConcurrentMap<String, Integer> shared_map = vertx.sharedData().getMap("craw.shared_map");
                                Integer current_index = shared_map.get("current_index") + 1;

                                //add find img
                                while(matcher.find()){
                                    img_list.add(matcher.group(0));
                                }

                                System.out.println("current index : " + current_index);

                                if( current_index == url_list_length){
                                    try{
                                        FileWriter writer = new FileWriter("c:\\vertx_crawling_test\\craw_result.html");
                                        for(String img : img_list){
                                            writer.write(img + "\n");
                                        }
                                        writer.close();
                                    }catch(Exception e){
                                        e.printStackTrace();
                                    }
                                    System.out.println("Done.");
                                }

                                shared_map.put("current_index",current_index);
                            }
                        });

                    }
                });
            }
            return crawling(new_url_list, img_list, depth - 1 );
        }
    }
}

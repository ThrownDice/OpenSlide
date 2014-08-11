package openslide.module.webserver;

import io.netty.handler.codec.http.Cookie;

import java.util.HashMap;

/**
 * Created by TD on 2014-08-11.
 */
public class CookieManager {

    private HashMap<String, String> cookie_map = null;

    public CookieManager(String cookie){
        cookie_map = new HashMap<String, String>();

        String[] splited_data = cookie.split(";");

        //parsing cookie
        try{
            for(String data : splited_data){

                String[] token = data.split("=");
                String key = token[0].trim();
                String value = token[1].trim();

                System.out.println("Key : " + key + " value : " + value);

                cookie_map.put(key, value);

            }
        }catch (Exception e){
            System.out.println("Exception occured while parsing cookie.");
        }
    }

    /**
     * This method return value which matched by key
     * @param key
     * @return
     */
    public String getValue(String key){
        return cookie_map.get(key);
    }
}

package openslide.module.webserver;

import io.netty.handler.codec.http.Cookie;

import java.util.HashMap;

/**
 * CookieManager Class
 * This class is utility class which manager cookies
 *
 * @author JIHYEON KANG
 */
public class CookieManager {

    private HashMap<String, String> cookie_map = null;

    /**
     * Constructor of CookieManager Class.
     * Split cookie and save as key-value HashMap.
     *
     * @param cookie {String}
     */
    public CookieManager(String cookie) throws Exception{

        String[] splited_data = cookie.split(";");
        this.cookie_map = new HashMap<String, String>();

        try{
            for(String data : splited_data){

                String[] token = data.split("=");
                String key = token[0].trim();
                String value = token[1].trim();

                cookie_map.put(key, value);
            }
        }catch (Exception e){
            System.out.println("Exception occured while parsing cookie.");
        }
    }

    /**
     * Get method of CookieManager Class
     * This method returns value which correspond to key
     *
     * @param key {String}
     * @return value (if there is no correspond value, return null) {String}
     */
    public String getValue(String key){
        return cookie_map.get(key);
    }
}

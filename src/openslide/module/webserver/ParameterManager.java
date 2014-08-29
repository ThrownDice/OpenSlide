package openslide.module.webserver;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * ParameterManager Class
 * This class is utility class which manage parameters as url.
 *
 * @author JIHYEON KANG
 */
public class ParameterManager {

    private HashMap<String,String> parameters;
    private ArrayList<String> keys;

    /**
     * Constructor of ParameterManager Class.
     * Split url as key-value HashMap, and save to parameters object.
     *
     * @param url {String}
     */
    public ParameterManager(String url){

        String uri = null;
        String[] key_value_list = null;
        this.parameters = new HashMap<String, String>();
        this.keys = new ArrayList<String>();

        if(url.indexOf("?") != -1) {
            uri = url.substring(url.indexOf("?") + 1, url.length());
        }else{
            uri = url;
        }

        System.out.println("marker1 uri : " + uri);

        key_value_list = uri.split("&");

        for(String param : key_value_list){
            String[] key_value = param.split("=");
            if(key_value.length == 2){
                if(key_value[0] != null && key_value[1] != null){

                    System.out.println("parsing key : " + key_value[0]);

                    keys.add(key_value[0]);
                    parameters.put(key_value[0], key_value[1]);
                }
            }
        }
    }

    /**
     * Get method of ParameterManager Class.
     * This method returns value which correspond to key
     *
     * @param key {String}
     * @return value (if there is no correspond value, return null) {String}
     */
    public String get(String key){
        return parameters.get(key);
    }

    /**
     * Get method of ParameterManager Class.
     * This method returns key list.
     *
     * @return keys {String[]}
     */
    public String[] getKeys(){
        return keys.toArray(new String[keys.size()]);
    }

}

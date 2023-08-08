package com.example.tunetracker;

import java.util.ArrayList;
import java.util.Map;

public class Tune {
    public Map<String, Object> map;
    private String sort_key = "title";
    private String subtitle;
    private final static ArrayList<String> backupArray = new ArrayList<String>();

    public Tune(String title, String composers) {
        this.title = title;
        this.composers = composers;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

    public Tune(Map<String, Object> map) {
        this.map = map;
        if(map.containsKey("title")){
            this.title = map.get("title").toString();
        }else{
            this.title = "No title supplied!";
        }
        if(map.containsKey("composers") && (map.get("composers") instanceof ArrayList)) {
            this.composers = String.join(", ", (ArrayList)map.get("composers"));
        }else{
            this.composers = "No composers supplied!";
        }
        this.subtitle = "";
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getComposers() {
        return composers;
    }

    public void setComposers(String composers) {
        this.composers = composers;
    }

    public String get_str(String key){
        return (String)map.getOrDefault(key, "~");
    }
    public int get_int(String key){
        return (int)map.getOrDefault(key, -1);
    }
    public String get_first(String key){
        ArrayList<String> al = (ArrayList)map.getOrDefault(key, backupArray);
        if(al.size() == 0){
            return "~";
        }
        return al.get(0);
    }


    String title;
    String composers;

}
